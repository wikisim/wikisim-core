/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from "chai"

import {
    __testing__,
    DBDataComponentInsertArgs,
    DBDataComponentUpdateArgs,
    get_supabase,
} from "../supabase"
import { deep_equals } from "../utils/deep_equals"
import { convert_from_db_row } from "./convert_between_db"
import {
    request_data_components,
    request_historical_data_components,
    search_data_components,
} from "./fetch_from_db"
import { IdAndVersion, IdOnly } from "./id"
import { DataComponent } from "./interface"
import { init_data_component } from "./modify"
import {
    insert_data_component,
    prepare_data_component_for_db_insert,
    prepare_data_component_for_db_update,
    update_data_component,
    UpsertDataComponentResponse,
} from "./write_to_db"


// AJPtest2 user id:
const OTHER_USER_ID = "c3b9d96b-dc5c-4f5f-9698-32eaf601b7f2"
type TABLE_NAME = "data_components_history" | "data_components"

describe("can init, insert, update, and search wiki data components", () =>
{
    const data_component_fixture: DataComponent = Object.freeze(init_data_component())


    after(async () =>
    {
        // Clean up test data after all tests have run
        await delete_test_data_in_db("data_components_history")
        await delete_test_data_in_db("data_components")
    })


    let user_id: string
    it("should be logged in", async () =>
    {
        user_id = await check_user_is_logged_in()
    })


    it("should not have any test data components in the database", async () =>
    {
        await check_no_test_data_in_db_and_delete_if_present()
    })


    it("ERR03 should disallow inserting new data component when user is not logged in", async function ()
    {
        const data_component = {
            ...data_component_fixture,
            test_run_id: data_component_fixture.test_run_id + ` - ${this.test?.title}`,
        }

        const response = await insert_data_component(__testing__.get_supabase_not_signed_in, data_component)
        if (response.data)
        {
            expect.fail(`Should have failed to insert data component with editor_id who is not logged in, but got response: ${JSON.stringify(response)}`)
        }
        expect(response.error).to.have.property("message").that.equals("ERR03. Must be authenticated")
    })


    it("should allow inserting new data component and ignore editor_id, and use that of user logged in", async function ()
    {
        this.timeout(5000)

        const data_component = {
            ...data_component_fixture,
            editor_id: OTHER_USER_ID,
            test_run_id: data_component_fixture.test_run_id + ` - ${this.test?.title}`,
        }

        const response1 = await insert_data_component(get_supabase, data_component)
        if (response1.error)
        {
            expect.fail(`Should have inserted data component with editor_id as that of logged in user, but got response: ${JSON.stringify(response1)}`)
        }
        expect(response1.data).to.have.property("editor_id", user_id)

        await delete_test_data_in_db("data_components_history")
        await delete_test_data_in_db("data_components")

        // Check insert_data_component rpc call would fail if editor_id is given
        const db_data_component = prepare_data_component_for_db_insert(data_component)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        ;(db_data_component as any).p_editor_id = OTHER_USER_ID

        const response2 = await low_level_insert_data_component(db_data_component)
        expect(response2.error).to.have.property("message").includes("Could not find the function public.insert_data_component")
    })


    it("should compute fields using edge function on insert and update", async function ()
    {
        this.timeout(5000)

        const data_component = {
            ...data_component_fixture,
            title: "<p>Some Title</p>",
            description: "<p>Some Description</p>",
            test_run_id: data_component_fixture.test_run_id + ` - ${this.test?.title}`,
        }

        const db_data_component1 = prepare_data_component_for_db_insert(data_component)
        expect(db_data_component1.p_plain_title).equals("Some Title")
        expect(db_data_component1.p_plain_description).equals("Some Description")
        db_data_component1.p_plain_title = "" // Explicitly set to empty string to test edge function sets it
        db_data_component1.p_plain_description = "" // Explicitly set to empty string to test edge function sets it

        const response1 = await low_level_insert_data_component(db_data_component1)
        if (response1.error) expect.fail(`Should have inserted data component with edge function computing fields, but got response: ${JSON.stringify(response1)}`)
        expect(response1.data.plain_title).equals("Some Title", "Edge function should have computed plain_title on insert")
        expect(response1.data.plain_description).equals("Some Description", "Edge function should have computed plain_description on insert")

        // Check update also calls edge function and computes the fields
        data_component.title = "<p>Some Other Title</p>"
        data_component.description = "<p>Some Other Description</p>"
        const db_data_component2 = prepare_data_component_for_db_update(data_component)
        db_data_component2.p_plain_title = "" // Explicitly set to empty string to test edge function sets it
        db_data_component2.p_plain_description = "" // Explicitly set to empty string to test edge function sets it

        const response2 = await low_level_update_data_component(db_data_component2)
        if (response2.error) expect.fail(`Should have inserted data component with edge function computing fields, but got response: ${JSON.stringify(response2)}`)
        expect(response2.data.plain_title).equals("Some Other Title", "Edge function should have computed plain_title on update")
        expect(response2.data.plain_description).equals("Some Other Description", "Edge function should have computed plain_description on update")

        await delete_test_data_in_db("data_components_history")
        await delete_test_data_in_db("data_components")
    })


    it("ERR01 should ignore version_number when inserting new data component", async function ()
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
            // If the version number was not ignored then ERR01 would have been raised
            expect.fail(`Should not have failed to insert data component when version 0 as it should have been ignored, but got response: ${JSON.stringify(response)}`)
        }
        deep_equals(response.data, {
            ...data_component,
            id: new IdAndVersion(data_component.id.id, 1), // Version should be set to 1 by the DB
            comment: undefined,
            version_type: undefined,
            version_rolled_back_to: undefined,
            label_ids: undefined,
            input_value: undefined,
            result_value: undefined,
            value_type: undefined,
            value_number_display_type: undefined,
            value_number_sig_figs: undefined,
            datetime_range_start: undefined,
            datetime_range_end: undefined,
            datetime_repeat_every: undefined,
            units: undefined,
            dimension_ids: undefined,
        })

        await delete_test_data_in_db("data_components_history")
        await delete_test_data_in_db("data_components")
    })


    it("ERR05 should disallowed inserting test data component when id >= 0 (and test_run_id is set)", async function ()
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
        // This error would be produced but we raise our own error ERR05 in the
        // function as a belt and braces approach.
        // expect(error).to.have.property("message").that.equals(`new row for relation "data_components" violates check constraint "data_components_test_data_id_and_run_id_consistency"`)
    })


    it("ERR13 should disallowed inserting test data component when id < -20 (and test_run_id is set)", async function ()
    {
        const data_component: DataComponent = {
            ...data_component_fixture,
            editor_id: user_id,
            id: new IdAndVersion(-21, 1),
            test_run_id: data_component_fixture.test_run_id + ` - ${this.test?.title}`,
        }

        const response = await insert_data_component(get_supabase, data_component)
        if (response.data)
        {
            expect.fail(`Should have failed to insert data component with id < -20 (and test_run_id set), but got response: ${JSON.stringify(response)}`)
        }
        expect(response.error).to.have.property("message").that.equals(`ERR13. p_id must be negative for test runs but no smaller than -20, got -21`)
        // This error would be produced but we raise our own error ERR13 in the
        // function as a belt and braces approach.
        // expect(error).to.have.property("message").that.equals(`new row for relation "data_components" violates check constraint "data_components_test_data_id_and_run_id_consistency"`)
    })


    it("ERR06 should disallowed inserting test data component when id < 0 and test_run_id not set", async () =>
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
        // This error would be produced but we raise our own error ERR06 in the
        // function as a belt and braces approach.
        // expect(error).to.have.property("message").that.equals(`new row for relation "data_components" violates check constraint "data_components_test_data_id_and_run_id_consistency"`)
    })


    let inserted_data_component: DataComponent
    it("should write the data component to the database", async function ()
    {
        const data_component: DataComponent = {
            ...data_component_fixture,
            editor_id: user_id,
            title: "<p>Test Title</p>",
            description: "<p>Test Description</p>",
            label_ids: [-1, -2],
            input_value: "123",
            result_value: "123",
            value_type: "number",
            value_number_display_type: "bare",
            value_number_sig_figs: 2,
            // The datetime_range_* fields are not used with the value* fields or the units field
            datetime_range_start: new Date("2023-01-01T00:00:00Z"),
            datetime_range_end: new Date("2023-01-02T00:00:00Z"),
            datetime_repeat_every: "day",
            units: "kg",
            dimension_ids: [new IdAndVersion(1, 2), new IdAndVersion(3, 4)],
            plain_title: "",
            plain_description: "",
            test_run_id: data_component_fixture.test_run_id + ` - ${this.test?.title}`,
        }

        const response = await insert_data_component(get_supabase, data_component)
        if (response.error)
        {
            expect.fail(`Failed to upsert data component: ${JSON.stringify(response.error)}`)
        }

        const expected_response: DataComponent = {
            id: new IdAndVersion(-1, 1),

            owner_id: undefined,

            editor_id: user_id,
            created_at: new Date(),
            comment: undefined,
            bytes_changed: 0,
            version_type: undefined,
            version_rolled_back_to: undefined,

            title: "<p>Test Title</p>",
            description: "<p>Test Description</p>",
            label_ids: [-1, -2],

            input_value: "123",
            result_value: "123",
            value_type: "number",
            value_number_display_type: "bare",
            value_number_sig_figs: 2,
            datetime_range_start: new Date("2023-01-01T00:00:00Z"),
            datetime_range_end: new Date("2023-01-02T00:00:00Z"),
            datetime_repeat_every: "day",
            units: "kg",
            dimension_ids: [new IdAndVersion(1, 2), new IdAndVersion(3, 4)],
            // Should be set by the server (edge function)
            plain_title: "Test Title",
            // Should be set by the server (edge function)
            plain_description: "Test Description",
            test_run_id: data_component.test_run_id,
        }

        compare_data_components(response.data, expected_response, "Data component from insertion should match expected response")
        inserted_data_component = response.data

        // Double check that the data component was inserted correctly into
        // both the main table and historical table
        const row_from_data_components = await request_data_components(get_supabase, { ids: [new IdOnly(-1)] })
        const row_from_data_components_history = await request_historical_data_components(get_supabase, [new IdOnly(-1)])
        compare_data_component_lists(row_from_data_components.data!, [expected_response], "Fetched data components should match expected")
        compare_data_component_lists(row_from_data_components_history.data!, [expected_response], "Fetched data components history fetched should match expected")
    })


    it("ERR07 should disallow updating data component when user not logged in", async function ()
    {
        expect(inserted_data_component, "This test is stateful and requires insertion from previous test").to.exist

        const data_component = {
            ...inserted_data_component,
            editor_id: user_id, // give a value editor_id but then use the get_supabase_not_signed_in
            test_run_id: inserted_data_component.test_run_id + ` - ${this.test?.title}`,
        }

        const response = await update_data_component(__testing__.get_supabase_not_signed_in, data_component)
        if (response.data) expect.fail(`Should have failed to update data component with editor_id who is not logged in, but got response: ${JSON.stringify(response)}`)
        expect(response.error).to.have.property("message").that.equals("ERR07. Must be authenticated")
    })


    let updated_data_component: DataComponent
    it("should update data component and ignore editor_id and use that of user logged in", async function ()
    {
        expect(inserted_data_component, "This test is stateful and requires insertion from previous test").to.exist

        const data_component = {
            ...inserted_data_component,
            editor_id: OTHER_USER_ID,
        }

        const response = await update_data_component(get_supabase, data_component)
        if (response.error) expect.fail(`Should have updated data component with editor_id of the logged in user, but got response: ${JSON.stringify(response)}`)
        expect(response.data).to.have.property("editor_id").that.equals(user_id)
        updated_data_component = response.data


        // Check update_data_component rpc call would fail if editor_id is given
        const db_data_component = prepare_data_component_for_db_update(data_component)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        ;(db_data_component as any).p_editor_id = OTHER_USER_ID

        const response2 = await low_level_update_data_component(db_data_component)
        expect(response2.error).to.have.property("message").includes("Could not find the function public.update_data_component")
    })


    it("should update the test data component in the database", async function ()
    {
        expect(updated_data_component, "This test is stateful and requires insertion from previous test").to.exist

        const data_component = {
            ...updated_data_component,
            title: "<p>Test Second Title</p>",
            plain_title: "",
        }

        const response = await update_data_component(get_supabase, data_component)
        if (response.error)
        {
            expect.fail(`Failed to upsert data component: ${JSON.stringify(response.error)}`)
        }

        const expected_response: DataComponent = {
            // The version number should have been increased by the DB
            id: new IdAndVersion(-1, 3),

            owner_id: undefined,

            // The title and plain_title should have been updated
            title: "<p>Test Second Title</p>",
            // Should be updated by the server (edge function)
            plain_title: "Test Second Title",
            test_run_id: data_component.test_run_id,

            // All other fields should remain the same
            editor_id: user_id,
            created_at: new Date(),
            comment: undefined,
            bytes_changed: 0,
            version_type: undefined,
            version_rolled_back_to: undefined,

            description: "<p>Test Description</p>",
            label_ids: [-1, -2],

            input_value: "123",
            result_value: "123",
            value_type: "number",
            value_number_display_type: "bare",
            value_number_sig_figs: 2,
            datetime_range_start: new Date("2023-01-01T00:00:00.000Z"),
            datetime_range_end: new Date("2023-01-02T00:00:00.000Z"),
            datetime_repeat_every: "day",
            units: "kg",
            dimension_ids: [new IdAndVersion(1, 2), new IdAndVersion(3, 4)],

            plain_description: "Test Description",
        }

        compare_data_components(response.data, expected_response)
        updated_data_component = response.data

        // Double check that the data component was inserted correctly into
        // both the main table and historical table
        const row_from_data_components = await request_data_components(get_supabase, { ids: [new IdOnly(-1)] })
        const row_from_data_components_history = await request_historical_data_components(get_supabase, [new IdOnly(-1)])
        compare_data_component_lists(row_from_data_components.data!, [expected_response])
        expect(row_from_data_components_history.data!.length).equals(3, "Should now have 3 rows in the historical table")
        compare_data_components(row_from_data_components_history.data![0]!, expected_response)
    })


    it("ERR02 & ERR09 should disallow updating data component with the wrong version_number", async function ()
    {
        expect(updated_data_component, "This test is stateful and requires insertion & update from previous test").to.exist

        const data_component = {
            ...updated_data_component,
            test_run_id: data_component_fixture.test_run_id + ` - ${this.test?.title}`,
        }
        data_component.id.version += 1 // This version number does not yet exist in the DB so should fail
        expect(data_component.id.version).to.equal(4, "Version number should be 4 for this test")

        const response = await update_data_component(get_supabase, data_component)
        if (response.data) expect.fail(`Should have failed to upsert data component`)
        expect(response.error).to.have.property("message").that.equals("ERR09. Update failed: id -1 with version_number 4 not found or version mismatch.")

        // This version number does exist in the DB but only in the
        // data_components_history table and so it is the wrong value for updating
        data_component.id.version -= 2
        expect(data_component.id.version).to.equal(2, "Version number should be 2 for this test")

        const response2 = await update_data_component(get_supabase, data_component)
        if (response2.data) expect.fail(`Should have failed to upsert data component`)
        // ERR02 won't be raised because ERR09 is raised first
        // expect(response2.error).to.have.property("message").that.equals("ERR02. Update failed: version_number mismatch. Existing: 3, Update Attempt: 2, Expected: 3")
        expect(response2.error).to.have.property("message").that.equals("ERR09. Update failed: id -1 with version_number 2 not found or version mismatch.")
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
        const data_components_page_1 = await request_data_components(get_supabase, { page: 0, size: 1, ids: ids_only })
        const data_components_page_2 = await request_data_components(get_supabase, { page: 1, size: 1, ids: ids_only })
        const historical_data_component_1_page_1 = await request_historical_data_components(get_supabase, [id_1.as_IdOnly()], { page: 0, size: 1 })
        const historical_data_component_1_page_2 = await request_historical_data_components(get_supabase, [id_1.as_IdOnly()], { page: 1, size: 1 })
        const historical_data_component_2 = await request_historical_data_components(get_supabase, [id_2.as_IdOnly()], { page: 0, size: 2 })

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
            [{ id: id_1.id, version_number: 3 }],
            "Expected second page of data"
        )

        expect(historical_data_component_1_page_1.data, "Expected historical data to be an array").to.be.an("array")
        deep_equals(
            get_ids_and_versions(historical_data_component_1_page_1.data!),
            [{ id: id_1.id, version_number: 3 }],
            "Expected first page of historical data for component 1"
        )
        deep_equals(
            get_ids_and_versions(historical_data_component_1_page_2.data!),
            [{ id: id_1.id, version_number: 2 }],
            "Expected second page of historical data for component 1"
        )
        deep_equals(
            get_ids_and_versions(historical_data_component_2.data!),
            [{ id: id_2.id, version_number: 2 }, { id: id_2.id, version_number: 1 }],
            "Expected page of historical data for component 2"
        )
    })


    it("should search over title and description of data components", async function ()
    {
        expect(second_updated_data_component.data, "This test is stateful and requires the insertion and update from previous test").to.exist

        const search_results = await search_data_components(get_supabase, "second title", { page: 0, size: 10, similarity_threshold: 0.5 })
        const search_2_results = await search_data_components(get_supabase, `"Second Component"`, { page: 0, size: 10, similarity_threshold: 0.5 })

        if (search_results.error || search_2_results.error)
        {
            expect.fail(`Error whilst searching for data components: ${JSON.stringify(search_results.error || search_2_results.error)}`)
        }

        expect(search_results.data, "Expected search results to be an array").to.be.an("array")
        expect(search_2_results.data, "Expected search 2 results to be an array").to.be.an("array")
        expect(search_results.data.length).equals(2, "Expected search results to match both data components")
        expect(search_2_results.data.length).equals(1, "Expected search two results to match only the second data component")
        deep_equals(
            search_2_results.data,
            [second_updated_data_component.data],
            "Expected search results to match inserted and updated second data component"
        )
    })
})


