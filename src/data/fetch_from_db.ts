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
    options: {
        page?: number
        size?: number
        ids?: IdOnly[]
        owner_id?: string
        __only_test_data?: boolean
    } = {},
): Promise<RequestDataComponentsReturn>
{
    const { ids = [], owner_id } = options
    limit_ids(ids)
    const { from, to } = get_range_from_options(options)

    let supa = get_supabase()
        .from("data_components")
        .select("*")

    // Use this feature for loading latest DataComponents for a page like
    // `/wiki/123`, i.e. loading by IdOnly
    // (Also use in intergration.browser.test.ts)
    if (ids.length > 0) supa = supa.in("id", ids.map(id => id.id))

    // When there are no ids provided this is currently because we are
    // requesting current components for the home page.
    else
    {
        // Filter by >=1 to ensure we don't get any test data with negative ids.
        if (!options.__only_test_data) supa = supa.gte("id", 1)
        else supa = supa.lte("id", -1)

        // Unless owner_id is specified then for now we filter to exclude where
        // there is an owner_id to ensure no "personal" data is shown to other
        // users e.g. on the front page
        if (owner_id) supa = supa.or(`owner_id.is.null,owner_id.eq.${owner_id}`)
        else supa = supa.is("owner_id", null)
    }

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
    /**
     * Must provide at least one IdAndVersion or IdOnly
     */
    ids: IdAndMaybeVersion[],
    /**
     * Page is 0-indexed, i.e. page 0 is the first page. Default is 0.
     * Size is the number of items per page. Default is 20, min is 1, max is 1000.
     */
    options: {
        page?: number
        size?: number
    } = {},
): Promise<RequestDataComponentsReturn>
{
    limit_ids(ids, 1)
    const { from, to } = get_range_from_options(options)

    let supa = get_supabase()
        .from("data_components_history")
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


export async function search_data_components_v1(
    get_supabase: GetSupabase,
    search_terms: string,
    /**
     * Page is 0-indexed, i.e. page 0 is the first page. Default is 0.
     * Size is the number of items per page. Default is 20, min is 1, max is 1000.
     */
    options: {
        page?: number
        size?: number
        owner_id?: string
    } = {},
): Promise<RequestDataComponentsReturn>
{
    const { owner_id } = options
    const { from, to } = get_range_from_options(options)

    let supa = get_supabase()
        .from("data_components")
        // .select(`*, ts_rank(search_vector, plainto_tsquery('english', '${search_terms}')) as rank`)
        // .select("*, ts_rank(search_vector, plainto_tsquery('english', ?)) as rank", { count: "exact" })
        .select("*")

    // Unless owner_id is specified then for now we filter to exclude where
    // there is an owner_id to ensure no "personal" data is shown to other
    // users e.g. on browse/search page
    if (owner_id) supa = supa.or(`owner_id.is.null,owner_id.eq.${owner_id}`)
    else supa = supa.is("owner_id", null)

    return supa
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
    options: {
        page?: number
        size?: number
        similarity_threshold?: number
    } = {},
): Promise<RequestDataComponentsReturn>
{
    const limit_n = clamp(options.size ?? 20, 1, 20)
    const page = Math.max(options.page ?? 0, 0)
    const offset_n = page * limit_n

    return get_supabase()
        .rpc("search_data_components", {
            query: search_terms,
            similarity_threshold: options.similarity_threshold ?? 0,
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
