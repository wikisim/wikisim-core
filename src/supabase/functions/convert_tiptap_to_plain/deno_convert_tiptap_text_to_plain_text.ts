// @ts-expect-error its deno
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts"

import { shared_convert_tiptap_text_to_plain_text } from "./shared_convert_tiptap_to_plain.ts"


export function deno_convert_tiptap_text_to_plain_text(tiptap_text: string): string
{
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const parser = new DOMParser()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return shared_convert_tiptap_text_to_plain_text(parser, tiptap_text)
}
