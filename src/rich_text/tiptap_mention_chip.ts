import { IdAndMaybeVersion, parse_id } from "../data/id.ts"


export function tiptap_mention_chip(args: { title: string, id: IdAndMaybeVersion | string } | string, tag: "span" | "a" = "a"): string
{
    const id_str: string = (
        typeof args === "string" ? parse_id(args)
        : typeof args.id === "string" ? parse_id(args.id)
        : args.id).to_str()
    const title = typeof args === "string" ? `Some title for ${args}` : args.title

    if (tag === "a")
    {
        return `<a class="mention-chip" data-id="${id_str}">${title}</a>`
    }

    return `<span class="mention-chip" data-type="customMention" data-id="${id_str}" data-label="${title}">@${title}</span>`
}
