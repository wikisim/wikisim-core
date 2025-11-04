import { Json } from "../supabase/interface"
import { LabelsAndResults } from "./interface"


export function result_string_to_json(result: string | undefined): { parsed: Json | undefined } | false
{
    if (!result) return false
    if (result === "undefined") return { parsed: undefined }

    try
    {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        return { parsed: JSON.parse(result) }
    }
    catch
    {
        return false
    }
}


export function assert_result_json_is_graphable(json: Json | undefined): LabelsAndResults | false
{
    if (typeof json !== "object" || json === null) return false

    if (!("labels" in json) || !("results" in json)) return false

    const { labels, results } = json
    if (!Array.isArray(labels) || !Array.isArray(results)) return false

    if (!labels.every(l => typeof l === "number")) return false
    if (!results.every(l => typeof l === "number")) return false

    return { labels, results }
}


export function result_string_to_graphable(result: string | undefined): LabelsAndResults | false
{
    const parsed_json = result_string_to_json(result)
    if (!parsed_json) return false

    return assert_result_json_is_graphable(parsed_json.parsed)
}
