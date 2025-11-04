import { expect } from "chai"

import { parse_id } from "../data/id"
import { init_data_component } from "../data/modify"
import { ERRORS } from "../errors"
import { tiptap_mention_chip } from "../rich_text/tiptap_mention_chip"
import { evaluate_code_in_browser_sandbox, setup_sandboxed_iframe } from "./browser_sandboxed_javascript"
import { load_dependencies_into_sandbox } from "./load_dependencies_into_sandbox"


describe("load_dependencies_into_sandbox", () =>
{
    let clean_up: () => void
    before(() =>
    {
        clean_up = setup_sandboxed_iframe({ logging: false }).clean_up
    })

    after(() =>
    {
        clean_up()
    })


    it("loads dependencies and evaluates them in the sandbox", async () =>
    {
        const component1 = init_data_component({
            id: parse_id("-1v1", true),
            value_type: "number",
            input_value: "111",
            // This should be value used in the sandbox not 111
            result_value: "222",
        })

        const component2 = init_data_component({
            id: parse_id("-2v1", true),
            value_type: "number",
            input_value: `2 + ${tiptap_mention_chip("-1v1")}`,
            // This should be value used in the sandbox not 123
            result_value: "456",
            recursive_dependency_ids: [component1.id],
        })

        const result = await load_dependencies_into_sandbox({
            component: component2,
            data_components_by_id_and_version: {
                [component1.id.to_str()]: component1,
            },
            evaluate_code_in_sandbox: evaluate_code_in_browser_sandbox,
        })

        expect(result.error).equals(null)
        expect(result.result).equals('"loaded_dependencies"')
    })


    it("errors when missing a dependency", async () =>
    {
        const component2 = init_data_component({
            id: parse_id("-2v1", true),
            value_type: "number",
            input_value: `2 + ${tiptap_mention_chip("-1v1")}`,
            // This should be value used in the sandbox not 123
            result_value: "456",
            recursive_dependency_ids: [parse_id("-1v1", true)],
        })

        const result = await load_dependencies_into_sandbox({
            component: component2,
            data_components_by_id_and_version: {},
            evaluate_code_in_sandbox: evaluate_code_in_browser_sandbox,
        })

        expect(result.error).equals(ERRORS.ERR39.message + ` Expected 1 dependencies but got 0`)
        expect(result.result).equals(null)
    })
})
