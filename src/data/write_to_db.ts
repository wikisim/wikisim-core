import { PostgrestError } from "@supabase/supabase-js"

import type {
    DBDataComponentInsertArgs,
    DBDataComponentUpdateArgs,
    GetSupabase
} from "../supabase"
import { convert_from_db_row, convert_to_db_row } from "./convert_between_db"
import { IdAndVersion } from "./id"
import { is_data_component, type DataComponent, type NewDataComponent } from "./interface"


export function prepare_data_component_for_db_insert (data_component: DataComponent | NewDataComponent): DBDataComponentInsertArgs
{
    let row
    let use_row_id: boolean
    if (is_data_component(data_component))
    {
        row = convert_to_db_row(data_component)
        use_row_id = true
    }
    else
    {
        const { temporary_id: _, ...rest } = data_component
        // Set a placeholder ID to allow use of `convert_to_db_row`
        const temp_data_component: DataComponent = { ...rest, id: new IdAndVersion(-1, 1) }
        row = convert_to_db_row(temp_data_component)
        use_row_id = false
    }


    const args: DBDataComponentInsertArgs = {
        p_owner_id: row.owner_id ?? undefined,
        p_comment: row.comment ?? undefined,
        p_bytes_changed: row.bytes_changed,
        p_version_type: row.version_type ?? undefined,
        p_version_rolled_back_to: row.version_rolled_back_to ?? undefined,
        p_title: row.title,
        p_description: row.description,
        p_label_ids: row.label_ids ?? undefined,
        p_input_value: row.input_value ?? undefined,
        p_result_value: row.result_value ?? undefined,
        p_value_type: row.value_type ?? undefined,
        p_value_number_display_type: row.value_number_display_type ?? undefined,
        p_value_number_sig_figs: row.value_number_sig_figs ?? undefined,
        p_datetime_range_start: row.datetime_range_start ?? undefined,
        p_datetime_range_end: row.datetime_range_end ?? undefined,
        p_datetime_repeat_every: row.datetime_repeat_every ?? undefined,
        p_units: row.units ?? undefined,
        p_dimension_ids: row.dimension_ids ?? undefined,
        p_plain_title: row.plain_title,
        p_plain_description: row.plain_description,
        p_test_run_id: row.test_run_id ?? undefined,
        p_id: use_row_id ? row.id : undefined,
    }

    return args
}



export function prepare_data_component_for_db_update (data_component: DataComponent): DBDataComponentUpdateArgs
{
    const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        p_test_run_id, p_id, p_owner_id,
        ...insert_args
    } = prepare_data_component_for_db_insert(data_component)

    const args: DBDataComponentUpdateArgs = {
        ...insert_args,
        p_id: data_component.id.id,
        p_version_number: data_component.id.version,
    }

    return args
}


export type UpsertDataComponentResponse = {
    data: null;
    error: Error | PostgrestError;
} | {
    data: DataComponent;
    error: null;
}
export function insert_data_component (get_supabase: GetSupabase, data_component: DataComponent | NewDataComponent): PromiseLike<UpsertDataComponentResponse>
{
    const db_data_component = prepare_data_component_for_db_insert(data_component)

    return get_supabase()
        .rpc("insert_data_component", db_data_component)
        .then(({ data, error }) =>
        {
            if (error) return { data: null, error }
            else if (data.length !== 1) return { data: null, error: new Error(`Wrong number of data returned from insert, expected 1 got ${data.length}`) }
            else return { data: convert_from_db_row(data[0]!), error: null }
        })
}


export function update_data_component (get_supabase: GetSupabase, data_component: DataComponent): PromiseLike<UpsertDataComponentResponse>
{
    const db_data_component = prepare_data_component_for_db_update(data_component)

    return get_supabase()
        .rpc("update_data_component", db_data_component)
        .then(({ data, error }) =>
        {
            if (error) return { data: null, error }
            else if (data.length !== 1) return { data: null, error: new Error(`Wrong number of data returned from update, expected 1 got ${data.length}`) }
            else return { data: convert_from_db_row(data[0]!), error: null }
        })
}
