import { LabelsAndResults } from "../evaluation/interface"
import { MergedLabelsAndResults, ResultPoint } from "./interface"


export function compare_results_to_expectations(data: LabelsAndResults, expected_data: LabelsAndResults | false): MergedLabelsAndResults
{
    if (!expected_data)
    {
        return { ...data, expected: undefined }
    }

    const all_labels = Array.from(new Set([...data.labels, ...expected_data.labels])).sort((a, b) => a - b)

    const results: ResultPoint[] = []
    const expected = {
        matched: [] as boolean[],
        results: [] as ResultPoint[],
    }

    all_labels.forEach(label =>
    {
        const index1 = data.labels.indexOf(label)
        let result = data.results[index1] ?? null
        const expected_index = expected_data.labels.indexOf(label)
        const expected_result = expected_data.results[expected_index] ?? null

        const matched = expected_result === null || result === expected_result
        expected.matched.push(matched)

        if (result === null && expected_result !== null)
        {
            result = expected_result
        }

        results.push(result)
        expected.results.push(expected_result)
    })

    return { labels: all_labels, results, expected }
}
