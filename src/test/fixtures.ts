import { IdAndVersion } from "../data/id"


export function tiptap_mention_chip(args: {title: string, id: IdAndVersion }): string
{
    return `<span class="mention-chip" data-type="customMention" data-id="${args.id.id}v${args.id.version}" data-label="${args.title}">@${args.title}</span>`
}
