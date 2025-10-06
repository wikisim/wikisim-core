// deno-lint-ignore-file no-explicit-any
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { valid_value_type } from "./field_values_with_defaults.ts"
import {
    DataComponent,
    DBFunctionArgument,
    DBScenario,
    NewDataComponent,
    ValueType
} from "./interface.ts"


// To avoid making a GenericZod type, just use any here, but when developing
// use typeof import("zod") to check types.
export function make_field_validators(z: any) //typeof import("zod"))
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
        })

        const ScenarioValuesSchema = z.record(z.string(), ScenarioValueSchema)

        const DBScenarioSchema = z.object({
            description: z.string().optional(),
            values: ScenarioValuesSchema,
            expected_result: z.string().optional(),
            expectation_met: z.boolean().optional(),
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
                const hasId = data.id !== undefined
                const hasTempId = data.temporary_id !== undefined
                return hasId !== hasTempId // XOR: exactly one must be true
            },
            { message: "Must have either id or temporary_id, but not both" }
        )

        const base_schema = ids_schema.and(z.object({
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
            value_type: z.string().optional(),
            plain_title: z.any(),
            plain_description: z.any(),
            test_run_id: z.any(),
        }))

        // Extend for each value_type
        const schemas_by_value_type: Record<ValueType, any> = {
            number: base_schema.and(z.object({
                input_value: z.any(),
                result_value: z.any(),
                recursive_dependency_ids: z.any(),
                value_number_display_type: z.any(),
                value_number_sig_figs: z.any(),
                units: z.any(),
            })),
            datetime_range: base_schema.and(z.object({
                datetime_range_start: z.any(),
                datetime_range_end: z.any(),
                datetime_repeat_every: z.any(),
            })),
            number_array: base_schema.and(z.object({
                input_value: z.any(),
                result_value: z.any(),
                recursive_dependency_ids: z.any(),
                value_number_display_type: z.any(),
                value_number_sig_figs: z.any(),
                units: z.any(),
                dimension_ids: z.any(),
            })),
            function: base_schema.and(z.object({
                input_value: z.any(),
                result_value: z.any(),
                recursive_dependency_ids: z.any(),
                units: z.any(),
                function_arguments: z.any(),
                scenarios: z.any(),
            })),
            interactable: base_schema.and(z.object({
                result_value: z.any(),
            })),
        }


        return {
            DBFunctionArgumentSchema,
            DBScenarioSchema,
            schemas_by_value_type,
        }
    }


    const { DBFunctionArgumentSchema, DBScenarioSchema, schemas_by_value_type } = zod_schemas()


    function validate_function_arguments_from_json(value: unknown): DBFunctionArgument[] | undefined
    {
        const arrSchema = z.array(DBFunctionArgumentSchema).nullable().optional()
        const parsed = arrSchema.safeParse(value)
        if (!parsed.success) throw new Error(parsed.error.message)
        return parsed.data || undefined
    }

    function validate_scenarios_from_json(value: unknown): DBScenario[] | undefined
    {
        const arrSchema = z.array(DBScenarioSchema).nullable().optional()
        const parsed = arrSchema.safeParse(value)
        if (!parsed.success) throw new Error(parsed.error.message)
        return parsed.data || undefined
    }

    function validate_fields_given_value_type<V extends (DataComponent | NewDataComponent)>(data_component: V): V
    {
        const value_type = valid_value_type(data_component.value_type)
        const schema = schemas_by_value_type[value_type]
        // Use .parse to strip unknown fields
        return schema.parse(data_component) as V
    }

    return {
        validate_function_arguments_from_json,
        validate_scenarios_from_json,
        validate_fields_given_value_type,
    }
}

export type FieldValidators = ReturnType<typeof make_field_validators>
