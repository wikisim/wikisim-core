import { extract_ids_from_text, IdAndVersion } from "../data/id"
import { DataComponent, NewDataComponent } from "../data/interface"
import { browser_get_referenced_ids_from_tiptap } from "./browser_get_referenced_ids_from_tiptap"
import { determine_input_value_text_type } from "./determine_text_type"


export function browser_get_referenced_ids (data_component: DataComponent | NewDataComponent): IdAndVersion[]
{
    const { input_value = "" } = data_component
    const text_type = determine_input_value_text_type(input_value)
    return text_type === "tiptap"
        ? browser_get_referenced_ids_from_tiptap(input_value)
        : get_referenced_ids_from_typescript(data_component.input_value ?? "")
}


function get_referenced_ids_from_typescript(input_value: string): IdAndVersion[]
{
    return extract_ids_from_text(input_value)
}
