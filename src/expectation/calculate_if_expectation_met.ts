import { result_string_to_graphable } from "../evaluation/parse_result"
import { EvaluationResponse } from "../evaluator/interface"
import { compare_results_to_expectations } from "./compare_results_to_expectations"



export function calculate_if_expectation_met(result: EvaluationResponse | string | undefined, expected_result: string): boolean | undefined
{
    if (result === undefined) return undefined
    const result_str = typeof result === "string" ? result : result.result
    if (result_str === null) return false

    const graphable_data = result_string_to_graphable(result_str)
    const graphable_expected_data = result_string_to_graphable(expected_result)

    let match: boolean | undefined
    if (!graphable_data)
    {
        match = expected_result
            ? result_str === expected_result
            : undefined
    }
    else
    {
        const merged = compare_results_to_expectations(graphable_data, graphable_expected_data)
        match = merged.expected?.matched.every(d => d)
    }

    return match
}
