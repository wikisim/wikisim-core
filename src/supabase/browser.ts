import { createClient, SupabaseClient } from "@supabase/supabase-js"

import { GetSupabase as GetSupabaseOrig } from "."
import { supabase_anon_key, supabase_url } from "./constants"
import { Database } from "./interface"


export type GetSupabase = GetSupabaseOrig

let supabase: SupabaseClient<Database> | undefined = undefined

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
