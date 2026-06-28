import { expect } from "chai"

import { deep_copy } from "./deep_copy"


describe("deep_copy", () =>
{
    it("handles null", () =>
    {
        const b = deep_copy(null)
        expect(b).equals(null)
    })

    it("copies nested objects", () =>
    {
        const a = { nested: { val: 1 } }
        const b = deep_copy(a)
        expect(b).not.equals(a)
        expect(b).deep.equals(a)
    })

    it("prevent self recursion", () =>
    {
        const a = { val: 1 }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        a.self = a

        const b = deep_copy(a)
        expect(b).not.equals(a)
        expect(b).deep.equals(a)
    })

    it("handles objects with read-only properties", () =>
    {
        const a = {} as { read_only_val: number }
        Object.defineProperty(a, "read_only_val", {
            value: 42,
            writable: false,
            enumerable: true,
            configurable: true
        })

        const b = deep_copy(a)
        b.read_only_val = 2
        expect(b.read_only_val).equals(2)
    })
})
