import { expect } from "chai"

import { data_component_all_fields_set } from "../test/fixtures"
import { DataComponent } from "./interface"
import { changes_made, init_data_component } from "./modify"


describe("can create a new data component", () =>
{
    it("should create a new data component with default values", () =>
    {
        const data_component: DataComponent = init_data_component({}, true)
        expect(data_component.id.to_str()).equals(`-1v1`)
        expect(data_component.id.id).equals(-1)
        expect(data_component.id.version).equals(1)
        expect(data_component.title).equals("")
        expect(data_component.description).equals("<p></p>")
        expect(data_component.value_type).equals(undefined)
        expect(data_component.datetime_repeat_every).equals(undefined)
    })
})


describe("changes_made function", () =>
{
    it("should return false when no changes made to the data component", () =>
    {
        const original: DataComponent = init_data_component({ title: "Original Title", description: "Original Description" })
        const unchanged: DataComponent = init_data_component({ title: "Original Title", description: "Original Description" })

        expect(changes_made(original, original)).equals(false)
        expect(changes_made(unchanged, original)).equals(false)
    })

    const original: DataComponent = init_data_component({}, true)
    const modified: DataComponent = data_component_all_fields_set()

    const normal_fields: (keyof DataComponent)[] = [
        "owner_id",

        "title",
        "description",
        "label_ids",

        "input_value",
        "result_value",
        "value_type",
        "value_number_display_type",
        "value_number_sig_figs",
        "datetime_range_start",
        "datetime_range_end",
        "datetime_repeat_every",
        "units",
        "dimension_ids",
        "function_arguments",
        "scenarios",
    ]

    const meta_fields: (keyof DataComponent)[] = [
        "comment",
        "bytes_changed",
        "version_type",
        "version_rolled_back_to",
    ]

    const derived_or_special_fields: (keyof DataComponent)[] = [
        // Not sure we want to compare these fields yet
        "editor_id",
        "created_at",

        // These fields are derived or special and should not be compared
        "plain_title",
        "plain_description",
        "recursive_dependency_ids",
        "test_run_id",
    ]

    it("should return true for changes to normal fields but not meta or special when compare_meta_fields is false", () =>
    {
        normal_fields.forEach(field => {
            const updated_component = { ...original, [field]: modified[field] }
            expect(changes_made(original, updated_component)).equals(true, `Changes should be detected for field "${field}"`)
            expect(changes_made(updated_component, original)).equals(true, `Changes should be detected for field "${field}" in both directions`)
        })

        meta_fields.forEach(field => {
            const updated_component = { ...original, [field]: modified[field] }
            expect(changes_made(original, updated_component)).equals(false, `Changes should be not detected for meta field "${field}" when compare_meta_fields is false`)
            expect(changes_made(updated_component, original)).equals(false, `Changes should be not detected for meta field "${field}" in both directions when compare_meta_fields is false`)
        })

        derived_or_special_fields.forEach(field => {
            const updated_component = { ...original, [field]: modified[field] }
            expect(changes_made(original, updated_component)).equals(false, `Changes should be not detected for derived or special field "${field}" when compare_meta_fields is false`)
            expect(changes_made(updated_component, original)).equals(false, `Changes should be not detected for derived or special field "${field}" in both directions when compare_meta_fields is false`)
        })
    })

    it("should return true for changes to normal and meta fields but not special when compare_meta_fields is true", () =>
    {
        [...normal_fields, ...meta_fields].forEach(field => {
            const updated_component = { ...original, [field]: modified[field] }
            expect(changes_made(original, updated_component, true)).equals(true, `Changes should be detected for field "${field}"`)
            expect(changes_made(updated_component, original, true)).equals(true, `Changes should be detected for field "${field}" in both directions`)
        })

        derived_or_special_fields.forEach(field => {
            const updated_component = { ...original, [field]: modified[field] }
            expect(changes_made(original, updated_component, true)).equals(false, `Changes should be not detected for derived or special field "${field}" when compare_meta_fields is true`)
            expect(changes_made(updated_component, original, true)).equals(false, `Changes should be not detected for derived or special field "${field}" in both directions when compare_meta_fields is true`)
        })
    })
})
