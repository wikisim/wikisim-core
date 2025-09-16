import { expect } from "chai"

import {
    validate_function_arguments_from_json,
    validate_scenarios_from_json
} from "./validate_fields"


describe("validate_function_arguments_from_json", () =>
{
    it("should return for null input", () =>
    {
        const result = validate_function_arguments_from_json(null)
        expect(result).equals(undefined)
    })


    it("should return for undefined input", () =>
    {
        const result = validate_function_arguments_from_json(undefined)
        expect(result).equals(undefined)
    })


    it("should return an empty array", () =>
    {
        const result = validate_function_arguments_from_json([])
        expect(result).deep.equals([])
    })


    it("should validate and return an array of DBFunctionArgument", () =>
    {
        const input = [
            { name: "arg1", description: "desc1", default_value: "default1" },
            { name: "arg2" }, // description and default_value are optional
        ]
        const result = validate_function_arguments_from_json(input)

        expect(result).deep.equals([
            { name: "arg1", description: "desc1", default_value: "default1" },
            { name: "arg2" },
        ])
    })


    it("should raise an error on invalid DBFunctionArgument", () =>
    {
        const test_cases = [
            "invalid",
            [{}], // missing required 'name'
            [null],
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            [{ name: 123 as any }], // invalid, should be filtered out
        ]

        test_cases.forEach(test_case =>
        {
            expect(() => validate_function_arguments_from_json(test_case))
                .to.throw(/code": "invalid_type"/)
        })
    })
})


describe("validate_scenarios_from_json", () =>
{
    it("should return when null or undefined is input", () =>
    {
        const test_cases = [
            null,
            undefined,
        ]

        test_cases.forEach(test_case =>
        {
            const result = validate_scenarios_from_json(test_case)
            expect(result).equals(undefined, `Failed for input: ${JSON.stringify(test_case)}`)
        })
    })

    it("should return an empty array", () =>
    {
        const result = validate_scenarios_from_json([])
        expect(result).deep.equals([])
    })

    it("should validate and return an array of DBScenario", () =>
    {
        const input = [
            {
                description: "Test scenario 1",
                values: {
                    arg1: { value: "value1", iterate_over: true },
                    arg2: { value: "value2" }, // iterate_over is optional
                },
                expected_result: "expected1",
                expectation_met: true,
            },
            {
                values: {
                    argA: { value: "valueA" },
                },
                // description, expected_result, and expectation_met are optional
            },
            {
                values: {},
            }
        ]
        const result = validate_scenarios_from_json(input)

        expect(result).deep.equals([
            {
                description: "Test scenario 1",
                values: {
                    arg1: { value: "value1", iterate_over: true },
                    arg2: { value: "value2" },
                },
                expected_result: "expected1",
                expectation_met: true,
            },
            {
                values: {
                    argA: { value: "valueA" },
                },
            },
            {
                values: {},
            }
        ])
    })

    it("should raise an error on invalid DBScenario", () =>
    {
        const test_cases = [
            "invalid",
            [{}], // missing required 'values'
            [null],
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            [{ values: "invalid" as any }],
        ]

        test_cases.forEach(test_case =>
        {
            expect(() => validate_scenarios_from_json(test_case))
                .to.throw(/code": "invalid_type"/)
        })
    })
})
