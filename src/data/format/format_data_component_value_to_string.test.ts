import { expect } from "chai"

import { init_data_component } from "../modify"
import { format_data_component_value_to_string } from "./format_data_component_value_to_string"


describe("format_data_component_value_to_string", () =>
{
    it("should format a number value correctly", () =>
    {
        const data_component = init_data_component({ value: "1.2345" })

        const result = format_data_component_value_to_string(data_component)
        expect(result).equals("1.2")
    })

    it("should handle an empty or invalid number value", () =>
    {
        const invalid_number_values = [
            undefined,
            "",
            "abc",
        ]

        invalid_number_values.forEach(value =>
        {
            const data_component = init_data_component({ value })

            const result = format_data_component_value_to_string(data_component)
            expect(result).equals("")
        })
    })
})
