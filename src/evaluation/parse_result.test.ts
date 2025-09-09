import { expect } from "chai"

import { result_string_to_graphable } from "./parse_result"


describe("result_string_to_graphable", () =>
{
    it("returns false for undefined", () =>
    {
        expect(result_string_to_graphable(undefined)).equals(false)
    })

    it("returns false for non-JSON", () =>
    {
        expect(result_string_to_graphable("not json")).equals(false)
    })

    it("returns an array of numbers for valid JSON", () =>
    {
        const result = result_string_to_graphable('{ "labels": [1,2,3], "results": [4,5,6] }')
        expect(result).to.deep.equal({ labels: [1, 2, 3], results: [4, 5, 6] })
    })
})
