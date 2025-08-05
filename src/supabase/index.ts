import { createClient, SupabaseClient } from "@supabase/supabase-js"

import { Database } from "./interface"

const supabase_url = "https://sfkgqscbwofiphfxhnxg.supabase.co"
const supabase_anon_key = "sb_publishable_XWsGRSpmju8qjodw4gIU8A_O_mHUR1H"


export type GetSupabase = () => SupabaseClient<Database>

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
            clear: () => { store.data = {} },
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

export type DBDataComponentRow = Database["public"]["Tables"]["data_components"]["Row"]
export type DBDataComponentInsertRow = Database["public"]["Tables"]["data_components"]["Insert"]
export type DBDataComponentUpdateRow = Database["public"]["Tables"]["data_components"]["Update"]
export type DBDataComponentInsertArgs = Database["public"]["Functions"]["insert_data_component"]["Args"]
export type DBDataComponentUpdateArgs = Database["public"]["Functions"]["update_data_component"]["Args"]

export type DBDataComponentArchiveRow = Database["public"]["Tables"]["data_components_archive"]["Row"]
