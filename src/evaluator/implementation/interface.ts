import { EvaluationRequest, EvaluationResponse } from "../interface"



export interface ExtendedEvaluationRequest extends Omit<EvaluationRequest, "data_component_by_id_and_version">
{
    evaluation_id: number
    requested_at: number
    start_time: number
    timeout_id?: ReturnType<typeof setTimeout>
    promise_result: Promise<EvaluationResponse>
    resolve: (response: EvaluationResponse) => void
}
