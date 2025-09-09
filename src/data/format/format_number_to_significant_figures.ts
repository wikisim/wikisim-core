import * as mathjs from "mathjs"


export function format_number_to_significant_figures (num: number, significant_figures: number, trim_trailing_zeros = true)
{
    if (num === 0) return "0"

    const precision = Math.max(0, significant_figures - Math.floor(Math.log10(Math.abs(num))) - 1)

    const str = mathjs.format(num, { notation: "fixed", precision })

    return trim_trailing_zeros ? str.replace(/(\.\d*[^0])0+|\.0+$/, "$1") : str
}


export function format_number_to_scientific_notation (num: number, significant_figures: number, trim_trailing_zeros = true)
{
    if (num === 0) return "0"

    const precision = Math.abs(num) < 1
        ? significant_figures
        : Math.max(significant_figures, significant_figures - Math.floor(Math.log10(Math.abs(num))) - 1)

    let str = mathjs.format(num, { notation: "exponential", precision })
        .replace("e+", "e")

    // Optionally remove trailing zeros in mantissa
    return trim_trailing_zeros ? str.replace(/\.?0+(e-?\d+)$/, "$1") : str
}
