import { z } from "zod"

import { ERRORS } from "../errors"
import type { GetSupabase } from "../supabase/browser"
import type {
    ClientInsertDataComponentV2Response,
    ClientUpdateDataComponentV2Response,
    EFInsertDataComponentV2Args,
    EFUpdateDataComponentV2Args,
} from "../supabase/edge_functions"
import {
    flatten_data_component_to_json,
    flatten_new_or_data_component_to_json,
    hydrate_data_component_from_json,
} from "./convert_between_json"
import { type DataComponent, type NewDataComponent } from "./interface"
import { make_field_validators } from "./validate_fields"


const field_validators = make_field_validators(z)


type ErrorResponse = string //| { code: number, message: string } //| Error //| PostgrestError
export type UpsertDataComponentResponse = {
    data: null
    error: ErrorResponse
} | {
    data: DataComponent
    error: null
}
export async function insert_data_component (
    get_supabase: GetSupabase,
    // Allow inserting DataComponent (which has a specific id) to allow running
    // integration tests.  Normal use for this should be NewDataComponent.
    data_component: NewDataComponent | DataComponent
): Promise<UpsertDataComponentResponse>
{
    return insert_data_components(get_supabase, [data_component])
        .then(result =>
        {
            let response: UpsertDataComponentResponse
            if (result.data) response = { data: result.data[0]!, error: null }
            else response = { data: null, error: result.error }
            return response
        })
}


export type UpsertDataComponentsResponse = {
    data: null
    error: ErrorResponse
} | {
    data: DataComponent[]
    error: null
}
export async function insert_data_components (
    get_supabase: GetSupabase,
    // Allow inserting DataComponent (which has a specific id) to allow running
    // integration tests.  Normal use for this should be NewDataComponent.
    data_components: (NewDataComponent | DataComponent)[]
): Promise<UpsertDataComponentsResponse>
{
    if (data_components.length === 0 || data_components.length > 10)
    {
        return { data: null, error: ERRORS.ERR33.message }
    }

    const new_data_components_json = data_components.map(flatten_new_or_data_component_to_json)

    const headers = await get_headers(get_supabase)
    const request_body: EFInsertDataComponentV2Args = { batch: new_data_components_json }

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

            if (data.length !== data_components.length)
            {
                return { data: null, error: `Wrong number of data returned from insert, expected ${data_components.length} got ${data.length}` }
            }

            const hydrated = data.map(d => hydrate_data_component_from_json(d, field_validators))

            return { data: hydrated, error: null }
        })
}


export async function update_data_component (get_supabase: GetSupabase, data_component: DataComponent): Promise<UpsertDataComponentResponse>
{
    const data_component_json = flatten_data_component_to_json(data_component)

    const headers = await get_headers(get_supabase)
    const request_body: EFUpdateDataComponentV2Args = { batch: [data_component_json] }

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

            return { data: hydrate_data_component_from_json(data[0]!, field_validators), error: null }
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
