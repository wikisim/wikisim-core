import type { AuthError, Session } from "@supabase/supabase-js"


export type UserAuthStatus = (
    // When the application first loads then nothing has happened yet.
    "initializing"
    // The user might already have a session stored in the browser local storage / cookies
    | "logged_in"
    // If there's no session then user is treated as being logged out
    | "logged_out"
    // User has requested to log in
    | "logged_out__requesting_OTP_sign_in"
    // User request to log in has succeeded, now user must check their email for the OTP
    | "logged_out__OTP_sign_in_request_made"
    // User request to log in has errored, there is a system error / user must try again
    | "logged_out__OTP_sign_in_request_errored"
)

export interface UserAuthSessionState
{
    user_name?: string | null
    session?: Session | null
    status: UserAuthStatus
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    error?: AuthError | unknown

    request_OTP_sign_in: (account_email_address: string) => void
    // OTP_sign_in_request_made: () => void
    // OTP_sign_in_request_errored: (error_msg: string) => void
    logout: () => void

    set_user_name: (user_name: string) => void
}
