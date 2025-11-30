/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect } from "chai"
import { z } from "zod"

import { data_component_all_fields_set, new_data_component_all_fields_set } from "../test/fixtures"
import { DataComponent, NewDataComponent, VALUE_TYPES, ValueType } from "./interface"
import { make_field_validators } from "./validate_fields"


describe("validate_function_arguments_from_json", () =>
{
    const { validate_function_arguments_from_json } = make_field_validators(z)

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
    const { validate_scenarios_from_json } = make_field_validators(z)

    it("should return when null or undefined is input", () =>
    {
        const test_cases = [
            null,
            undefined,
        ]

        test_cases.forEach(test_case =>
        {
            const result = validate_scenarios_from_json(test_case, new Set())
            expect(result).equals(undefined, `Failed for input: ${JSON.stringify(test_case)}`)
        })
    })

    it("should return undefined from an array", () =>
    {
        const result = validate_scenarios_from_json([], new Set())
        expect(result).equals(undefined)
    })

    it("should validate and return an array of DBScenario", () =>
    {
        const input = [
            {
                description: "Test scenario 1",
                values: {
                    arg1: { value: "value1", iterate_over: true },
                    arg2: { value: "value2" }, // iterate_over is optional
                    arg3: { value: "", use_previous_result: true },
                },
                expected_result: "expected1",
                expectation_met: true,
                selected_paths: [
                    [{ key: "months" }],
                    [{ key: "data" }, { index: "*" }, { key: "value" }, { index: 0 }],
                ],
                selected_path_names: {
                    '[{"key":"months"}]': "Month",
                    '[{"key":"data"},{"index":"*"},{"key":"value"},{"index":0}]': "Some field name",
                },
                graphs: [
                    {
                        x_axis_path: '[{"key":"months"}]',
                        y_axis_series: ['[{"key":"data"},{"index":"*"},{"key":"value"},{"index":0}]'],
                    }
                ]
            },
            {
                values: {
                    // Should have `use_previous_result` removed because there
                    // is not a valid use of `iterate_over`
                    arg1: { value: "valueA", use_previous_result: true },
                    // Should remove `iterate_over` key because it's false
                    // Should also trim whitespace from value
                    arg3: { value: "  123  ", iterate_over: false },
                    // Should be removed as arg_none is not a valid input argument name
                    arg_none: { value: "valueB" },
                },
                // description, expected_result, expectation_met,
                // selected_paths, and selected_path_names are optional
            },
            {
                values: {},
            },
            {
                values: {
                    // Should remove the `use_previous_result` option because it
                    // already has the `iterate_over` option
                    arg1: { value: "valueC", iterate_over: true, use_previous_result: true },
                    // Should remove the `iterate_over` option because there is
                    // already an input value using it.
                    arg2: { value: "valueD", iterate_over: true, use_previous_result: true },
                    // Should remove the `iterate_over` and `use_previous_result`
                    // options because there are already input values using it.
                    arg3: { value: "valueE", iterate_over: true, use_previous_result: true },
                },
            },
        ]
        const result = validate_scenarios_from_json(input, new Set(["arg1", "arg2", "arg3"]))

        expect(result).deep.equals([
            {
                description: "Test scenario 1",
                values: {
                    arg1: { value: "value1", iterate_over: true },
                    arg2: { value: "value2" },
                    arg3: { value: "", use_previous_result: true },
                },
                expected_result: "expected1",
                expectation_met: true,
                selected_paths: [
                    [{ key: "months" }],
                    [{ key: "data" }, { index: "*" }, { key: "value" }, { index: 0 }],
                ],
                selected_path_names: {
                    '[{"key":"months"}]': "Month",
                    '[{"key":"data"},{"index":"*"},{"key":"value"},{"index":0}]': "Some field name",
                },
                graphs: [
                    {
                        x_axis_path: '[{"key":"months"}]',
                        y_axis_series: ['[{"key":"data"},{"index":"*"},{"key":"value"},{"index":0}]'],
                    },
                ],
            },
            {
                values: {
                    arg1: { value: "valueA" },
                    arg3: { value: "123" },
                },
            },
            {
                values: {},
            },
            {
                values: {
                    arg1: { value: "valueC", iterate_over: true },
                    arg2: { value: "valueD", use_previous_result: true },
                    arg3: { value: "valueE" },
                },
            },
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
            expect(() => validate_scenarios_from_json(test_case, new Set()))
                .to.throw(/code": "invalid_type"/)
        })
    })

    it("should remove invalid path strings from selected_path_names", () =>
    {
        const input = [
            {
                values: {},
                selected_paths: [
                    [{ key: "months" }],
                ],
                selected_path_names: {
                    '[{"key":"months"}]': "Month",
                    '[{"key":"years"}]': "Year",
                },
            },
        ]
        const result = validate_scenarios_from_json(input, new Set())
        expect(result).deep.equals([
            {
                values: {},
                selected_paths: [
                    [{ key: "months" }],
                ],
                selected_path_names: {
                    '[{"key":"months"}]': "Month",
                },
            },
        ])
    })

    it("should remove invalid path strings from graphs", () =>
    {
        const input = [
            {
                values: {},
                selected_paths: [
                    [{ key: "months" }],
                ],
                graphs: [
                    {
                        x_axis_path: '[{"key":"years"}]',
                        y_axis_series: [
                            '[{"key":"years"}]',
                        ],
                    }
                ],
            },
        ]
        const result = validate_scenarios_from_json(input, new Set())
        expect(result).deep.equals([
            {
                values: {},
                selected_paths: [
                    [{ key: "months" }],
                ],
            },
        ])
    })
})


describe("validate_fields_given_value_type", () =>
{
    const { validate_fields_given_value_type } = make_field_validators(z)

    it("should remove specific (optional) fields give different value_types", () =>
    {
        // Whether a field should be kept or removed given a specific value_type
        // true or undefined means the field should be kept, false means it
        // should be removed
        const fields_keep_or_remove: {[k in keyof (DataComponent & NewDataComponent)]: true | {[v in ValueType]?: true}} = {
            "temporary_id": true,
            "id": true,

            "owner_id": true,

            "editor_id": true,
            "created_at": true,
            "comment": true,
            "bytes_changed": true,
            "version_type": true,
            "version_rolled_back_to": true,

            "title": true,
            "description": true,
            "label_ids": true,

            "input_value": {
                number: true,
                // datetime_range: false,
                number_array: true,
                function: true,
                // interactable: false, // interactable should only have result_value
            },
            "result_value": {
                number: true,
                // datetime_range: false,
                number_array: true,
                function: true,
                interactable: true,
            },
            "recursive_dependency_ids": {
                number: true,
                // datetime_range: false,
                number_array: true,
                function: true,
                // interactable: false, // for now interactable should not store this
            },
            "value_type": true,
            "value_number_display_type": {
                number: true,
                // datetime_range: false,
                number_array: true,
                // function: false,
                // interactable: false,
            },
            "value_number_sig_figs": {
                number: true,
                // datetime_range: false,
                number_array: true,
                // function: false,
                // interactable: false,
            },
            "datetime_range_start": {
                // number: false,
                datetime_range: true,
                // number_array: false,
                // function: false,
                // interactable: false,
            },
            "datetime_range_end": {
                // number: false,
                datetime_range: true,
                // number_array: false,
                // function: false,
                // interactable: false,
            },
            "datetime_repeat_every": {
                // number: false,
                datetime_range: true,
                // number_array: false,
                // function: false,
                // interactable: false,
            },
            "units": {
                number: true,
                // datetime_range: false,
                number_array: true,
                function: true,
                // interactable: false,
            },
            "dimension_ids": {
                // number: false,
                // datetime_range: false,
                number_array: true,
                // function: false,
                // interactable: false,
            },
            "function_arguments": {
                // number: false,
                // datetime_range: false,
                // number_array: false,
                function: true,
                // interactable: false,
            },
            "scenarios": {
                // number: false,
                // datetime_range: false,
                // number_array: false,
                function: true,
                // interactable: false,
            },

            "plain_title": true,
            "plain_description": true,

            "test_run_id": true,
        }

        VALUE_TYPES.forEach(value_type =>
        {
            const data_component = data_component_all_fields_set({ value_type })
            const result = validate_fields_given_value_type(data_component)

            Object.entries(fields_keep_or_remove).forEach(([field_, keep_or_remove]) =>
            {
                const field = field_ as keyof DataComponent

                // Assert there is some field value unless it's temporary_id
                // @ts-ignore
                const is_not_temporary_id = field !== "temporary_id"
                expect(!!data_component[field]).equals(is_not_temporary_id, `Test setup error: field "${field}" has ${is_not_temporary_id ? "no value" : "some value"}`)

                const should_keep: boolean = keep_or_remove === true
                    ? true
                    : keep_or_remove[value_type] ?? false

                if (should_keep)
                {
                    expect(result[field]).equals(data_component[field], `Expected to keep value for field "${field}" with value_type "${value_type}"`)
                }
                else
                {
                    expect(result[field]).equals(undefined, `Expected to remove value for field "${field}" with value_type "${value_type}"`)
                }
            })

            // Check the id and temporary_id fields when is a new data component
            const new_data_component = new_data_component_all_fields_set({ value_type })
            const new_result = validate_fields_given_value_type(new_data_component)

            Object.entries(fields_keep_or_remove).forEach(([field_, keep_or_remove]) =>
            {
                const field = field_ as keyof NewDataComponent

                // Assert there is some field value unless it's id
                // @ts-ignore
                const is_not_id = field !== "id"
                expect(!!new_data_component[field]).equals(is_not_id, `Test setup error: field "${field}" has ${is_not_id ? "no value" : "some value"}`)

                const should_keep: boolean = keep_or_remove === true
                    ? true
                    : keep_or_remove[value_type] ?? false

                if (should_keep)
                {
                    expect(new_result[field]).equals(new_data_component[field], `Expected to keep value for field "${field}" with value_type "${value_type}"`)
                }
                else
                {
                    expect(new_result[field]).equals(undefined, `Expected to remove value for field "${field}" with value_type "${value_type}"`)
                }
            })
        })
    })
})
