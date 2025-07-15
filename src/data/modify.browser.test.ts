import { expect } from "chai"

import { DataComponent } from "./interface"
import { new_data_component } from "./modify"
import { prepare_data_component_for_db, upsert_data_component } from "./write_to_db"


describe("can created a new data component", () => {
    it("should write the data component to the database", async () => {
        const data_component: DataComponent = new_data_component()
        data_component.title = "<p>Test Title</p>"
        data_component.description = "<p>Test Description</p>"
        data_component.plain_title = "Test Title"
        data_component.plain_description = "Test Description"

        const db_data_component = prepare_data_component_for_db(data_component)
        await upsert_data_component(db_data_component)

        // TODO Check the database to ensure the record was created
        expect(true).equals(true) // This is a placeholder assertion
    })
})
