// deno-lint-ignore-file no-explicit-any
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Json } from "../supabase/interface.ts"
import { valid_value_type } from "./field_values_with_defaults.ts"
import {
    DataComponent,
    DBFunctionArgument,
    DBScenario,
    NewDataComponent,
    ScenarioValue,
} from "./interface.ts"

// To avoid making a GenericZod type, just use `any` here, but when developing
// use typeof import("zod") to check types.
// type Zod = typeof import("zod")
type Zod = any

export function make_field_validators(z: Zod)
{
    function zod_schemas()
    {
        const DBFunctionArgumentSchema = z.object({
            name: z.string(),
            description: z.string().optional(),
            default_value: z.string().optional(),
        })

        const ScenarioValueSchema = z.object({
            value: z.string(),
            iterate_over: z.boolean().optional(),
            use_previous_result: z.boolean().optional(),
        })

        const ScenarioValuesSchema = z.record(z.string(), ScenarioValueSchema)

        const DBScenarioSchema = z.object({
            description: z.string().optional(),
            values: ScenarioValuesSchema,
            expected_result: z.string().optional(),
            expectation_met: z.boolean().optional(),
            selected_paths: z.array(z.array(z.union([
                z.object({ key: z.string() }),
                z.object({ index: z.union([z.number(), z.literal("*")]) }),
            ]))).optional(),
            selected_path_names: z.record(z.string(), z.string()).optional(),
            graphs: z.array(z.object({
                // title: z.string().optional(),
                x_axis_path: z.string().optional(),
                y_axis_series: z.array(z.string()).optional(),
            })).optional(),
        })


        const id_schema = z.object({
            id: z.any(),
            temporary_id: z.undefined(),
        })
        const temporary_id_schema = z.object({
            id: z.undefined(),
            temporary_id: z.any(),
        })
        type IdOrTempId = {
            id: any;
            temporary_id: undefined;
        } | {
            id: undefined;
            temporary_id: any;
        }

        const ids_schema = id_schema.or(temporary_id_schema).refine(
            (data: IdOrTempId) => {
                const has_id = data.id !== undefined
                const has_temp_id = data.temporary_id !== undefined
                return has_id !== has_temp_id // XOR: exactly one must be true
            },
            { message: "Must have either id or temporary_id, but not both" }
        )

        function base_fields(optionals_as_nullable: boolean) {
            // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents, @typescript-eslint/no-duplicate-type-constituents
            function optional(a: InstanceType<Zod["ZodString"]> | InstanceType<Zod["ZodNumber"]>)
            {
                return optionals_as_nullable
                    ? a.nullable().optional()
                    : a.optional()
            }

            return {
                owner_id: z.any(),
                editor_id: z.any(),
                created_at: z.any(),
                comment: z.any(),
                bytes_changed: z.any(),
                version_type: z.any(),
                version_rolled_back_to: z.any(),
                title: z.any(),
                description: z.any(),
                label_ids: z.any(),
                value_type: optional(z.string()),
                subject_id: optional(z.number()),
                according_to_id: optional(z.number()),
                plain_title: z.any(),
                plain_description: z.any(),
                test_run_id: z.any(),
            }
        }


        const input_value = { input_value: z.any() }
        const result_value = { result_value: z.any() }
        const recursive_dependency_ids = { recursive_dependency_ids: z.any() }
        const value_number_display_type = { value_number_display_type: z.any() }
        const value_number_sig_figs = { value_number_sig_figs: z.any() }
        const units = { units: z.any() }
        const datetime_range_start = { datetime_range_start: z.any() }
        const datetime_range_end = { datetime_range_end: z.any() }
        const datetime_repeat_every = { datetime_repeat_every: z.any() }
        const dimension_ids = { dimension_ids: z.any() }
        const function_arguments = { function_arguments: z.any() }
        const scenarios = { scenarios: z.any() }

        const all_type_specific_fields = {
            ...input_value,
            ...result_value,
            ...recursive_dependency_ids,
            ...value_number_display_type,
            ...value_number_sig_figs,
            ...units,
            ...datetime_range_start,
            ...datetime_range_end,
            ...datetime_repeat_every,
            ...dimension_ids,
            ...function_arguments,
            ...scenarios,
        }


        const base_schema = ids_schema.and(z.object(base_fields(false)))

        // Extend for each value_type
        // const schemas_by_value_type: Record<ValueType, any> = {
        const schemas_by_value_type = {
            number: base_schema.and(z.object({
                ...input_value,
                ...result_value,
                ...recursive_dependency_ids,
                ...value_number_display_type,
                ...value_number_sig_figs,
                ...units,
            })),
            datetime_range: base_schema.and(z.object({
                ...datetime_range_start,
                ...datetime_range_end,
                ...datetime_repeat_every,
            })),
            number_array: base_schema.and(z.object({
                ...input_value,
                ...result_value,
                ...recursive_dependency_ids,
                ...value_number_display_type,
                ...value_number_sig_figs,
                ...units,
                ...dimension_ids,
            })),
            function: base_schema.and(z.object({
                ...input_value,
                ...result_value,
                ...recursive_dependency_ids,
                ...units,
                ...function_arguments,
                ...scenarios,
            })),
            interactable: base_schema.and(z.object({
                ...result_value,
            })),
        }


        const json_union_schema = z.object({
            temporary_id: z.any(),
            id: z.any(),
            version_number: z.any(),
            ...base_fields(true),
            ...all_type_specific_fields,
            // Also add attributes from rpc search_data_components
            score: z.number().optional(),
            method: z.number().optional(),
        })


        return {
            DBFunctionArgumentSchema,
            DBScenarioSchema,
            schemas_by_value_type,
            json_union_schema,
        }
    }


    const {
        DBFunctionArgumentSchema,
        DBScenarioSchema,
        schemas_by_value_type,
        json_union_schema,
    } = zod_schemas()


    function validate_function_arguments_from_json(value: unknown): DBFunctionArgument[] | undefined
    {
        const arrSchema = z.array(DBFunctionArgumentSchema).nullable().optional()
        const parsed = arrSchema.safeParse(value)
        if (!parsed.success) throw new Error(parsed.error.message)
        return parsed.data || undefined
    }

    function validate_scenarios_from_json(value: unknown, known_input_names: Set<string>): DBScenario[] | undefined
    {
        const arrSchema = z.array(DBScenarioSchema).nullable().optional()
        const parsed = arrSchema.safeParse(value)
        if (!parsed.success) throw new Error(parsed.error.message)

        let data = parsed.data || undefined
        data = data && data.length === 0 ? undefined : data
        data = remove_non_existent_scenario_input_values(data, known_input_names)
        data = remove_scenario_input_falsy_modifiers(data)
        data = remove_scenario_input_invalid_modifiers(data)
        data = remove_empty_scenario_input_values(data)
        data = remove_invalid_selected_path_names(data)
        data = remove_invalid_graph_paths(data)
        return data
    }

    function validate_fields_given_value_type<V extends (DataComponent | NewDataComponent)>(data_component: V): V
    {
        const value_type = valid_value_type(data_component.value_type)
        const schema: any = schemas_by_value_type[value_type]
        // Use .parse to strip unsupported fields for specific value_type.
        return schema.parse(data_component) as V
    }

    function validate_json<V extends Json>(data_component: V): V
    {
        // Check it matches the union of all schemas first.  This helps detect
        // fields which an older server or client does not support and gives better
        // error messages to help identify the issue.
        json_union_schema.strict().parse(data_component)

        return data_component
    }

    return {
        validate_function_arguments_from_json,
        validate_scenarios_from_json,
        validate_fields_given_value_type,
        validate_json,
    }
}

