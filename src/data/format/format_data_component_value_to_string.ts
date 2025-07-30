import { DataComponent, NewDataComponent } from "../interface"
import { format_number_to_string } from "./format_number_to_string"


export function format_data_component_value_to_string (data_component: DataComponent | NewDataComponent): string
{
    const {
        value = "",
        // value_type,
        value_number_display_type = "bare",
        value_number_sig_figs = 2,
    } = data_component

    const value_as_number = parseFloat(value)

    return format_number_to_string(value_as_number, value_number_sig_figs, value_number_display_type)
}
