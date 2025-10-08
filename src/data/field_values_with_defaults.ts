import { DEFAULTS } from "./defaults.ts"
import {
    NUMBER_DISPLAY_TYPES_OBJ,
    NumberDisplayType,
    VALUE_TYPES_OBJ,
    ValueType,
} from "./interface.ts"



export function valid_value_type(value_type: string | null | undefined): ValueType
{
    if (!value_type) return DEFAULTS.value_type
    if (!(value_type in VALUE_TYPES_OBJ)) return DEFAULTS.value_type
    return value_type as ValueType
}


export function valid_value_number_display_type(value_number_display_type: string | null | undefined): NumberDisplayType
{
    if (!value_number_display_type) return DEFAULTS.value_number_display_type
    if (!(value_number_display_type in NUMBER_DISPLAY_TYPES_OBJ)) return DEFAULTS.value_number_display_type
    return value_number_display_type as NumberDisplayType
}
