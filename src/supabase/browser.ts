import { createClient, SupabaseClient } from "@supabase/supabase-js"

import { supabase_anon_key, supabase_url } from "./constants"
import { Database } from "./interface"


export type GetSupabase = () => SupabaseClient<Database>

let supabase: SupabaseClient<Database> | undefined = undefined


function get_window(): Window | null
{
    if (typeof window !== "undefined") return window
    return null
}


export function get_supabase (): SupabaseClient<Database>
{
    if (supabase) return supabase

    supabase = createClient<Database>(supabase_url, supabase_anon_key, {
        auth: {
            storage: get_window()?.localStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
        },
    })

    return supabase
}

export const __testing__ = {
    get_supabase_not_signed_in: (): SupabaseClient<Database> =>
    {
        const store: { data: {[key: string]: string} } = { data: {}}
        const empty_storage = {
            getItem: (key: string) => store.data[key] || null,
            setItem: (key: string, value: string) => { store.data[key] = value },
            removeItem: (key: string) => { delete store.data[key] },
        }

        return createClient<Database>(supabase_url, supabase_anon_key, {
            auth: {
                storage: empty_storage,
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true,
            },
        })
    }
}
