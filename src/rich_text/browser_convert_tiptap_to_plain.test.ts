import { expect } from "chai"

import { tiptap_mention_chip } from "../test/fixtures"
import { browser_convert_tiptap_to_plain } from "./browser_convert_tiptap_to_plain"


describe("browser_convert_tiptap_to_plain", () =>
{
    // TODO remove the `span` tag for tiptap_mention_chip when
    // existing content has been updated to use `a` tags for
    // mention chips
    const tags = ["span", "a"] as const

    tags.forEach(tag =>
    {
        const tiptap_text = `
            <h2>Some description</h2>
            <p>This is a multiline description with some markdown triggered formatting saved as html.</p>
            <p>This ${tiptap_mention_chip("1234", tag)} can become <u>25 million (+25%) homes</u>.</p>
            <ul><li><p>Item 1</p></li><li><p>Item 2</p></li><li><p>Item 3</p></li></ul>`

        it(`should convert tiptap text to plain text when mention-chip uses "${tag}" HTML tags`, () =>
        {
            const plain_text = browser_convert_tiptap_to_plain(tiptap_text)
            expect(plain_text).equals("Some description This is a multiline description with some markdown triggered formatting saved as html. This Some title for 1234 can become 25 million (+25%) homes . Item 1 Item 2 Item 3")
        })
    })
})
