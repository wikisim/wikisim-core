import { shared_convert_tiptap_text_to_plain_text } from "./shared_convert_tiptap_to_plain"


export function browser_convert_tiptap_to_plain (tiptap_text: string): string
{
    // Create a DOMParser instance
    const parser = new DOMParser()

    // Use the shared function to convert Tiptap text to plain text
    return shared_convert_tiptap_text_to_plain_text(parser, tiptap_text)
}
