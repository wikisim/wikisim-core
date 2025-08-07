import { immer } from "zustand/middleware/immer"
import { createStore, StoreApi } from "zustand/vanilla"

import { get_supabase, GetSupabase } from "../supabase"
// import * as data_components from "./data_components"
import type { RootCoreState } from "./interface"
import * as user_auth_session from "./user_auth_session"


export type CoreStore = StoreApi<RootCoreState>

export interface CoreStoreDependencies
{
    get_supabase: GetSupabase
}

export function default_dependencies(): CoreStoreDependencies
{
    return {
        get_supabase,
    }
}

// Wrapped the Zustand store creation in a function to allow for testing and
// resetting.
// This allows us to create a fresh store instance for each test or reset
// without affecting the global state.
export const get_new_core_store = (dependencies?: CoreStoreDependencies) =>
{
    dependencies = dependencies || default_dependencies()

    const core_store = createStore<RootCoreState>()(immer((set, get) => ({
        // data_components: data_components.initial_state(set, get),
        user_auth_session: user_auth_session.initial_state(set, get, dependencies.get_supabase),
    })))

    // data_components.subscriptions(core_store, dependencies.get_supabase)
    user_auth_session.subscriptions(core_store, dependencies.get_supabase)

    return core_store
}


// Wrapped the store in a function to allow for lazy initialization.
// This allows us to create the store only when it's needed, which allows us to
// stub out the calls to supabase in tests.
let _core_store: CoreStore | undefined = undefined
export const core_store = () =>
{
    if (_core_store) return _core_store
    _core_store = get_new_core_store()

    return _core_store
}
