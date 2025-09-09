

export type ResultPoint = number | null
export interface MergedLabelsAndResults
{
    labels: number[]
    results: ResultPoint[]
    expected:
    {
        matched: boolean[]
        results: ResultPoint[]
    } | undefined
}
