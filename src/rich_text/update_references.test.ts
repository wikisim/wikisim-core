import { expect } from "chai"

import { IdAndVersion } from "../data/id"
import { DataComponent } from "../data/interface"
import { init_data_component } from "../data/modify"
import { tiptap_mention_chip } from "./tiptap_mention_chip"
import { update_references } from "./update_references"


describe("update_references", () =>
{
    it("should handle updating id and title in tiptap text", () =>
    {
        const input_value = `<p>${tiptap_mention_chip({ title: "old title", id: "2v1" })} + ${tiptap_mention_chip("4v2")}</p>`
        const expected_new_title = `New title referencing Component ABC another component`
        const expected_output = `<p>${tiptap_mention_chip({ title: expected_new_title, id: "2v3" })} + ${tiptap_mention_chip("4v2")}</p>`

        const result = update_references(
            input_value,
            (id: IdAndVersion) =>
            {
                const data: Record<string, DataComponent> = {
                    "2": init_data_component({
                        id: "2v3",
                        title: `New title referencing ${tiptap_mention_chip({ id: "4v2", title: "Component ABC" })} another component`,
                        plain_title: `New title referencing Component ABC another component`,
                    }),
                }

                return data[id.to_str_without_version()]
            },
        )

        expect(result).to.equal(expected_output)
    })
})