export type FieldValidators = ReturnType<typeof make_field_validators>



function remove_non_existent_scenario_input_values(
    scenarios: DBScenario[] | undefined,
    known_input_names: Set<string>,
): DBScenario[] | undefined
{
    if (!scenarios) return undefined

    return scenarios.map(scenario =>
    {
        const new_values: Record<string, ScenarioValue> = {}
        for (const [input_name, val] of Object.entries(scenario.values))
        {
            if (known_input_names.has(input_name))
            {
                new_values[input_name] = val
            }
        }

        return {
            ...scenario,
            values: new_values,
        }
    })
}


function remove_scenario_input_falsy_modifiers(scenarios: DBScenario[] | undefined): DBScenario[] | undefined
{
    if (!scenarios) return undefined

    return scenarios.map(scenario =>
    {
        const new_values: Record<string, ScenarioValue> = {}
        for (const [input_name, val] of Object.entries(scenario.values))
        {
            const new_val: ScenarioValue = { value: val.value }
            if (val.iterate_over) new_val.iterate_over = val.iterate_over
            if (val.use_previous_result) new_val.use_previous_result = val.use_previous_result
            new_values[input_name] = new_val
        }

        return {
            ...scenario,
            values: new_values,
        }
    })
}

function remove_scenario_input_invalid_modifiers(scenarios: DBScenario[] | undefined): DBScenario[] | undefined
{
    if (!scenarios) return undefined

    return scenarios.map(scenario =>
    {
        let scenario_has_iterate_over = false
        let scenario_has_use_previous_result = false

        const new_values: Record<string, ScenarioValue> = {}
        for (const [input_name, val] of Object.entries(scenario.values))
        {
            const new_val: ScenarioValue = { value: val.value }
            if (val.iterate_over)
            {
                if (!scenario_has_iterate_over)
                {
                    new_val.iterate_over = val.iterate_over
                    scenario_has_iterate_over = true
                }
            }

            new_values[input_name] = new_val
        }

        if (scenario_has_iterate_over)
        {
            for (const [input_name, val] of Object.entries(scenario.values))
            {
                const new_val = new_values[input_name]!
                if (val.use_previous_result && !new_val.iterate_over)
                {
                    if (!scenario_has_use_previous_result)
                    {
                        new_val.use_previous_result = val.use_previous_result
                        scenario_has_use_previous_result = true
                    }
                }
            }
        }

        return {
            ...scenario,
            values: new_values,
        }
    })
}


