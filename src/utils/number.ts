

export function round_to_significant_figures (num: number, significant_figures: number): number
{
    if (num === 0) return 0

    const multiplier = Math.pow(10, significant_figures - Math.floor(Math.log10(Math.abs(num))) - 1)
    return Math.round(num * multiplier) / multiplier
}
