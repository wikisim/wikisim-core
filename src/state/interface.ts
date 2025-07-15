import { DataComponentsState } from "./data_components/interface"
import { UserAuthSessionState } from "./user_auth_session/interface"


export interface RootCoreState
{
    data_components: DataComponentsState
    user_auth_session: UserAuthSessionState
}

export type SetCoreState = {
    (
        partial: RootCoreState | Partial<RootCoreState> | ((state: RootCoreState) => RootCoreState | Partial<RootCoreState>),
        replace?: false
    ): void
    (
        state: RootCoreState | ((state: RootCoreState) => RootCoreState),
        replace: true
    ): void
}
export type GetCoreState = () => RootCoreState
