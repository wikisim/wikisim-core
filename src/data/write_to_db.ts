import {
    DBDataComponentInsertArgs,
    DBDataComponentUpdateArgs,
    get_supabase
} from "../supabase"
import { convert_from_db_row, convert_to_db_row } from "./convert_between_db"
import { DataComponent } from "./interface"


export function prepare_data_component_for_db_insert (data_component: DataComponent): DBDataComponentInsertArgs
{
    const row = convert_to_db_row(data_component)

    const args: DBDataComponentInsertArgs = {
        p_editor_id: row.editor_id,
        p_comment: row.comment ?? undefined,
        p_bytes_changed: row.bytes_changed,
        p_version_type: row.version_type ?? undefined,
        p_version_rolled_back_to: row.version_rolled_back_to ?? undefined,
        p_title: row.title,
        p_description: row.description,
        p_label_ids: row.label_ids ?? undefined,
        p_value: row.value ?? undefined,
        p_value_type: row.value_type ?? undefined,
        p_datetime_range_start: row.datetime_range_start ?? undefined,
        p_datetime_range_end: row.datetime_range_end ?? undefined,
        p_datetime_repeat_every: row.datetime_repeat_every ?? undefined,
        p_units: row.units ?? undefined,
        p_dimension_ids: row.dimension_ids ?? undefined,
        p_plain_title: row.plain_title,
        p_plain_description: row.plain_description,
        p_test_run_id: row.test_run_id ?? undefined,
        p_id: row.id,
    }

    return args
}



export function prepare_data_component_for_db_update (data_component: DataComponent): DBDataComponentUpdateArgs
{
    const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        p_test_run_id, p_id,
        ...insert_args
    } = prepare_data_component_for_db_insert(data_component)

    const args: DBDataComponentUpdateArgs = {
        ...insert_args,
        p_id: data_component.id,
        p_version_number: data_component.version_number,
    }

    return args
}


export function insert_data_component (data_component: DataComponent): Promise<DataComponent>
{
    const db_data_component = prepare_data_component_for_db_insert(data_component)

    if (data_component.version_number !== 1)
    {
        throw new Error(`Inserts into data_components will be rejected by DB when version_number != 1. Attempted value: ${data_component.version_number}`)
    }

    return new Promise((resolve, reject) =>
    {
        get_supabase()
            .rpc("insert_data_component", db_data_component)
            .then(({ data, error }) =>
            {
                if (error) reject(error)
                else resolve(convert_from_db_row(data, "yes"))
            })
    })
}


export function update_data_component (data_component: DataComponent): Promise<DataComponent>
{
    const db_data_component = prepare_data_component_for_db_update(data_component)

    return new Promise((resolve, reject) => {
        get_supabase()
            .rpc("update_data_component", db_data_component)
            .then(({ data, error }) =>
            {
                if (error) reject(error)
                else resolve(convert_from_db_row(data, "yes"))
            })
    })
}
