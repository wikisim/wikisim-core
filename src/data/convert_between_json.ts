import { convert_typescript_to_tiptap } from "../rich_text/convert_text_type.ts"
import { determine_input_value_text_type } from "../rich_text/determine_text_type.ts"
import type { DataComponentAsJSON, NewDataComponentAsJSON } from "../supabase/index.ts"
import type { Json } from "../supabase/interface.ts"
import { IdAndVersion, parse_id, TempId } from "./id.ts"
import {
    is_data_component,
    MapSelectedPathToName,
    TempScenarioValues,
    type DataComponent,
    type FunctionArgument,
    type NewDataComponent,
    type Scenario
} from "./interface.ts"
import type { FieldValidators } from "./validate_fields.ts"


export function flatten_new_or_data_component_to_json(data_component: NewDataComponent): NewDataComponentAsJSON
export function flatten_new_or_data_component_to_json(data_component: DataComponent): DataComponentAsJSON
export function flatten_new_or_data_component_to_json(data_component: NewDataComponent | DataComponent): NewDataComponentAsJSON | DataComponentAsJSON
export function flatten_new_or_data_component_to_json(data_component: NewDataComponent | DataComponent): NewDataComponentAsJSON | DataComponentAsJSON
{
    return is_data_component(data_component)
        ? flatten_data_component_to_json(data_component)
        : flatten_new_data_component_to_json(data_component)
}


export function flatten_new_data_component_to_json(data_component: NewDataComponent): NewDataComponentAsJSON
{
    return {
        temporary_id: data_component.temporary_id.to_str(),

        owner_id: data_component.owner_id ?? null,

        editor_id: data_component.editor_id,
        created_at: data_component.created_at.toISOString(),
        comment: data_component.comment ?? null,
        bytes_changed: data_component.bytes_changed,
        version_type: data_component.version_type ?? null,
        version_rolled_back_to: data_component.version_rolled_back_to ?? null,

        title: data_component.title,
        description: data_component.description,
        label_ids: data_component.label_ids ?? null,

        input_value: flatten_input_value(data_component),
        result_value: data_component.result_value ?? null,
        recursive_dependency_ids: data_component.recursive_dependency_ids
            ? data_component.recursive_dependency_ids.map(d => d.to_str())
            : null,
        value_type: data_component.value_type ?? null,
        value_number_display_type: data_component.value_number_display_type ?? null,
        value_number_sig_figs: data_component.value_number_sig_figs ?? null,
        datetime_range_start: data_component.datetime_range_start
            ? data_component.datetime_range_start.toISOString()
            : null,
        datetime_range_end: data_component.datetime_range_end
            ? data_component.datetime_range_end.toISOString()
            : null,
        datetime_repeat_every: data_component.datetime_repeat_every ?? null,
        units: data_component.units ?? null,
        dimension_ids: data_component.dimension_ids
            ? data_component.dimension_ids.map(d => d.to_str())
            : null,
        function_arguments: data_component.function_arguments
            ? data_component.function_arguments.map(({ local_temp_id: _, ...args }) => args) as Json
            : null,
        scenarios: flatten_scenarios(data_component),

        // Will be set by the server-side (edge function)
        plain_title: "",
        plain_description: "",

        test_run_id: data_component.test_run_id ?? null,
    }
}


function flatten_input_value(data_component: NewDataComponent): string | null
{
    let { input_value, value_type } = data_component
    if (!input_value) return null
    if (value_type !== "function") return input_value

    if (determine_input_value_text_type(input_value) === "typescript")
    {
        input_value = convert_typescript_to_tiptap(input_value)
    }
    return input_value
}


function flatten_scenarios(data_component: NewDataComponent): Json | null
{
    if (!data_component.scenarios || data_component.scenarios.length === 0) return null

    return data_component.scenarios.map(({ local_temp_id: _, values_by_temp_id, ...args }) =>
    {
        // Find corresponding function argument names for the scenario values ids
        const values_by_name: Record<string, unknown> = {}
        Object.entries(values_by_temp_id).forEach(([temp_id_str, val]) =>
        {
            const func_arg = data_component.function_arguments?.find(fa => fa.local_temp_id === temp_id_str)
            if (func_arg) values_by_name[func_arg.name] = val
            // This error should never happen if the data was correctly validated
            // on (the client and) the server before saving
            else console.error(`flatten_scenarios: could not find function argument with local_temp_id ${temp_id_str}`)
        })

        // deno-lint-ignore no-explicit-any
        return { ...args, values: values_by_name } as any as Json
    })
}


export function flatten_data_component_to_json(data_component: DataComponent): DataComponentAsJSON
{
    const flattened_as_new = flatten_new_data_component_to_json({ ...data_component, temporary_id: new TempId() })
    const { temporary_id: _, ...rest } = flattened_as_new

    return {
        ...rest,
        id: data_component.id.id,
        version_number: data_component.id.version,
    }
}



