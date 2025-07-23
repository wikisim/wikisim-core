/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from "chai"

import { get_supabase } from "../supabase"
import { deep_equals } from "../utils/deep_equals"
import {
    request_archived_data_components,
    request_data_component_history,
    request_data_components,
    RequestDataComponentsReturn,
    search_data_components
} from "./fetch_from_db"
import { IdAndVersion, IdOnly } from "./id"
import { DataComponent } from "./interface"
import { init_data_component } from "./modify"
import { insert_data_component, update_data_component, UpsertDataComponentResponse } from "./write_to_db"


type TABLE_NAME = "data_components_archive" | "data_components"

describe("can init a data component", () =>
{
    const data_component_fixture: DataComponent = Object.freeze(init_data_component())


    after(async () =>
    {
        // Clean up test data after all tests have run
        await delete_test_data_in_db("data_components_archive")
        await delete_test_data_in_db("data_components")
    })

    let user_id: string
    it("should be logged in", async () =>
    {
        const { data: { user }, error } = await get_supabase().auth.getUser()
        if (error || !user) {
            expect.fail("User is not logged in.  Please log in to run this test.")
        } else {
            expect(user).to.have.property("id")
            user_id = user.id
        }
    })


    it("should not have any test data components in the database", async () =>
    {
        const supabase = get_supabase()

        const table_names: TABLE_NAME[] = ["data_components_archive", "data_components"]
        let rows_found = 0
        for (const table_name of table_names)
        {
            const response = await supabase.from(table_name)
                .select("*")
                .lte("id", -1) // Test data components have id < 0

            if (response.error)
            {
                expect.fail(`Failed to query for test rows in "${table_name}": ${response.error.message}`)
            }

            if (response.data.length > 0)
            {
                console .warn(`Deleting test rows from "${table_name}": `, response.data)
                await delete_test_data_in_db(table_name, response.data.length)
            }

            rows_found += response.data.length
        }

        expect(rows_found).equals(0, `There are ${rows_found} test data components in the database, they should have been deleted immediately after being created.`)
    })


    it("should disallowed inserting new data component when user different to that of user logged in", async function ()
    {
        const data_component = {
            ...data_component_fixture,
            // AJPtest2 user id:
            editor_id: "c3b9d96b-dc5c-4f5f-9698-32eaf601b7f2",
            test_run_id: data_component_fixture.test_run_id + ` - ${this.test?.title}`,
        }

        const response = await insert_data_component(get_supabase, data_component)
        if (response.data)
        {
            expect.fail(`Should have failed to insert data component with editor_id who is not logged in, but got response: ${JSON.stringify(response)}`)
        }
        expect(response.error).to.have.property("message").that.equals("ERR04. editor_id must match your user id" )
    })


    it("should ignore version_number when inserting new data component", async function ()
    {
        this.timeout(3000)

        const id = new IdAndVersion(data_component_fixture.id.id, 1) // Version 0 is not allowed in constructor
        id.version = 0 // Explicitly set to 0 for this test
        const data_component: DataComponent = {
            ...data_component_fixture,
            editor_id: user_id,
            id,
            test_run_id: data_component_fixture.test_run_id + ` - ${this.test?.title}`,
        }

        const response = await insert_data_component(get_supabase, data_component)
        if (response.error)
        {
            expect.fail(`Should not have failed to insert data component when version 0 as it should have been ignored, but got response: ${JSON.stringify(response)}`)
        }
        deep_equals(response.data, {
            ...data_component,
            id: new IdAndVersion(data_component.id.id, 1), // Version should be set to 1 by the DB
            comment: undefined,
            version_type: undefined,
            version_rolled_back_to: undefined,
            label_ids: undefined,
            value: undefined,
            value_type: undefined,
            datetime_range_start: undefined,
            datetime_range_end: undefined,
            datetime_repeat_every: undefined,
            units: undefined,
            dimension_ids: undefined,
        })

        await delete_test_data_in_db("data_components_archive")
        await delete_test_data_in_db("data_components")
    })


    it("should disallowed inserting test data component when id >= 0 and test_run_id is set", async function ()
    {
        const data_component: DataComponent = {
            ...data_component_fixture,
            editor_id: user_id,
            id: new IdAndVersion(0, 1), // Version 1 is allowed, but id must be < 0 for test data
            test_run_id: data_component_fixture.test_run_id + ` - ${this.test?.title}`,
        }
        expect(data_component.test_run_id).to.exist

        const response = await insert_data_component(get_supabase, data_component)
        if (response.data)
        {
            expect.fail(`Production data at risk of corruption.  Should have failed to insert data component with id >= 0 and test_run_id set, but got response: ${JSON.stringify(response)}`)
        }
        expect(response.error).to.have.property("message").that.equals(`ERR05. p_id must be negative for test runs, got 0`)
        // This error would be produced but we raise our own error in the function.
        // Belt and braces approach.
        // expect(error).to.have.property("message").that.equals(`new row for relation "data_components" violates check constraint "data_components_test_data_id_and_run_id_consistency"`)
    })


    it("should disallowed inserting test data component when id < 0 and test_run_id not set", async () =>
    {
        const data_component: DataComponent = {
            ...data_component_fixture,
            editor_id: user_id,
            id: new IdAndVersion(-1, 1), // Re-instantiating the id to be explicit about it being valid for test data
            test_run_id: undefined, // Explicitly set to undefined
        }

        const response = await insert_data_component(get_supabase, data_component)
        if (response.data)
        {
            expect.fail(`Should have failed to insert data component with id < 0 and test_run_id not set, but got response: ${JSON.stringify(response)}`)
        }

        expect(response.error).to.have.property("message").that.equals(`ERR06. p_test_run_id must be provided for test runs with negative id of -1, but got <NULL>`)
        // This error would be produced but we raise our own error in the function.
        // Belt and braces approach.
        // expect(error).to.have.property("message").that.equals(`new row for relation "data_components" violates check constraint "data_components_test_data_id_and_run_id_consistency"`)
    })


    let inserted_data_component: DataComponent
    it("should write the data component to the database", async function ()
    {
        inserted_data_component = {
            ...data_component_fixture,
            editor_id: user_id,
            title: "<p>Test Title</p>",
            description: "<p>Test Description</p>",
            plain_title: "Some other title",
            plain_description: "Some other description",
            test_run_id: data_component_fixture.test_run_id + ` - ${this.test?.title}`,
        }

        const response = await insert_data_component(get_supabase, inserted_data_component)
        if (response.error)
        {
            expect.fail(`Failed to upsert data component: ${JSON.stringify(response.error)}`)
        }

        const expected_response: DataComponent = {
            id: new IdAndVersion(-1, 1),
            editor_id: "85347368-a8cb-431f-bcfc-1a211c20b97a",
            created_at: new Date(),
            comment: undefined,
            bytes_changed: 0,
            version_type: undefined,
            version_rolled_back_to: undefined,
            title: "<p>Test Title</p>",
            description: "<p>Test Description</p>",
            label_ids: undefined,
            value: undefined,
            value_type: undefined,
            datetime_range_start: undefined,
            datetime_range_end: undefined,
            datetime_repeat_every: undefined,
            units: undefined,
            dimension_ids: undefined,
            // Should be set by the convert_to_db_row function
            plain_title: "Test Title",
            // Should be set by the convert_to_db_row function
            plain_description: "Test Description",
            test_run_id: inserted_data_component.test_run_id,
        }

        compare_data_components(response.data, expected_response, "Data component from insertion should match expected response")

        // Double check that the data component was inserted correctly into
        // both the main table and archive table
        const row_from_data_components = await request_data_components(get_supabase, {}, [new IdOnly(-1)])
        const row_from_data_components_archive = await request_data_component_history(get_supabase, -1)
        compare_data_component_lists(row_from_data_components.data!, [expected_response], "Fetched data components should match expected")
        compare_data_component_lists(row_from_data_components_archive.data!, [expected_response], "Fetched data components history fetched should match expected")
    })


    it("should update the test data component in the database", async function ()
    {
        expect(inserted_data_component, "This test is stateful and requires insertion from previous test").to.exist

        const data_component = {
            ...inserted_data_component,
            title: "<p>Test Second Title</p>",
            plain_title: "Test Second Title",
            test_run_id: data_component_fixture.test_run_id + ` - ${this.test?.title}`,
        }

        const response = await update_data_component(get_supabase, data_component)
        if (response.error)
        {
            expect.fail(`Failed to upsert data component: ${JSON.stringify(response.error)}`)
        }

        const expected_response: DataComponent = {
            // The version number should have been increased by the DB
            id: new IdAndVersion(-1, 2),
            // The title and plain_title should have been updated
            title: "<p>Test Second Title</p>",
            plain_title: "Test Second Title",
            // The test_run_id should remain the same
            test_run_id: inserted_data_component.test_run_id!,

            // All other fields should remain the same
            editor_id: "85347368-a8cb-431f-bcfc-1a211c20b97a",
            created_at: new Date(),
            comment: undefined,
            bytes_changed: 0,
            version_type: undefined,
            version_rolled_back_to: undefined,
            description: "<p>Test Description</p>",
            label_ids: undefined,
            value: undefined,
            value_type: undefined,
            datetime_range_start: undefined,
            datetime_range_end: undefined,
            datetime_repeat_every: undefined,
            units: undefined,
            dimension_ids: undefined,
            plain_description: "Test Description",
        }

        compare_data_components(response.data, expected_response)

        // Double check that the data component was inserted correctly into
        // both the main table and archive table
        const row_from_data_components = await request_data_components(get_supabase, {}, [new IdOnly(-1)])
        const row_from_data_components_archive = await request_data_component_history(get_supabase, -1)
        compare_data_component_lists(row_from_data_components.data!, [expected_response])
        expect(row_from_data_components_archive.data!.length).equals(2, "Should now have 2 rows in the archive table")
        compare_data_components(row_from_data_components_archive.data![0]!, expected_response)
    })


    let second_updated_data_component: UpsertDataComponentResponse
    it("should paginate over the test data components in the database", async function ()
    {
        this.timeout(5000)
        expect(inserted_data_component, "This test is stateful and requires insertion from previous test").to.exist
        const data_component_2: DataComponent = {
            ...inserted_data_component,
            id: new IdAndVersion(-2, 1),
            editor_id: user_id,
            test_run_id: data_component_fixture.test_run_id + ` - ${this.test?.title}`
        }

        const id_1 = inserted_data_component.id

        const response = await insert_data_component(get_supabase, data_component_2)
        if (response.error)
        {
            expect.fail(`Failed to insert second data component: ${JSON.stringify(response.error)}`)
        }
        const id_2 = response.data.id

        second_updated_data_component = await update_data_component(get_supabase, {
            ...data_component_2,
            id: id_2,
            title: "<p>Test Second Component's Second Title</p>"
        })

        if (second_updated_data_component.error)
        {
            expect.fail(`Failed to update second data component: ${JSON.stringify(second_updated_data_component.error)}`)
        }

        const ids_only = [id_1.as_IdOnly(), id_2.as_IdOnly()]
        const data_components_page_1 = await request_data_components(get_supabase, { page: 0, size: 1 }, ids_only)
        const data_components_page_2 = await request_data_components(get_supabase, { page: 1, size: 1 }, ids_only)
        const archived_data_component_1_page_1 = await request_data_component_history(get_supabase, id_1.id, { page: 0, size: 1 })
        const archived_data_component_1_page_2 = await request_data_component_history(get_supabase, id_1.id, { page: 1, size: 1 })
        const archived_data_component_2 = await request_data_component_history(get_supabase, id_2.id, { page: 0, size: 2 })
        const all_data_component_2 = await request_archived_data_components(get_supabase, [id_2.as_IdOnly()], { page: 0, size: 2 })

        const get_ids_and_versions = (data: DataComponent[]) => data.map(row => ({ id: row.id.id, version_number: row.id.version }))

        expect(data_components_page_1.data, "Expected data to be an array").to.be.an("array")
        deep_equals(
            get_ids_and_versions(data_components_page_1.data!),
            // Note that we expect the smallest id to be returned first which would
            // normally be the smallest _positive_ id, i.e. the oldest data component
            // but as we use negative ids for the tests then it returns the largest
            // negative id first, which is also the most recent data component
            // rather than the oldest.
            [{ id: id_2.id, version_number: 2 }],
            "Expected first page of data"
        )
        deep_equals(
            get_ids_and_versions(data_components_page_2.data!),
            [{ id: id_1.id, version_number: 2 }],
            "Expected second page of data"
        )

        expect(archived_data_component_1_page_1.data, "Expected archived data to be an array").to.be.an("array")
        deep_equals(
            get_ids_and_versions(archived_data_component_1_page_1.data!),
            [{ id: id_1.id, version_number: 2 }],
            "Expected first page of archived data for component 1"
        )
        deep_equals(
            get_ids_and_versions(archived_data_component_1_page_2.data!),
            [{ id: id_1.id, version_number: 1 }],
            "Expected second page of archived data for component 1"
        )
        deep_equals(
            get_ids_and_versions(archived_data_component_2.data!),
            [{ id: id_2.id, version_number: 2 }, { id: id_2.id, version_number: 1 }],
            "Expected page of archived data for component 2"
        )
        deep_equals(
            get_ids_and_versions(all_data_component_2.data!),
            [{ id: id_2.id, version_number: 2 }, { id: id_2.id, version_number: 1 }],
            "Expected page of all (archived) data for component 2"
        )
    })


    it("should search over title and description of data components", async function ()
    {
        expect(second_updated_data_component.data, "This test is stateful and requires the insertion and update from previous test").to.exist

        let search_results: RequestDataComponentsReturn
        let search_2_results: RequestDataComponentsReturn
        try
        {
            search_results = await search_data_components(get_supabase, "second title", { page: 0, size: 10 })
            search_2_results = await search_data_components(get_supabase, `"Second Component"`, { page: 0, size: 10 })
        }
        catch (error)
        {
            expect.fail(`Error whilst inserting second data component: ${JSON.stringify(error)}`)
        }

        expect(search_results.data, "Expected search results to be an array").to.be.an("array")
        expect(search_2_results.data, "Expected search 2 results to be an array").to.be.an("array")
        expect(search_results.data!.length).equals(2, "Expected search results to match both data components")
        expect(search_2_results.data!.length).equals(1, "Expected search two results to match only the second data component")
        deep_equals(
            search_2_results.data!,
            [second_updated_data_component.data],
            "Expected search results to match inserted and updated second data component"
        )
    })
})


