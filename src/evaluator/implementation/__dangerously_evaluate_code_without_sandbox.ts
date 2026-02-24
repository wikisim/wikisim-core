import { EvaluationRequest, EvaluationResponse } from "../interface"
import { ExtendedEvaluationRequest } from "./interface"
import { delete_evaluation_request, request_next_evaluation } from "./request_next_evaluation"


let next_evaluation_id = 0


export async function __dangerously_evaluate_code_without_sandbox(basic_request: EvaluationRequest): Promise<EvaluationResponse>
{
    let resolve: (response: EvaluationResponse) => void
    const promise_result = new Promise<EvaluationResponse>(r => resolve = r)

    const request: ExtendedEvaluationRequest = {
        evaluation_id: ++next_evaluation_id,
        js_input_value: basic_request.js_input_value,
        requested_at: basic_request.requested_at,
        start_time: -1,
        promise_result,
        resolve: resolve!,
    }

    // Ensure evaluations are processed in order, one at a time
    await request_next_evaluation(request)

    request.start_time = performance.now()

    try
    {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const raw_result = eval(basic_request.js_input_value)
        // Handle async code that returns a Promise
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const awaited_result = raw_result instanceof Promise ? await raw_result : raw_result
        const result = JSON.stringify(awaited_result)

        const response: EvaluationResponse = {
            evaluation_id: request.evaluation_id,
            js_input_value: basic_request.js_input_value,
            requested_at: basic_request.requested_at,
            start_time: request.start_time,
            end_time: performance.now(),
            result,
            error: null,
        }
        delete_evaluation_request(request)
        request.resolve(response)
    }
    catch (err)
    {
        const response: EvaluationResponse = {
            evaluation_id: request.evaluation_id,
            js_input_value: basic_request.js_input_value,
            requested_at: basic_request.requested_at,
            start_time: request.start_time,
            end_time: performance.now(),
            result: null,
            error: err instanceof Error ? err.toString() : String(err),
        }
        delete_evaluation_request(request)
        request.resolve(response)
    }

    return promise_result
}
