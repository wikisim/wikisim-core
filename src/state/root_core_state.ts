import { UserAuthSessionState } from "./user_auth_session/interface"


export interface RootCoreState
{
    user_auth_session: UserAuthSessionState
}

export type SetType = {
    (
        partial: RootCoreState | Partial<RootCoreState> | ((state: RootCoreState) => RootCoreState | Partial<RootCoreState>),
        replace?: false
    ): void
    (
        state: RootCoreState | ((state: RootCoreState) => RootCoreState),
        replace: true
    ): void
}
export type GetType = () => RootCoreState
