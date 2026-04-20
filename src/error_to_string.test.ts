import { PostgrestError } from "@supabase/supabase-js"
import { config, expect } from "chai"

import { error_to_string } from "./error_to_string"


describe("error_to_string", function ()
{
    const original_truncateThreshold = config.truncateThreshold
    this.beforeAll(() =>
    {
        // Show full error diff for easier debugging of test failures
        config.truncateThreshold = 0
    })

    this.afterAll(() =>
    {
        config.truncateThreshold = original_truncateThreshold
    })


    it("should return the string itself if the input is a string", () =>
    {
        expect(error_to_string("This is an error")).equals("This is an error")
    })

    it("should return a string representation of an Error object", () =>
    {
        const error = new Error("This is an error")
        const result = error_to_string(error)
        expect(result).contains("Message: This is an error, Stack:")
    })

    it("should return a string representation of a PostgrestError object", () =>
    {
        const postgrestError = new PostgrestError({
            code: "123",
            message: "This is a Postgrest error",
            details: "Some details",
            hint: "Some hint",
        })
        const result = error_to_string(postgrestError)
        expect(result).contains("PostgrestError 123 - PostgrestError, message: This is a Postgrest error, details: Some details, hint: Some hint, stack: PostgrestError: This is a Postgrest error\n    at Context.<anonymous> ")
    })

    it("should return a useful string representation of an subclass of an Error object", () =>
    {
        class SubClassedError extends Error
        {
            constructor(message: string)
            {
                super(message)
                this.name = "SubClassedError"
            }
        }

        const error1 = new SubClassedError("This is an error")
        const result1 = error_to_string(error1)
        expect(result1).contains(`Message: This is an error, JSON: {"name":"SubClassedError"}, Stack: SubClassedError: This is an error\n    at Context.<anonymous> `)


        class AuthError extends Error
        {
            status: string | undefined
            code: number | undefined

            __isAuthError = true

            constructor(message: string, status?: string, code?: number) {
                super(message)
                this.name = 'AuthError'
                this.status = status
                this.code = code
            }
        }

        const error2 = new AuthError("This is an auth error", "401", 1001)
        const result2 = error_to_string(error2)
        expect(result2).contains(`Message: This is an auth error, JSON: {"status":"401","code":1001,"__isAuthError":true,"name":"AuthError"}, Stack: AuthError: This is an auth error\n    at Context.<anonymous>`)
    })
})
