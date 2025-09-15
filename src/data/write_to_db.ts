import type {
    DBDataComponentInsertV2ArgsComponent,
    DBDataComponentUpdateV2ArgsComponent,
    GetSupabase,
} from "../supabase"
import type {
    ClientInsertDataComponentV2Response,
    ClientUpdateDataComponentV2Response,
    EFInsertDataComponentV2Args,
    EFUpdateDataComponentV2Args,
} from "../supabase/edge_functions"
import { convert_from_db_row, convert_to_db_row } from "./convert_between_db"
import { IdAndVersion } from "./id"
import { is_data_component, type DataComponent, type NewDataComponent } from "./interface"


export function prepare_data_component_for_db_insert (data_component: DataComponent | NewDataComponent): DBDataComponentInsertV2ArgsComponent
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


    const args: DBDataComponentInsertV2ArgsComponent = {
        p_owner_id: row.owner_id,
        p_comment: row.comment,
        p_bytes_changed: row.bytes_changed,
        p_version_type: row.version_type,
        p_version_rolled_back_to: row.version_rolled_back_to,
        p_title: row.title,
        p_description: row.description,
        p_label_ids: row.label_ids,
        p_input_value: row.input_value,
        p_result_value: row.result_value,
        p_value_type: row.value_type,
        p_value_number_display_type: row.value_number_display_type,
        p_value_number_sig_figs: row.value_number_sig_figs,
        p_datetime_range_start: row.datetime_range_start,
        p_datetime_range_end: row.datetime_range_end,
        p_datetime_repeat_every: row.datetime_repeat_every,
        p_units: row.units,
        p_dimension_ids: row.dimension_ids,
        p_function_arguments: row.function_arguments,
        p_scenarios: row.scenarios,
        p_plain_title: row.plain_title,
        p_plain_description: row.plain_description,
        p_test_run_id: row.test_run_id,
        p_id: use_row_id ? row.id : null,
    }

    return args
}



export function prepare_data_component_for_db_update (data_component: DataComponent): DBDataComponentUpdateV2ArgsComponent
{
    const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        p_test_run_id, p_id, p_owner_id,
        ...insert_args
    } = prepare_data_component_for_db_insert(data_component)

    const args: DBDataComponentUpdateV2ArgsComponent = {
        ...insert_args,
        p_id: data_component.id.id,
        p_version_number: data_component.id.version,
    }

    return args
}


type ErrorResponse = string //| { code: number, message: string } //| Error //| PostgrestError;
export type UpsertDataComponentResponse = {
    data: null
    error: ErrorResponse
} | {
    data: DataComponent
    error: null
}
export async function insert_data_component (get_supabase: GetSupabase, data_component: DataComponent | NewDataComponent): Promise<UpsertDataComponentResponse>
{
    const db_data_component = prepare_data_component_for_db_insert(data_component)

    const headers = await get_headers(get_supabase)
    const request_body: EFInsertDataComponentV2Args = { batch: [db_data_component] }

    return get_supabase()
        .functions.invoke("ef_insert_data_component_v2", {
            method: "POST",
            headers,
            body: request_body,
        })
        .then(async resp =>
        {
            const { data, error, response } = resp as ClientInsertDataComponentV2Response

            if (error !== null && error !== undefined)
            {
                return await handle_error(error, response)
            }

            if (data.length !== 1)
            {
                return { data: null, error: `Wrong number of data returned from insert, expected 1 got ${data.length}` }
            }

            return { data: convert_from_db_row(data[0]!), error: null }
        })
}


export async function update_data_component (get_supabase: GetSupabase, data_component: DataComponent): Promise<UpsertDataComponentResponse>
{
    const db_data_component = prepare_data_component_for_db_update(data_component)

    const headers = await get_headers(get_supabase)
    const request_body: EFUpdateDataComponentV2Args = { batch: [db_data_component] }

    return get_supabase()
        .functions.invoke("ef_update_data_component_v2", {
            method: "POST",
            headers,
            body: request_body,
        })
        .then(async resp =>
        {
            const { data, error, response } = resp as ClientUpdateDataComponentV2Response

            if (error !== null && error !== undefined)
            {
                return await handle_error(error, response)
            }

            if (data.length !== 1)
            {
                return { data: null, error: `Wrong number of data returned from update, expected 1 got ${data.length}` }
            }

            return { data: convert_from_db_row(data[0]!), error: null }
        })
}


async function get_headers (get_supabase: GetSupabase)
{
    const supabase = get_supabase()
    const session = await supabase.auth.getSession()
    const access_token = session.data.session?.access_token

    const headers: { [key: string]: string } = {
        // DO NOT SET Content-Type otherwise supabase will not use the body?!
        // "Content-Type": "application/json",
    }
    if (access_token) headers["Authorization"] = `Bearer ${access_token}`
    else console.warn("No access token found for supabase client, request may fail")

    return headers
}


async function handle_error(error: Error | { code: number; message: string }, response: Response)
{
    let error_body: ErrorResponse = error.message
    try {
        error_body = await response.text()
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const parsed_error_body = JSON.parse(error_body)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (typeof parsed_error_body === "object" && "message" in parsed_error_body && typeof parsed_error_body.message === "string")
        {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            error_body = parsed_error_body.message
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        else error_body = parsed_error_body
    } catch { /* ignore */ }

    return { data: null, error: error_body }
}
