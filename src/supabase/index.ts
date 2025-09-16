import type { SupabaseClient } from "@supabase/supabase-js"


import { Database } from "./interface.ts"


export type GetSupabase = () => SupabaseClient<Database>


export type DBDataComponentRow = Database["public"]["Tables"]["data_components"]["Row"]
export type DBDataComponentInsertRow = Database["public"]["Tables"]["data_components"]["Insert"]
export type DBDataComponentUpdateRow = Database["public"]["Tables"]["data_components"]["Update"]
// export type DBDataComponentInsertArgs = Database["public"]["Functions"]["insert_data_component"]["Args"]
export type DBDataComponentInsertV2Args = Database["public"]["Functions"]["insert_data_component_v2"]["Args"]
export type DBDataComponentInsertV2ArgsComponent = DBDataComponentInsertV2Args["components"][number]
export type DBDataComponentInsertV2Returns = Database["public"]["Functions"]["insert_data_component_v2"]["Returns"]
// export type DBDataComponentUpdateArgs = Database["public"]["Functions"]["update_data_component"]["Args"]
export type DBDataComponentUpdateV2Args = Database["public"]["Functions"]["update_data_component_v2"]["Args"]
export type DBDataComponentUpdateV2ArgsComponent = DBDataComponentUpdateV2Args["components"][number]
export type DBDataComponentUpdateV2Returns = Database["public"]["Functions"]["update_data_component_v2"]["Returns"]

// export type DBDataComponentHistoryRow = Database["public"]["Tables"]["data_components_history"]["Row"]
export type NewDataComponentAsJSON = Omit<DBDataComponentRow, "id" | "version_number"> & { temporary_id: string }
export type DataComponentAsJSON = DBDataComponentRow
