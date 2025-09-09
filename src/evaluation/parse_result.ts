import { LabelsAndResults } from "./interface"


export function result_string_to_graphable(result: string | undefined): LabelsAndResults | false
{
    if (!result) return false

    try
    {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const json = JSON.parse(result)
        return assert_json_is_graphable(json)
    }
    catch
    {
        return false
    }
}


function assert_json_is_graphable(json: any): LabelsAndResults | false
{
    if (typeof json !== "object" || json === null) return false

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { labels, results } = json
    if (!Array.isArray(labels) || !Array.isArray(results)) return false

    if (!labels.every(l => typeof l === "number")) return false
    if (!results.every(l => typeof l === "number")) return false

    return { labels, results }
}
