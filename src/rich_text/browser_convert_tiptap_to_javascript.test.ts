import { expect } from "chai"

import { browser_convert_tiptap_to_javascript } from "./browser_convert_tiptap_to_javascript"


describe("browser_convert_tiptap_to_javascript", () =>
{
    const tiptap_text = `
        <p><span class="mention-chip" data-type="customMention" data-id="1003v1" data-label="Dwelling stock in England (2023)">@Dwelling stock in England (2023)</span>+2</p>`

    describe("referencing other data components", () =>
    {
        it("should convert tiptap text to javascript text", () =>
        {
            //const d1003v1 = init_data_component({ id: new IdAndVersion(1003, 1), title: "some value", result_value: "25400000" })
            const plain_text = browser_convert_tiptap_to_javascript(tiptap_text)//, {"1003v1": d1003v1})
            // expect(plain_text).equals("d1003v1 = 25400000\nd1003v1 + 2")
            expect(plain_text).equals("d1003v1+2")
        })

        it("should not convert data components references into strings that can be parsed as a float", () =>
        {
            const plain_text = browser_convert_tiptap_to_javascript(tiptap_text)//, {})
            expect(plain_text).equals(`d1003v1+2`)
            expect(parseFloat(plain_text)).deep.equals(NaN)
        })

        it("should mention that only versioned components can be referenced", () =>
        {
            const tiptap_text = `
                <p><span class="mention-chip" data-type="customMention" data-id="1003" data-label="Thing">@Thing</span>+ 2</p>`
            const plain_text = browser_convert_tiptap_to_javascript(tiptap_text)//, {})
            expect(plain_text).equals(`"referenced components must use a version but got id 1003 of Thing"+ 2`)
            expect(parseFloat(plain_text)).deep.equals(NaN)
        })

        it("should modify plain text that would otherwise be valid ids", () =>
        {
            const tiptap_text = `
                <p>d_123v2 + d123v2 + <span class="mention-chip" data-type="customMention" data-id="1003v2" data-label="Thing">@Thing</span> + d678v3</p>`
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
            const plain_text = browser_convert_tiptap_to_javascript(tiptap_text)//, {})
            expect(plain_text).equals(`upgrading_piping = 7\nheat_pump = 2\nupgrading_piping + heat_pump`)
            expect(parseFloat(plain_text)).deep.equals(NaN)
        })

        it("should handle example 2", () =>
        {
            const tiptap_text = `<p>available_people = 0.8*<span class="mention-chip" data-type="customMention" data-id="1012v1" data-label="Number of people">@Number of people</span></p><p><span class="mention-chip" data-type="customMention" data-id="1010v2" data-label="Person days">@Person days</span></p>`
            const plain_text = browser_convert_tiptap_to_javascript(tiptap_text)//, {
            //     "1012v1": init_data_component({ id: new IdAndVersion(1012, 1), result_value: "100" }),
            //     "1010v2": init_data_component({ id: new IdAndVersion(1010, 2), result_value: "200" }),
            // })
            expect(plain_text).equals(`available_people = 0.8*d1012v1\nd1010v2`)
            expect(parseFloat(plain_text)).deep.equals(NaN)
        })

        it("should handle <br>", () =>
        {
            const tiptap_text = `<p>person_days_required = <span class="mention-chip" data-type="customMention" data-id="1010v2" data-label="Person days">@Person days</span>*<span class="mention-chip" data-type="customMention" data-id="1002v5" data-label="Dwelling stock">@Dwelling stock</span><br>available_people = 0.8*<span class="mention-chip" data-type="customMention" data-id="1012v1" data-label="Number of people">@Number of people</span></p><p>person_days_required / available_people</p>`
            const plain_text = browser_convert_tiptap_to_javascript(tiptap_text)//, {
            //     "1002v5": init_data_component({ id: new IdAndVersion(1002, 5), result_value: "30e6" }),
            //     "1012v1": init_data_component({ id: new IdAndVersion(1012, 1), result_value: "100" }),
            //     "1010v2": init_data_component({ id: new IdAndVersion(1010, 2), result_value: "200" }),
            // })
            expect(plain_text).equals(`person_days_required = d1010v2*d1002v5\navailable_people = 0.8*d1012v1\nperson_days_required / available_people`)
            expect(parseFloat(plain_text)).deep.equals(NaN)
        })
    })


    describe("handling functions", () =>
    {
        const increment_function_tiptap_mention_chip = `<span class="mention-chip" data-type="customMention" data-id="1019v3" data-label="increment">@increment</span>`

        it("should wrap functions in parentheses", () =>
        {
            const tiptap_text = `<p>${increment_function_tiptap_mention_chip}(0.5)</p>`
            const plain_text = browser_convert_tiptap_to_javascript(tiptap_text)//, {
            //     "1019v3": increment_function_component,
            // })
            expect(plain_text).equals(`d1019v3(0.5)`)
        })

        it("should introduce newlines", () =>
        {
            const tiptap_text = `<p>value = 1e7/1e8<br>value2 = 2</p><p>${increment_function_tiptap_mention_chip}(value, value2)</p>`
            const plain_text = browser_convert_tiptap_to_javascript(tiptap_text)//, {
            //     "1019v3": increment_function_component,
            // })
            // Note the ";" in the "\n;" is only present for when we wrap
            // functions in parentheses AND there is a newline before them.
            expect(plain_text).equals(`value = 1e7/1e8\nvalue2 = 2\nd1019v3(value, value2)`)
        })
    })
})
