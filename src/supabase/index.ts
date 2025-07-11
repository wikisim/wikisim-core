import { createClient } from "@supabase/supabase-js"

import { Database } from "./interface"

const supabase_url = "https://sfkgqscbwofiphfxhnxg.supabase.co"
const supabase_anon_key = "sb_publishable_XWsGRSpmju8qjodw4gIU8A_O_mHUR1H"


export const supabase = createClient<Database>(supabase_url, supabase_anon_key, {
  auth: {
    storage: window.localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})
