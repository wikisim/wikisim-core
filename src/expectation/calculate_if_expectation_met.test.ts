import { expect } from "chai"

import { fixture_evaluation_response } from "../test/fixtures"
import { calculate_if_expectation_met } from "./calculate_if_expectation_met"


describe("calculate_if_expectation_met", () =>
{
    it("returns undefined if result is undefined", () =>
    {
        const result = calculate_if_expectation_met(undefined, "expected result")
        expect(result).equals(undefined)
    })

    describe("auto -> exact_json_match", () =>
    {
        it("returns true if results match", () =>
        {
            const result = calculate_if_expectation_met(fixture_evaluation_response(), "3")
            expect(result).equals(true)
        })

        it("returns false if results do not match", () =>
        {
            const result = calculate_if_expectation_met(fixture_evaluation_response(), "42")
            expect(result).equals(false)
        })
    })

    describe("auto -> graphable", () =>
    {
        it("returns true if graphable results match", () =>
        {
            const result = calculate_if_expectation_met(
                fixture_evaluation_response({
                    result: `{"labels":[1,2,3],"results":[1,2,3]}`
                }),
                // Intentionally leaving in spaces so that we test the direct
                // JSON string comparison is not used and the graphable
                // comparison is used.
                `{"labels": [1, 2, 3], "results": [1, 2, 3]}`
            )
            expect(result).equals(true)
        })

        it("returns false if graphable results do not match", () =>
        {
            const result = calculate_if_expectation_met(
                fixture_evaluation_response({
                    result: `{"labels":[1,2,3],"results":["a","b","c"]}`
                }),
                // Intentionally leaving in spaces so that we test the direct
                // JSON string comparison is not used and the graphable
                // comparison is used.
                `{"labels": [1, 2, 3], "results": [1, 2, 3]}`
            )
            expect(result).equals(false)
        })
    })
})
