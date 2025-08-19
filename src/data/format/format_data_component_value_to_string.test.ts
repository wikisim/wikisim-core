import { expect } from "chai"

import { init_data_component } from "../modify"
import { format_data_component_value_to_string } from "./format_data_component_value_to_string"


describe("format_data_component_value_to_string", () =>
{
    it("should format a number value correctly", () =>
    {
        const data_component = init_data_component({ result_value: "1.2345" })
        const result = format_data_component_value_to_string(data_component)
        expect(result).equals("1.2", "Should default to 2 significant figures and bare display type formatting")
    })

    it("should not use input_value for result value", () =>
    {
        const data_component = init_data_component({ input_value: "" })
        const result = format_data_component_value_to_string(data_component)
        expect(result).equals("")
    })

    it("should use sig_figs for formatting", () =>
    {
        const data_component = init_data_component({ result_value: "1.2345", value_number_sig_figs: 10 })
        const result = format_data_component_value_to_string(data_component)
        expect(result).equals("1.2345")
    })

    it("should use display_type for formatting", () =>
    {
        const data_component = init_data_component({ result_value: "1.2345", value_number_display_type: "scientific" })
        const result = format_data_component_value_to_string(data_component)
        expect(result).equals("1.2e0")
    })

    it("should handle an empty or invalid number value", () =>
    {
        const invalid_number_values = [
            undefined,
            "",
            "abc",
        ]

        invalid_number_values.forEach(result_value =>
        {
            const data_component = init_data_component({ result_value })

            const result = format_data_component_value_to_string(data_component)
            expect(result).equals("")
        })
    })
})
