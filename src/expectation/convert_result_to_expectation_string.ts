// import { DEFAULTS } from "../data/defaults"
// import { format_number_to_string } from "../data/format/format_number_to_string"
// import { NumberDisplayType } from "../data/interface"


// /**
//  *
//  * @param result
//  * @param sig_figs
//  * @returns
//  */
// export function convert_result_to_expectation_string(
//     result: number | number[],
//     sig_figs: number = DEFAULTS.value_number_sig_figs,
//     format: NumberDisplayType | undefined = undefined,
// ): string | undefined
// {
//     if (Array.isArray(result))
//     {
//         const val_strs = result.map(n => num_to_str(n, sig_figs, format)).join(", ")
//         return `[${val_strs}]`
//     }

//     return num_to_str(result, sig_figs, format)
// }


// function num_to_str(n: number, sig_figs: number, format: NumberDisplayType | undefined): string
// {
//     if (Math.abs(n) >= 1000 || Math.abs(n) < 0.01)
//     {
//         return format_number_to_string(n, sig_figs, format || "scientific")
//     }
//     return format_number_to_string(n, sig_figs, format || DEFAULTS.value_number_display_type)
// }
