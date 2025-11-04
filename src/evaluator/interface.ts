

export interface EvaluationRequest
{
    js_input_value: string
    requested_at: number
    /**
     * Optional timeout in milliseconds, default is 100 ms
     */
    timeout_ms?: number
    debugging?: boolean
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
    js_input_value: string
    requested_at: number
    start_time: number
    end_time: number
}
