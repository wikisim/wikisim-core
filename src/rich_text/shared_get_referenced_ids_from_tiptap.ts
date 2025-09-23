import { IdAndVersion, OrderedUniqueIdAndVersionList } from "../data/id.ts"
import { GenericDOMParser, GenericNode } from "./generic_interface.ts"


export function shared_get_referenced_ids_from_tiptap (parser: GenericDOMParser, tiptap_text: string): IdAndVersion[]
{
    const doc = parser.parseFromString(tiptap_text, "text/html")
    if (!doc) throw new Error("Error: Unable to parse text")

    const ids = new OrderedUniqueIdAndVersionList()

    function find_ids(node: GenericNode)
    {
        if (node.nodeType === 1) //Node.ELEMENT_NODE)
        {
            const tag = (node as Element).tagName.toLowerCase()
            if (tag === "span" && (node as Element).classList.contains("mention-chip"))
            {
                const data_id_and_version = (node as Element).getAttribute("data-id")
                if (data_id_and_version) ids.add(data_id_and_version)
            }

            Array.from(node.childNodes).map(find_ids)
        }
    }

    find_ids(doc.body)
    return ids.get_all()
}
