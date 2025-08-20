import { IdAndMaybeVersion, parse_id } from "../data/id"
import { GenericNode } from "./generic_interface"


export function browser_get_referenced_ids_from_tiptap (tiptap_text: string): IdAndMaybeVersion[]
{
    const parser = new DOMParser()
    const doc = parser.parseFromString(tiptap_text, "text/html")

    const ids = new Set<string>()

    function find_ids(node: GenericNode)
    {
        if (node.nodeType === 1) //Node.ELEMENT_NODE)
        {
            const tag = (node as Element).tagName.toLowerCase()
            if (tag === "span" && (node as Element).classList.contains("mention-chip"))
            {
                const data_id_and_version = (node as Element).getAttribute("data-id")
                if (data_id_and_version)
                {
                    ids.add(data_id_and_version)
                }
            }

            Array.from(node.childNodes).map(find_ids)
        }
    }

    find_ids(doc.body)
    return Array.from(ids).map(id_str => parse_id(id_str))
}
