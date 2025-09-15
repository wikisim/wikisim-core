import { render } from "preact"
import { useEffect, useRef, useState } from "preact/hooks"

import { request_data_components } from "./data/fetch_from_db"
import { DataComponent } from "./data/interface"
import "./monkey_patch"
import { core_store } from "./state/store"
import { get_can_request_sign_in_with_OTP } from "./state/user_auth_session/accessor"
import { UserAuthStatus } from "./state/user_auth_session/interface"
import { get_supabase } from "./supabase/browser"


function App()
{
    const state = core_store()

    const can_request_registration = get_can_request_sign_in_with_OTP(state)
    if (can_request_registration.allowed && document.location.hostname === "localhost" && document.location.port !== "5173")
    {
        // If we are running on localhost, we allow to request registration / sign in
        // with OTP but only if the port is not 5173 (which is the default for Vite dev server).
        can_request_registration.allowed = false
        can_request_registration.reason = "Running on localhost is fine to register / sign in with OTP but must be on port 5173 otherwise OTP links will not redirect to here."
    }

    // History of authentication status changes
    const potential_new_status_history = {
        status: state.user_auth_session.status,
        datetime: new Date(),
        error: state.user_auth_session.error,
    }
    const authentication_status_history = useRef<{ status: UserAuthStatus, datetime: Date, error?: any }[]>([
        potential_new_status_history
    ])
    if (
        (authentication_status_history.current.last()?.status !== state.user_auth_session.status)
        || state.user_auth_session.error
    )
    {
        authentication_status_history.current.push(potential_new_status_history)
    }

    // We save to and pull account_email_address from localStorage just to make
    // it easier to test the registration flow.
    const default_account_email_address = localStorage.getItem("_testing.account_email_address") || ""
    const [account_email_address, set_account_email_address] = useState(default_account_email_address)
    localStorage.setItem("_testing.account_email_address", account_email_address)


    const [data, set_data] = useState<DataComponent[]>([])
    useEffect(() =>
    {
        if (state.user_auth_session.status !== "logged_in") return
        request_data_components(get_supabase)
            .then(response =>
            {
                if (response.data) set_data(response.data)
            })
    }, [state.user_auth_session.status])


    return <div style={{ fontFamily: "sans-serif", padding: "16px" }}>
        Demo of WikiSim core library in a Preact app.  Demonstrates user authentication data / methods:
        <ol>
            <li>Access current state of the user's authentication / sign in (or registration) request.</li>
            <li>Access current user's info.</li>
            <li>Offer the user to register or signin via email.</li>
            <li>Offer the user to sign out.</li>
        </ol>

        Demonstrates user profile data:
        <ol start={5}>
            <li>Show the user their username.</li>
            <li>Ask the user to set their username.</li>
            <li><s>Allows the user to change their username.</s> (not enabled yet)</li>
        </ol>

        Demonstrates CRUD (Create, Read, Update, Delete) operations on WikiSim data:
        <ol start={8}>
            <li>List all data items.</li>
            <li>Offer the user to create a new data item.</li>
            <li>Offer the user to update an existing data item.</li>
            <li>Offer the user to delete an existing data item.</li>
        </ol>

        <p>
            Any error: <Highlight>{JSON.stringify(state.user_auth_session.error)}</Highlight>
        </p>

        <p>
            1. current state of the user's authentication state is: <Highlight>{state.user_auth_session.status}</Highlight>
            <br />
            <div style={{ marginLeft: "50px" }}>
                History:
                <br />
                {authentication_status_history.current.map(item =>
                    <span key={item.status + item.datetime.toISOString()}>
                        <br/>
                        <Highlight>{item.status}</Highlight>
                        at {item.datetime.toLocaleTimeString()}.{item.datetime.getMilliseconds()}
                        {item.error ? ` with error ${JSON.stringify(item.error)}` : ""}
                        <br/>
                    </span>
                )}
            </div>
        </p>

        <p>
            2. current user info:

            <br/>
            <br/>
            <Highlight>
                {
                    state.user_auth_session.session?.user.email === undefined
                        ? "No user email info available yet."
                        : state.user_auth_session.session.user.email
                }
            </Highlight>
            <br/>
            <br/>
            <Highlight>
                {
                    state.user_auth_session.user_name === undefined
                        ? "No user name info available yet."
                    : state.user_auth_session.user_name === null
                        ? "No user name set yet."
                        : state.user_auth_session.user_name
                }
            </Highlight>
        </p>

        <p>
            3. {can_request_registration.allowed
            ? (<>
                <input type="text" placeholder="Enter email address to register or login with" value={account_email_address}
                    onInput={e => set_account_email_address((e.target as HTMLInputElement).value)}
                />
                {account_email_address && <>
                    <br style={{ margin: 10 }}/>
                    Register a new user or login an existing with email: "{account_email_address}"
                    <br style={{ margin: 10 }}/>
                    <button onClick={() => state.user_auth_session.request_OTP_sign_in(account_email_address)}>
                        Register / Login
                    </button>
                </>}
            </>)
            : (
                state.user_auth_session.status === "logged_out__requesting_OTP_sign_in"
                    ? <span style={{ color: "orange" }}>Requesting registration / sign in is in progress...</span>
                : state.user_auth_session.status === "logged_out__OTP_sign_in_request_made"
                    ? <span style={{ color: "green" }}>Registration / sign in request has been made, please check your email and click the link the sign in to WikiSim.</span>
                    : <span style={{ color: "red" }}>Cannot request registration / sign in: {can_request_registration.reason}</span>)
            }
        </p>

        <p>
            4. {state.user_auth_session.status === "logged_in"
                    ? <button onClick={() => state.user_auth_session.logout()}>Sign out</button>
                    : <span style={{ color: "red" }}>Cannot sign out, user auth status is currently: {state.user_auth_session.status}</span>
                }
        </p>

        <p>
            5. {state.user_auth_session.status !== "logged_in"
                ? <span style={{ color: "red" }}>Please sign in to see how your user will be displayed as.</span>
                : (state.user_auth_session.user_name !== undefined
                    ? <span>
                        Your user will appear as: <Highlight>
                            {state.user_auth_session.user_name || `User id ${state.user_auth_session.session?.user.id}`}
                        </Highlight>
                    </span>
                    : <span style={{ color: "orange" }}>Loading user info...</span>
                )
            }
        </p>

        <p>
            6. {state.user_auth_session.status !== "logged_in"
                ? <span style={{ color: "red" }}>Please sign in to set your user name.</span>
                : (state.user_auth_session.user_name === null
                    ? <span>
                        Your user name is not set yet, please set it now:
                        <br/>
                        <input type="text" placeholder="Enter your user name"
                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                            value={state.user_auth_session.user_name || ""}
                            onBlur={e => state.user_auth_session.set_user_name((e.target as HTMLInputElement).value)}
                        />
                    </span>
                    : (state.user_auth_session.user_name === undefined
                    ? <span style={{ color: "orange" }}>Loading user info...</span>
                    : <span>User name set to: {state.user_auth_session.user_name}</span>)
                )
            }
        </p>

        <p>
            8. List all data items:
            <br/>
            {data.map(item =>
                <div key={item.id} style={{ margin: "8px 0" }}>
                    <Highlight>{item.id}</Highlight>:
                    <br/>
                    <span style={{ marginLeft: "20px" }}>
                        {item.title}
                        <br/>
                        {item.description}
                        <br/>
                        {item.created_at.toLocaleString()}
                        <br/>
                    </span>
                </div>
            )}
        </p>
    </div>
}

render(<App />, document.getElementById("app")!)


function Highlight(props: { children: any })
{
    return <span style={{
        padding: "4px 8px",
        borderRadius: "4px",
        fontWeight: "bold",
        whiteSpace: "nowrap",
        backgroundColor: "#eee",
        cursor: "pointer",
    }}>
        {props.children}
    </span>
}
