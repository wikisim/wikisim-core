import { clamp } from "../../utils/clamp"
import { round_to_significant_figures } from "../../utils/number"
import { NUMBER_DISPLAY_TYPES_OBJ, NumberDisplayType } from "../interface"
import { format_number_to_scientific_notation, format_number_to_significant_figures } from "./format_number_to_significant_figures"


export function format_number_to_string (num: number, significant_figures: number, display_type: NumberDisplayType): string
{
    let formatted_number: string

    if (isNaN(num))
    {
        return ""
    }

    significant_figures = Math.round(significant_figures)
    significant_figures = Math.max(1, significant_figures)

    if (display_type === NUMBER_DISPLAY_TYPES_OBJ.bare)
    {
        const rounded_number = round_to_significant_figures(num, significant_figures)
        formatted_number = rounded_number.toString()
    }
    else if (display_type === NUMBER_DISPLAY_TYPES_OBJ.simple)
    {
        const rounded_number = round_to_significant_figures(num, significant_figures)
        formatted_number = Math.abs(rounded_number) < 1 ? rounded_number.toString() : rounded_number.toLocaleString()
    }
    else if (display_type === NUMBER_DISPLAY_TYPES_OBJ.scaled)
    {
        formatted_number = scale_number(num, significant_figures)
    }
    else if (display_type === NUMBER_DISPLAY_TYPES_OBJ.percentage)
    {
        const rounded_number = round_to_significant_figures(num * 100, significant_figures)
        formatted_number = rounded_number.toString() + "%"
    }
    else if (display_type === NUMBER_DISPLAY_TYPES_OBJ.abbreviated_scaled)
    {
        formatted_number = abbreviate_number(num, significant_figures)
    }
    else if (display_type === NUMBER_DISPLAY_TYPES_OBJ.scientific)
    {
        // const minimised_significant_figures = minimise_significant_figures(num, max_significant_figures)
        // formatted_number = num.toExponential(minimised_significant_figures - 1)
        formatted_number = format_number_to_scientific_notation(num, significant_figures)
    }
    else
    {
        throw new Error(`Unimplemented display type ${display_type}`)
    }

    formatted_number = formatted_number.replace("e+", "e").trim()

    return formatted_number
}


const SCALE_PREFIXES = ["", "thousand", "million", "billion", "trillion"]
function scale_number (num: number, max_significant_figures: number): string
{
    let prefix_index = 0

    while (Math.abs(num) >= 1000 && prefix_index < SCALE_PREFIXES.length - 1)
    {
        num /= 1000
        prefix_index++
    }

    const minimised_significant_figures = minimise_significant_figures(num, max_significant_figures)

    return format_number_to_significant_figures(num, minimised_significant_figures) + " " + SCALE_PREFIXES[prefix_index]
}


// https://en.wikipedia.org/wiki/Metric_prefix
const ABBREVIATE_PREFIXES = ["a", "f", "p", "n", "μ", "m", "", "k", "M", "G", "T", "P", "E"]
function abbreviate_number (num: number, max_significant_figures: number): string
{
    if (num === 0) return "0"

    let prefix_index = Math.floor(Math.log10(Math.abs(num)) / 3)
    prefix_index = clamp(prefix_index, -6, 6) // Limit to the range of prefixes we have
    const offset_prefix_index = prefix_index + 6 // Offset to match the index of ABBREVIATE_PREFIXES

    num /= Math.pow(10, prefix_index * 3)
    const prefix = ABBREVIATE_PREFIXES[offset_prefix_index]
    const minimised_significant_figures = minimise_significant_figures(num, max_significant_figures)

    return format_number_to_significant_figures(num, minimised_significant_figures) + " " + prefix
}


function minimise_significant_figures (num: number, max_significant_figures: number): number
{
    let minimised_significant_figures = max_significant_figures

    while (minimised_significant_figures > 1)
    {
        if (Number.parseFloat(num.toPrecision(minimised_significant_figures - 1)) === num)
        {
            --minimised_significant_figures
        }
        else
        {
            break
        }
    }

    return minimised_significant_figures
}