describe("can init, insert, update, and search user owned data components", () =>
{
    const data_component_fixture: DataComponent = Object.freeze(init_data_component())


    after(async () =>
    {
        // Clean up test data after all tests have run
        await delete_test_data_in_db("data_components_history")
        await delete_test_data_in_db("data_components")
    })


    let user_id: string
    it("should be logged in", async () =>
    {
        user_id = await check_user_is_logged_in()
        expect(user_id).not.equals(OTHER_USER_ID, `Must not be logged in with user_id "${OTHER_USER_ID}"`)
    })


    it("should not have any test data components in the database", async () =>
    {
        await check_no_test_data_in_db_and_delete_if_present()
    })


    it("ERR10 should disallow inserting new data component when owner_id does not match user logged in", async function ()
    {
        const data_component = {
            ...data_component_fixture,
            editor_id: user_id,
            owner_id: OTHER_USER_ID,
            test_run_id: data_component_fixture.test_run_id + ` - ${this.test?.title}`,
        }

        const response = await insert_data_component(get_supabase, data_component)
        if (response.data)
        {
            expect.fail(`Should have failed to insert data component when owner_id does not match user logged in, but got response: ${JSON.stringify(response)}`)
        }
        expect(response.error).to.have.property("message").that.equals("ERR10. owner_id must match your user id or be NULL")
    })


    let inserted_user_pages_data_component: DataComponent
    it(`should allow inserting "user owned" (which are public) data component to the database`, async function ()
    {
        const data_component: DataComponent = {
            ...data_component_fixture,
            owner_id: user_id, // owner_id should match user logged in
            editor_id: user_id,
            title: "<p>Test User Owned Component (which is public not private)</p>",
            description: "<p>Test Description</p>",
            label_ids: [-1, -2],
            input_value: "123",
            result_value: "123",
            value_type: "number",
            value_number_display_type: "bare",
            value_number_sig_figs: 2,
            // The datetime_range_* fields are not used with the value* fields or the units field
            datetime_range_start: new Date("2023-01-01T00:00:00Z"),
            datetime_range_end: new Date("2023-01-02T00:00:00Z"),
            datetime_repeat_every: "day",
            units: "kg",
            dimension_ids: [new IdAndVersion(1, 2), new IdAndVersion(3, 4)],
            plain_title: "",
            plain_description: "",
            test_run_id: data_component_fixture.test_run_id + ` - ${this.test?.title}`,
        }

        const response = await insert_data_component(get_supabase, data_component)
        if (response.error)
        {
            expect.fail(`Failed to upsert data component: ${JSON.stringify(response.error)}`)
        }

        const expected_response: DataComponent = {
            id: new IdAndVersion(-1, 1),
            owner_id: user_id,
            editor_id: user_id,
            created_at: new Date(),
            comment: undefined,
            bytes_changed: 0,
            version_type: undefined,
            version_rolled_back_to: undefined,
            title: "<p>Test User Owned Component (which is public not private)</p>",
            description: "<p>Test Description</p>",
            label_ids: [-1, -2],
            input_value: "123",
            result_value: "123",
            value_type: "number",
            value_number_display_type: "bare",
            value_number_sig_figs: 2,
            datetime_range_start: new Date("2023-01-01T00:00:00Z"),
            datetime_range_end: new Date("2023-01-02T00:00:00Z"),
            datetime_repeat_every: "day",
            units: "kg",
            dimension_ids: [new IdAndVersion(1, 2), new IdAndVersion(3, 4)],
            // Should be set by the server (edge function)
            plain_title: "Test User Owned Component (which is public not private)",
            // Should be set by the server (edge function)
            plain_description: "Test Description",
            test_run_id: data_component.test_run_id,
        }

        compare_data_components(response.data, expected_response, "Data component from insertion should match expected response")
        inserted_user_pages_data_component = response.data

        // Double check that the data component was inserted correctly into
        // both the main table and historical table
        const row_from_data_components = await request_data_components(get_supabase, { ids: [new IdOnly(-1)] })
        const row_from_data_components_history = await request_historical_data_components(get_supabase, [new IdOnly(-1)])
        compare_data_component_lists(row_from_data_components.data!, [expected_response], "Fetched data components should match expected")
        compare_data_component_lists(row_from_data_components_history.data!, [expected_response], "Fetched data components history fetched should match expected")
    })


    it("ERR11 should disallow updating owner_id of data component", async function ()
    {
        expect(inserted_user_pages_data_component, "This test is stateful and requires insertion from previous test").to.exist

        const data_component = {
            ...inserted_user_pages_data_component,
            editor_id: user_id,
            test_run_id: inserted_user_pages_data_component.test_run_id + ` - ${this.test?.title}`,
        }

        const db_data_component = prepare_data_component_for_db_update(data_component)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        ;(db_data_component as any).p_owner_id = OTHER_USER_ID // Attempt to change owner_id in the DB row

        const response = await low_level_update_data_component(db_data_component)
        if (response.data) expect.fail(`Should have failed to update data component with editor_id who is not logged in, but got response: ${JSON.stringify(response)}`)
        // `update_data_component` function does not accept p_owner_id as a
        // parameter otherwise ERR11 should be raised and returned here.
        expect(response.error).to.have.property("message").that.includes(`Could not find the function public.update_data_component`)
    })


    let updated_user_pages_data_component: DataComponent
    it("should update the test data component in the database", async function ()
    {
        expect(inserted_user_pages_data_component, "This test is stateful and requires insertion from previous test").to.exist

        const data_component = {
            ...inserted_user_pages_data_component,
            title: "<p>Test Updated User Owned Component (which is public not private)</p>",
            plain_title: "",
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
            title: "<p>Test Updated User Owned Component (which is public not private)</p>",
            // Should be updated by the server (edge function)
            plain_title: "Test Updated User Owned Component (which is public not private)",
            // The test_run_id should remain the same
            test_run_id: inserted_user_pages_data_component.test_run_id!,

            // All other fields should remain the same
            owner_id: user_id,
            editor_id: user_id,
            created_at: new Date(),
            comment: undefined,
            bytes_changed: 0,
            version_type: undefined,
            version_rolled_back_to: undefined,
            description: "<p>Test Description</p>",
            label_ids: [-1, -2],
            input_value: "123",
            result_value: "123",
            value_type: "number",
            value_number_display_type: "bare",
            value_number_sig_figs: 2,
            datetime_range_start: new Date("2023-01-01T00:00:00.000Z"),
            datetime_range_end: new Date("2023-01-02T00:00:00.000Z"),
            datetime_repeat_every: "day",
            units: "kg",
            dimension_ids: [new IdAndVersion(1, 2), new IdAndVersion(3, 4)],
            plain_description: "Test Description",
        }

        compare_data_components(response.data, expected_response)
        updated_user_pages_data_component = response.data

        // Double check that the data component was inserted correctly into
        // both the main table and historical table
        const row_from_data_components = await request_data_components(get_supabase, { ids: [new IdOnly(-1)] })
        const row_from_data_components_history = await request_historical_data_components(get_supabase, [new IdOnly(-1)])
        compare_data_component_lists(row_from_data_components.data!, [expected_response])
        expect(row_from_data_components_history.data!.length).equals(2, "Should now have 2 rows in the historical table")
        compare_data_components(row_from_data_components_history.data![0]!, expected_response)
    })


    it("ERR12 should disallow updating data component belonging to another user", async function ()
    {
        // TODO replace this with ability to just log out of this current user,
        // log in as another user, make this change, then log back in as the
        // original user.
        const response1 = await get_supabase().rpc("__testing_insert_test_data_component", {
            p_id: -10,
            p_test_run_id: data_component_fixture.test_run_id + ` - ${this.test?.title}`,
        })
        if (response1.error) expect.fail(`Should have run __testing_insert_test_data_component without error to insert a test data component with editor_id who is different to logged in user, but got response: ${JSON.stringify(response1)}`)
        expect(response1.data.owner_id).equals(OTHER_USER_ID)

        const data_component = {
            ...inserted_user_pages_data_component,
            editor_id: user_id,
            test_run_id: inserted_user_pages_data_component.test_run_id + ` - ${this.test?.title}`,
        }

        const db_data_component = prepare_data_component_for_db_update(data_component)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        ;(db_data_component as any).p_owner_id = OTHER_USER_ID // Attempt to change owner_id in the DB row

        const response2 = await low_level_update_data_component(db_data_component)
        if (response2.data) expect.fail(`Should have failed to update data component with editor_id who is not logged in, but got response: ${JSON.stringify(response2)}`)
        // `update_data_component` function does not accept owner_id as a
        // parameter otherwise ERR12 should be raised and returned here.
        expect(response2.error).to.have.property("message").that.includes(`Could not find the function public.update_data_component`)
    })


    let inserted_wiki_data_component: DataComponent
    it(`until there are moderation tools we should not include "user owned" (which are public) data by default on the home page unless specific owner_id is given`, async function ()
    {
        this.timeout(5000)
        expect(updated_user_pages_data_component, "This test is stateful and requires inserted and updated component from previous test").to.exist
        const response = await insert_data_component(get_supabase, {
            ...data_component_fixture,
            id: new IdAndVersion(-2, 1),
            title: "Wiki Component",
            plain_title: "Wiki Component",
            owner_id: undefined,
        })
        if (response.error)
        {
            expect.fail(`Failed to insert wiki data component: ${JSON.stringify(response.error)}`)
        }
        inserted_wiki_data_component = response.data
        expect(inserted_wiki_data_component, "Inserted wiki data component should exist").to.exist

        expect(inserted_user_pages_data_component.owner_id).equals(user_id, "Inserted data component should have owner_id set to user logged in")

        const data_components_1 = await request_data_components(get_supabase, { __only_test_data: true })
        const ids = [inserted_wiki_data_component.id.as_IdOnly(), inserted_user_pages_data_component.id.as_IdOnly()]
        const historical_data_component_1 = await request_historical_data_components(get_supabase, ids)
        const data_components_1_with_owner = await request_data_components(get_supabase, { owner_id: user_id, __only_test_data: true })

        expect(data_components_1.data, "Expected data to be an array").to.be.an("array")
        deep_equals(
            get_ids_and_versions(data_components_1.data!),
            get_ids_and_versions([inserted_wiki_data_component]),
            "Expected data components"
        )
        deep_equals(
            get_ids_and_versions(historical_data_component_1.data!),
            get_ids_and_versions([
                updated_user_pages_data_component,
                inserted_wiki_data_component,
                inserted_user_pages_data_component,
            ]),
            "Expected historical data components"
        )
        deep_equals(
            get_ids_and_versions(data_components_1_with_owner.data!),
            get_ids_and_versions([
                inserted_wiki_data_component,
                updated_user_pages_data_component,
            ]),
            "Expected historical data components"
        )
    })


    it(`should search over all data components including a users' own "user owned" (which are public) data components`, async function ()
    {
        expect(updated_user_pages_data_component, "This test is stateful and requires the insertion and update from previous test").to.exist

        const search_results = await search_data_components(get_supabase, `"User Owned Component"`)
        if (search_results.error) expect.fail(`Error whilst searching for data components: ${JSON.stringify(search_results.error)}`)

        expect(search_results.data, "Expected search results to be an array").to.be.an("array")
        deep_equals(
            get_ids_and_versions(search_results.data),
            get_ids_and_versions([
                // inserted_wiki_data_component,
                updated_user_pages_data_component,
            ]),
            `Expected search results to match "user owned" data component`
        )
    })
})


