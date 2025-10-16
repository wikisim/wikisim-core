

export function determine_input_value_text_type(input_value: string): "tiptap" | "typescript"
{
    const trimmed = input_value.trim()

    return (!trimmed || trimmed.startsWith("<p")) ? "tiptap" : "typescript"
}
