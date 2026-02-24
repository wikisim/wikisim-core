import { ExtendedEvaluationRequest } from "./interface"


const requests: Record<number, ExtendedEvaluationRequest> = {}
let previous_request: ExtendedEvaluationRequest | undefined
export async function request_next_evaluation(request: ExtendedEvaluationRequest)
{
    requests[request.evaluation_id] = request

    const previous_promise_result = previous_request?.promise_result
    previous_request = request

    await previous_promise_result
}


export function get_evaluation_request(evaluation_id: number): ExtendedEvaluationRequest | undefined
{
    return requests[evaluation_id]
}


export function delete_evaluation_request(evaluation_request: { evaluation_id: number }): void
{
    delete requests[evaluation_request.evaluation_id]
}
