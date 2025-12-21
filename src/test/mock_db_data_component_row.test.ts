// TODO merge create_mock_db_data_component_row into fixtures.ts
import { z } from "zod"

import { hydrate_data_component_from_json } from "../data/convert_between_json"
import { make_field_validators } from "../data/validate_fields"
import { create_mock_db_data_component_row } from "./mock_db_data_component_row"


describe("create_mock_db_data_component_row", () =>
{
    it("works", () =>
    {
        const row = create_mock_db_data_component_row()

        const validators = make_field_validators(z)

        // This should not throw an error
        hydrate_data_component_from_json(row, validators)
    })
})