async function delete_test_data_in_db(table_name: TABLE_NAME, data_count?: number): Promise<void>
{
    const supabase = get_supabase()
    console .log(`Deleting ${data_count || ""} test rows from table "${table_name}" where id < 0`)
    const response = await supabase.from(table_name)
        .delete()
        .lte("id", -1) // Test data components have id < 0

    if (response.error) {
        expect.fail(`Failed to delete test rows from "${table_name}": ${response.error.message}`)
    }
}


function compare_data_components(actual: DataComponent, expected: DataComponent, message = ""): void
{
    // Compare two DataComponent objects
    const { created_at: created_at_actual, ...actual_without_created_at } = actual
    const { created_at: _, ...expected_without_created_at } = expected
    deep_equals(actual_without_created_at, expected_without_created_at, message)
    const ten_minutes = 10 * 60 * 1000 // 10 minutes in milliseconds
    expect(created_at_actual.getTime()).to.be.closeTo(new Date().getTime(), ten_minutes, `${message} Created at times should be close to each other`)
}

function compare_data_component_lists(actual: DataComponent[], expected: DataComponent[], message = ""): void
{
    expect(actual.length).equals(expected.length, `${message} Expected ${expected.length} rows, but got ${actual.length}`)
    actual.forEach((row, index) => {
        const expected_row = expected[index]
        expect(expected_row, `${message} Expected row at index ${index} to exist`).to.exist
        // type guard
        if (!expected_row) return
        compare_data_components(row, expected_row, `${message} at index ${index}`)
    })
}
