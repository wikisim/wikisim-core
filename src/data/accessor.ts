import { DataComponent, NewDataComponent, is_data_component } from "./interface"


export function get_id_str_of_data_component(data_component: DataComponent | NewDataComponent): string
{
    if (is_data_component(data_component))
    {
        return data_component.id.to_str_without_version()
    }
    return data_component.temporary_id.to_str()
}


export function get_version_of_data_component(data_component: DataComponent | NewDataComponent): number
{
    if (is_data_component(data_component)) return data_component.id.version
    return 0
}
