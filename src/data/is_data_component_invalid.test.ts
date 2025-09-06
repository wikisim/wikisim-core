import { expect } from "chai"

import { is_data_component_invalid } from "./is_data_component_invalid"
import { init_data_component, init_new_data_component } from "./modify"


describe("is_data_component_invalid", () =>
{
    it("should return false for newly inited new_data_component", () =>
    {
        const component = init_new_data_component()
        expect(is_data_component_invalid(component)).equals(false)
    })

    it("should return false for newly inited data_component", () =>
    {
        const component = init_data_component()
        expect(is_data_component_invalid(component)).equals(false)
    })

    describe("function inputs aka function arguments", () =>
    {
        it("should return an error when a function input name is empty", () =>
        {
            const component = init_new_data_component()
            component.function_arguments = [
                { id: 1, name: " ", value_type: "number", description: "" },
            ]
            expect(is_data_component_invalid(component)).equals("All inputs must have a name or be deleted")
        })

        it("should return an error when a function input name is duplicated", () =>
        {
            const component = init_new_data_component()
            component.function_arguments = [
                { id: 1, name: "min", value_type: "number", description: "" },
                { id: 2, name: "min", value_type: "number", description: "" },
            ]
            expect(is_data_component_invalid(component)).equals(`Input names must be unique but "min" is duplicated`)
        })
    })
})
