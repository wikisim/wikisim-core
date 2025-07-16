import { expect } from "chai"

import { DataComponent } from "./interface"
import { new_data_component, set_fields } from "./modify"


describe("can created a new data component", () => {
    it("should create a new data component with default values", () => {
        const data_component: DataComponent = new_data_component()
        expect(data_component.id).equals(-1)
        expect(data_component.version_number).equals(1)
        expect(data_component.title).equals("")
        expect(data_component.description).equals("")
        expect(data_component.value_type).equals(undefined)
        expect(data_component.datetime_repeat_every).equals(undefined)
        expect(data_component.version_is_current).equals("yes")
        expect(data_component.version_requires_save).equals(true)
    })

    it("should set fields correctly", () => {
        let data_component: DataComponent = new_data_component()
        expect(() =>
            set_fields(data_component, { title: "Test Title" })
        ).throws("Cannot set title, requires UI libraries.")

        expect(() =>
            set_fields(data_component, { description: "Test Description" })
        ).throws("Cannot set description, requires UI libraries.")
    })
})
