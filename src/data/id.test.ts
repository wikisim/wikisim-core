import { expect } from "chai"

import { IdAndVersion, IdOnly, parse_id } from "./id"


describe("IdOnly", () =>
{
    it("should instantiate with id and no version", () =>
    {
        let id = new IdOnly(123)
        expect(id.id).equals(123)
        expect(id).to.not.have.property("version")
    })

    it("should convert to string without version", () =>
    {
        const id = new IdOnly(123)
        expect(id.to_str()).equals("123")
    })
})


describe("IdAndVersion", () =>
{
    it("should instantiate with id and version", () =>
    {
        const id = new IdAndVersion(123, 2)
        expect(id.id).equals(123)
        expect(id.version).equals(2)
    })

    it("should convert to string with version", () =>
    {
        const id = new IdAndVersion(123, 2)
        expect(id.to_str()).equals("123v2")
    })
})


describe("parse_id", () =>
{
    it("should parse from a string without version", () =>
    {
        const id = parse_id("123")
        expect(id.id).equals(123)
        expect(id).to.be.instanceOf(IdOnly)
    })

    it("should parse from a string with version", () =>
    {
        const id = parse_id("123v2")
        expect(id.id).equals(123)
        expect(id).to.be.instanceOf(IdAndVersion)
        expect((id as IdAndVersion).version).equals(2)
    })

    it("should throw an error when parsing an invalid id", () =>
    {
        expect(() => parse_id("abc")).to.throw(`id must be a valid number but got "abc"`)
    })

    it("should throw an error when parsing an invalid version", () =>
    {
        expect(() => parse_id("123vabc")).to.throw(`version must be a valid number >= 1 but got "abc"`)
    })

    it("should return itself when IdOnly passed to parse_id function", () =>
    {
        const id = new IdOnly(123)
        const id2 = parse_id(id)
        expect(id2).equals(id)
    })

    it("should return itself when IdAndVersion passed to parse_id function", () =>
    {
        const id = new IdAndVersion(123, 2)
        const id2 = parse_id(id)
        expect(id2).equals(id)
    })

    it("should only return IdAndVersion when parse_id function given enforce_version true", () =>
    {
        const id = parse_id("123v2", true)
        expect(id).to.be.instanceOf(IdAndVersion)
    })

    it("should error when parse_id function given enforce_version true and version is missing", () =>
    {
        expect(() => parse_id("123", true)).to.throw("DataComponentId string must include version: 123")
    })
})


// @ts-expect-error: IdOnly requires only one argument
new IdOnly(123, 2)

// @ts-expect-error: IdAndVersion should not be used where IdOnly is expected
const _bad_id_2: IdOnly = new IdAndVersion(1, 2)

// @ts-expect-error: IdOnly should not be used where IdAndVersion is expected
const _bad_id_3: IdAndVersion = new IdOnly(1)
