import { expect } from "chai"

import { tiptap_mention_chip } from "../rich_text/tiptap_mention_chip"
import { deindent } from "../utils/deindent"
import { convert_text_type } from "./convert_text_type"


describe("convert_text_type", () =>
{
    const d_12v3 = tiptap_mention_chip({ id: "-12v3", title: "Some title" })
    const d_45v6 = tiptap_mention_chip({ id: "-45v6", title: "other comp" })
    const tiptap = `<p>// Some comment\u00A0\u00A0 with three spaces in it</p><p>const a = 1</p><p>\u00A0 \u00A0 (a + ${d_12v3}) / ${d_12v3} + ${d_45v6}</p>`
    const typescript = deindent(`
        const other_comp = d_45v6 // "other comp"
        const Some_title = d_12v3 // "Some title"

        // Some comment   with three spaces in it
        const a = 1
            (a + Some_title) / Some_title + other_comp`)

    it("should convert tiptap to typescript", () =>
    {
        expect(convert_text_type(tiptap)).equals(typescript)
    })

    it("should convert typescript to tiptap", () =>
    {
        expect(convert_text_type(typescript)).equals(tiptap)
    })
})
