import { get_supabase } from "../supabase"
import {
    DataComponent,
    DBDataComponentInsertArgs,
    DBDataComponentInsertRow,
    DBDataComponentRow,
    DBDataComponentUpdateArgs,
} from "./interface"


export function prepare_data_component_for_db_insert (data_component: DataComponent): DBDataComponentInsertArgs
{
    const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        version_is_current, version_requires_save,
        ...rest
    } = data_component

    // Prepare the data component for writing to the database
    const row: DBDataComponentInsertRow = {
        ...rest,
        created_at: data_component.created_at.toISOString(),

        datetime_range_start: data_component.datetime_range_start
            ? data_component.datetime_range_start.toISOString()
            : null,
        datetime_range_end: data_component.datetime_range_end
            ? data_component.datetime_range_end.toISOString()
            : null,
        dimension_ids: data_component.dimension_ids
            ? data_component.dimension_ids.map(d => d.to_str())
            : null,

        // Will leave plain_title and plain_description as they are, because we
        // assume:
        // 1) the lack of @tiptap libraries in this repo means that no one is
        // going to be displaying or editing the rich text in the title or
        // description and thus:
        // 2) the plain_title and plain_description will already be set.
        plain_title: data_component.plain_title,
        plain_description: data_component.plain_description,
    }

    const args: DBDataComponentInsertArgs = {
        p_editor_id: row.editor_id,
        p_comment: row.comment ?? undefined,
        p_bytes_changed: row.bytes_changed,
        p_version_type: row.version_type ?? undefined,
        p_version_rolled_back_to: row.version_rolled_back_to ?? undefined,
        p_title: row.title,
        p_description: row.description,
        p_label_ids: row.label_ids ?? undefined,
        p_value: row.value ?? undefined,
        p_value_type: row.value_type ?? undefined,
        p_datetime_range_start: row.datetime_range_start ?? undefined,
        p_datetime_range_end: row.datetime_range_end ?? undefined,
        p_datetime_repeat_every: row.datetime_repeat_every ?? undefined,
        p_units: row.units ?? undefined,
        p_dimension_ids: row.dimension_ids ?? undefined,
        p_plain_title: row.plain_title,
        p_plain_description: row.plain_description,
        p_test_run_id: row.test_run_id ?? undefined,
        p_id: row.id,
    }

    return args
}


export function prepare_data_component_for_db_update (data_component: DataComponent): DBDataComponentUpdateArgs
{
    const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        p_test_run_id, p_id,
        ...insert_args
    } = prepare_data_component_for_db_insert(data_component)

    const args: DBDataComponentUpdateArgs = {
        ...insert_args,
        p_id: data_component.id,
        p_version_number: data_component.version_number,
    }

    return args
}


export function insert_data_component (data_component: DataComponent): Promise<DBDataComponentRow>
{
    const db_data_component = prepare_data_component_for_db_insert(data_component)

    if (data_component.version_number !== 1)
    {
        throw new Error(`Inserts into data_components will be rejected by DB when version_number != 1. Attempted value: ${data_component.version_number}`)
    }

    return new Promise((resolve, reject) =>
    {
        get_supabase()
            .rpc("insert_data_component", db_data_component)
            .then(({ data, error }) =>
            {
                if (error) reject(error)
                else resolve(data)
            })
    })
}


export function update_data_component (data_component: DataComponent): Promise<DBDataComponentRow>
{
    const db_data_component = prepare_data_component_for_db_update(data_component)

    return new Promise((resolve, reject) => {
        get_supabase()
            .rpc("update_data_component", db_data_component)
            .then(({ data, error }) =>
            {
                if (error) reject(error)
                else resolve(data)
            })
    })
}
