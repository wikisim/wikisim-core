import type { PostgrestError } from "@supabase/supabase-js"
import { z } from "zod"

import { DATA_COMPONENT_SELECT_STRING } from "../supabase"
import type { GetSupabase } from "../supabase/browser"
import { hydrate_data_component_from_json } from "./convert_between_json"
import {
    clamp_page_size,
    get_range_from_options,
    limit_ids,
    make_or_clause_for_ids,
} from "./fetch_from_db_utils"
import { IdAndMaybeVersion, IdAndVersion, IdOnly } from "./id"
import type { DataComponent, DbPaginationOptions } from "./interface"
import { make_field_validators } from "./validate_fields"


const field_validators = make_field_validators(z)


export type FilterByOwnerId =
{
    type: "only_user"
    owner_id: string
} | {
    type: "wiki_and_user"
    owner_id: string
} | {
    type: "include_all"
    owner_id?: string
} | {
    type: "only_wiki"
    owner_id?: string
}


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
     * Size is the number of items per page. Default is 20, min is 1, max is 101.
     */
    options: DbPaginationOptions & {
        /**
         * Max 1000 IDs
         */
        ids?: IdOnly[]
        /**
         * When not provided then it defaults to only_wiki components being
         * returned, i.e. components not owned by any user.
         */
        filter_by_owner_id?: FilterByOwnerId
        /**
         * Filter by `subject_id` to find alternative components
         */
        subject_id?: number
        __only_test_data?: boolean
        order_by?: "earliest_created" | "latest_modified"
    } = {},
): Promise<RequestDataComponentsReturn>
{
    const { ids = [], filter_by_owner_id, subject_id } = options
    limit_ids(ids)
    const { from, to } = get_range_from_options(options)

    let supa = get_supabase()
        .from("data_components")
        .select(DATA_COMPONENT_SELECT_STRING as "*")

    // Use this feature for loading latest DataComponents for a page like
    // `/wiki/123`, i.e. loading by IdOnly
    // (Also use in intergration.browser.test.ts)
    if (ids.length > 0)
    {
        supa = supa.in("id", ids.map(id => id.id))

        if (filter_by_owner_id) console.warn("request_data_components: filter_by_owner_id is ignored when ids are provided.")
        if (options.__only_test_data) console.warn("request_data_components: __only_test_data is ignored when ids are provided.")
    }
    // When there are no ids provided this is currently because we are
    // requesting current components for the home page.
    else
    {
        // Filter by >=1 to ensure we don't get any test data with negative ids.
        if (!options.__only_test_data) supa = supa.gte("id", 1)
        else supa = supa.lte("id", -1)

        if (filter_by_owner_id && filter_by_owner_id.type !== "only_wiki")
        {
            if (filter_by_owner_id.type === "only_user") supa = supa.eq("owner_id", filter_by_owner_id.owner_id)
            else if (filter_by_owner_id.type === "wiki_and_user")
            {
                supa = supa.or(`owner_id.is.null,owner_id.eq.${filter_by_owner_id.owner_id}`)
            }
        }
        // Unless filter_by_owner_id is specified then we filter to exclude where
        // there is an owner_id to ensure no "user owned" data is shown to other
        // users e.g. on the front page
        else supa = supa.is("owner_id", null)
    }

    if (subject_id !== undefined)
    {
        supa = supa.eq("subject_id", subject_id)
    }

    if (options.order_by === "latest_modified")
    {
        // Because we're selecting from the data_components table, this will
        // return most recently created new versions, i.e. latest modified.
        supa = supa.order("created_at", { ascending: false })
    }
    else
    {
        supa = supa.order("id", { ascending: true })
    }

    return supa
        .range(from, to)
        .then(({ data, error }) =>
        {
            if (error) return { data: null, error }
            const instances = data.map(d => hydrate_data_component_from_json(d, field_validators))
            return { data: instances, error: null }
        })
}


export async function request_historical_data_components(
    get_supabase: GetSupabase,
    /**
     * Provide 0 or more IdAndVersion and or IdOnly. Max 1000 IDs.
     * When no IDs are provided then an empty array is returned immediately,
     * this is useful for simplifying code to load
     * `data_component.recursive_dependency_ids` when this list is empty.
     */
    ids: IdAndMaybeVersion[],
    /**
     * Page is 0-indexed, i.e. page 0 is the first page. Default is 0.
     * Size is the number of items per page. Default is 20, min is 1, max is 101.
     */
    options: DbPaginationOptions = {},
): Promise<RequestDataComponentsReturn>
{
    if (ids.length === 0) return Promise.resolve({ data: [], error: null })

    limit_ids(ids, 1)
    const { from, to } = get_range_from_options(options)

    const or_clause = make_or_clause_for_ids(ids)

    return get_supabase()
        .from("data_components_history")
        .select(DATA_COMPONENT_SELECT_STRING as "*")
        .or(or_clause)
        .order("version_number", { ascending: false })
        .order("id", { ascending: true })
        .range(from, to)
        .then(({ data, error }) =>
        {
            if (error) return { data: null, error }
            const instances = data.map(d => hydrate_data_component_from_json(d, field_validators))
            return { data: instances, error: null }
        })
}