function remove_empty_scenario_input_values(scenarios: DBScenario[] | undefined): DBScenario[] | undefined
{
    if (!scenarios) return undefined

    return scenarios.map(scenario =>
    {
        const new_values: Record<string, ScenarioValue> = {}
        for (const [input_name, val] of Object.entries(scenario.values))
        {
            val.value = val.value.trim()
            if (val.value !== "" || val.iterate_over || val.use_previous_result)
            {
                new_values[input_name] = val
            }
        }

        return {
            ...scenario,
            values: new_values,
        }
    })
}


function remove_invalid_selected_path_names(scenarios: DBScenario[] | undefined): DBScenario[] | undefined
{
    if (!scenarios) return undefined

    return scenarios.map(scenario =>
    {
        const new_selected_path_names: DBScenario["selected_path_names"] = scenario.selected_path_names
        if (!new_selected_path_names) return scenario

        const { selected_paths = [] } = scenario
        const valid_path_strs = new Set(
            selected_paths.map(path => JSON.stringify(path))
        )

        // Check each new_selected_path_names key is in selected_paths
        Object.keys(new_selected_path_names).forEach(path_str =>
        {
            if (!valid_path_strs.has(path_str))
            {
                delete new_selected_path_names[path_str]
            }
        })

        return scenario
    })
}


function remove_invalid_graph_paths(scenarios: DBScenario[] | undefined): DBScenario[] | undefined
{
    if (!scenarios) return undefined
    return scenarios.map(scenario =>
    {
        let new_graphs: DBScenario["graphs"] = scenario.graphs
        if (!new_graphs) return scenario

        const { selected_paths = [] } = scenario
        const valid_path_strs = new Set(
            selected_paths.map(path => JSON.stringify(path))
        )

        // Check the x_axis_path and y_axis_series are all in selected_paths
        new_graphs = new_graphs.filter(graph =>
        {
            if (graph.x_axis_path && !valid_path_strs.has(graph.x_axis_path))
            {
                delete graph.x_axis_path
            }

            if (graph.y_axis_series)
            {
                graph.y_axis_series = graph.y_axis_series.filter(path_str =>
                    valid_path_strs.has(path_str)
                )

                if (graph.y_axis_series.length === 0)
                {
                    delete graph.y_axis_series
                }
            }

            return Object.keys(graph).length > 0
        })
        scenario = { ...scenario, graphs: new_graphs }

        if (scenario.graphs?.length === 0) delete scenario.graphs

        return scenario
    })
}
