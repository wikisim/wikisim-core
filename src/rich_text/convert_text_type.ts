import { IdAndVersion, parse_id } from "../data/id"
import { to_javascript_identifier } from "../data/to_javascript_identifier"
import { browser_convert_tiptap_to_javascript } from "./browser_convert_tiptap_to_javascript"
import { browser_extract_ids_and_labels_from_tiptap } from "./browser_extract_ids_and_labels_from_tiptap"
import { determine_input_value_text_type } from "./determine_text_type"
import { match_js_component_ref_const, upsert_js_component_const } from "./get_global_js_lines"
import { tiptap_mention_chip } from "./tiptap_mention_chip"


export function convert_text_type(input_value: string, to_type?: "tiptap" | "typescript"): string
{
    const from_type = determine_input_value_text_type(input_value)
    if (from_type === to_type) return input_value

    return from_type === "tiptap"
        ? convert_tiptap_to_typescript(input_value)
        : convert_typescript_to_tiptap(input_value)
}


function convert_tiptap_to_typescript(input_value: string): string
{
    const ids_and_labels = browser_extract_ids_and_labels_from_tiptap(input_value)
    if (ids_and_labels.error) throw new Error(ids_and_labels.error)
    const javscript = browser_convert_tiptap_to_javascript(input_value)

    let typescript = javscript
    ids_and_labels.data.forEach(({ id, label: title }) =>
    {
        const js_identifier = to_javascript_identifier({ id, title })
        typescript = typescript.replaceAll(id.to_javascript_str(), js_identifier)
        typescript = upsert_js_component_const({ id, title }, typescript)
    })

    typescript = typescript.replaceAll("\u00A0", " ") // replace non-breaking spaces with normal spaces

    return typescript
}


export function convert_typescript_to_tiptap(input_value: string): string
{
    // Try to match any of the js_component_const from the beginning of the
    // input_value.  If user has moved them or edited them this won't work.
    const lines = input_value.split("\n")
    const components: { id: IdAndVersion, js_identifier: string, title: string }[] = []
    const lines_to_keep: string[] = []
    let processing_header = true

    for (const line of lines)
    {
        const match = line.match(match_js_component_ref_const)
        if (match)
        {
            const [, js_identifier, neg, id_str, version, title] = match
            const id = parse_id((neg ? "-" : "") + id_str + "v" + version, true)
            components.push({
                id,
                js_identifier: js_identifier!,
                title: title || js_identifier || "unknown",
            })
        }
        else
        {
            // This conditional allows us to drop the blank lines during / after
            // the header reference const(s) to the js component(s).
            if (processing_header && line.trim() === "") continue
            processing_header = false

            const preserved_spaces_line = preserve_leading_spaces(line, "text")
            lines_to_keep.push(preserved_spaces_line)
        }
    }

    let tiptap = lines_to_keep.join("</p><p>") // re-join the remaining lines
    tiptap = `<p>${tiptap}</p>` // wrap in <p> tags

    components.forEach(({ id, js_identifier, title }) =>
    {
        const mention_chip = tiptap_mention_chip({ id, title })
        tiptap = tiptap.replaceAll(js_identifier, mention_chip)
    })

    return tiptap
}



/**
 * function preserve_leading_spaces
 *
 * Will replace multiple spaces with a nbsp and a space.
 *
 * This code is necessary otherwise leading spaces will not be
 * preserved in text.  However it has very strange, hard to
 * predict behaviour:
 *          line1            ==>   line1
 *          {                ==>   {
 *              return {     ==>   return {    // <-- Wrong indentation
 *              }            ==>       }
 *          }                ==>   }
 *
 * Not yet happy with this implementation because:
 *   * No tests
 *   * Not easy to manually reproduce in browser
 *   * Converts all double spaces, not just leading ones
 *   * Have not test with mixed tabs and spaces, or mixed nbsp and spaces
 */
export function preserve_leading_spaces(input: string, type: "html" | "text"): string
{
    if (type === "html")
    {
        return input.replace(/ {2}/g, "&nbsp; ")
    }
    else
    {
        return input.replace(/ {2}/g, "\u00A0 ")
    }
}
