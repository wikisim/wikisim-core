import { IdAndVersion } from "../data/id"
import {
    shared_get_referenced_ids_from_tiptap,
} from "./shared_get_referenced_ids_from_tiptap"


export function browser_get_referenced_ids_from_tiptap (tiptap_text: string): IdAndVersion[]
{
    const parser = new DOMParser()
    return shared_get_referenced_ids_from_tiptap(parser, tiptap_text)
}
