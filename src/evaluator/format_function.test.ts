import { expect } from "chai"

import { FunctionArgument } from "../data/interface"
import { deindent } from "../utils/deindent"
import { format_function_input_value_string } from "./format_function"


describe("format_function_input_value_string", () =>
{
    const function_arguments: FunctionArgument[] = [
        // Swap around the order to ensure formatting uses argument
        // positions not names
        { local_temp_id: "0", name: "min", default_value: "0" },
        { local_temp_id: "1", name: "value" },
    ]


    it("formats a single line function correctly", () =>
    {
        const basic_request = {
            js_input_value: "Math.max(value, min)",
            function_arguments,
        }
        const result = format_function_input_value_string(basic_request)
        expect(result).equals("(min = 0, value) => {\n    return Math.max(value, min)\n}")
    })


    it("does not use empty default_value", () =>
    {
        const function_arguments: FunctionArgument[] = [
            { local_temp_id: "0", name: "min", default_value: "" }
        ]
        const basic_request = {
            js_input_value: "Math.max(1, min)",
            function_arguments,
        }
        const result = format_function_input_value_string(basic_request)
        expect(result).equals("(min) => {\n    return Math.max(1, min)\n}")
    })


    it("formats a multi-line function with a return correctly", () =>
    {
        const basic_request = {
            js_input_value: `
            result = Math.max(min, value)
            return result`,
            function_arguments,
        }
        const result = format_function_input_value_string(basic_request)
        expect(result).equals(deindent(`
        (min = 0, value) => {
            result = Math.max(min, value)
            return result
        }`))
    })


    it("formats a multi-line function without a return by auto inserting return", () =>
    {
        const basic_request = {
            js_input_value: `
            result = Math.max(min, value)
            result + 1`,
            function_arguments,
        }
        const result = format_function_input_value_string(basic_request)
        expect(result).equals(deindent(`
        (min = 0, value) => {
            result = Math.max(min, value)
            return result + 1
        }`))
    })

    it("does not auto auto insert return if return already mentioned in function body", () =>
    {
        const basic_request = {
            js_input_value: `
            return {
                a: min,
                b: value
            }`,
            function_arguments,
        }
        const result = format_function_input_value_string(basic_request)
        expect(result).equals(deindent(`
        (min = 0, value) => {
            return {
                a: min,
                b: value
            }
        }`))
    })


    it("does not make empty functions", () =>
    {
        const function_arguments: FunctionArgument[] = [
            { local_temp_id: "0", name: "min", default_value: "" }
        ]
        const basic_request = {
            js_input_value: "",
            function_arguments,
        }
        const result = format_function_input_value_string(basic_request)
        expect(result).equals("")
    })
})
