// deno-lint-ignore-file no-explicit-any
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
    DBFunctionArgument,
    DBScenario
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

        return {
            DBFunctionArgumentSchema,
            DBScenarioSchema,
        }
    }


    const { DBFunctionArgumentSchema, DBScenarioSchema } = zod_schemas()


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

    return {
        validate_function_arguments_from_json,
        validate_scenarios_from_json,
    }
}

export type FieldValidators = ReturnType<typeof make_field_validators>
