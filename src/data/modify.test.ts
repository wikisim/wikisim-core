import { expect } from "chai"

import { IdAndVersion } from "./id"
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
    const modified: DataComponent = init_data_component({
        // This field should not and will never be changed once a component is
        // created, but whilst a new component is being edited for the first
        // time it may be changed.
        owner_id: "owner_2",

        editor_id: "editor_1",
        created_at: new Date("2025-07-30T00:00:00Z"),
        comment: "Another comment",
        bytes_changed: 100,
        version_type: "minor",
        version_rolled_back_to: -10,

        title: "<p>Modified Title</p>",
        description: "<p>Modified Description</p>",
        label_ids: [-2, -3],

        input_value: "Modified Value",
        result_value: "Modified Value",
        value_type: "number",
        value_number_display_type: "scientific",
        value_number_sig_figs: 3,
        datetime_range_start: new Date("2025-07-30T00:00:00Z"),
        datetime_range_end: new Date("2025-07-30T00:00:00Z"),
        datetime_repeat_every: "day",
        units: "some units",
        dimension_ids: [ new IdAndVersion(-1, 1) ],
        function_arguments: [
            {
                id: 1,
                name: "arg1",
                default_value: "123",
            }
        ],
        scenarios: [
            {
                id: 1,
                values: { arg1: { value: "456" } },
            }
        ],

        plain_title: "Modified Title",
        plain_description: "Modified Description",

        test_run_id: "test_run_-789",
    })

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
