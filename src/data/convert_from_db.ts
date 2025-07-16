import { DBDataComponentRow } from "../supabase"
import { IdAndMaybeVersion } from "./id"
import { DataComponent } from "./interface"


export function convert_from_db_row (row: DBDataComponentRow, version_is_current: boolean): DataComponent
{
    return {
        id: row.id,

        version_number: row.version_number,
        editor_id: row.editor_id,
        created_at: new Date(row.created_at),
        comment: row.comment || undefined,
        bytes_changed: row.bytes_changed,
        version_type: row.version_type || undefined,
        version_rolled_back_to: row.version_rolled_back_to || undefined,

        title: row.title,
        description: row.description,
        label_ids: row.label_ids || undefined,

        datetime_range_start: convert_datetime(row.datetime_range_start),
        datetime_range_end: convert_datetime(row.datetime_range_end),
        datetime_repeat_every: row.datetime_repeat_every || undefined,
        units: row.units || undefined,
        dimension_ids: row.dimension_ids ? row.dimension_ids.map(id => IdAndMaybeVersion.from_str(id, true)) : undefined,

        version_is_current,
        version_requires_save: false,

        plain_title: row.plain_title,
        plain_description: row.plain_description,
    }
}


function convert_datetime (datetime: string | null): Date | undefined
{
    return datetime ? new Date(datetime) : undefined
}
