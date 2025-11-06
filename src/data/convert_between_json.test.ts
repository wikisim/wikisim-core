/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect } from "chai"
import { z } from "zod"

import { tiptap_mention_chip } from "../rich_text/tiptap_mention_chip"
import { DataComponentAsJSON, NewDataComponentAsJSON } from "../supabase"
import {
    data_component_all_fields_set,
    new_data_component_all_fields_set,
} from "../test/fixtures"
import { deindent } from "../utils/deindent"
import {
    flatten_new_or_data_component_to_json,
    hydrate_data_component_from_json,
} from "./convert_between_json"
import { DataComponent, NewDataComponent } from "./interface"
import { init_data_component, init_new_data_component } from "./modify"
import { make_field_validators } from "./validate_fields"


const field_validators = make_field_validators(z)


describe("flatten_data_component_to_json and hydrate_data_component_from_json", function ()
{
    it("should flatten and hydrate a DataComponent correctly", function ()
    {
        const data_component = data_component_all_fields_set()
        // These fields are not set by client when sending to server so will be
        // empty when we hydrate back again.
        data_component.plain_title = ""
        data_component.plain_description = ""

        const hydrated: DataComponent = helper_flatten_to_json_and_hydrate(data_component).hydrated
        expect(hydrated).deep.equals(data_component)
    })

    it("should flatten and hydrate a NewDataComponent correctly", function ()
    {
        const new_data_component = new_data_component_all_fields_set()
        // These fields are not set by client when sending to server so will be
        // empty when we hydrate back again.
        new_data_component.plain_title = ""
        new_data_component.plain_description = ""

        const hydrated: NewDataComponent = helper_flatten_to_json_and_hydrate(new_data_component).hydrated
        expect(hydrated).deep.equals(new_data_component)
    })

    it("should raise an error on invalid function_arguments", function ()
    {
        const data_component = init_data_component({
            function_arguments: [
                // @ts-expect-error
                {},  // Missing key "name"
            ]
        })

        expect(() => helper_flatten_to_json_and_hydrate(data_component))
            .to.throw(/code": "invalid_type"/)
    })

    it("should raise an error on invalid scenarios", function ()
    {
        const data_component = init_data_component()
        const flattened = flatten_new_or_data_component_to_json(data_component)
        flattened.scenarios = [
            {} // Missing key "values"
        ]

        expect(() => hydrate_data_component_from_json(flattened, field_validators))
            .to.throw(/code": "invalid_type"/)
    })

    it("empty lists should return undefined", function ()
    {
        const new_data_component = new_data_component_all_fields_set()
        new_data_component.recursive_dependency_ids = []
        new_data_component.label_ids = []
        new_data_component.dimension_ids = []
        new_data_component.function_arguments = []
        new_data_component.scenarios = []

        const hydrated: NewDataComponent = helper_flatten_to_json_and_hydrate(new_data_component).hydrated
        expect(hydrated.recursive_dependency_ids).equals(undefined, "empty list of recursive_dependency_ids should flatten and hydrate to undefined")
        expect(hydrated.label_ids).equals(undefined, "empty list of label_ids should flatten and hydrate to undefined")
        expect(hydrated.dimension_ids).equals(undefined, "empty list of dimension_ids should flatten and hydrate to undefined")
        expect(hydrated.function_arguments).equals(undefined, "empty list of function_arguments should flatten and hydrate to undefined")
        expect(hydrated.scenarios).equals(undefined, "empty list of scenarios should flatten and hydrate to undefined")
    })

    it("lists should be returned successfully", function ()
    {
        const new_data_component = new_data_component_all_fields_set()

        const result = helper_flatten_to_json_and_hydrate(new_data_component)
        const hydrated: NewDataComponent = result.hydrated
        expect(hydrated.recursive_dependency_ids).deep.equals([
            {
                id: -5,
                version: 1,
            },
            {
                id: -6,
                version: 2,
            }
        ], "list of recursive_dependency_ids should flatten and hydrate")

        expect(hydrated.label_ids).deep.equals([-2, -3], "list of label_ids should flatten and hydrate")
        expect(hydrated.dimension_ids).deep.equals([
            {
                id: -1,
                version: 1,
            }
        ], "list of dimension_ids should flatten and hydrate")

        expect(result.flattened.function_arguments).deep.equals([
            {
                name: "arg1",
                default_value: "123",
            },
            {
                name: "arg2",
                default_value: "456",
            },
        ], "list of function_arguments in flattened JSON should not have local_temp_id")

        expect(hydrated.function_arguments).deep.equals([
            {
                local_temp_id: "0",
                name: "arg1",
                default_value: "123",
            },
            {
                local_temp_id: "1",
                name: "arg2",
                default_value: "456",
            },
        ], "list of function_arguments should flatten and hydrate")

        expect(result.flattened.scenarios).deep.equals([
            {
                values: {
                    arg1: { value: "789", iterate_over: true },
                    arg2: { value: "112", use_previous_result: true },
                },
            }
        ], "list of scenarios in flattened JSON should not have local_temp_id")

        expect(hydrated.scenarios).deep.equals([
            {
                local_temp_id: "0",
                values_by_temp_id: {
                    "0": { value: "789", iterate_over: true },
                    "1": { value: "112", use_previous_result: true },
                },
            }
        ], "list of scenarios should flatten and hydrate")
    })

    describe("function input_value typescript conversion to tiptap", function ()
    {
        const input_value = deindent(`
            const aBc = d12v3 // "aBc"

            return aBc + 5
        `)

        it("should convert javascript to tiptap format", function ()
        {
            const new_data_component = init_new_data_component({
                value_type: "function", input_value
            })
            const result = helper_flatten_to_json_and_hydrate(new_data_component)
            const hydrated: NewDataComponent = result.hydrated

            expect(result.flattened.input_value).equals(deindent(`
                <p>return ${tiptap_mention_chip({ title: "aBc", id: "12v3" })} + 5</p>
            `))

            expect(hydrated.input_value).equals(deindent(`
                <p>return ${tiptap_mention_chip({ title: "aBc", id: "12v3" })} + 5</p>
            `))
        })

        it("should not convert javascript to tiptap format when value_type is not function", function ()
        {
            const new_data_component = init_new_data_component({
                value_type: "number", input_value
            })
            const hydrated: NewDataComponent = helper_flatten_to_json_and_hydrate(new_data_component).hydrated

            expect(hydrated.input_value).equals(input_value)
        })
    })
})


function helper_flatten_to_json_and_hydrate(data_component: NewDataComponent): { flattened: NewDataComponentAsJSON, hydrated: NewDataComponent }
function helper_flatten_to_json_and_hydrate(data_component: DataComponent): { flattened: DataComponentAsJSON, hydrated: DataComponent }
function helper_flatten_to_json_and_hydrate(data_component: NewDataComponent | DataComponent): { flattened: NewDataComponentAsJSON | DataComponentAsJSON, hydrated: NewDataComponent | DataComponent }
{
    const flattened = flatten_new_or_data_component_to_json(data_component)
    const as_json_string = JSON.stringify(flattened) // Check it doesn't throw
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const as_json = JSON.parse(as_json_string) // Check it doesn't throw

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const hydrated: DataComponent = hydrate_data_component_from_json(as_json, field_validators)

    return { flattened, hydrated }
}
