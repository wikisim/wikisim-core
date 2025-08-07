

export function binary_search<T>(arr: T[], target: T, compare: (a: T, b: T) => number): number
{
    let low = 0
    let high = arr.length - 1

    while (low <= high)
    {
        const mid = Math.floor((low + high) / 2)
        const cmp = compare(arr[mid]!, target)
        if (cmp === 0) return mid
        if (cmp < 0) low = mid + 1
        else high = mid - 1
    }
    return -1
}
