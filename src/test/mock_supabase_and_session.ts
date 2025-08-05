import type { Session, SupabaseClient, User } from "@supabase/supabase-js"
import sinon from "sinon"

import type { Database } from "../supabase/interface"

/**
 * Returns a mock Session object for testing purposes.
 * You can override any field by passing a partial Session.
 */
export function create_mock_session(overrides: Partial<Session> = {}): Session
{
    const default_user: User = {
        id: "mock-user-id",
        email: "abc@example.com",
        app_metadata: {},
        user_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
    }

    const default_session: Session = {
        access_token: "mock-access-token",
        refresh_token: "mock-refresh-token",
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: "bearer",
        user: default_user,
        provider_token: null,
        provider_refresh_token: null,
    }

    return { ...default_session, ...overrides }
}



export function create_mocked_supabase (session_data: Session | null = null, db_data?: any)
{
    const mocked_supabase = {
        auth: {
            getSession: sinon.stub().resolves({ data: { session: session_data }, error: null }),
            signOut: sinon.stub(),
            signInWithOtp: sinon.stub(),
        },
        from: sinon.stub().returnsThis(),
        upsert: sinon.stub().returnsThis(),
        eq: sinon.stub().returnsThis(),
        select: sinon.stub().returnsThis(),
        in: sinon.stub().returnsThis(),
        order: sinon.stub().returnsThis(),
        range: sinon.stub().returnsThis(),
        gte: sinon.stub().returnsThis(),
        lte: sinon.stub().returnsThis(),
        or: sinon.stub().returnsThis(),
        is: sinon.stub().returnsThis(),
        textSearch: sinon.stub().returnsThis(),
        rpc: sinon.stub().returnsThis(),
        then: sinon.stub().resolves({ data: [], error: null }),
    }

    if (db_data)
    {
        const eq_stub = sinon.stub().resolves({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            data: db_data,
            error: null,
        });
        const select_stub = sinon.stub().returns({ eq: eq_stub });
        const from_stub = sinon.stub().returns({ select: select_stub });
        mocked_supabase.from = from_stub
    }

    return {
        mocked_supabase,
        get_supabase: () => mocked_supabase as any as SupabaseClient<Database>,
    }
}

export type MockedSupabase = ReturnType<typeof create_mocked_supabase>["mocked_supabase"]
