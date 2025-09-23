import { expect } from "chai"

import { IdAndVersion, IdOnly } from "../data/id"
import { tiptap_mention_chip } from "../test/fixtures"
import {
    browser_get_referenced_ids_from_tiptap,
} from "./browser_get_referenced_ids_from_tiptap"


describe("browser_get_referenced_ids_from_tiptap", () =>
{
    it("should get data component ids from tiptap text", () =>
    {
        const tiptap_text = `
            <p>
                ${tiptap_mention_chip({ id: new IdAndVersion(1003, 1), title: "variable a" })}
                + ${tiptap_mention_chip({ id: new IdAndVersion(-2, 1), title: "variable b" })}
                + 2
            </p>`

        const ids = browser_get_referenced_ids_from_tiptap(tiptap_text)
        expect(ids).deep.equals([
            new IdAndVersion(1003, 1),
            new IdAndVersion(-2, 1),
        ])
    })

    it("should throw an error when data component id lacks version", () =>
    {
        const tiptap_text = `
            <p>${tiptap_mention_chip({ id: new IdOnly(1003), title: "variable a" })} + 2</p>`

        expect(() => browser_get_referenced_ids_from_tiptap(tiptap_text)).to.throw("Data component id in mention chip lacks version number: 1003")
    })
})
