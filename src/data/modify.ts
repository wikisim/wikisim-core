// TODO: rename this file

import { IdAndVersion, TempId } from "./id"
import { DataComponent, NewDataComponent } from "./interface"


export function init_data_component(partial: Partial<DataComponent> = {}): DataComponent
{
    return {
        id: new IdAndVersion(-1, 1), // Use a negative ID for test data

        editor_id: "",
        created_at: new Date(),
        bytes_changed: 0,

        title: "",
        // Use the default values produced by the TipTap editor so that the
        // new form does not show changes to the title and description when none
        // were made.
        description: "<p></p>",

        // value: "",
        // value_type: "number",
        // datetime_range_start: new Date(),
        // datetime_range_end: new Date(),
        // datetime_repeat_every: "day",
        // units: "",
        // dimension_ids: [],

        plain_title: "",
        plain_description: "",

        test_run_id: `test_run_id_${new Date().toISOString()}`, // Default to current time for test runs

        ...partial,
    }
}


export function init_new_data_component(partial: Partial<DataComponent> = {}): NewDataComponent
{
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...rest } = init_data_component(partial)
    return {
        ...rest,
        // Use a temporary ID for draft components
        temporary_id: new TempId(),
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
    }
}


export function changes_made(component_1: DataComponent | NewDataComponent, component_2: DataComponent | NewDataComponent, compare_meta_fields?: boolean): boolean
{
    const diff = component_1.title !== component_2.title
           || component_1.description !== component_2.description

    if (diff || !compare_meta_fields) return diff

    return component_1.comment !== component_2.comment
        || component_1.version_type !== component_2.version_type
}
