import { DataComponent, DataComponentsById, FunctionArgument } from "../data/interface.ts"
import { to_javascript_identifier } from "../data/to_javascript_identifier.ts"
import { deindent } from "../utils/deindent.ts"
import { truncate } from "../utils/truncate.ts"


export function get_global_js_lines(
    data_component_dependencies_by_id: DataComponentsById,
    function_arguments: FunctionArgument[],
    include_aliases: boolean = false,
)
{
    const dependencies_and_aliases = Object.entries(data_component_dependencies_by_id)
    .map(([id, component]) =>
    {
        const title = get_jsdoc_safe_text(component.plain_title)
        const description = get_jsdoc_safe_text(component.plain_description)
        return deindent(`
            /**
             * ${title}
             *
             * ${description}
             *
             * https://wikisim.org/wiki/${id}
             */
            declare const ${"d" + id}: any;
            `)
    })

    if (include_aliases)
    {
        Object.values(data_component_dependencies_by_id)
        .forEach(component =>
        {
            dependencies_and_aliases.push(js_component_ref(component, "declare const"))
        })
    }

    const function_args_for_auto_complete = [
        `// function args for auto-complete`,
        ...Object.entries(function_arguments)
            .map(([_, arg]) => `declare const ${arg.name}: any;`)
    ]

    return [
        ...dependencies_and_aliases,
        ...function_args_for_auto_complete,
    ]
}


export function js_component_ref(component: DataComponent, type: "declare const" | "const"): string
{
    const id = component.id.to_str()
    const description = get_jsdoc_safe_text(component.plain_description)

    if (type === "declare const") return deindent(`
        /**
         * ${description}
         *
         * https://wikisim.org/wiki/${id}
         */
        declare const ${to_javascript_identifier(component)}: any; // ${id}
    `)

    return deindent(`
        /**
         * ${description}
         *
         * https://wikisim.org/wiki/${id}
         */
        ${js_component_ref_as_const(component)};
    `)
}


export const match_js_component_ref_const = /^const (\w+) = d(_?)(\d+)v(\d+) \/\/ "(.+)"/

export function upsert_js_component_const(component: Pick<DataComponent, "id" | "title">, existing_code: string): string
{
    const ref = js_component_ref_as_const(component)
    const lines = existing_code.split("\n")
    const has_one_or_more_refs = existing_code.trim().match(match_js_component_ref_const)

    for (const line of lines)
    {
        if (line.includes(ref))
        {
            return existing_code
        }
    }

    return ref + "\n" + (has_one_or_more_refs ? "" : "\n") + existing_code
}


function js_component_ref_as_const(component: Pick<DataComponent, "id" | "title">): string
{
    const id_js_str = component.id.to_javascript_str()
    return `const ${to_javascript_identifier(component)} = ${id_js_str} // "${component.title}"`
}


function get_jsdoc_safe_text(text: string): string
{
    const processed_text = text.trim()
        .replaceAll("*/", "* /")
        .replaceAll(/\n|\r/g, "")
    return truncate(processed_text, 200)
}
