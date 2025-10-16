import { IdAndVersion } from "../data/id.ts"
import type { DataComponent, NewDataComponent } from "../data/interface.ts"
import { init_data_component, init_new_data_component } from "../data/modify.ts"


export function new_data_component_all_fields_set(overrides: Partial<NewDataComponent> = {}): NewDataComponent
{
    return init_new_data_component({
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
        recursive_dependency_ids: [ new IdAndVersion(-5, 1), new IdAndVersion(-6, 2) ],
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
                id: 0,
                name: "arg1",
                default_value: "123",
            }
        ],
        scenarios: [
            {
                id: 0,
                values: { arg1: { value: "456" } },
            }
        ],

        plain_title: "Modified Title",
        plain_description: "Modified Description",

        test_run_id: "test_run_-789",
        ...overrides,
    })
}


export function data_component_all_fields_set(overrides: Partial<DataComponent> = {}): DataComponent
{
    const {
        temporary_id: _,
        ...rest_new_data_component
    } = new_data_component_all_fields_set()

    return init_data_component({
        ...rest_new_data_component,
        ...overrides,
    })
}
