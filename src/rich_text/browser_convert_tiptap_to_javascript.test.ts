import { expect } from "chai"

import { tiptap_mention_chip } from "../test/fixtures"
import { browser_convert_tiptap_to_javascript } from "./browser_convert_tiptap_to_javascript"


describe("browser_convert_tiptap_to_javascript", () =>
{
    // TODO remove the `span` tag for tiptap_mention_chip when
    // existing content has been updated to use `a` tags for
    // mention chips
    const tags = ["span", "a"] as const

    tags.forEach(tag =>
    {
        const tiptap_text = `
        <p>${tiptap_mention_chip("1003v1", tag)}+2</p>`

        describe(`referencing other data components with tiptap "${tag}" HTML tag mention chip`, () =>
        {
            it("should convert tiptap text to javascript text", () =>
            {
                const plain_text = browser_convert_tiptap_to_javascript(tiptap_text)
                expect(plain_text).equals("d1003v1+2")
            })

            it("should not convert data components references into strings that can be parsed as a float", () =>
            {
                const plain_text = browser_convert_tiptap_to_javascript(tiptap_text)
                expect(plain_text).equals(`d1003v1+2`)
                expect(parseFloat(plain_text)).deep.equals(NaN)
            })

            it("should mention that only versioned components can be referenced", () =>
            {
                const tiptap_text = `
                    <p>${tiptap_mention_chip("1003", tag)}+ 2</p>`
                const plain_text = browser_convert_tiptap_to_javascript(tiptap_text)
                expect(plain_text).equals(`"referenced components must use a version but got id 1003 for Some title for 1003"+ 2`)
                expect(parseFloat(plain_text)).deep.equals(NaN)
            })

            it("should modify plain text that would otherwise be valid ids", () =>
            {
                const tiptap_text = `
                    <p>d_123v2 + d123v2 + ${tiptap_mention_chip("1003v2", tag)} + d678v3</p>`
                const plain_text = browser_convert_tiptap_to_javascript(tiptap_text)
                expect(plain_text).equals("_d123v2 + _d123v2 + d1003v2 + _d678v3")
                expect(parseFloat(plain_text)).deep.equals(NaN)
            })
        })


        describe("handling multiline", () =>
        {
            it("should handle example 1", () =>
            {
                const tiptap_text = `<p>upgrading_piping = 7</p><p>heat_pump = 2</p><p>upgrading_piping + heat_pump</p>`
                const plain_text = browser_convert_tiptap_to_javascript(tiptap_text)
                expect(plain_text).equals(`upgrading_piping = 7\nheat_pump = 2\nupgrading_piping + heat_pump`)
                expect(parseFloat(plain_text)).deep.equals(NaN)
            })

            it("should handle example 2", () =>
            {
                const tiptap_text = `<p>available_people = 0.8*${tiptap_mention_chip("1012v1", tag)}</p><p>${tiptap_mention_chip("1010v2", tag)}</p>`
                const plain_text = browser_convert_tiptap_to_javascript(tiptap_text)
                expect(plain_text).equals(`available_people = 0.8*d1012v1\nd1010v2`)
                expect(parseFloat(plain_text)).deep.equals(NaN)
            })

            it("should handle <br>", () =>
            {
                const tiptap_text = `<p>person_days_required = ${tiptap_mention_chip("1010v2", tag)}*${tiptap_mention_chip("1002v5", tag)}<br>available_people = 0.8*${tiptap_mention_chip("1012v1", tag)}</p><p>person_days_required / available_people</p>`
                const plain_text = browser_convert_tiptap_to_javascript(tiptap_text)
                expect(plain_text).equals(`person_days_required = d1010v2*d1002v5\navailable_people = 0.8*d1012v1\nperson_days_required / available_people`)
                expect(parseFloat(plain_text)).deep.equals(NaN)
            })
        })


        describe("handling functions", () =>
        {
            const increment_function_tiptap_mention_chip = `${tiptap_mention_chip("1019v3", tag)}`

            it("should wrap functions in parentheses", () =>
            {
                const tiptap_text = `<p>${increment_function_tiptap_mention_chip}(0.5)</p>`
                const plain_text = browser_convert_tiptap_to_javascript(tiptap_text)
                expect(plain_text).equals(`d1019v3(0.5)`)
            })

            it("should introduce newlines", () =>
            {
                const tiptap_text = `<p>value = 1e7/1e8<br>value2 = 2</p><p>${increment_function_tiptap_mention_chip}(value, value2)</p>`
                const plain_text = browser_convert_tiptap_to_javascript(tiptap_text)
                // Note the ";" in the "\n;" is only present for when we wrap
                // functions in parentheses AND there is a newline before them.
                expect(plain_text).equals(`value = 1e7/1e8\nvalue2 = 2\nd1019v3(value, value2)`)
            })
        })


        describe("replacing any text that matches variable names for dependencies", () =>
        {
            it("should replace d123v4 with _d123v4", () =>
            {
                const tiptap_text = `<p>a = 1 + d123v4</p>`
                const plain_text = browser_convert_tiptap_to_javascript(tiptap_text)
                expect(plain_text).equals(`a = 1 + _d123v4`, "variable names for dependencies should be replaced to avoid confusion")
            })
        })
    })
})
