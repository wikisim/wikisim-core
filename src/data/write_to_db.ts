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


export function upsert_data_component (data_component: DBDataComponentInsert): Promise<DBDataComponentRow[]>
{
    return new Promise((resolve, reject) => {
        get_supabase()
            .from("data_components")
            .upsert(data_component)
            .select("*")
            .then(({ data, error }) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(data)
                }
            })
    })
}