async function check_user_is_logged_in(): Promise<string>
{
    const { data: { user }, error } = await get_supabase().auth.getUser()
    if (error || !user)
    {
        expect.fail("User is not logged in.  Please log in to run this test.")
    }
    else
    {
        expect(user).to.have.property("id")
        return user.id
    }
}


async function check_no_test_data_in_db_and_delete_if_present(): Promise<void>
{
    const supabase = get_supabase()

    const table_names: TABLE_NAME[] = ["data_components_history", "data_components"]
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
}


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



async function low_level_insert_data_component(db_data_component: DBDataComponentInsertArgs): Promise<UpsertDataComponentResponse>
{
    return await get_supabase()
        .rpc("insert_data_component", db_data_component)
        .then(({ data, error }) =>
        {
            if (error) return { data: null, error }
            else if (data.length !== 1) return { data: null, error: new Error(`Wrong number of data returned from insert, expected 1 got ${data.length}`) }
            else return { data: convert_from_db_row(data[0]!), error: null }
        })
}


async function low_level_update_data_component(db_data_component: DBDataComponentUpdateArgs): Promise<UpsertDataComponentResponse>
{
    return await get_supabase()
        .rpc("update_data_component", db_data_component)
        .then(({ data, error }) =>
        {
            if (error) return { data: null, error }
            else if (data.length !== 1) return { data: null, error: new Error(`Wrong number of data returned from update, expected 1 got ${data.length}`) }
            else return { data: convert_from_db_row(data[0]!), error: null }
        })
}


function get_ids_and_versions (data: DataComponent[])
{
    return data.map(row => ({ id: row.id.id, version_number: row.id.version }))
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
