// This file is part of WikiSim Supabase so it uses generic non-Node specific
// types which are compatible with the Deno environment.
import type { GenericDOMParser, GenericNode } from "./generic_interface.ts"


export function shared_convert_tiptap_text_to_plain_text(parser: GenericDOMParser, tiptap_text: string): string
{
    const doc = parser.parseFromString(tiptap_text, "text/html")
    if (!doc) throw new Error("Error: Unable to parse text")

    // List of block-level elements to add spaces between
    const block_tags = new Set([
        "address", "article", "aside", "blockquote", "canvas", "dd", "div",
        "dl", "dt", "fieldset", "figcaption", "figure", "footer", "form",
        "h1", "h2", "h3", "h4", "h5", "h6", "header", "hr", "li", "main", "nav",
        "noscript", "ol", "output", "p", "pre", "section", "table", "tfoot", "ul"
    ])

    function extract_text(node: GenericNode): string
    {
        if (node.nodeType === 3) //Node.TEXT_NODE)
        {
            return (node.textContent?.replace(/^@/, "") || "").trim()
        }
        if (node.nodeType === 1) //Node.ELEMENT_NODE)
        {
            // @ts-expect-error its deno, should be `(node as Element).tagName`
            const tag = node.tagName.toLowerCase()
            let text = Array.from(node.childNodes).map(extract_text).filter(Boolean).join(" ")
            // Add space after block-level elements
            if (block_tags.has(tag)) text = text + " "
            return text
        }
        return ""
    }

    // Extract text from body
    return extract_text(doc.body).replace(/ +/g, " ").trim()
}
