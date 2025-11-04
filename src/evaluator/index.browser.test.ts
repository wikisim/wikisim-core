import { expect } from "chai"

import { IdAndVersion } from "../data/id"
import { init_data_component } from "../data/modify"
import {
    browser_convert_tiptap_to_javascript,
} from "../rich_text/browser_convert_tiptap_to_javascript"
import { tiptap_mention_chip } from "../rich_text/tiptap_mention_chip"
import {
    evaluate_code_in_browser_sandbox,
    setup_sandboxed_iframe,
} from "./browser_sandboxed_javascript"
import { calculate_result_value } from "./index"


describe(`calculate_result_value`, function ()
{
    // Enabling this timeout previously (2025-10-01) caused Firefox to insist on
    // pausing and claiming the subsequent line was a breakpoint but not as of 2025-11-04
    const timeout = 500
    this.timeout(timeout)


    let clean_up: () => void
    before(() =>
    {
        clean_up = setup_sandboxed_iframe({ logging: true }).clean_up
    })

    after(() =>
    {
        clean_up()
    })


    const a_number = init_data_component({
        id: new IdAndVersion(-3, 1),
        value_type: "number",
        // input_value: `<p>2</p>`,
        result_value: `2`,
    })
    const data_components_by_id_and_version = {
        [a_number.id.to_str()]: a_number,
    }

    // TODO remove the `span` tag for tiptap_mention_chip when
    // existing content has been updated to use `a` tags for
    // mention chips
    const tags = ["span", "a"] as const
    tags.forEach(tag =>
    {
        it(`can calculate a non-function value when tiptap is "${tag}" HTML tag`, async function ()
        {
            const input_value = `<p>42 + ${tiptap_mention_chip(a_number, tag)}</p>`
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
                    data_components_by_id_and_version,
                    convert_tiptap_to_javascript: browser_convert_tiptap_to_javascript,
                    evaluate_code_in_sandbox: evaluate_code_in_browser_sandbox,
                    timeout_ms: timeout / 2,
                    debugging: false,
                })

                if (!response || response.error) expect.fail(`Run ${i} ${response?.error || "Failed to calculate_result_value for non-function value"}`)

                expect(response.result).to.equal("44", `Run ${i} should calculate 42 + 2`)
            }
        })
    })
})
