/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { browser_convert_tiptap_to_plain } from "../rich_text/browser_convert_tiptap_to_plain"
import { DBDataComponentRow } from "../supabase"
import { IdAndVersion, parse_id } from "./id"
import { DataComponent, FunctionArgument, NewDataComponent, Scenario } from "./interface"


export function flatten_data_component_for_db(data_component: DataComponent | NewDataComponent)
{
    return {
        owner_id: data_component.owner_id ?? null,

        editor_id: data_component.editor_id,
        created_at: data_component.created_at.toISOString(),
        comment: data_component.comment ?? null,
        bytes_changed: data_component.bytes_changed,
        version_type: data_component.version_type ?? null,
        version_rolled_back_to: data_component.version_rolled_back_to ?? null,

        title: data_component.title,
        description: data_component.description,
        label_ids: data_component.label_ids ?? null,

        input_value: data_component.input_value ?? null,
        result_value: data_component.result_value ?? null,
        value_type: data_component.value_type ?? null,
        value_number_display_type: data_component.value_number_display_type ?? null,
        value_number_sig_figs: data_component.value_number_sig_figs ?? null,
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
        function_arguments: data_component.function_arguments
            ? JSON.stringify(data_component.function_arguments.map(({ id: _, ...args }) => args))
            : null,
        scenarios: data_component.scenarios
            ? JSON.stringify(data_component.scenarios.map(({ id: _, ...args }) => args))
            : null,

        // Will be overwritted by the server-side (edge function) conversion but
        // included here for consistency and just in case server side conversion
        // fails.
        plain_title: browser_convert_tiptap_to_plain(data_component.title),
        plain_description: browser_convert_tiptap_to_plain(data_component.description),
    }
}


export function hydrate_data_component_from_db(row: Omit<DBDataComponentRow, "id" | "version_number" | "test_run_id">)
{
    return {
        owner_id: row.owner_id ?? undefined,

        editor_id: row.editor_id,
        created_at: new Date(row.created_at),
        comment: row.comment ?? undefined,
        bytes_changed: row.bytes_changed,
        version_type: row.version_type ?? undefined,
        version_rolled_back_to: row.version_rolled_back_to ?? undefined,

        title: row.title,
        description: row.description,
        label_ids: row.label_ids ?? undefined,

        input_value: row.input_value ?? undefined,
        result_value: row.result_value ?? undefined,
        value_type: row.value_type ?? undefined,
        value_number_display_type: row.value_number_display_type ?? undefined,
        value_number_sig_figs: row.value_number_sig_figs ?? undefined,
        datetime_range_start: convert_datetime(row.datetime_range_start),
        datetime_range_end: convert_datetime(row.datetime_range_end),
        datetime_repeat_every: row.datetime_repeat_every ?? undefined,
        units: row.units ?? undefined,
        dimension_ids: row.dimension_ids ? row.dimension_ids.map(id => parse_id(id, true)) : undefined,
        // @ts-expect-error
        function_arguments: hydrate_function_arguments(row),
        // @ts-expect-error
        scenarios: hydrate_scenarios(row),

        plain_title: row.plain_title,
        plain_description: row.plain_description,
    }
}


function hydrate_function_arguments(row: DBDataComponentRow): FunctionArgument[] | undefined
{
    // @ts-expect-error
    if (!row.function_arguments) return undefined

    try
    {
        // @ts-expect-error
        const args = JSON.parse(row.function_arguments) as Omit<FunctionArgument, "id">[]
        return args.map((arg, index) => ({ id: index, ...arg }))
    }
    catch (e)
    {
        // @ts-expect-error
        console.error("Error parsing function_arguments from DB row:", e, row.function_arguments)
        return undefined
    }
}


function hydrate_scenarios(row: DBDataComponentRow): Scenario[] | undefined
{
    // @ts-expect-error
    if (!row.scenarios) return undefined

    try
    {
        // @ts-expect-error
        const args = JSON.parse(row.scenarios) as Omit<Scenario, "id">[]
        return args.map((arg, index) => ({ id: index, ...arg }))
    }
    catch (e)
    {
        // @ts-expect-error
        console.error("Error parsing scenarios from DB row:", e, row.scenarios)
        return undefined
    }
}


export function convert_to_db_row(data_component: DataComponent): DBDataComponentRow
{
    // Prepare the data component for writing to the database
    const row: DBDataComponentRow = {
        id: data_component.id.id,
        version_number: data_component.id.version,

        ...flatten_data_component_for_db(data_component),

        test_run_id: data_component.test_run_id ?? null,
    }

    return row
}


export function convert_from_db_row (row: DBDataComponentRow): DataComponent
{
    return {
        id: new IdAndVersion(row.id, row.version_number),

        ...hydrate_data_component_from_db(row),

        test_run_id: row.test_run_id ?? undefined,
    }
}


function convert_datetime (datetime: string | null): Date | undefined
{
    return datetime ? new Date(datetime) : undefined
}
