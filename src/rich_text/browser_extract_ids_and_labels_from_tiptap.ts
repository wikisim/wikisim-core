import {
    ExtractedIdsAndLabels,
    shared_extract_ids_and_labels_from_tiptap,
} from "./shared_extract_ids_and_labels_from_tiptap"


export function browser_extract_ids_and_labels_from_tiptap (tiptap_text: string): ExtractedIdsAndLabels
{
    const parser = new DOMParser()
    return shared_extract_ids_and_labels_from_tiptap(parser, tiptap_text)
}
