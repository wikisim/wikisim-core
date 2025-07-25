import { PostgrestError } from "@supabase/supabase-js"

import { GetSupabase } from "../supabase"
import { clamp } from "../utils/clamp"
import { convert_from_db_row } from "./convert_between_db"
import { IdAndMaybeVersion, IdAndVersion, IdOnly } from "./id"
import { DataComponent } from "./interface"


export type RequestDataComponentsReturn =
{
    data: DataComponent[]
    error: null
} | {
    data: null
    error: PostgrestError | Error
}
export async function request_data_components(
    get_supabase: GetSupabase,
    /**
     * Page is 0-indexed, i.e. page 0 is the first page. Default is 0.
     * Size is the number of items per page. Default is 20, min is 1, max is 1000.
     */
    options: { page?: number, size?: number } = {},
    ids: IdOnly[] = [],
): Promise<RequestDataComponentsReturn>
{
    limit_ids(ids)
    const { from, to } = get_range_from_options(options)

    let supa = get_supabase()
        .from("data_components")
        .select("*")

    // Use this feature for loading latest DataComponents, i.e. loading by IdOnly
    // (Also use in intergration.browser.test.ts)
    if (ids.length > 0) supa = supa.in("id", ids.map(id => id.id))

    // When there are no ids provided this is currently because we are
    // requesting current components for the home page.
    // Filter by gte 1 to ensure we don't get any test data with negative ids.
    else supa = supa.gte("id", 1)

    return supa
        .order("id", { ascending: true })
        .range(from, to)
        .then(({ data, error }) =>
        {
            if (error) return { data: null, error }
            const instances = data.map(d => convert_from_db_row(d))
            return { data: instances, error: null }
        })
}


export async function request_archived_data_components(
    get_supabase: GetSupabase,
    ids: IdAndMaybeVersion[] = [],
    /**
     * Page is 0-indexed, i.e. page 0 is the first page. Default is 0.
     * Size is the number of items per page. Default is 20, min is 1, max is 1000.
     */
    options: { page?: number, size?: number } = {},
): Promise<RequestDataComponentsReturn>
{
    limit_ids(ids, 1)
    const { from, to } = get_range_from_options(options)

    let supa = get_supabase()
        .from("data_components_archive")
        .select("*")

    const or_clauses: string[] = []
    ids.forEach(id =>
    {
        if (id instanceof IdOnly)
        {
            or_clauses.push(`id.eq.${id.to_str_without_version()}`)
        }
        else if (id instanceof IdAndVersion)
        {
            or_clauses.push(`and(id.eq.${id.id},version_number.eq.${id.version})`)
        }
        else
        {
            throw new Error(`Invalid ID type: ${id}, typeof: ${typeof id}, expected IdAndVersion or IdOnly`)
        }
    })
    supa = supa.or(or_clauses.join(','))

    return supa
        .order("version_number", { ascending: false })
        .order("id", { ascending: true })
        .range(from, to)
        .then(({ data, error }) =>
        {
            if (error) return { data: null, error }
            const instances = data.map(d => convert_from_db_row(d))
            return { data: instances, error: null }
        })
}


export async function request_data_component_history(
    get_supabase: GetSupabase,
    id: number,
    /**
     * Page is 0-indexed, i.e. page 0 is the first page. Default is 0.
     * Size is the number of items per page. Default is 20, min is 1, max is 1000.
     */
    options: { page?: number, size?: number } = {},
): Promise<RequestDataComponentsReturn>
{
    return request_archived_data_components(get_supabase, [new IdOnly(id)], options)
}



export async function search_data_components_v1(
    get_supabase: GetSupabase,
    search_terms: string,
    /**
     * Page is 0-indexed, i.e. page 0 is the first page. Default is 0.
     * Size is the number of items per page. Default is 20, min is 1, max is 1000.
     */
    options: { page?: number, size?: number } = {},
): Promise<RequestDataComponentsReturn>
{
    const { from, to } = get_range_from_options(options)

    return get_supabase()
        .from("data_components")
        // .select(`*, ts_rank(search_vector, plainto_tsquery('english', '${search_terms}')) as rank`)
        // .select("*, ts_rank(search_vector, plainto_tsquery('english', ?)) as rank", { count: "exact" })
        .select("*")
        .textSearch("search_vector", search_terms, {
            config: "english",
            type: "websearch",
        })
        // .order("rank", { ascending: false })
        .range(from, to)
        .then(({ data, error }) =>
        {
            if (error) return { data: null, error }
            const instances = data.map(d => convert_from_db_row(d))
            return { data: instances, error: null }
        })
}


export async function search_data_components(
    get_supabase: GetSupabase,
    search_terms: string,
    /**
     * Page is 0-indexed, i.e. page 0 is the first page. Default is 0.
     * Size is the number of items per page. Default is 20, min is 1, max is 1000.
     */
    options: { page?: number, size?: number } = {},
): Promise<RequestDataComponentsReturn>
{
    const limit_n = clamp(options.size ?? 20, 1, 20)
    const page = Math.max(options.page ?? 0, 0)
    const offset_n = page * limit_n

    return get_supabase()
        .rpc("search_data_components", {
            query: search_terms,
            similarity_threshold: 0,
            offset_n,
            limit_n,
        })
        .then(({ data, error }) =>
        {
            if (error) return { data: null, error }
            const instances = data.map(d => convert_from_db_row(d))
            return { data: instances, error: null }
        })
}


function limit_ids(ids: IdAndMaybeVersion[], min: number = 0, max: number = 1000)
{
    if (ids.length > max)
    {
        throw new Error(`Too many IDs provided, maximum is ${max} but got ${ids.length}`)
    }
    if (ids.length < min)
    {
        throw new Error(`Too few IDs provided, minium is ${min} but got ${ids.length}`)
    }
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
