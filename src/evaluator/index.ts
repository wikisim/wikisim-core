import { DataComponent, NewDataComponent } from "../data/interface.ts"
import { format_function_input_value_string } from "./format_function.ts"
import { EvaluationRequest, EvaluationResponse } from "./interface.ts"
import { load_dependencies_into_sandbox } from "./load_dependencies_into_sandbox.ts"


interface CalculateResultValueArgs
{
    component: DataComponent | NewDataComponent
    data_components_by_id_and_version: Record<string, DataComponent>
    convert_tiptap_to_javascript: (tiptap_text: string) => string,
    /**
     * When run on the edge functions we pass undefined here as we can't
     * evaluate code in a sandbox.
     */
    evaluate_code_in_sandbox: undefined | ((request: EvaluationRequest) => Promise<EvaluationResponse>),
    timeout_ms?: number
}

export async function calculate_result_value(args: CalculateResultValueArgs): Promise<EvaluationResponse | null>
{
    const { component } = args
    const { input_value } = component

    if (!input_value) return Promise.resolve(null)

    const js_input_value = args.convert_tiptap_to_javascript(input_value)
    const basic_request: EvaluationRequest = {
        js_input_value,
        requested_at: performance.now(),
        timeout_ms: args.timeout_ms,
    }

    if (component.value_type === "function")
    {
        return format_function_input_value_string({
            ...basic_request,
            function_arguments: component.function_arguments || [],
        })
    }


    // When on edge function, args.evaluate_code_in_sandbox will be undefined so
    // we just return the result value as the args.component.result_value that
    // was given by the user.
    if (!args.evaluate_code_in_sandbox) return Promise.resolve({
        result: args.component.result_value || "",

        evaluation_id: 0,
        js_input_value,
        requested_at: basic_request.requested_at,
        start_time: 0,
        end_time: 0,
        error: null,
    })


    const load_dependencies_response = await load_dependencies_into_sandbox({
        component,
        data_components_by_id_and_version: args.data_components_by_id_and_version,
        evaluate_code_in_sandbox: args.evaluate_code_in_sandbox,
    })
    if (load_dependencies_response.error) return load_dependencies_response

    return await args.evaluate_code_in_sandbox(basic_request)
}
