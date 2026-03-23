// TODO merge create_mock_json_data_component_row into fixtures.ts
import { z } from "zod"

import { hydrate_data_component_from_json } from "../data/convert_between_json.ts"
import { make_field_validators } from "../data/validate_fields.ts"
import { create_mock_json_data_component_row } from "./mock_data_component_row.ts"


describe("create_mock_json_data_component_row", () =>
{
    it("works", () =>
    {
        const row = create_mock_json_data_component_row()

        const validators = make_field_validators(z)

        // This should not throw an error
        hydrate_data_component_from_json(row, validators)
    })
})
