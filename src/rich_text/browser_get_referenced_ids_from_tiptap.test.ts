import { expect } from "chai"

import { IdAndVersion, IdOnly } from "../data/id"
import { tiptap_mention_chip } from "../rich_text/tiptap_mention_chip"
import {
    browser_get_referenced_ids_from_tiptap,
} from "./browser_get_referenced_ids_from_tiptap"


describe("browser_get_referenced_ids_from_tiptap", () =>
{
    // TODO remove the `span` tag for tiptap_mention_chip when
    // existing content has been updated to use `a` tags for
    // mention chips
    const tags = ["span", "a"] as const

    tags.forEach(tag =>
    {
        it(`should get data component ids from tiptap text with "${tag}" HTML tag`, () =>
        {
            const d1003v1 = tiptap_mention_chip({ id: new IdAndVersion(1003, 1), title: "variable a" }, tag)
            const tiptap_text = `
                <p>
                    ${d1003v1}
                    + ${d1003v1} // test deduplication
                    + ${tiptap_mention_chip({ id: new IdAndVersion(-2, 1), title: "variable b" }, tag)}
                    + 2
                </p>`

            const ids = browser_get_referenced_ids_from_tiptap(tiptap_text)
            expect(ids).deep.equals([
                new IdAndVersion(1003, 1),
                new IdAndVersion(-2, 1),
            ])
        })

        it(`should throw an error when data component id lacks version with "${tag}" HTML tag`, () =>
        {
            const tiptap_text = `
                <p>${tiptap_mention_chip({ id: new IdOnly(1003), title: "variable a" }, tag)} + 2</p>`

            expect(() => browser_get_referenced_ids_from_tiptap(tiptap_text)).to.throw("ERR34. Data component id in mention chip lacks version number: 1003")
        })
    })
})
