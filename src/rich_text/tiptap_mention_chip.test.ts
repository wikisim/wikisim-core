import { expect } from "chai"

import { tiptap_mention_chip } from "./tiptap_mention_chip"


describe("tiptap_mention_chip", () =>
{
    it("should error on <p> tag in title", () =>
    {
        const throw_function = () =>
        {
            tiptap_mention_chip({ title: "<p>Some Title</p>", id: "123" })
        }
        expect(throw_function).to.throw("ERR49. Title must not contain <p> tag")
    })
})
