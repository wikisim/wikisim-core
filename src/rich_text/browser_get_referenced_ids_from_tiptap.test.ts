import { expect } from "chai"

import { browser_get_referenced_ids_from_tiptap } from "./browser_get_referenced_ids_from_tiptap"


describe("browser_get_referenced_ids_from_tiptap", () =>
{
    const tiptap_text = `
        <p><span class="mention-chip" data-type="customMention" data-id="1003v1" data-label="variable a">@variable a</span>+2</p>`

    it("should get data component ids from tiptap text", () =>
    {
        const ids = browser_get_referenced_ids_from_tiptap(tiptap_text)
        expect(ids).deep.equals(new Set(["1003v1"]))
    })
})
