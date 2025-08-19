import { DataComponent } from "../data/interface"

import { GenericNode } from "./generic_interface"


export function browser_convert_tiptap_to_javascript (tiptap_text: string, data_component_by_id_and_version: Record<string, DataComponent>): string
{
    const parser = new DOMParser()
    const doc = parser.parseFromString(tiptap_text, "text/html")

    function extract_text(node: GenericNode): string
    {
        if (node.nodeType === 3) //Node.TEXT_NODE)
        {
            return (node.textContent || "").trim()
        }
        if (node.nodeType === 1) //Node.ELEMENT_NODE)
        {
            const tag = (node as Element).tagName.toLowerCase()
            if (tag === "span" && (node as Element).classList.contains("mention-chip"))
            {
                const data_id_and_version = (node as Element).getAttribute("data-id")
                if (data_id_and_version)
                {
                    const component_value = data_component_by_id_and_version[data_id_and_version]?.result_value
                    return component_value || `"${data_id_and_version} is undefined"`
                }
            }

            const text = Array.from(node.childNodes).map(extract_text).filter(Boolean).join(" ")
            return text
        }
        return ""
    }

    // Extract text from body
    return extract_text(doc.body).replace(/ +/g, " ").trim()
}
