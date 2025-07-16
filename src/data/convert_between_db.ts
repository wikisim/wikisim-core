import { DBDataComponentRow } from "../supabase"
import { IdAndMaybeVersion } from "./id"
import { DataComponent, YesNoMaybe } from "./interface"


export function convert_to_db_row(data_component: DataComponent): DBDataComponentRow
{
    const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        version_is_current, version_requires_save,
        ...rest
    } = data_component

    // Prepare the data component for writing to the database
    const row: DBDataComponentRow = {
        ...rest,

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

        // Will leave plain_title and plain_description as they are, because we
        // assume:
        // 1) the lack of @tiptap libraries in this repo means that no one is
        // going to be displaying or editing the rich text in the title or
        // description and thus:
        // 2) the plain_title and plain_description will already be set.
        plain_title: data_component.plain_title,
        plain_description: data_component.plain_description,

        test_run_id: data_component.test_run_id ?? null,
    }

    return row
}


export function convert_from_db_row (row: DBDataComponentRow, version_is_current: YesNoMaybe): DataComponent
{
    return {
        id: row.id,

        version_number: row.version_number,
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
        dimension_ids: row.dimension_ids ? row.dimension_ids.map(id => IdAndMaybeVersion.from_str(id, true)) : undefined,

        plain_title: row.plain_title,
        plain_description: row.plain_description,

        test_run_id: row.test_run_id ?? undefined,

        version_is_current,
        version_requires_save: false,
    }
}


function convert_datetime (datetime: string | null): Date | undefined
{
    return datetime ? new Date(datetime) : undefined
}
