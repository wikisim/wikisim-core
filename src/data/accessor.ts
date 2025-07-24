import { DataComponent, NewDataComponent, is_data_component } from "./interface"


export function get_id_str_of_data_component(data_component: DataComponent | NewDataComponent, all_temp_ids_are_same?: boolean): string
{
    if (is_data_component(data_component))
    {
        return data_component.id.to_str_without_version()
    }
    return all_temp_ids_are_same ? "temp_id" : data_component.temporary_id.to_str()
}


export function get_version_of_data_component(data_component: DataComponent | NewDataComponent): number
{
    if (is_data_component(data_component)) return data_component.id.version
    return 0
}
