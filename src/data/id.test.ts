import { expect } from "chai"

import { DataComponentIdMaybeVersion } from "./id"


describe("DataComponentId", () =>
{
    it("should instantiate with id and version", () =>
    {
        const id = new DataComponentIdMaybeVersion(123, 2)
        expect(id.id).equals(123)
        expect(id.version).equals(2)
    })

    it("should instantiate with id and no version", () =>
    {
        let id = new DataComponentIdMaybeVersion(123)
        expect(id.id).equals(123)
        expect(id.version).equals(undefined)

        id = new DataComponentIdMaybeVersion(123, undefined)
        expect(id.id).equals(123)
        expect(id.version).equals(undefined)
    })


    it("should parse from a string with version", () =>
    {
        const id = DataComponentIdMaybeVersion.from_str("123v2")
        expect(id.id).equals(123)
        expect(id.version).equals(2)
    })

    it("should parse from a string without version", () =>
    {
        const id = DataComponentIdMaybeVersion.from_str("123")
        expect(id.id).equals(123)
        expect(id.version).equals(undefined)
    })

    it("should throw an error when parsing an invalid id", () =>
    {
        expect(() => DataComponentIdMaybeVersion.from_str("abc")).to.throw("Invalid id in DataComponentId string: abc")
    })

    it("should throw an error when parsing an invalid version", () =>
    {
        expect(() => DataComponentIdMaybeVersion.from_str("123vabc")).to.throw("Invalid version in DataComponentId string: 123vabc")
    })

    it("should return itself when DataComponentIdMaybeVersion passed to from_str function", () =>
    {
        const id = new DataComponentIdMaybeVersion(123, 2)
        const id2 = DataComponentIdMaybeVersion.from_str(id)
        expect(id2).equals(id)
    })


    it("should convert to string with version", () =>
    {
        const id = new DataComponentIdMaybeVersion(123, 2)
        expect(id.to_str()).equals("123v2")
    })

    it("should throw error when converting to string without version", () =>
    {
        const id = new DataComponentIdMaybeVersion(123)
        expect(() => id.to_str()).to.throw("Version is not defined for DataComponentId \"123\"")
    })
})
