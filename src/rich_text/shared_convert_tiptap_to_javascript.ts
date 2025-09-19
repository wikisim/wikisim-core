import { IdOnly, parse_id } from "../data/id.ts"
import { GenericDOMParser, GenericNode } from "./generic_interface.ts"


export function shared_convert_tiptap_text_to_javascript (parser: GenericDOMParser, tiptap_text: string): string //, data_component_by_id_and_version: Record<string, DataComponent>): string
{
    // console .log("Converting tiptap to javascript:", tiptap_text, data_component_by_id_and_version)

    // tiptap_text = tiptap_text.replace(/<\/p><p>/g, "\n").replace(/<br>/g, "\n")
    const doc = parser.parseFromString(tiptap_text, "text/html")
    if (!doc) return "Error: Unable to parse text, no document"

    function extract_text(node: GenericNode): string | string[]
    {
        // console .log(node.nodeType, node.tagName, node.textContent)
        if (node.nodeType === 3) //Node.TEXT_NODE)
        {
            if (node.textContent?.startsWith("\n")) return ["\n", node.textContent]//.trim()]
            return (node.textContent || "")//.trim()
        }
        else if (node.nodeType === 1) //Node.ELEMENT_NODE)
        {
            const tag = (node as Element).tagName
            if (tag === "BR") return "\n"

            if (tag === "SPAN" && (node as Element).classList.contains("mention-chip"))
            {
                const data_id_and_maybe_version = (node as Element).getAttribute("data-id")
                if (!data_id_and_maybe_version) return `"mention chip is missing data-id attribute"`

                const data_id_and_version = parse_id(data_id_and_maybe_version)
                if (data_id_and_version instanceof IdOnly)
                {
                    const component_name = node.textContent?.replace(/^@/, "") || "unknown"
                    return `"referenced components must use a version but got id ${data_id_and_maybe_version} of ${component_name}"`
                }
                else
                {
                    // const component = data_component_by_id_and_version[data_id_and_maybe_version]
                    // if (!component) return `"component ${data_id_and_maybe_version} is undefined"`

                    return data_id_and_version.to_javascript_str()
                }
            }

            const parts = Array.from(node.childNodes).map(extract_text).flat().filter(Boolean)
            let text = ""
            parts.forEach((part, i) =>
            {
                if (part === "\n") text += "\n"
                else
                {
                    // const end_char = i > 0 && text && text[text.length - 1]
                    // // Add a space if the previous part did not end with a
                    // // newline.
                    // if (end_char && end_char !== "\n") text += " "
                    text += part
                }
            })

            if (tag === "P") text += "\n"

            return text
        }
        return ""
    }

    // Extract text from body
    const extracted = extract_text(doc.body)
    const extracted_string = Array.isArray(extracted) ? extracted.join("") : extracted
    return extracted_string.replace(/ +/g, " ").trim().replace(/^;/, "")
}
