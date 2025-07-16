import { PostgrestError } from "@supabase/supabase-js"

import { DBDataComponentArchiveRow, DBDataComponentRow, GetSupabase } from "../supabase"
import { clamp } from "../utils/clamp"


export type RequestDataComponentsReturn =
{
    data: DBDataComponentRow[]
    error: null
} | {
    data: null
    error: PostgrestError | Error
}
export async function request_data_components(
    get_supabase: GetSupabase,
    ids: number[],
    options: { page?: number, size?: number } = {},
): Promise<RequestDataComponentsReturn>
{
    const { from, to } = get_range_from_options(options)

    return get_supabase()
        .from("data_components")
        .select("*")
        .in("id", ids)
        .order("version_number", { ascending: false })
        .order("id", { ascending: true })
        .range(from, to)
        .then(({ data, error }) =>
        {
            if (error) return { data: null, error }
            else return { data, error: null }
        })
}

export type RequestDataComponentsHistoryReturn =
{
    data: DBDataComponentArchiveRow[]
    error: null
} | {
    data: null
    error: PostgrestError | Error
}
export async function request_data_components_history(
    get_supabase: GetSupabase,
    ids: number[],
    options: { page?: number, size?: number } = {},
): Promise<RequestDataComponentsHistoryReturn>
{
    const { from, to } = get_range_from_options(options)

    return get_supabase()
        .from("data_components_archive")
        .select("*")
        .in("id", ids)
        .order("version_number", { ascending: false })
        .order("id", { ascending: true })
        .range(from, to)
        .then(({ data, error }) =>
        {
            if (error) return { data: null, error }
            else return { data, error: null }
        })
}


function get_range_from_options(options: { page?: number, size?: number } = {}): { from: number, to: number }
{
    let { page, size } = options
    page = Math.max(page ?? 0, 0)
    size = clamp(size ?? 20, 1, 1000)
    const limit = size
    const offset = page * limit
    const from = offset
    const to = offset + limit - 1
    return { from, to }
}
