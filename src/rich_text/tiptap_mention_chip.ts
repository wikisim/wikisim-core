import { IdAndMaybeVersion, parse_id } from "../data/id.ts"
import { ERRORS } from "../errors.ts"


export function tiptap_mention_chip(args: { title: string, id: IdAndMaybeVersion | string } | string, tag: "span" | "a" = "a"): string
{
    const id_str: string = (
        typeof args === "string" ? parse_id(args)
        : typeof args.id === "string" ? parse_id(args.id)
        : args.id).to_str()
    const title = typeof args === "string" ? `Some title for ${args}` : args.title

    // This catches setting up incorrect titles in tests, this was not added due
    // to a bug in production code.
    if (title.includes("<p>")) throw new Error(ERRORS.ERR49.message + title)

    if (tag === "a")
    {
        return `<a class="mention-chip" data-id="${id_str}">${title}</a>`
    }

    return `<span class="mention-chip" data-type="customMention" data-id="${id_str}" data-label="${title}">@${title}</span>`
}
