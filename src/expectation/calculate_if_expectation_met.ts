import { result_string_to_graphable } from "../evaluation/parse_result"
import { EvaluationResponse } from "../evaluator/interface"
import { compare_results_to_expectations } from "./compare_results_to_expectations"



export function calculate_if_expectation_met(result: EvaluationResponse | undefined, expected_result: string): boolean | undefined
{
    if (result === undefined) return undefined
    if (result.result === null) return false

    const graphable_data = result_string_to_graphable(result.result)
    const graphable_expected_data = result_string_to_graphable(expected_result)

    let match: boolean | undefined
    if (!graphable_data)
    {
        match = expected_result
            ? result.result === expected_result
            : undefined
    }
    else
    {
        const merged = compare_results_to_expectations(graphable_data, graphable_expected_data)
        match = merged.expected?.matched.every(d => d)
    }

    return match
}
