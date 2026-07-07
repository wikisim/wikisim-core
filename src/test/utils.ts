import { expect } from "chai"


export function deep_approximate<T>(actual: T, expected: T, tolerance: number = 1e-6, path = ""): void
{
    if (typeof actual === "number" && typeof expected === "number")
    {
        expect(Math.abs(actual - expected) <= tolerance).equals(true, `Values${at_path(path)} differ by more than ${tolerance}: actual=${actual}, expected=${expected}`)
    }
    else if (Array.isArray(actual) && Array.isArray(expected))
    {
        expect(actual.length).equals(expected.length, `Array lengths${at_path(path)} differ: actual=${actual.length}, expected=${expected.length}`)

        if (actual.length === expected.length)
        for (let i = 0; i < actual.length; i++)
        {
            deep_approximate(actual[i], expected[i], tolerance)
        }
    }
    else if (typeof actual === "object" && typeof expected === "object" && actual !== null && expected !== null)
    {
        const actual_keys = Object.keys(actual)
        const expected_keys = Object.keys(expected)

        expect(actual_keys.length).equals(expected_keys.length, `Object keys${at_path(path)} differ: actual=${actual_keys}, expected=${expected_keys}`)

        if (actual_keys.length === expected_keys.length)
        {
            for (const key of actual_keys)
            {
                expect(key in expected).equals(true, `Key "${key}"${at_path(path)} is present in actual but not in expected`)
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                deep_approximate((actual as any)[key], (expected as any)[key], tolerance)
            }
        }
    }
    else
    {
        expect(actual).equals(expected, `Values${at_path(path)} differ: actual=${actual}, expected=${expected}`)
    }
}


function at_path(path: string): string
{
    return path ? ` at path "${path}"` : ""
}
