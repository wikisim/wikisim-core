/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { expect } from "chai"

import { deep_freeze, deep_freeze_str } from "./deep_freeze"


describe("deep_freeze", () =>
{
    run_tests(deep_freeze)
})

describe("deep_freeze_str", () =>
{
    const deep_freeze_func = <T>(obj: T): T => eval(deep_freeze_str + ` deep_freeze(${JSON.stringify(obj)})`) as T
    run_tests(deep_freeze_func)
})


function run_tests(deep_freeze_func: <T>(obj: T) => T)
{
    it("should freeze a simple object", () =>
    {
        const obj = { a: 1, b: 2 }
        const frozen_obj = deep_freeze_func(obj)
        expect(Object.isFrozen(frozen_obj)).equals(true)
        expect(() => { (frozen_obj as any).a = 3 }).throws("")
    })

    it("should freeze nested objects", () =>
    {
        const obj = { a: 1, b: { c: 2, d: { e: 3 } } }
        const frozen_obj = deep_freeze_func(obj)
        expect(Object.isFrozen(frozen_obj)).equals(true)
        expect(Object.isFrozen(frozen_obj.b)).equals(true)
        expect(Object.isFrozen(frozen_obj.b.d)).equals(true)
        expect(() => { (frozen_obj.b as any).c = 4 }).throws("")
        expect(() => { (frozen_obj.b.d as any).e = 5 }).throws("")
    })

    it("should handle arrays", () =>
    {
        const arr = [1, 2, { a: 3 }]
        const frozenArr = deep_freeze_func(arr)
        expect(Object.isFrozen(frozenArr)).equals(true)
        expect(Object.isFrozen(frozenArr[2])).equals(true)
        expect(() => { (frozenArr as any)[0] = 4 }).throws("")
        expect(() => { (frozenArr[2] as any).a = 5 }).throws("")
    })

    it("should return non-object values as is", () =>
    {
        expect(deep_freeze_func(42)).equals(42)
        expect(deep_freeze_func("hello")).equals("hello")
        expect(deep_freeze_func(null)).equals(null)
        expect(deep_freeze_func(undefined)).equals(undefined)
    })

    it("should deep freeze already partially frozen objects", () =>
    {
        const obj = Object.freeze({ a: 1, b: Object.freeze({ c: { d: 3 } }) })
        expect(Object.isFrozen(obj.b.c)).equals(false) // Nested object was not frozen
        const frozen_obj = deep_freeze_func(obj)
        // expect(frozen_obj).equals(obj) // Should return the same reference
        expect(Object.isFrozen(frozen_obj.b.c)).equals(true) // Nested object should now be frozen
    })
}
