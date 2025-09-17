import type { FunctionArgument } from "../data/interface.ts"
import { deindent } from "../utils/deindent.ts"

import type { EvaluationRequest, EvaluationResponse } from "./interface.ts"


export function format_function_input_value_string(basic_request: EvaluationRequest): EvaluationResponse
{
    const body = function_body(basic_request.js_input_value).trim()
    const formatted_function = !body ? "" : function_signature(basic_request.function_arguments) + " => " + body

    return {
        result: formatted_function,
        error: null,

        // TODO: remove these fields from the EvaluationResponse interface
        evaluation_id: 0,
        js_input_value: basic_request.js_input_value,
        requested_at: Date.now(),
        start_time: Date.now(),
        end_time: 0,
    }
}


function function_signature(function_arguments?: FunctionArgument[]): string
{
    const args = function_arguments || []
    const formatted_args = args.map(arg =>
    {
        if (arg.default_value)
        {
            return `${arg.name} = ${arg.default_value}`
        }
        return arg.name
    }).join(", ")

    return `(${formatted_args})`
}


function function_body(value: string): string
{
    const trimmed = deindent(value)

    if (trimmed.includes("\n"))
    {
        const lines = trimmed.split("\n")

        // Check if last line has a return statement
        const last_line = lines[lines.length - 1]!
        if (!last_line.trim().startsWith("return "))
        {
            lines[lines.length - 1] = "return " + last_line
        }

        const indented = lines.map(line => "    " + line).join("\n")

        return `{\n${indented}\n}`
    }

    return trimmed
}
