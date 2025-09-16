import { z } from "zod"

import {
    DBFunctionArgument,
    DBScenario
} from "./interface.ts"


// Zod schemas
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


// Validation functions
export function validate_function_arguments_from_json(value: unknown): DBFunctionArgument[] | undefined
{
    const arrSchema = z.array(DBFunctionArgumentSchema).nullable().optional()
    const parsed = arrSchema.safeParse(value)
    if (!parsed.success) throw new Error(parsed.error.message)
    return parsed.data || undefined
}

export function validate_scenarios_from_json(value: unknown): DBScenario[] | undefined
{
    const arrSchema = z.array(DBScenarioSchema).nullable().optional()
    const parsed = arrSchema.safeParse(value)
    if (!parsed.success) throw new Error(parsed.error.message)
    return parsed.data || undefined
}
