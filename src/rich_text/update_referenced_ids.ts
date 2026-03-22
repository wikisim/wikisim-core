import { extract_ids_from_text, IdAndVersion } from "../data/id"
import { convert_text_type } from "./convert_text_type"
import { determine_input_value_text_type } from "./determine_text_type"


export function update_referenced_ids (
    input_value: string,
    map_id_and_version_to_new_id_and_version: (id: IdAndVersion) => IdAndVersion | undefined
): string
{
    const text_type = determine_input_value_text_type(input_value)
    const typescript = convert_text_type(input_value, "typescript")
    const ids = get_referenced_ids_from_typescript(typescript)

    let updated_typescript = typescript
    ids.forEach(id =>
    {
        const new_id_and_version = map_id_and_version_to_new_id_and_version(id)
        if (!new_id_and_version) return

        const id_str_with_version = id.to_str()
        const new_id_str = new_id_and_version.to_str()
        updated_typescript = updated_typescript.replaceAll(id_str_with_version, new_id_str)
    })

    return convert_text_type(updated_typescript, text_type)
}


function get_referenced_ids_from_typescript(input_value: string): IdAndVersion[]
{
    return extract_ids_from_text(input_value)
}
