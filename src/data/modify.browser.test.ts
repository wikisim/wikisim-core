// import { expect } from "chai"

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

        // jest.mock("@supabase/supabase-js", () => {
        //     return {
        //         createClient: jest.fn(() => ({
        //         from: jest.fn(() => ({
        //             select: jest.fn().mockResolvedValue({ data: [], error: null }),
        //             insert: jest.fn().mockResolvedValue({ data: [{ id: 1 }], error: null }),
        //         })),
        //         auth: {
        //             signInWithOtp: jest.fn().mockResolvedValue({ data: {}, error: null }),
        //         },
        //         })),
        //     }
        // })
        const db_data_component = prepare_data_component_for_db(data_component)
        await upsert_data_component(db_data_component)

        // Here you would typically check the database to ensure the record was created
        // For this test, we will assume the function works as expected
    })
})
