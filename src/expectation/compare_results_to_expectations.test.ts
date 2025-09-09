import { expect } from "chai"
import { LabelsAndResults } from "../evaluation/interface"
import { compare_results_to_expectations } from "./compare_results_to_expectations"


describe("compare_results_to_expectations", () =>
{
    it("returns data with expected undefined if no expected_data provided", () =>
    {
        const data: LabelsAndResults = { labels: [1, 2, 3], results: [10, 20, 30] }
        const result = compare_results_to_expectations(data, false)
        expect(result).deep.equals({ labels: [1, 2, 3], results: [10, 20, 30], expected: undefined })
    })

    it("compares results to expectations correctly", () =>
    {
        const data: LabelsAndResults = { labels: [1, 2, 3], results: [10, 20, 30] }
        const expected_data: LabelsAndResults = { labels: [2, 3, 4], results: [20, 99, 40] }
        const result = compare_results_to_expectations(data, expected_data)
        expect(result).deep.equals({
            labels: [1, 2, 3, 4],
            results: [10, 20, 30, 40],
            expected: {
                matched: [
                    true, // it "matches" because no expectation
                    true, // matches
                    false, // does not match
                    false, // it does not match as no actual result
                ],
                results: [null, 20, 99, 40],
            },
        })
    })
})
