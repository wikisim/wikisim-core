import { expect } from "chai"

import { create_mock_session, create_mocked_supabase } from "../../test/mock_supabase_and_session"
import { get_new_core_store } from "../store"


describe("store.user_auth_session and supabase.getSession", () =>
{
    it("should transition status from initializing to logged_out when no session", async () =>
    {
        const { mocked_supabase, get_supabase } = create_mocked_supabase()
        const core_store = get_new_core_store({ get_supabase })

        let { user_auth_session } = core_store.getState()
        expect(user_auth_session.user_name).equals(undefined, "user_name should be initialised as undefined")
        expect(user_auth_session.session).equals(undefined, "session should initialised as undefined")
        expect(user_auth_session.status).equals("initializing")

        expect(mocked_supabase.auth.getSession.calledOnce).equals(true, "getSession should be called once")

        // Wait for the async getSession to resolve and state to update
        await mocked_supabase.auth.getSession.returnValues[0]

        ;({ user_auth_session } = core_store.getState())
        expect(user_auth_session.user_name).equals(undefined, "user_name should stay as undefined")
        expect(user_auth_session.session).equals(null, "session should be updated to null")
        expect(user_auth_session.status).equals("logged_out")
    })


    describe("when session present", () => {
        it("should transition status to logged_in", async () =>
        {
            const session_data = create_mock_session()
            const { mocked_supabase, get_supabase } = create_mocked_supabase(session_data)
            const core_store = get_new_core_store({ get_supabase })

            // Wait for async getSession to resolve and state to update
            await mocked_supabase.auth.getSession.returnValues[0]

            const { user_auth_session } = core_store.getState()
            expect(user_auth_session.user_name).equals(undefined, "user_name should remain as undefined")
            expect(user_auth_session.session).equals(session_data, "session should be present")
            expect(user_auth_session.status).equals("logged_in")
        })

        it("should then load user_name info from supabase users table", async () =>
        {
            const session_data = create_mock_session()
            const user_id = session_data.user.id
            const db_data = [{ id: user_id, name: "Test User" }]

            const { mocked_supabase, get_supabase } = create_mocked_supabase(session_data, db_data)
            const core_store = get_new_core_store({ get_supabase })

            // Wait for async getSession to resolve and state to update
            await mocked_supabase.auth.getSession.returnValues[0]

            // Wait for the subscription to trigger and load user info
            await new Promise(resolve => setTimeout(resolve, 0))

            expect(mocked_supabase.from.args).to.deep.equal([["users"]], `from() called with "users"`)
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            expect(mocked_supabase.from().select.args).to.deep.equal([["id, name"]], `select() called with "id, name"`)
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            expect(mocked_supabase.from().select().eq.args).to.deep.equal([["id", user_id]], `eq() called with "id", "${user_id}"`)

            const { user_auth_session } = core_store.getState()
            expect(user_auth_session.user_name).equals("Test User")
        })
    })
})