export function hydrate_data_component_from_json(row: DataComponentAsJSON, validators: FieldValidators): DataComponent
export function hydrate_data_component_from_json(row: NewDataComponentAsJSON, validators: FieldValidators): NewDataComponent
export function hydrate_data_component_from_json(row: DataComponentAsJSON | NewDataComponentAsJSON, validators: FieldValidators): DataComponent | NewDataComponent
export function hydrate_data_component_from_json(row: DataComponentAsJSON | NewDataComponentAsJSON, validators: FieldValidators): DataComponent | NewDataComponent
{
    const hydrated_function_arguments = hydrate_function_arguments(row, validators)

    const core = {
        owner_id: row.owner_id ?? undefined,

        editor_id: row.editor_id,
        created_at: new Date(row.created_at),
        comment: row.comment ?? undefined,
        bytes_changed: row.bytes_changed,
        version_type: row.version_type ?? undefined,
        version_rolled_back_to: row.version_rolled_back_to ?? undefined,

        title: row.title,
        description: row.description,
        label_ids: row.label_ids && row.label_ids.length ? row.label_ids : undefined,

        input_value: row.input_value ?? undefined,
        result_value: row.result_value ?? undefined,
        recursive_dependency_ids: hydrate_list_of_ids(row.recursive_dependency_ids),
        value_type: row.value_type ?? undefined,
        value_number_display_type: row.value_number_display_type ?? undefined,
        value_number_sig_figs: row.value_number_sig_figs ?? undefined,
        datetime_range_start: convert_datetime(row.datetime_range_start),
        datetime_range_end: convert_datetime(row.datetime_range_end),
        datetime_repeat_every: row.datetime_repeat_every ?? undefined,
        units: row.units ?? undefined,
        dimension_ids: hydrate_list_of_ids(row.dimension_ids),
        function_arguments: hydrated_function_arguments,
        scenarios: hydrate_scenarios(row, hydrated_function_arguments, validators),

        plain_title: row.plain_title,
        plain_description: row.plain_description,
    }

    if ("temporary_id" in row)
    {
        return {
            temporary_id: new TempId(row.temporary_id),
            ...core,
            test_run_id: row.test_run_id ?? undefined,
        }
    }
    else
    {
        return {
            id: new IdAndVersion(row.id, row.version_number),
            ...core,
            test_run_id: row.test_run_id ?? undefined,
        }
    }
}


export function hydrate_list_of_ids(ids: string[] | null | undefined): IdAndVersion[] | undefined
{
    return (ids && ids.length) ? ids.map(id => parse_id(id, true)) : undefined
}


function hydrate_function_arguments(row: NewDataComponentAsJSON | DataComponentAsJSON, validators: FieldValidators): FunctionArgument[] | undefined
{
    const function_arguments = validators.validate_function_arguments_from_json(row.function_arguments)
    if (!function_arguments || function_arguments.length === 0) return undefined
    return function_arguments.map((arg, index) => ({ local_temp_id: index.toString(), ...arg }) )
}


function hydrate_scenarios(
    row: NewDataComponentAsJSON | DataComponentAsJSON,
    hydrated_function_arguments: FunctionArgument[] | undefined,
    validators: FieldValidators,
): Scenario[] | undefined
{
    const known_input_names = new Set<string>()
    hydrated_function_arguments?.forEach(arg => known_input_names.add(arg.name))

    const scenarios = validators.validate_scenarios_from_json(row.scenarios, known_input_names)
    if (!scenarios || scenarios.length === 0) return undefined

    return scenarios.map((args, index) =>
    {
        const { values, selected_path_names, ...rest } = args
        const values_by_temp_id: TempScenarioValues = {}
        Object.entries(values).forEach(([arg_name, val]) =>
        {
            const arg = hydrated_function_arguments?.find(a => a.name === arg_name)
            if (arg) values_by_temp_id[arg.local_temp_id] = val
            // This error should never happen if the data was correctly validated
            // on (the client and) the server before saving
            else console.error(`hydrate_scenarios: could not find function argument with name ${arg_name}`)
        })

        const selected_path_names_converted: MapSelectedPathToName | undefined = selected_path_names
            ? Object.fromEntries(Object.entries(selected_path_names).map(([path_str, name_or_obj]) =>
                typeof name_or_obj === "string"
                    ? [path_str, { name: name_or_obj }]
                    : [path_str, name_or_obj]
            ))
            : undefined

        return {
            local_temp_id: index.toString(),
            values_by_temp_id,
            selected_path_names: selected_path_names_converted,
            ...rest
        }
    })
}


function convert_datetime (datetime: string | null): Date | undefined
{
    return datetime ? new Date(datetime) : undefined
}
