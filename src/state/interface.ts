import { UserAuthSessionState } from "./user_auth_session/interface"


export interface RootCoreState
{
    user_auth_session: UserAuthSessionState
}

export type SetCoreState = {
    (
        partial: RootCoreState | Partial<RootCoreState> | ((state: RootCoreState) => void),
        replace?: false
    ): void
    (
        state: RootCoreState | ((state: RootCoreState) => void),
        replace: true
    ): void
}
export type GetCoreState = () => RootCoreState
