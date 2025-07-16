import { PostgrestError } from "@supabase/supabase-js"

import { DBDataComponentArchiveRow, DBDataComponentRow, GetSupabase } from "../supabase"


type RequestDataComponentsReturn =
{
    data: DBDataComponentRow[]
    error: null
} | {
    data: null
    error: PostgrestError | Error
}
export async function request_data_components(
    get_supabase: GetSupabase,
    ids: number[]
): Promise<RequestDataComponentsReturn>
{
    return get_supabase()
        .from("data_components")
        .select("*")
        .in("id", ids)
        .then(({ data, error }) =>
        {
            if (error) return { data: null, error }
            else return { data, error: null }
        })
}

type RequestDataComponentsHistoryReturn =
{
    data: DBDataComponentArchiveRow[]
    error: null
} | {
    data: null
    error: PostgrestError | Error
}
export async function request_data_components_history(
    get_supabase: GetSupabase,
    ids: number[]
): Promise<RequestDataComponentsHistoryReturn>
{
    return get_supabase()
        .from("data_components_archive")
        .select("*")
        .in("id", ids)
        .order("version_number", { ascending: false })
        .then(({ data, error }) =>
        {
            if (error) return { data: null, error }
            else return { data, error: null }
        })
}
