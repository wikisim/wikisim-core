import { clamp } from "./clamp"


export function lerp (a: number, b: number, t: number): number
{
    return a + (b - a) * clamp(t, 0, 1)
}


export function inverse_lerp(min: number, max: number, value: number): number
{
    if (min === max) return 0
    return Math.max(0, Math.min(1, (value - min) / (max - min)))
}
