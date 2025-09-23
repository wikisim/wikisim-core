import { IdAndMaybeVersion } from "../data/id.ts"
import {
    shared_get_referenced_ids_from_tiptap,
} from "./shared_get_referenced_ids_from_tiptap.ts"


export function browser_get_referenced_ids_from_tiptap (tiptap_text: string): IdAndMaybeVersion[]
{
    const parser = new DOMParser()
    return shared_get_referenced_ids_from_tiptap(parser, tiptap_text)
}
