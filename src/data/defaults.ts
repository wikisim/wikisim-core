import { NUMBER_DISPLAY_TYPES_OBJ, ScenarioValueUsage, VALUE_TYPES_OBJ } from "./interface"


const scenario_value_usage: ScenarioValueUsage = "as_is"
export const DEFAULTS = {
    value_type: VALUE_TYPES_OBJ.number,
    value_number_display_type: NUMBER_DISPLAY_TYPES_OBJ.bare,
    value_number_sig_figs: 2,
    scenario_value_usage,
}
