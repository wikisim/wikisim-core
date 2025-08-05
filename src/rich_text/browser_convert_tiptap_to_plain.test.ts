import { expect } from "chai"

import { browser_convert_tiptap_to_plain } from "./browser_convert_tiptap_to_plain"



describe("browser_convert_tiptap_to_plain", () =>
{
    const tiptap_text = `
        <h2>Some description</h2>
        <p>This is a multiline description with some markdown triggered formatting saved as html.</p>
        <p>This <span class="mention-chip" data-type="customMention" data-id="2" data-label="Some label">@Some label</span><u>20 million homes</u> can become <u>25 million (+25%) homes</u>.</p>
        <ul><li><p>Item 1</p></li><li><p>Item 2</p></li><li><p>Item 3</p></li></ul>`

    it("should convert tiptap text to plain text", () =>
    {
        const plain_text = browser_convert_tiptap_to_plain(tiptap_text)
        expect(plain_text).equals("Some description This is a multiline description with some markdown triggered formatting saved as html. This @Some label 20 million homes can become 25 million (+25%) homes . Item 1 Item 2 Item 3")
    })
})
