

export function convert_tiptap_text_to_plain_text(tiptap_text: string): string
{
    const parser = new DOMParser()
    const doc = parser.parseFromString(tiptap_text, "text/html")

    // List of block-level elements to add spaces between
    const blockTags = new Set([
        "address", "article", "aside", "blockquote", "canvas", "dd", "div",
        "dl", "dt", "fieldset", "figcaption", "figure", "footer", "form",
        "h1", "h2", "h3", "h4", "h5", "h6", "header", "hr", "li", "main", "nav",
        "noscript", "ol", "output", "p", "pre", "section", "table", "tfoot", "ul"
    ])

    function extractText(node: Node): string
    {
        if (node.nodeType === Node.TEXT_NODE)
        {
            return (node.textContent || "").trim()
        }
        if (node.nodeType === Node.ELEMENT_NODE)
        {
            const tag = (node as Element).tagName.toLowerCase()
            let text = Array.from(node.childNodes).map(extractText).filter(Boolean).join(" ")
            // Add space after block-level elements
            if (blockTags.has(tag)) text = text + " "
            return text
        }
        return ""
    }

    // Extract text from body
    return extractText(doc.body).replace(/ +/g, " ").trim()
}
