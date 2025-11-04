import { expect } from "chai"

import { is_data_component_invalid } from "./is_data_component_invalid"
import { init_data_component, init_new_data_component } from "./modify"


describe("is_data_component_invalid", () =>
{
    it("should return false for newly inited new_data_component", () =>
    {
        const component = init_new_data_component({}, true)
        expect(is_data_component_invalid(component)).equals(false)
    })

    it("should return false for newly inited data_component", () =>
    {
        const component = init_data_component({}, true)
        expect(is_data_component_invalid(component)).equals(false)
    })

    describe("function inputs aka function arguments", () =>
    {
        it("should return an error when a function input name is empty", () =>
        {
            const component = init_new_data_component({}, true)
            component.function_arguments = [
                { local_temp_id: "1", name: " ", description: "" },
            ]
            expect(is_data_component_invalid(component)).equals("All inputs must have a name or be deleted")
        })

        it("should return an error when a function input name is duplicated", () =>
        {
            const component = init_new_data_component({}, true)
            component.function_arguments = [
                { local_temp_id: "1", name: "min", description: "" },
                { local_temp_id: "2", name: "min", description: "" },
            ]
            expect(is_data_component_invalid(component)).equals(`Input names must be unique but "min" is duplicated`)
        })

        it("should return an error when a function input name does not start with a letter or underscore", () =>
        {
            const component = init_new_data_component({}, true)
            ;[" 1min ", " -min "].forEach(name =>
            {
                component.function_arguments = [
                    { local_temp_id: "2", name, description: "" },
                ]
                expect(is_data_component_invalid(component)).equals(`Input name must start with a letter or underscore but got "${name.trim()[0]}" as the first character of "${name.trim()}"`)
            })
        })

        it("should return an error when a function input name contains characters other than letters, numbers and underscore", () =>
        {
            const component = init_new_data_component({}, true)
            ;[" min imum ", " min-imum "].forEach(name =>
            {
                component.function_arguments = [
                    { local_temp_id: "2", name, description: "" },
                ]
                expect(is_data_component_invalid(component)).equals(`Input name must only contain letters, numbers, and underscores but got "${name.trim()}"`)
            })
        })

        it("should be valid when name contains underscore", () =>
        {
            const component = init_new_data_component({}, true)
            component.function_arguments = [
                { local_temp_id: "1", name: " min_imum1", description: "" },
            ]
            expect(is_data_component_invalid(component)).equals(false)
        })
    })
})
