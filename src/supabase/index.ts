import { createClient, SupabaseClient } from "@supabase/supabase-js"

import { Database } from "./interface"

const supabase_url = "https://sfkgqscbwofiphfxhnxg.supabase.co"
const supabase_anon_key = "sb_publishable_XWsGRSpmju8qjodw4gIU8A_O_mHUR1H"


let supabase: ReturnType<typeof createClient<Database>> | undefined = undefined

export function get_supabase (): SupabaseClient<Database>
{
    if (supabase) return supabase

    supabase = createClient<Database>(supabase_url, supabase_anon_key, {
        auth: {
            storage: window.localStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
        },
    })

    return supabase
}
