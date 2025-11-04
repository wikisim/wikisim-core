import { expect } from "chai"

import { DataComponentsById, FunctionArgument } from "../data/interface"
import { init_data_component } from "../data/modify"
import { deindent } from "../utils/deindent"
import {
    get_global_js_lines,
    upsert_js_component_const
} from "./get_global_js_lines"


describe("get_global_js_lines", () =>
{
    it("generates correct JS lines for components and function arguments", () =>
    {
        const components: DataComponentsById = {
            "12v3": init_data_component({
                id: "12v3",
                title: "Some normal title",
                plain_title: "Some normal title",
                plain_description: "Component 12 description",
            }),
            "45v6": init_data_component({
                id: "45v6",
                title: "  $u%6_(Some StRaNgE t-i-t-l-e)",
                plain_title: "  $u%6_(Some StRaNgE t-i-t-l-e)",
                plain_description: "Component 45 */ description",
            }),
        }

        const function_args: FunctionArgument[] = [
            { name: "arg1", local_temp_id: "0" },
            { name: "arg2", local_temp_id: "1" }
        ]

        const js_lines = get_global_js_lines(components, function_args, true).join("\n")

        // Check that component declarations are included
        expect(js_lines).equals(deindent(`
            /**
             * Some normal title
             *
             * Component 12 description
             *
             * https://wikisim.org/wiki/12v3
             */
            declare const d12v3: any;
            /**
             * $u%6_(Some StRaNgE t-i-t-l-e)
             *
             * Component 45 * / description
             *
             * https://wikisim.org/wiki/45v6
             */
            declare const d45v6: any;
            /**
             * Component 12 description
             *
             * https://wikisim.org/wiki/12v3
             */
            declare const Some_normal_title: any; // 12v3
            /**
             * Component 45 * / description
             *
             * https://wikisim.org/wiki/45v6
             */
            declare const u_6_Some_StRaNgE_t_i_t_l_e: any; // 45v6
            // function args for auto-complete
            declare const arg1: any;
            declare const arg2: any;
        `))
    })
})


describe("upsert_js_component_const", () =>
{
    it("generates correct JS reference lines for components", () =>
    {
        const component = init_data_component({
            id: "12v3",
            title: "Some normal title",
            plain_description: "Component 12 description",
        })

        const initial_code = deindent(`
        Some_normal_title + 123 + Some_normal_title(456)
        `)

        const code = upsert_js_component_const(component, initial_code)
        expect(code).equals(deindent(`
            const Some_normal_title = d12v3 // "Some normal title"
            Some_normal_title + 123 + Some_normal_title(456)
        `))

        const code2 = upsert_js_component_const(component, code)
        expect(code2).equals(deindent(`
            const Some_normal_title = d12v3 // "Some normal title"
            Some_normal_title + 123 + Some_normal_title(456)
        `))
    })
})
