/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import type { AuthError, Session } from "@supabase/supabase-js"

import { GetSupabase } from "../../supabase/browser"
import { StateMachine } from "../../utils/state_machine"
import { GetCoreState, SetCoreState } from "../interface"
import type { CoreStore } from "../store"
import { UserAuthSessionState, UserAuthStatus } from "./interface"


const status_allowed_transitions: Record<UserAuthStatus, UserAuthStatus[]> = {
    initializing: ["logged_in", "logged_out"],
    logged_in: ["logged_out"],
    logged_out: ["logged_out__requesting_OTP_sign_in"],
    logged_out__requesting_OTP_sign_in: [
        "logged_out__OTP_sign_in_request_made",
        "logged_out__OTP_sign_in_request_errored",
    ],
    logged_out__OTP_sign_in_request_made: [
        // User would click on link in their email so would likely open a new
        // tab and as such this status transition would never occur.
        "logged_in",
        // This status transition could only occur if the link that the user
        // clicked on in their email was invalid or expired.
        "logged_out__OTP_sign_in_request_errored",
    ],
    logged_out__OTP_sign_in_request_errored: ["logged_out__requesting_OTP_sign_in"],
}

// validates and transitions the current status to the next status value
function transition_status(current: UserAuthSessionState, next: UserAuthStatus)
{
    // Create a temporary state machine at the current state
    const sm = new StateMachine<UserAuthStatus>(current.status, status_allowed_transitions)
    sm.set_state(next) // will throw an error if the transition is not allowed
    current.status = sm.get_state()
}



export function initial_state(set: SetCoreState, get: GetCoreState, get_supabase: GetSupabase): UserAuthSessionState
{
    const initialized = (session: Session | null) => set(root_state =>
    {
        transition_status(root_state.user_auth_session, session ? "logged_in" : "logged_out")
        root_state.user_auth_session.session = session
        root_state.user_auth_session.error = undefined
    })

    // Get logged in state from supabase
    get_supabase().auth.getSession().then(response =>
    {
        // To handle DataCurator registration we could add some metadata to that
        // registration call and then if we detect that here then we either:
        // 1. copy the cookie and redirect user back to datacurator with the
        // cookie in the URL to store on DataCurator domain
        // 2. or we put up a message saying "DataCurator is deprecated, please
        // use WikiSim instead"
        // 3. or we put up a message saying that if you want to register on
        // DataCurator you need to manually edit the URL or email xyz@datacurator
        // response.data.session?.user.user_metadata
        initialized(response.data.session)
    })

    return {
        user_name: undefined,
        session: undefined,
        status: "initializing",
        logout: () => set(root_state =>
        {
            transition_status(root_state.user_auth_session, "logged_out")
            root_state.user_auth_session.session = null

            get_supabase().auth.signOut().then(() =>
            {
                console .log("Supabase sign out succeeded")
            }).catch(error =>
            {
                console .error("Supabase sign out error:", error)
                set(root_state =>
                {
                    root_state.user_auth_session.error = error
                })
            })

        }),

        request_OTP_sign_in: (account_email_address: string) =>
        {
            supabase_OTP_sign_in(set, account_email_address, get_supabase)
        },

        set_user_name: (user_name: string) =>
        {
            supabase_set_user_name(set, get, user_name, get_supabase)
        }
    }
}


function supabase_OTP_sign_in(set: SetCoreState, account_email_address: string, get_supabase: GetSupabase)
{
    set(root_state =>
    {
        transition_status(root_state.user_auth_session, "logged_out__requesting_OTP_sign_in")
        root_state.user_auth_session.error = undefined
    })

    const OTP_sign_in_request_made = () => set(root_state =>
    {
        console .log("Supabase OTP_sign_in request (signInWithOtp) succeeded:")
        transition_status(root_state.user_auth_session, "logged_out__OTP_sign_in_request_made")
        root_state.user_auth_session.error = undefined
    })

    const OTP_sign_in_request_errored = (error: AuthError | any) => set(root_state =>
    {
        console .log("Supabase OTP_sign_in request (signInWithOtp) error:", error)
        transition_status(root_state.user_auth_session, "logged_out__OTP_sign_in_request_errored")
        root_state.user_auth_session.error = error
    })


    // Sign in with email OTP
    get_supabase().auth.signInWithOtp({
        email: account_email_address,
        options:
        {
            // Redirect to the current page after sign in
            emailRedirectTo: window.location.href,
            // Include user.user_metadata in the sign in request
            data: {},
        },
    })
    .then(({ data: _data, error }) =>
    {
        if (error) OTP_sign_in_request_errored(error)
        else OTP_sign_in_request_made()
    })
    .catch(error =>
    {
        OTP_sign_in_request_errored(error)
    })
}


function supabase_set_user_name(set: SetCoreState, get: GetCoreState, user_name: string, get_supabase: GetSupabase)
{
    const user_id = get().user_auth_session.session?.user.id
    if (!user_id) throw new Error("Cannot set user name, user is not logged in.")

    set(root_state =>
    {
        root_state.user_auth_session.error_setting_user_name = undefined
    })

    // Update user name in supabase users table
    get_supabase()
        .from("users")
        .upsert({ id: user_id, name: user_name })
        .eq("id", user_id)
        .select("*")
    .then(({ data, error }) =>
    {
        const entry = (data || [])[0]
        set(root_state =>
        {
            if (!entry || error)
            {
                console.error("Supabase supabase_set_user_name error:", error)

                root_state.user_auth_session.error_setting_user_name = error?.message || "Unknown error setting user name"
            }
            else
            {
                // Update user name in the state
                root_state.user_auth_session.user_name = entry.name
                root_state.user_auth_session.user_name_set = true
                root_state.user_auth_session.error_setting_user_name = undefined
            }
        })
    })
}


export function subscriptions (store: CoreStore, get_supabase: GetSupabase)
{
    store.subscribe((state, previous_state) =>
    {
        const user_id = state.user_auth_session.session?.user.id
        if (!user_id) return

        const should_load_user_info = (
            state.user_auth_session.status === "logged_in"
            && previous_state.user_auth_session.status !== "logged_in"
        )

        if (should_load_user_info) load_user_info(store, user_id, get_supabase)
    })
}


async function load_user_info(store: CoreStore, user_id: string, get_supabase: GetSupabase)
{
    // console .debug("Loading user info for user...", state.user_auth_session.session?.user.id)
    const response = await get_supabase()
        .from("users")
        .select("id, name")
        .eq("id", user_id)
    const entry = (response.data || [])[0]

    // console .debug("got user info from supabase users table: ", entry, response)
    let user_name: string | null = entry?.name ?? null

    store.setState(root_state =>
    {
        root_state.user_auth_session.user_name = user_name
        root_state.user_auth_session.user_name_set = user_name !== null
    })
}
