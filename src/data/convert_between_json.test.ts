/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect } from "chai"
import { z } from "zod"

import {
    data_component_all_fields_set,
    new_data_component_all_fields_set,
} from "../test/fixtures"
import {
    flatten_new_or_data_component_to_json,
    hydrate_data_component_from_json,
} from "./convert_between_json"
import { DataComponent, NewDataComponent } from "./interface"
import { init_data_component } from "./modify"
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

        const hydrated: DataComponent = helper_flatten_to_json_and_hydrate(data_component)
        expect(hydrated).deep.equals(data_component)
    })

    it("should flatten and hydrate a NewDataComponent correctly", function ()
    {
        const new_data_component = new_data_component_all_fields_set()
        // These fields are not set by client when sending to server so will be
        // empty when we hydrate back again.
        new_data_component.plain_title = ""
        new_data_component.plain_description = ""

        const hydrated: NewDataComponent = helper_flatten_to_json_and_hydrate(new_data_component)
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
        const data_component = init_data_component({
            scenarios: [
                // @ts-expect-error
                {},  // Missing key "values"
            ]
        })

        expect(() => helper_flatten_to_json_and_hydrate(data_component))
            .to.throw(/code": "invalid_type"/)
    })
})


function helper_flatten_to_json_and_hydrate(data_component: NewDataComponent): NewDataComponent
function helper_flatten_to_json_and_hydrate(data_component: DataComponent): DataComponent
function helper_flatten_to_json_and_hydrate(data_component: NewDataComponent | DataComponent): NewDataComponent | DataComponent
{
    const flattened = flatten_new_or_data_component_to_json(data_component)
    const as_json_string = JSON.stringify(flattened) // Check it doesn't throw
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const as_json = JSON.parse(as_json_string) // Check it doesn't throw

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const hydrated: DataComponent = hydrate_data_component_from_json(as_json, field_validators)

    return hydrated
}
