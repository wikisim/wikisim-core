import type { FunctionArgument } from "../data/interface.ts"
import { deindent } from "../utils/deindent.ts"


interface FunctionToStringEvaluationRequest
{
    js_input_value: string
    function_arguments: FunctionArgument[]
}

export function format_function_input_value_string(basic_request: FunctionToStringEvaluationRequest)
{
    const body = function_body(basic_request.js_input_value).trim()
    const function_signature = get_function_signature(basic_request.function_arguments)
    const formatted_function = (function_signature + " => " + body)

    return formatted_function
}


export function get_function_signature(function_arguments: FunctionArgument[]): string
{
    const formatted_args = function_arguments.map(arg =>
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

    const lines = trimmed.split("\n")

    // Check if any line starts with a return statement
    // This is a simple check and will not cover cases such as when there is
    // a return statement inside a block or function, inside a conditional,
    // inside a multi-line string or comment, etc.
    const has_return_statement = lines.some(line => line.trim().includes("return "))

    const last_line = lines[lines.length - 1]!
    if (!has_return_statement && !last_line.trim().startsWith("return "))
    {
        lines[lines.length - 1] = "return" + (last_line ? " " + last_line : "")
    }

    const indented = lines.map(line => "    " + line).join("\n")

    return `{\n${indented}\n}`
}
