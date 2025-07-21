// TODO: rename this file

import { IdAndVersion } from "./id"
import { DataComponent } from "./interface"


export function new_data_component(partial: Partial<DataComponent> = {}): DataComponent
{
    return {
        id: new IdAndVersion(-1, 1), // Use a negative ID for test data

        editor_id: "",
        created_at: new Date(),
        bytes_changed: 0,

        title: "",
        description: "",

        // value: "",
        // value_type: "number",
        // datetime_range_start: new Date(),
        // datetime_range_end: new Date(),
        // datetime_repeat_every: "day",
        // units: "",
        // dimension_ids: [],

        plain_title: "",
        plain_description: "",

        test_run_id: new Date().toISOString(), // Default to current time for test runs

        version_is_current: "yes",
        version_requires_save: true,
        ...partial,
    }
}


export function set_fields(data_component: DataComponent, fields: Partial<DataComponent>): DataComponent
{
    if (fields.title !== undefined) throw new Error("Cannot set title, requires UI libraries.")
    if (fields.description !== undefined) throw new Error("Cannot set description, requires UI libraries.")

    return {
        ...data_component,
        ...fields,
        // // Ensure that certain fields are set to default values if not provided
        // value_type: fields.value_type ?? "number",
        // datetime_repeat_every: fields.datetime_repeat_every ?? "day",
        // created_at: fields.created_at ?? new Date(),
        // version_is_current: fields.version_is_current ?? true,
    }
}


export function changes_made(component_1: DataComponent, component_2: DataComponent): boolean
{
    return component_1.title !== component_2.title ||
           component_1.description !== component_2.description
}
