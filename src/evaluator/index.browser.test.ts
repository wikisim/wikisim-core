import { expect } from "chai"

import { IdAndVersion } from "../data/id"
import { init_data_component } from "../data/modify"
import {
    browser_convert_tiptap_to_javascript,
} from "../rich_text/browser_convert_tiptap_to_javascript"
import { tiptap_mention_chip } from "../test/fixtures"
import {
    evaluate_code_in_browser_sandbox,
    setup_sandboxed_iframe,
} from "./browser_sandboxed_javascript"
import { calculate_result_value } from "./index"


describe("calculate_result_value", function ()
{
    this.timeout(500)

    setup_sandboxed_iframe()

    it("can calculate a non-function value", async function ()
    {
        const a_number = init_data_component({
            id: new IdAndVersion(-3, 1),
            value_type: "number",
            input_value: `<p>2</p>`,
            result_value: `2`,
        })
        const data_component_by_id_and_version = {
            [a_number.id.to_str()]: a_number,
        }

        const input_value = `<p>42 + ${tiptap_mention_chip(a_number)}</p>`
        const component = init_data_component({
            value_type: "number",
            input_value,
            recursive_dependency_ids: [a_number.id],
        })

        let i = 0
        while(i < 2)
        {
            i++
            const response = await calculate_result_value({
                component,
                data_component_by_id_and_version,
                convert_tiptap_to_javascript: browser_convert_tiptap_to_javascript,
                evaluate_code_in_sandbox: evaluate_code_in_browser_sandbox,
                timeout_ms: 5000,
            })

            if (!response || response.error) expect.fail(`Run ${i} ${response?.error || "Failed to calculate_result_value for non-function value"}`)

            expect(response.result).to.equal("44", `Run ${i} should calculate 42 + 2`)
        }
    })
})
