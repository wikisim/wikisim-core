import { Database } from "./interface.ts"


export type DBDataComponentRow = Database["public"]["Tables"]["data_components"]["Row"]
export type DBDataComponentInsertRow = Database["public"]["Tables"]["data_components"]["Insert"]
export type DBDataComponentUpdateRow = Database["public"]["Tables"]["data_components"]["Update"]
// export type DBDataComponentInsertArgs = Database["public"]["Functions"]["insert_data_component"]["Args"]
export type DBDataComponentInsertV2Args = Database["public"]["Functions"]["insert_data_component_v2"]["Args"]
export type DBDataComponentInsertV2ArgsComponent = DBDataComponentInsertV2Args["components"][number]
export type DBDataComponentInsertV2Returns = Database["public"]["Functions"]["insert_data_component_v2"]["Returns"]
export type EFDataComponentInsertV2Returns = Omit<DBDataComponentInsertV2Returns[number], "search_vector">[]
// export type DBDataComponentUpdateArgs = Database["public"]["Functions"]["update_data_component"]["Args"]
export type DBDataComponentUpdateV2Args = Database["public"]["Functions"]["update_data_component_v2"]["Args"]
export type DBDataComponentUpdateV2ArgsComponent = DBDataComponentUpdateV2Args["components"][number]
export type DBDataComponentUpdateV2Returns = Database["public"]["Functions"]["update_data_component_v2"]["Returns"]
export type EFDataComponentUpdateV2Returns = Omit<DBDataComponentUpdateV2Returns[number], "search_vector">[]

// export type DBDataComponentHistoryRow = Database["public"]["Tables"]["data_components_history"]["Row"]
export type NewDataComponentAsJSON = Omit<DBDataComponentRow, "id" | "version_number" | "search_vector"> & { temporary_id: string }
export type DataComponentAsJSON = Omit<DBDataComponentRow, "search_vector">


const data_component_select_fields: {[k in keyof DataComponentAsJSON]: 1} = {
    id: 1,
    owner_id: 1,
    version_number: 1,
    editor_id: 1,
    created_at: 1,
    comment: 1,
    bytes_changed: 1,
    version_type: 1,
    version_rolled_back_to: 1,

    title: 1,
    description: 1,
    label_ids: 1,

    input_value: 1,
    result_value: 1,
    recursive_dependency_ids: 1,
    value_type: 1,
    value_number_display_type: 1,
    value_number_sig_figs: 1,
    datetime_range_start: 1,
    datetime_range_end: 1,
    datetime_repeat_every: 1,
    units: 1,
    dimension_ids: 1,
    function_arguments: 1,
    scenarios: 1,

    subject_id: 1,
    according_to_id: 1,

    plain_title: 1,
    plain_description: 1,

    test_run_id: 1,
}

export const DATA_COMPONENT_SELECT_STRING = Object.keys(data_component_select_fields).join(", ")
