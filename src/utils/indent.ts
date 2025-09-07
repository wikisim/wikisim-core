

export function indent(text: string, indentation: string, level: number): string
{
    const indent_str = indentation.repeat(level)
    return text.split("\n").map(line => line ? (indent_str + line) : line).join("\n")
}
