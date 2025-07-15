import { expect } from "chai"

import { IdAndMaybeVersion } from "./id"


describe("DataComponentId", () =>
{
    it("should instantiate with id and version", () =>
    {
        const id = new IdAndMaybeVersion(123, 2)
        expect(id.id).equals(123)
        expect(id.version).equals(2)
    })

    it("should instantiate with id and no version", () =>
    {
        let id = new IdAndMaybeVersion(123, null)
        expect(id.id).equals(123)
        expect(id.version).equals(null)
    })


    it("should parse from a string with version", () =>
    {
        const id = IdAndMaybeVersion.from_str("123v2")
        expect(id.id).equals(123)
        expect(id.version).equals(2)
    })

    it("should parse from a string without version", () =>
    {
        const id = IdAndMaybeVersion.from_str("123")
        expect(id.id).equals(123)
        expect(id.version).equals(null)
    })

    it("should throw an error when parsing an invalid id", () =>
    {
        expect(() => IdAndMaybeVersion.from_str("abc")).to.throw("Invalid id in DataComponentId string: abc")
    })

    it("should throw an error when parsing an invalid version", () =>
    {
        expect(() => IdAndMaybeVersion.from_str("123vabc")).to.throw("Invalid version in DataComponentId string: 123vabc")
    })

    it("should return itself when DataComponentIdMaybeVersion passed to from_str function", () =>
    {
        const id = new IdAndMaybeVersion(123, 2)
        const id2 = IdAndMaybeVersion.from_str(id)
        expect(id2).equals(id)
    })


    it("should convert to string with version", () =>
    {
        const id = new IdAndMaybeVersion(123, 2)
        expect(id.to_str()).equals("123v2")
    })

    it("should not error when converting to string without version", () =>
    {
        const id = new IdAndMaybeVersion(123, null)
        expect(id.to_str()).equals("123")
    })
})
