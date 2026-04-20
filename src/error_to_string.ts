import { PostgrestError } from "@supabase/supabase-js"


export function error_to_string(value: unknown): string
{
    if (typeof value === "string") return value
    if (value instanceof PostgrestError) return `PostgrestError ${value.code} - ${value.name}, message: ${value.message}, details: ${value.details}, hint: ${value.hint}, stack: ${value.stack}`

    let json_string = ""
    try
    {
        json_string = JSON.stringify(value)
        json_string = json_string === "{}" ? "" : (", JSON: " + json_string)
    }
    catch {
        // pass
    }

    if (value instanceof Error) return "Message: " + value.message + json_string + ", Stack: " + value.stack

    return String(value) + json_string
}
