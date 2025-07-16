import { get_supabase } from "../supabase"
import { DataComponent, DBDataComponentInsert, DBDataComponentRow } from "./interface"


export function prepare_data_component_for_db (data_component: DataComponent): DBDataComponentInsert
{
    const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        version_is_current, version_requires_save,
        ...rest
    } = data_component

    // Prepare the data component for writing to the database
    const obj: DBDataComponentInsert = {
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

    return obj
}


export function insert_data_component (data_component: DBDataComponentInsert): Promise<DBDataComponentRow>
{
    if (data_component.version_number !== 1)
    {
        throw new Error(`Inserts into data_components are only allowed when version_number = 1. Attempted value: ${data_component.version_number}`)
    }

    return new Promise((resolve, reject) =>
    {
        get_supabase().rpc("insert_data_component", {
            p_editor_id: data_component.editor_id,
            p_comment: data_component.comment ?? undefined,
            p_bytes_changed: data_component.bytes_changed,
            p_version_type: data_component.version_type ?? undefined,
            p_version_rolled_back_to: data_component.version_rolled_back_to ?? undefined,
            p_title: data_component.title,
            p_description: data_component.description,
            p_label_ids: data_component.label_ids ?? undefined,
            p_value: data_component.value ?? undefined,
            p_value_type: data_component.value_type ?? undefined,
            p_datetime_range_start: data_component.datetime_range_start ?? undefined,
            p_datetime_range_end: data_component.datetime_range_end ?? undefined,
            p_datetime_repeat_every: data_component.datetime_repeat_every ?? undefined,
            p_units: data_component.units ?? undefined,
            p_dimension_ids: data_component.dimension_ids ?? undefined,
            p_plain_title: data_component.plain_title,
            p_plain_description: data_component.plain_description,
            p_test_run_id: data_component.test_run_id ?? undefined,
            p_id: data_component.id,
        })
            .then(({ data, error }) =>
            {
                if (error) reject(error)
                else resolve(data)
            })
    })
}

// export function update_data_component (data_component: DBDataComponentUpdate): Promise<DBDataComponentRow[]>
// {
//     return new Promise((resolve, reject) => {
//         get_supabase()
//             .rpc("update_data_component", {
//                 p_id: data_component.id,
//                 p_version_number: data_component.version_number,
//                 p_editor_id: data_component.editor_id,
//                 p_comment: data_component.comment,
//                 p_bytes_changed: data_component.bytes_changed,
//                 p_version_type: data_component.version_type,
//                 p_version_rolled_back_to: data_component.version_rolled_back_to,
//                 p_title: data_component.title,
//                 p_description: data_component.description,
//                 p_label_ids: data_component.label_ids,
//                 p_value: data_component.value,
//                 p_value_type: data_component.value_type,
//                 p_datetime_range_start: data_component.datetime_range_start,
//                 p_datetime_range_end: data_component.datetime_range_end,
//                 p_datetime_repeat_every: data_component.datetime_repeat_every,
//                 p_units: data_component.units,
//                 p_dimension_ids: data_component.dimension_ids,
//                 p_plain_title: data_component.plain_title,
//                 p_plain_description: data_component.plain_description,
//             })
//             // .upsert(data_component)
//             // .select("*")
//             // .then(({ data, error }) => {
//             //     if (error) {
//             //         reject(error)
//             //     } else {
//             //         resolve(data)
//             //     }
//             // })
//     })
// }
