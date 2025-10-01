import { expect } from "chai"

import {
    valid_value_number_display_type,
    valid_value_type,
} from "./field_values_with_defaults"
import { NUMBER_DISPLAY_TYPES, VALUE_TYPES } from "./interface"


describe("valid_value_type", () =>
{
    it("returns default for null/undefined", () =>
    {
        expect(valid_value_type(null)).equals("number")
        expect(valid_value_type(undefined)).equals("number")
    })

    it("returns default for invalid value", () =>
    {
        expect(valid_value_type("invalid_value")).equals("number")
        expect(valid_value_type("")).equals("number")
    })

    it("returns the value if valid", () =>
    {
        VALUE_TYPES.forEach((type) =>
        {
            expect(valid_value_type(type)).equals(type)
        })
    })
})


describe("valid_value_number_display_type", () =>
{
    it("returns default for null/undefined", () =>
    {
        expect(valid_value_number_display_type(null)).equals("bare")
        expect(valid_value_number_display_type(undefined)).equals("bare")
    })

    it("returns default for invalid value", () =>
    {
        expect(valid_value_number_display_type("invalid_value")).equals("bare")
        expect(valid_value_number_display_type("")).equals("bare")
    })

    it("returns the value if valid", () =>
    {
        NUMBER_DISPLAY_TYPES.forEach((type) =>
        {
            expect(valid_value_number_display_type(type)).equals(type)
        })
    })
})
