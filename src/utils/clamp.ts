

export function clamp(value: number | undefined, min: number, max: number): number
{
    if (value === undefined) return min; // Default to min if value is undefined
    return Math.max(min, Math.min(max, value));
}
