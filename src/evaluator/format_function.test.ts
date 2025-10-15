import { expect } from "chai"

import { FunctionArgument } from "../data/interface"
import { deindent } from "../utils/deindent"
import { format_function_input_value_string } from "./format_function"
import { EvaluationRequest } from "./interface"


describe("format_function_input_value_string", () =>
{
    const function_arguments: FunctionArgument[] = [
        // Swap around the order to ensure formatting uses argument
        // positions not names
        { id: 0, name: "min", default_value: "0" },
        { id: 1, name: "value" },
    ]


    it("formats a single line function correctly", () =>
    {
        const basic_request: EvaluationRequest = {
            requested_at: 0,
            js_input_value: "Math.max(value, min)",
        }
        const { result, first_line_sans_body } = format_function_input_value_string({ ...basic_request, function_arguments })
        expect(result).to.equal("(min = 0, value) => Math.max(value, min)")
        expect(first_line_sans_body).to.equal("(min = 0, value) => ")
    })


    it("does not use empty default_value", () =>
    {
        const function_arguments: FunctionArgument[] = [
            { id: 0, name: "min", default_value: "" }
        ]
        const basic_request: EvaluationRequest = {
            requested_at: 0,
            js_input_value: "Math.max(1, min)",
        }
        const { result } = format_function_input_value_string({ ...basic_request, function_arguments })
        expect(result).to.equal("(min) => Math.max(1, min)")
    })


    it("formats a multi-line function with a return correctly", () =>
    {
        const basic_request: EvaluationRequest = {
            requested_at: 0,
            js_input_value: `
            result = Math.max(min, value)
            return result`,
        }
        const { result, first_line_sans_body } = format_function_input_value_string({ ...basic_request, function_arguments })
        expect(result).to.equal(deindent(`
        (min = 0, value) => {
            result = Math.max(min, value)
            return result
        }`))
        expect(first_line_sans_body).to.equal("(min = 0, value) => ")
    })


    it("formats a multi-line function without a return by auto inserting return", () =>
    {
        const basic_request: EvaluationRequest = {
            requested_at: 0,
            js_input_value: `
            result = Math.max(min, value)
            result + 1`,
        }
        const { result } = format_function_input_value_string({ ...basic_request, function_arguments })
        expect(result).to.equal(deindent(`
        (min = 0, value) => {
            result = Math.max(min, value)
            return result + 1
        }`))
    })


    it("does not make empty functions", () =>
    {
        const function_arguments: FunctionArgument[] = [
            { id: 0, name: "min", default_value: "" }
        ]
        const basic_request: EvaluationRequest = {
            requested_at: 0,
            js_input_value: "",
        }
        const { result } = format_function_input_value_string({ ...basic_request, function_arguments })
        expect(result).to.equal("")
    })
})
