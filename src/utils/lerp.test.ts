import { expect } from "chai"

import { inverse_lerp, lerp } from "./lerp"


describe("lerp", () =>
{
    it("interpolates between two numbers", () =>
    {
        const result = lerp(10, 20, 0.5)
        expect(result).to.equal(15)
    })

    it("clamps t to 0 and 1", () =>
    {
        const result1 = lerp(10, 20, -0.5)
        expect(result1).to.equal(10)
        const result2 = lerp(10, 20, 1.5)
        expect(result2).to.equal(20)
    })
})


describe("inverse_lerp", () =>
{
    it("calculates the interpolation factor", () =>
    {
        const result = inverse_lerp(0, 100, 25)
        expect(result).to.equal(0.25)
    })

    it("clamps the result between 0 and 1", () =>
    {
        const result1 = inverse_lerp(0, 100, -10)
        expect(result1).to.equal(0)
        const result2 = inverse_lerp(0, 100, 150)
        expect(result2).to.equal(1)
    })

    it("returns 0 when min and max are equal", () =>
    {
        const result = inverse_lerp(50, 50, 50)
        expect(result).to.equal(0)
    })
})
