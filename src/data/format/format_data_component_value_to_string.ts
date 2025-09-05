import { DEFAULTS } from "../defaults"
import { DataComponent, NewDataComponent } from "../interface"
import { format_number_to_string } from "./format_number_to_string"


export function format_data_component_value_to_string (data_component: DataComponent | NewDataComponent): string
{
    const {
        // input_value = "",
        result_value = "",
        units = "",
        value_type,
        value_number_display_type = DEFAULTS.value_number_display_type,
        value_number_sig_figs = DEFAULTS.value_number_sig_figs,
    } = data_component

    if (value_type === "function") return result_value

    const value_as_number = parseFloat(result_value)

    let num_as_str = format_number_to_string(value_as_number, value_number_sig_figs, value_number_display_type)
    if (num_as_str === "") return ""

    const units_sans_underscores = units ? units.trim().replace(/_/g, " ") : ""

    return units_sans_underscores ? `${num_as_str} ${units_sans_underscores}` : num_as_str
}
