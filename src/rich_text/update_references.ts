import { IdAndVersion } from "../data/id"
import { DataComponent } from "../data/interface"
import { convert_text_type } from "./convert_text_type"
import { determine_input_value_text_type } from "./determine_text_type"
import { GenericNode } from "./generic_interface"


export function update_references(
    input_value: string,
    map_id_and_version_to_new_component: (id: IdAndVersion) => DataComponent | undefined
): string
{
    const text_type = determine_input_value_text_type(input_value)
    const tiptap_text = convert_text_type(input_value, "tiptap")

    const parser = new DOMParser()
    const doc = parser.parseFromString(tiptap_text, "text/html")

    function modify_references(node: GenericNode)
    {
        if (node.nodeType === 1) //Node.ELEMENT_NODE)
        {
            const tag = (node as Element).tagName
            if ((tag === "SPAN" || tag === "A") && (node as Element).classList.contains("mention-chip"))
            {
                const data_id_and_version = (node as Element).getAttribute("data-id")
                if (data_id_and_version)
                {
                    const id_and_version = IdAndVersion.from_str(data_id_and_version)
                    const new_component = map_id_and_version_to_new_component(id_and_version)
                    if (new_component)
                    {
                        const new_id_and_version_str = new_component.id.to_str()
                        ;(node as Element).setAttribute("data-id", new_id_and_version_str)
                        node.textContent = new_component.plain_title
                    }
                }
            }

            Array.from(node.childNodes).map(modify_references)
        }
    }

    modify_references(doc.body)

    const updated_tiptap_text = doc.body.innerHTML

    return convert_text_type(updated_tiptap_text, text_type)
}
