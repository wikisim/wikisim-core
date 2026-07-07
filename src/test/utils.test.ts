import { expect } from "chai"

import { deep_approximate } from "./utils"


describe("deep_approximate", () =>
{
    it("should return true for equal or approx equal numbers", () =>
    {
        deep_approximate(1, 1)
        deep_approximate(1, 1 + 1e-7)
    })

    it("should return false for unequal numbers", () =>
    {
        expect(() => deep_approximate(1, 2)).to.throw()
    })

    it("should return true for equal and approx arrays", () =>
    {
        deep_approximate([1, 2], [1, 2])
        deep_approximate([1, 2 + 1e-7], [1, 2])
    })

    it("should return false for unequal arrays", () =>
    {
        expect(() => deep_approximate([1, 2], [1, 3])).to.throw()
    })

    it("should return true for equal and approx objects", () =>
    {
        deep_approximate({ a: 1, b: 2 }, { a: 1, b: 2 })
        deep_approximate({ a: 1, b: 2 + 1e-7 }, { a: 1, b: 2 })
    })

    it("should return false for unequal objects", () =>
    {
        expect(() => deep_approximate({ a: 1, b: 2 }, { a: 1, b: 3 })).to.throw()
    })

    it("should return false for objects with different keys", () =>
    {
        expect(() => deep_approximate({ a: 1, b: 2 }, { a: 1, c: 2 })).to.throw()
    })
})
