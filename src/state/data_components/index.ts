import type { PostgrestError } from "@supabase/supabase-js"
// import type { PostgrestResponseFailure } from "@supabase/postgrest-js"

import { convert_from_db_row } from "../../data/convert_from_db"
import { IdAndMaybeVersion } from "../../data/id"
import { DBDataComponentsRow, GetSupabase } from "../../supabase"
import { GetCoreState, RootCoreState, SetCoreState } from "../interface"
import { CoreStore } from "../store"
import { DataComponentsState } from "./interface"


export function initial_state(set: SetCoreState, get: GetCoreState): DataComponentsState
{
    return {
        data_component_ids_to_load: [],
        data_component_by_id_and_maybe_version: {},

        request_data_component_error: undefined,
        request_data_component: (data_component_id: string | IdAndMaybeVersion) =>
        {
            const { data_component_by_id_and_maybe_version } = get().data_components
            const id = IdAndMaybeVersion.from_str(data_component_id)
            const id_str = id.to_str()

            let data_component = data_component_by_id_and_maybe_version[id_str]

            if (!data_component)
            {
                // console .debug(`Data component with ID ${data_component_id} not found.  Requesting to load it.`)

                data_component = {
                    id,
                    component: null,
                    status: "requested",
                }
                const new_data_component = data_component

                set(state =>
                {
                    state.data_components.data_component_ids_to_load.push(id)
                    state.data_components.data_component_by_id_and_maybe_version[id_str] = new_data_component

                    return state
                })
            }

            return data_component
        }


    }
}


export function subscriptions(core_store: CoreStore, get_supabase: GetSupabase)
{
    core_store.subscribe((state: RootCoreState) =>
    {
        load_requested_data_components(state, core_store, get_supabase)
    })
}



async function load_requested_data_components(
    state: RootCoreState,
    core_store: CoreStore,
    get_supabase: GetSupabase,
)
{
    const { data_component_ids_to_load } = state.data_components
    // If there are no components to request, return early, otherwise trigger a load
    if (data_component_ids_to_load.length === 0) return
    const ids_to_load: number[] = data_component_ids_to_load.map(id => id.id)

    // Request from supabase
    const response = await request_data_components(get_supabase, ids_to_load)

    if (response.error)
    {
        core_store.setState(state =>
        {
            state.data_components.request_data_component_error = response.error
            return state
        })
        return
    }

    update_store_with_loaded_data_components(ids_to_load, core_store, response.data)
}


function update_store_with_loaded_data_components(
    expected_ids: number[],
    core_store: CoreStore,
    data: DBDataComponentsRow[],
)
{
    const expected_ids_to_load: Set<number> = new Set(expected_ids)

    core_store.setState(state =>
    {
        data.forEach(row =>
        {
            // For each entry, find it's placeholder in `data_components_by_id_only`
            // and update it with the loaded data component
            const { data_component_by_id_and_maybe_version } = state.data_components
            const entry = data_component_by_id_and_maybe_version[row.id]
            // type guard, should not happen
            if (!entry) throw new Error(`Exception: No placeholder found for data component with ID ${row.id}`)

            entry.status = "loaded"
            entry.component = convert_from_db_row(row, true)
            expected_ids_to_load.delete(row.id)
        })

        expected_ids_to_load.forEach(id =>
        {
            // If there are any IDs that were expected to be loaded but were not found,
            // we set their status to "not_found"
            const { data_component_by_id_and_maybe_version } = state.data_components
            const entry = data_component_by_id_and_maybe_version[id]
            // type guard, should not happen
            if (!entry) throw new Error(`Exception: No placeholder found for data component with ID ${id}`)

            entry.status = "not_found"
            entry.component = null
        })

        // Clear the request list
        state.data_components.data_component_ids_to_load = []
        return state
    })
}


type RequestDataComponentsReturn =
{
    data: DBDataComponentsRow[]
    error: null
} | {
    data: null
    error: PostgrestError | Error
}
async function request_data_components(
    get_supabase: GetSupabase,
    ids: number[]
): Promise<RequestDataComponentsReturn>
{
    let response: RequestDataComponentsReturn

    try
    {
        response = await get_supabase()
            .from("data_components")
            .select("*")
            .in("id", ids)
    }
    catch (err)
    {
        response = {
            data: null,
            error: err as PostgrestError | Error,
        }
    }

    return response
}
