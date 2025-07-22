import { convert_tiptap_text_to_plain_text } from "../rich_text/editor"
import { DBDataComponentRow } from "../supabase"
import { IdAndVersion, parse_id } from "./id"
import { DataComponent } from "./interface"


export function convert_to_db_row(data_component: DataComponent): DBDataComponentRow
{
    const { id, ...rest } = data_component

    // Prepare the data component for writing to the database
    const row: DBDataComponentRow = {
        ...rest,

        id: id.id,
        version_number: id.version,

        created_at: data_component.created_at.toISOString(),
        comment: data_component.comment ?? null,
        version_type: data_component.version_type ?? null,
        version_rolled_back_to: data_component.version_rolled_back_to ?? null,

        label_ids: data_component.label_ids ?? null,

        value: data_component.value ?? null,
        value_type: data_component.value_type ?? null,
        datetime_range_start: data_component.datetime_range_start
            ? data_component.datetime_range_start.toISOString()
            : null,
        datetime_range_end: data_component.datetime_range_end
            ? data_component.datetime_range_end.toISOString()
            : null,
        datetime_repeat_every: data_component.datetime_repeat_every ?? null,
        units: data_component.units ?? null,
        dimension_ids: data_component.dimension_ids
            ? data_component.dimension_ids.map(d => d.to_str())
            : null,

        plain_title: convert_tiptap_text_to_plain_text(data_component.title),
        plain_description: convert_tiptap_text_to_plain_text(data_component.description),

        test_run_id: data_component.test_run_id ?? null,
    }

    return row
}


export function convert_from_db_row (row: DBDataComponentRow): DataComponent
{
    return {
        id: new IdAndVersion(row.id, row.version_number),

        editor_id: row.editor_id,
        created_at: new Date(row.created_at),
        comment: row.comment ?? undefined,
        bytes_changed: row.bytes_changed,
        version_type: row.version_type ?? undefined,
        version_rolled_back_to: row.version_rolled_back_to ?? undefined,

        title: row.title,
        description: row.description,
        label_ids: row.label_ids ?? undefined,

        value: row.value ?? undefined,
        value_type: row.value_type ?? undefined,
        datetime_range_start: convert_datetime(row.datetime_range_start),
        datetime_range_end: convert_datetime(row.datetime_range_end),
        datetime_repeat_every: row.datetime_repeat_every ?? undefined,
        units: row.units ?? undefined,
        dimension_ids: row.dimension_ids ? row.dimension_ids.map(id => parse_id(id, true)) : undefined,

        plain_title: row.plain_title,
        plain_description: row.plain_description,

        test_run_id: row.test_run_id ?? undefined,
    }
}


function convert_datetime (datetime: string | null): Date | undefined
{
    return datetime ? new Date(datetime) : undefined
}
