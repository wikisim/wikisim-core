import { create, StoreApi, UseBoundStore } from "zustand"
import { immer } from "zustand/middleware/immer"

import { RootCoreState } from "./root_core_state"
import * as user_auth_session from "./user_auth_session"


export type CoreStore = UseBoundStore<StoreApi<RootCoreState>>

export const core_store = create<RootCoreState>()(immer((set, get) => ({
    user_auth_session: user_auth_session.initial_state(set, get),
})))


user_auth_session.subscriptions(core_store)
