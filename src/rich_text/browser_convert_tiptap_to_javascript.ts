import { shared_convert_tiptap_text_to_javascript } from "./shared_convert_tiptap_to_javascript.ts"


export function browser_convert_tiptap_to_javascript (tiptap_text: string): string //, data_component_by_id_and_version: Record<string, DataComponent>): string
{
    const parser = new DOMParser()
    return shared_convert_tiptap_text_to_javascript(parser, tiptap_text)//, data_component_by_id_and_version)
}
