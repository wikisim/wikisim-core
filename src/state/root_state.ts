import { UserAuthSessionState } from "./user_auth_session/state";


export interface RootState
{
    user_auth_session: UserAuthSessionState
}

export type SetType = {
    (
        partial: RootState | Partial<RootState> | ((state: RootState) => RootState | Partial<RootState>),
        replace?: false
    ): void;
    (
        state: RootState | ((state: RootState) => RootState),
        replace: true
    ): void
}
export type GetType = () => RootState
