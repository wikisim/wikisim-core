import type { FunctionArgument, ValueType } from "../data/interface.ts"


export interface EvaluationRequest
{
    js_input_value: string
    value_type: ValueType | undefined
    function_arguments?: FunctionArgument[]
    requested_at: number
    timeout_ms?: number // Optional timeout in milliseconds, default is 100 ms
}

export type MinimalEvaluationResponse =
{
    evaluation_id: number
} & (
    {
        result: string
        error: null
    } | {
        result: null
        error: string
    }
)


export type EvaluationResponse = MinimalEvaluationResponse &
{
    requested_at: number
    start_time: number
    end_time: number
}
