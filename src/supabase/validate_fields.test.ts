import { expect } from "chai"

import {
    validate_function_arguments_as_json,
    validate_scenarios_as_json
} from "./validate_fields"


describe("validate_function_arguments_as_json", () =>
{
    it("should return null for null input", () =>
    {
        const result = validate_function_arguments_as_json(null)
        expect(result).equals(null)
    })


    it("should return null for undefined input", () =>
    {
        const result = validate_function_arguments_as_json(undefined)
        expect(result).equals(null)
    })


    it("should return an empty array", () =>
    {
        const result = validate_function_arguments_as_json([])
        expect(result).deep.equals([])
    })


    it("should validate and return an array of DBFunctionArgument", () =>
    {
        const input = [
            { name: "arg1", description: "desc1", default_value: "default1" },
            { name: "arg2" }, // description and default_value are optional
        ]
        const result = validate_function_arguments_as_json(input)

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
            try
            {
                validate_function_arguments_as_json(test_case)
            }
            catch (e: unknown)
            {
                const err = e as Error
                expect(err.message).includes(`"code": "invalid_type"`)
                return
            }
            expect.fail(`Expected an error to be thrown for "${JSON.stringify(test_case)}"`)
        })
    })
})


describe("validate_scenarios_as_json", () =>
{
    it("should return null when null or undefined is input", () =>
    {
        const test_cases = [
            null,
            undefined,
        ]

        test_cases.forEach(test_case =>
        {
            const result = validate_scenarios_as_json(test_case)
            expect(result).equals(null, `Failed for input: ${JSON.stringify(test_case)}`)
        })
    })

    it("should return an empty array", () =>
    {
        const result = validate_scenarios_as_json([])
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
        const result = validate_scenarios_as_json(input)

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
            try
            {
                validate_scenarios_as_json(test_case)
            }
            catch (e: unknown)
            {
                const err = e as Error
                expect(err.message).includes(`"code": "invalid_type"`)
                return
            }
            expect.fail(`Expected an error to be thrown for "${JSON.stringify(test_case)}"`)
        })
    })
})
