import { expect } from "chai"

import { IdAndVersion } from "../data/id"
import { init_data_component } from "../data/modify"
import { browser_convert_tiptap_to_javascript } from "./browser_convert_tiptap_to_javascript"


describe("browser_convert_tiptap_to_javascript", () =>
{
    const tiptap_text = `
        <p><span class="mention-chip" data-type="customMention" data-id="1003v1" data-label="Dwelling stock in England (2023)">@Dwelling stock in England (2023)</span>+2</p>`

    it("should convert tiptap text to javascript text", () =>
    {
        const d1003v1 = init_data_component({ id: new IdAndVersion(1003, 1), result_value: "25400000" })
        const plain_text = browser_convert_tiptap_to_javascript(tiptap_text, {"1003v1": d1003v1})
        // expect(plain_text).equals("d1003v1 = 25400000\nd1003v1 + 2")
        expect(plain_text).equals("25400000 +2")
    })

    it("should not convert undefined data components into strings that can be parsed as a float", () =>
    {
        const plain_text = browser_convert_tiptap_to_javascript(tiptap_text, {})
        expect(plain_text).equals(`"component 1003v1 is undefined" +2`)
        expect(parseFloat(plain_text)).deep.equals(NaN)
    })
})
