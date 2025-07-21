import { expect } from "chai"

import { DataComponent } from "./interface"
import { changes_made, new_data_component, set_fields } from "./modify"


describe("can created a new data component", () => {
    it("should create a new data component with default values", () => {
        const data_component: DataComponent = new_data_component()
        expect(data_component.id.to_str()).equals(`-1v1`)
        expect(data_component.id.id).equals(-1)
        expect(data_component.id.version).equals(1)
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


describe("changes_made function", () => {
    it("should detect changes made to the data component", () => {
        const original: DataComponent = new_data_component({ title: "Original Title", description: "Original Description" })
        const unchanged: DataComponent = new_data_component({ title: "Original Title", description: "Original Description" })
        const modified: DataComponent = new_data_component({ title: "Modified Title", description: "Original Description" })

        expect(changes_made(original, original)).equals(false)
        expect(changes_made(unchanged, original)).equals(false)
        expect(changes_made(modified, modified)).equals(false)

        expect(changes_made(modified, original)).equals(true)
        expect(changes_made(original, modified)).equals(true, "Changes should be detected in both directions")
    })
})
