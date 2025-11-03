

export function truncate(text: string, max_length: number = 100): string
{
    if (text.length <= max_length) return text
    return text.slice(0, max_length - 3) + "..."
}
