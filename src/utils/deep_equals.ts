
export function deep_equals(actual: unknown, expected: unknown, message: string = ""): void
{
    let diffs: string[] = []
    try
    {
        diffs = get_deep_diffs(actual, expected, "")
    }
    catch (error)
    {
        throw new Error(`${message} -- Deep equals check failed: ${error instanceof Error ? error.message : String(error)}`)
    }

    // The Chai assertion diff is so short that it's not worth using so just
    // throw an error instead.
    // expect(diffs.join("\n")).equals("")
    if (diffs.length > 0)
    {
        throw new Error(`${message} -- Deep diff failed:\n${diffs.join("\n")}`)
    }
}


function get_deep_diffs(actual: unknown, expected: unknown, path: string): string[]
{
    if (actual === expected) return []

    if (Array.isArray(expected)) return diff_arrays(actual, expected, path)
    if (expected === null || typeof expected !== "object") {
        if (actual !== expected)
        {
            return [`At path "${path}" Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`]
        }
        return []
    }
    return diff_objects(actual as Record<string, unknown>, expected as Record<string, unknown>, path)
}


function diff_arrays(actual: unknown, expected: unknown[], path: string): string[]
{
    let diffs: string[] = []

    if (!Array.isArray(actual))
    {
        diffs.push(`Expected "${path}" to be an array, but got ${typeof actual}. Expected: ${JSON.stringify(expected)} vs actual ${JSON.stringify(actual)}`)
    }
    else
    {
        if (actual.length !== expected.length)
        {
            diffs.push(`Array length for "${path}" differs: expected ${expected.length}, got ${actual.length}.  Expected: ${JSON.stringify(expected)} vs actual ${JSON.stringify(actual)}`)
        }

        actual.forEach((item, index) =>
        {
            diffs = diffs.concat(get_deep_diffs(item, expected[index], `${path}[${index}]`))
        })
    }

    return diffs
}


function diff_objects(actual: Record<string, unknown>, expected: Record<string, unknown>, path: string): string[]
{
    const actual_keys = Object.keys(actual)
    const expected_keys = Object.keys(expected)

    let diffs: string[] = []

    expected_keys.forEach((key) =>
    {
        if (!actual_keys.includes(key))
        {
            diffs.push(`Expected key "${key}" not found in actual object.`)
        }

        const actual_value = actual[key]
        const expected_value = expected[key]

        diffs = diffs.concat(get_deep_diffs(actual_value, expected_value, `${path}.${key}`))
    })

    actual_keys.forEach((key) =>
    {
        if (!expected_keys.includes(key))
        {
            diffs.push(`Unexpected key "${key}" found in actual object.`)
        }
    })

    return diffs
}
