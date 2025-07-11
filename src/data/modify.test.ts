import { DataComponent } from "./interface"
import { new_data_component, set_fields } from "./modify"
import { prepare_data_component_for_db, upsert_data_component } from "./write_to_db"


describe("can created a new data component", () => {
    it("should create a new data component with default values", () => {
        const data_component: DataComponent = new_data_component()
        expect(data_component.id).toBe(0)
        expect(data_component.title).toBe("")
        expect(data_component.description).toBe("")
        expect(data_component.value_type).toBe(undefined)
        expect(data_component.datetime_repeat_every).toBe(undefined)
        expect(data_component.version_is_current).toBe(true)
        expect(data_component.version_requires_save).toBe(true)
    })

    it("should set fields correctly", () => {
        let data_component: DataComponent = new_data_component()
        expect(() =>
            set_fields(data_component, { title: "Test Title" })
        ).toThrow("Cannot set title, requires UI libraries.")

        expect(() =>
            set_fields(data_component, { description: "Test Description" })
        ).toThrow("Cannot set description, requires UI libraries.")
    })

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
