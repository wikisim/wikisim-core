import { create, StoreApi, UseBoundStore } from "zustand"
import { immer } from "zustand/middleware/immer"

import { RootState } from "./root_state"
import * as user_auth_session from "./user_auth_session/user_auth_session"


export type Store = UseBoundStore<StoreApi<RootState>>

export const get_store = create<RootState>()(immer((set, get) => ({
    user_auth_session: user_auth_session.initial_state(set, get),
})))


user_auth_session.subscriptions(get_store)
