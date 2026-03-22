import { expect } from "chai"
import { IdAndVersion } from "../data/id"
import { tiptap_mention_chip } from "./tiptap_mention_chip"
import { update_referenced_ids } from "./update_references"


describe("update_referenced_ids", () =>
{
    it("should convert tiptap to typescript, update ids, and return tiptap", () =>
    {
        const input_value = `<p>${tiptap_mention_chip("2v1")} + ${tiptap_mention_chip("4v2")}</p>`
        const expected_output = `<p>${tiptap_mention_chip("2v3")} + ${tiptap_mention_chip("4v2")}</p>`

        const result = update_referenced_ids(
            input_value,
            (id: IdAndVersion) =>
            {
                const data: Record<string, IdAndVersion> = { "2": IdAndVersion.from_str("2v3") }

                return data[id.to_str_without_version()]
            },
        )

        expect(result).to.equal(expected_output)
    })
})