export async function request_latest_and_historical_data_components(
    get_supabase: GetSupabase,
    /**
     * Provide 0 or more IdAndVersion and or IdOnly. Max 1000 IDs.
     * When no IDs are provided then an empty array is returned immediately,
     * this is useful for simplifying code to load
     * `data_component.recursive_dependency_ids` when this list is empty.
     */
    ids: IdAndMaybeVersion[],
    /**
     * Page is 0-indexed, i.e. page 0 is the first page. Default is 0.
     * Size is the number of items per page. Default is 20, min is 1, max is 101.
     */
    options: DbPaginationOptions = {},
): Promise<RequestDataComponentsReturn>
{
    if (ids.length === 0) return Promise.resolve({ data: [], error: null })

    // First fetch the latest version numbers for all the provided IDs, then
    // fetch the historical versions for any IDs where the version number is
    // different from the latest version number. This ensures we get the correct
    // version for any IDAndVersion provided, and also ensures we get the latest
    // version.

    const response = await request_data_components(get_supabase, {
        ids: ids.map(id => new IdOnly(id.id)),
        size: ids.length,
    })
    if (response.error) return { data: null, error: response.error }

    // Find which IDs have a different version number than the latest version number
    const ids_fetched: Set<string> = new Set()
    response.data.forEach(component =>
    {
        ids_fetched.add(component.id.to_str())
    })
    const ids_to_fetch_historical_version_of = ids.filter(id =>
    {
        const id_str = id.to_str()
        return !ids_fetched.has(id_str)
    })

    const response_historical = await request_historical_data_components(get_supabase, ids_to_fetch_historical_version_of, options)

    if (response_historical.error) return { data: null, error: response_historical.error }

    const all_data = [ ...response.data, ...response_historical.data ]
    return { data: all_data, error: null }
}


export type RequestLatestDataComponentVersionReturn =
{
    data: IdAndVersion
    error: null
} | {
    data: null
    error: PostgrestError | Error
}
export async function request_latest_data_component_version(
    get_supabase: GetSupabase,
    id: IdAndMaybeVersion,
): Promise<RequestLatestDataComponentVersionReturn>
{
    return get_supabase()
        .from("data_components")
        .select("version_number")
        .eq("id", id.id)
        .then(({ data, error }) =>
        {
            if (error) return { data: null, error }
            if (data.length === 0)
            {
                return {
                    data: null,
                    error: new Error(`No data component found with id ${id.id}.`),
                }
            }
            const version = data[0]!.version_number
            const component_id = new IdAndVersion(id.id, version)
            return { data: component_id, error: null }
        })
}


export async function search_data_components(
    get_supabase: GetSupabase,
    search_terms: string,
    /**
     * Page is 0-indexed, i.e. page 0 is the first page. Default is 0.
     * Size is the number of items per page. Default is 20, min is 1, max is 101.
     */
    options: DbPaginationOptions & {
        similarity_threshold?: number
        // Filters
        filter_exclude_test_components?: boolean
        filter_by_owner_id?: FilterByOwnerId
    } = {},
): Promise<RequestDataComponentsReturn>
{
    if (!search_terms.trim())
    {
        return request_data_components(get_supabase, {
            page: options.page,
            size: options.size,
            filter_by_owner_id: options.filter_by_owner_id,
            __only_test_data: !(options.filter_exclude_test_components ?? true),
            order_by: "latest_modified",
        })
    }

    const limit_n = clamp_page_size(options.size)
    const page = Math.max(options.page ?? 0, 0)
    const offset_n = page * limit_n

    const { type, owner_id } = options.filter_by_owner_id || {}

    return get_supabase()
        .rpc("search_data_components", {
            query: search_terms,
            similarity_threshold: options.similarity_threshold ?? 0,
            offset_n,
            limit_n,
            filter_exclude_test_components: options.filter_exclude_test_components ?? true,
            filter_by_owner_id: (type === "only_user" && owner_id) || undefined,
        })
        .then(({ data, error }) =>
        {
            if (error) return { data: null, error }
            const instances = data.map(d => hydrate_data_component_from_json(d, field_validators))
            return { data: instances, error: null }
        })
}


/**
 *
 * Left for other consumers but @deprecated for WikiSim frontend use and replaced
 * by get_async_data_component_and_dependencies
 */
export async function request_versioned_data_component_and_dependencies(
    get_supabase: GetSupabase,
    id: IdAndVersion,
): Promise<RequestDataComponentsReturn>
{
    let component: DataComponent | undefined = undefined

    return request_historical_data_components(get_supabase, [id])
    .then(response =>
    {
        if (response.error) return response

        component = response.data[0]
        if (!component || response.data.length !== 1)
        {
            return {
                data: null,
                error: new Error(`Expected one data component but got ${response.data.length}.`)
            }
        }

        // Fetch dependencies
        const { recursive_dependency_ids = [] } = component
        return request_historical_data_components(
            get_supabase,
            recursive_dependency_ids,
            // PERFORMANCE
            // This will error when recursive_dependency_ids.length > 1000
            // and likely not a good idea to request 1000 rows at once but
            // we'll use this simpler approach for now.
            { page: 0, size: recursive_dependency_ids.length }
        )
    })
    .then(response =>
    {
        if (response.error) return response

        const dependencies = response.data
        if (dependencies.length !== (component!.recursive_dependency_ids || []).length)
        {
            return {
                data: null,
                error: new Error(`Expected ${ (component!.recursive_dependency_ids || []).length } dependencies but got ${dependencies.length}.`)
            }
        }

        const all_data = [component!, ...dependencies]
        return { data: all_data, error: null }
    })
}
