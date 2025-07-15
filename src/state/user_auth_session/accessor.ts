import { RootCoreState } from "../interface"


export function get_can_request_sign_in_with_OTP(store: RootCoreState): { allowed: boolean, reason: string }
{
    if (store.user_auth_session.status === "logged_out")
    {
        return { allowed: true, reason: "User is allowed to request registration or sign in with OTP."}
    }

    return { allowed: false, reason: `User is not logged out but is "${store.user_auth_session.status}".` }
}
