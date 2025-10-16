/// <reference lib="dom" />

import { IdAndVersion, IdOnly, parse_id } from "../data/id.ts"
import { GenericDOMParser, GenericNode } from "./generic_interface.ts"


export interface ExtractedIdsAndLabels
{
    data: { id: IdAndVersion, label: string }[]
    error: string | null
}

export function shared_extract_ids_and_labels_from_tiptap (parser: GenericDOMParser, tiptap_text: string): ExtractedIdsAndLabels
{
    const doc = parser.parseFromString(tiptap_text, "text/html")
    if (!doc) return { error: "Error: Unable to parse text, no document", data: [] }


    const ids: { id: IdAndVersion, label: string }[] = []
    const seen_ids = new Set<string>()
    const errors: string[] = []


    function extract_id_and_labels(node: GenericNode): void
    {
        if (node.nodeType === 3) //Node.TEXT_NODE)
        {
            return
        }
        else if (node.nodeType === 1) //Node.ELEMENT_NODE)
        {
            const tag = (node as Element).tagName
            if (tag === "BR") return

            if ((tag === "SPAN" || tag === "A") && (node as Element).classList.contains("mention-chip"))
            {
                const data_id_and_maybe_version = (node as Element).getAttribute("data-id")
                if (!data_id_and_maybe_version)
                {
                    errors.push("mention chip is missing data-id attribute")
                    return
                }

                const data_id_and_version = parse_id(data_id_and_maybe_version)
                const component_name = node.textContent?.replace(/^@/, "") || "unknown"
                if (data_id_and_version instanceof IdOnly)
                {
                    errors.push(`referenced components must use a version but got id ${data_id_and_maybe_version} for ${component_name}`)
                    return
                }
                else
                {
                    const id_str = data_id_and_version.to_str()
                    if (seen_ids.has(id_str)) return
                    seen_ids.add(id_str)
                    ids.push({ id: data_id_and_version, label: component_name })
                    return
                }
            }

            Array.from(node.childNodes).forEach(extract_id_and_labels)
        }
    }

    // Extract id and labels from body
    extract_id_and_labels(doc.body)
    return {
        data: ids,
        error: errors.length ? errors.join(", ") : null,
    }
}
