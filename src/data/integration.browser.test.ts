/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from "chai"

import { __testing__, get_supabase } from "../supabase/browser"
import { tiptap_mention_chip } from "../test/fixtures"
import { deep_equals } from "../utils/deep_equals"
import { deindent } from "../utils/deindent"
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
    insert_data_components,
    update_data_component,
    UpsertDataComponentResponse,
} from "./post_to_edge_functions"


// AJPtest2 user id:
const OTHER_USER_ID = "c3b9d96b-dc5c-4f5f-9698-32eaf601b7f2"
type TABLE_NAME = "data_components_history" | "data_components"

describe("can init, insert, update, and search wiki data components", function ()
{
    this.timeout(5000)

    // We don't use the init_new_data_component because for testing when we want
    // to insert into the DB we have to specify an ID and it has to be negative
    // where as `init_new_data_component` does not generate an `.id` value and
    // only adds a temporary_id value.
    // const draft_data_component_fixture: NewDataComponent = Object.freeze(init_new_data_component({}, true))
    const data_component_fixture: DataComponent = Object.freeze(init_data_component({
        title: "Test title",
    }, true))

    afterEach(async () =>
    {
        // Clean up test data after all tests have run
        await delete_test_data_in_db("data_components_history")
        await delete_test_data_in_db("data_components")
    })


    it("should not have any test data components in the database", async () =>
    {
        await check_no_test_data_in_db_and_delete_if_present()
    })


    let user_id: string
    it("should be logged in", async () =>
    {
        user_id = await check_user_is_logged_in(user_id)
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
        // expect(response.error).equals("ERR03. Must be authenticated")
        expect(response.error).equals("Invalid JWT")
    })


    it("should allow inserting new data component and ignore editor_id, and use that of user logged in", async function ()
    {
        user_id = await check_user_is_logged_in(user_id)

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
        // Note that we don't currently test this as rigorously as previously
        // when we used to set the editor_id value on a data_component
        // and then ued a lower level function (to attempt to) insert that into
        // the DB and check that the wrong editor_id was ignored and the current
        // user's id was used instead.
    })


    describe("computed fields using edge function on insert and update", function ()
    {
        let data_component_2: UpsertDataComponentResponse["data"] | undefined = undefined
        let data_component_3: UpsertDataComponentResponse["data"] | undefined = undefined
        let data_component_4: UpsertDataComponentResponse["data"] | undefined = undefined
        it("set up data for tests", async function ()
        {
            const data_component_1 = { id: new IdAndVersion(-1, 1), title: "Some other Component" }

            const data_component_2_to_insert = {
                ...data_component_fixture,
                id: new IdAndVersion(-2, 1),

                title: "<p>Some Title</p>",
                description: "<p>Some Description</p>",

                value_type: undefined,  // should default to "number",
                // This number has a calculation that references another data
                // component but because we don't currently run the calculation
                // on the edge function we haven't actually created it. Later
                // when the edge function does calculation then this test will
                // fail and need to be updated to create this referenced data
                // component `id: -1v1, title: "Some other Component"`
                input_value: `123 + ${tiptap_mention_chip(data_component_1)}`,
                // Should be left as-is for non-function value_types
                result_value: "456",
                // Should be ignored and set to [id-1v1] by edge function
                recursive_dependency_ids: [new IdAndVersion(-9, 1), new IdAndVersion(-10, 1)],

                test_run_id: data_component_fixture.test_run_id + ` - ${this.test?.title}`,
            }

            const data_component_3_to_insert: DataComponent = {
                ...data_component_fixture,
                id: new IdAndVersion(-3, 1),

                value_type: "function",
                input_value: `789 + ${tiptap_mention_chip(data_component_2_to_insert)}`,
                // Should be computed by edge function
                result_value: "",
                // Should be ignored and set to [id-2v1] by edge function
                recursive_dependency_ids: [new IdAndVersion(-9, 1), new IdAndVersion(-10, 1)],

                test_run_id: data_component_fixture.test_run_id + ` - ${this.test?.title}`,
            }

            const data_component_4_to_insert: DataComponent = {
                ...data_component_fixture,
                id: new IdAndVersion(-4, 1),

                value_type: "function",
                input_value: `101112 + ${tiptap_mention_chip(data_component_3_to_insert)}()`,
                // Should be ignored and set to [id-2v1, id-3v1] by edge function
                recursive_dependency_ids: [new IdAndVersion(-9, 1), new IdAndVersion(-10, 1)],

                test_run_id: data_component_fixture.test_run_id + ` - ${this.test?.title}`,
            }

            const response = await insert_data_components(get_supabase, [
                data_component_2_to_insert,
                data_component_3_to_insert,
                data_component_4_to_insert,
            ])
            if (response.error !== null) expect.fail(`Should have inserted mentioned data component, but got response: ${JSON.stringify(response)}`)
            data_component_2 = response.data[0]
            data_component_3 = response.data[1]
            data_component_4 = response.data[2]
        })

        it("should compute title and description", function ()
        {
            if (!data_component_2) expect.fail("Test data not set up")

            expect(data_component_2.plain_title).equals("Some Title", "Edge function should have computed plain_title on insert")
            expect(data_component_2.plain_description).equals("Some Description", "Edge function should have computed plain_description on insert")
        })

        it("should compute recursive_dependency_ids", function ()
        {
            if (!data_component_2) expect.fail("Test data not set up")
            if (!data_component_3) expect.fail("Test data not set up")
            if (!data_component_4) expect.fail("Test data not set up")

            expect(data_component_2.recursive_dependency_ids).deep.equals([
                new IdAndVersion(-1, 1),
            ], "Edge function should have computed recursive_dependency_ids of mentioned component on insert")
            expect(data_component_2.result_value).equals("456", "result_value should be unchanged as edge function does not yet compute it")

            expect(data_component_3.recursive_dependency_ids).deep.equals([
                // new IdAndVersion(-1, 1), <-- it should not include dependencies of any non-functions it references
                new IdAndVersion(-2, 1),
            ], "Edge function should have computed recursive_dependency_ids of mentioned component on insert")
            expect(data_component_3.result_value).equals("() => 789 + d_2v1", "result_value should be set by edge function for function value_type")

            expect(data_component_4.recursive_dependency_ids).deep.equals([
                new IdAndVersion(-2, 1), // <-- it should include dependencies of any functions it references
                new IdAndVersion(-3, 1),
            ], "Edge function should have computed recursive_dependency_ids of mentioned component on insert")
            expect(data_component_4.result_value).equals("() => 101112 + d_3v1()", "result_value should be set by edge function for function value_type")
        })
    })


    it("ERR01 should ignore version_number when inserting new data component", async function ()
    {
        user_id = await check_user_is_logged_in(user_id)

        // Version 2 is wrong for the initial version_number and should be ignored
        const id = new IdAndVersion(data_component_fixture.id.id, 2)
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
            function_arguments: undefined,
            scenarios: undefined,
            plain_title: "Test title",
        })
    })


    it("ERR05 should disallow inserting test data component when id >= 0 (and test_run_id is set)", async function ()
    {
        user_id = await check_user_is_logged_in(user_id)

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
        expect(response.error).equals(`ERR05.v2. p_id must be negative for test runs, got 0`)
        // This error would be produced but we raise our own error ERR05 in the
        // function as a belt and braces approach.
        // expect(error).equals(`new row for relation "data_components" violates check constraint "data_components_test_data_id_and_run_id_consistency"`)
    })


    it("ERR13 should disallowed inserting test data component when id < -20 (and test_run_id is set)", async function ()
    {
        user_id = await check_user_is_logged_in(user_id)

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
        expect(response.error).equals(`ERR13.v2. p_id must be negative for test runs but no smaller than -20, got -21`)
        // This error would be produced but we raise our own error ERR13 in the
        // function as a belt and braces approach.
        // expect(error).equals(`new row for relation "data_components" violates check constraint "data_components_test_data_id_and_run_id_consistency"`)
    })


    it("ERR06 should disallowed inserting test data component when id < 0 and test_run_id not set", async () =>
    {
        user_id = await check_user_is_logged_in(user_id)

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

        expect(response.error).equals(`ERR06.v2. p_test_run_id must be provided for test runs with negative id of -1, but got <NULL>`)
        // This error would be produced but we raise our own error ERR06 in the
        // function as a belt and braces approach.
        // expect(error).equals(`new row for relation "data_components" violates check constraint "data_components_test_data_id_and_run_id_consistency"`)
    })


    async function helper_insert_wiki_data_component(test_title: string | undefined, override?: Partial<DataComponent>)
    {
        user_id = await check_user_is_logged_in(user_id)

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
            test_run_id: data_component_fixture.test_run_id + ` - ${test_title}`,
            ...override,
        }

        const response = await insert_data_component(get_supabase, data_component)

        return { data_component, response }
    }


    it("should write the data component to the database", async function ()
    {
        user_id = await check_user_is_logged_in(user_id)

        const { data_component, response } = await helper_insert_wiki_data_component(this.test?.title)
        if (response.error !== null)
        {
            expect.fail(`Failed to insert data component: ${JSON.stringify(response.error)}`)
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
            recursive_dependency_ids: undefined,
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
            function_arguments: undefined,
            scenarios: undefined,
        }

        compare_data_components(response.data, expected_response, "Data component from insertion should match expected response")

        // Double check that the data component was inserted correctly into
        // both the main table and historical table
        const row_from_data_components = await request_data_components(get_supabase, { ids: [new IdOnly(-1)] })
        const row_from_data_components_history = await request_historical_data_components(get_supabase, [new IdOnly(-1)])
        compare_data_component_lists(row_from_data_components.data!, [expected_response], "Fetched data components should match expected")
        compare_data_component_lists(row_from_data_components_history.data!, [expected_response], "Fetched data components history fetched should match expected")
    })


    it("ERR07 should disallow updating data component when user not logged in", async function ()
    {
        user_id = await check_user_is_logged_in(user_id)

        const inserted_data_component_response = (await helper_insert_wiki_data_component(this.test?.title)).response
        const inserted_data_component = inserted_data_component_response.data
        if (!inserted_data_component) expect.fail(`Failed to insert data component ${this.test?.title} but got error: ${JSON.stringify(inserted_data_component_response.error)}`)

        const data_component = {
            ...inserted_data_component,
            editor_id: user_id, // give a value editor_id but then use the get_supabase_not_signed_in
            test_run_id: inserted_data_component.test_run_id + ` - ${this.test?.title}`,
        }

        const response = await update_data_component(__testing__.get_supabase_not_signed_in, data_component)
        if (response.data) expect.fail(`Should have failed to update data component with editor_id who is not logged in, but got response: ${JSON.stringify(response)}`)
        // expect(response.error).equals("ERR07. Must be authenticated")
        expect(response.error).equals("Invalid JWT")
    })


    it("should update data component and ignore editor_id and use that of user logged in", async function ()
    {
        user_id = await check_user_is_logged_in(user_id)

        const inserted_data_component_response = (await helper_insert_wiki_data_component(this.test?.title)).response
        const inserted_data_component = inserted_data_component_response.data
        if (!inserted_data_component) expect.fail(`Failed to insert data component ${this.test?.title} but got error: ${JSON.stringify(inserted_data_component_response.error)}`)

        const data_component = {
            ...inserted_data_component,
            editor_id: OTHER_USER_ID,
        }

        const response = await update_data_component(get_supabase, data_component)
        if (response.error !== null) expect.fail(`Should have updated data component with editor_id of the logged in user, but got response: ${JSON.stringify(response)}`)
        expect(response.data).to.have.property("editor_id").that.equals(user_id)
    })


    it("should update the (test) data component in the database", async function ()
    {
        user_id = await check_user_is_logged_in(user_id)

        const inserted_data_component_response = (await helper_insert_wiki_data_component(this.test?.title)).response
        const inserted_data_component = inserted_data_component_response.data
        if (!inserted_data_component) expect.fail(`Failed to insert data component ${this.test?.title} but got error: ${JSON.stringify(inserted_data_component_response.error)}`)

        const data_component = {
            ...inserted_data_component,
            title: "<p>Test Second Title</p>",
            plain_title: "",
        }

        const response = await update_data_component(get_supabase, data_component)
        if (response.error !== null)
        {
            expect.fail(`Failed to update data component: ${JSON.stringify(response.error)}`)
        }

        const expected_response: DataComponent = {
            // The version number should have been increased by the DB
            id: new IdAndVersion(-1, 2),

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
            recursive_dependency_ids: undefined,
            value_type: "number",
            value_number_display_type: "bare",
            value_number_sig_figs: 2,
            datetime_range_start: new Date("2023-01-01T00:00:00.000Z"),
            datetime_range_end: new Date("2023-01-02T00:00:00.000Z"),
            datetime_repeat_every: "day",
            units: "kg",
            dimension_ids: [new IdAndVersion(1, 2), new IdAndVersion(3, 4)],
            function_arguments: undefined,
            scenarios: undefined,

            plain_description: "Test Description",
        }

        compare_data_components(response.data, expected_response)

        // Double check that the data component was inserted correctly into
        // both the main table and historical table
        const row_from_data_components = await request_data_components(get_supabase, { ids: [new IdOnly(-1)] })
        const row_from_data_components_history = await request_historical_data_components(get_supabase, [new IdOnly(-1)])
        compare_data_component_lists(row_from_data_components.data!, [expected_response])
        expect(row_from_data_components_history.data!.length).equals(2, "Should now have 2 rows in the historical table")
        compare_data_components(row_from_data_components_history.data![0]!, expected_response)
    })


    it("ERR02 & ERR09 should disallow updating data component with the wrong version_number", async function ()
    {
        const inserted_data_component_response = (await helper_insert_wiki_data_component(this.test?.title)).response
        const inserted_data_component = inserted_data_component_response.data
        if (!inserted_data_component) expect.fail(`Failed to insert data component ${this.test?.title} but got error: ${JSON.stringify(inserted_data_component_response.error)}`)

        const data_component = { ...inserted_data_component, title: "title two" }
        const response_update_1 = await update_data_component(get_supabase, data_component)
        if(response_update_1.error) expect.fail(`First update of data component should have succeeded but got: ${JSON.stringify(response_update_1.error)}`)

        data_component.id.version = 3 // This version number does not yet exist in the DB so should fail
        const response = await update_data_component(get_supabase, data_component)
        if (response.data) expect.fail(`Should have failed to update data component`)
        expect(response.error).equals("ERR09.v2. Update failed: id -1 with version_number 3 not found or version mismatch, or owner_id editor_id mismatch.")

        // This version number does exist in the DB but now only in the
        // data_components_history table and so it is the wrong value for updating
        data_component.id.version = 1
        const response2 = await update_data_component(get_supabase, data_component)
        if (response2.data) expect.fail(`Should have failed to update data component`)
        // ERR02 won't be raised because ERR09.v2 is raised first
        expect(response2.error).equals("ERR09.v2. Update failed: id -1 with version_number 1 not found or version mismatch, or owner_id editor_id mismatch.")
    })


    it("should paginate over the test data components in the database", async function ()
    {
        this.timeout(10000)

        const inserted_data_component_1_response = (await helper_insert_wiki_data_component(this.test?.title)).response
        const inserted_data_component_1 = inserted_data_component_1_response.data
        if (!inserted_data_component_1) expect.fail(`Failed to insert data component ${this.test?.title} but got error: ${JSON.stringify(inserted_data_component_1_response.error)}`)
        const response_update_1_1 = await update_data_component(get_supabase, inserted_data_component_1)
        if(!response_update_1_1.data) expect.fail(`First update of data component 1 should have succeeded but got: ${JSON.stringify(response_update_1_1.error)}`)
        const response_update_1_2 = await update_data_component(get_supabase, response_update_1_1.data)
        if(response_update_1_2.error) expect.fail(`Second update of data component 1 should have succeeded but got: ${JSON.stringify(response_update_1_2.error)}`)


        const inserted_data_component_2_response = (await helper_insert_wiki_data_component(this.test?.title, { id: new IdAndVersion(-2, 1) })).response
        const inserted_data_component_2 = inserted_data_component_2_response.data
        if (!inserted_data_component_2) expect.fail(`Failed to insert data component ${this.test?.title} but got error: ${JSON.stringify(inserted_data_component_2_response.error)}`)
        const response_update_2 = await update_data_component(get_supabase, inserted_data_component_2)
        if(response_update_2.error) expect.fail(`First update of data component 2 should have succeeded but got: ${JSON.stringify(response_update_2.error)}`)


        const id_1 = inserted_data_component_1.id
        const id_2 = inserted_data_component_2.id
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
        const inserted_data_component_1_response = (await helper_insert_wiki_data_component(this.test?.title, { title: "abc", description: "some description" })).response
        const inserted_data_component_1 = inserted_data_component_1_response.data
        if (!inserted_data_component_1) expect.fail(`Failed to insert data component 1 ${this.test?.title} but got error: ${JSON.stringify(inserted_data_component_1_response.error)}`)

        const inserted_data_component_2_response = (await helper_insert_wiki_data_component(this.test?.title, {
            id: new IdAndVersion(-2, 1),
            title: "<p>Test Second Component's Title</p>",
            description: "some description",
        })).response
        const inserted_data_component_2 = inserted_data_component_2_response.data
        if (!inserted_data_component_2) expect.fail(`Failed to insert data component 2 ${this.test?.title} but got error: ${JSON.stringify(inserted_data_component_2_response.error)}`)

        const search_results = await search_data_components(get_supabase, "some description", { page: 0, size: 10, similarity_threshold: 0.5 })
        const search_2_results = await search_data_components(get_supabase, `"Second Component"`, { page: 0, size: 10, similarity_threshold: 0.5 })

        if (search_results.error || search_2_results.error)
        {
            expect.fail(`Error whilst searching for data components: ${JSON.stringify(search_results.error || search_2_results.error)}`)
        }

        expect(search_results.data, "Expected results of search no1 to be an array").to.be.an("array")
        expect(search_2_results.data, "Expected results of search no2 to be an array").to.be.an("array")
        expect(search_results.data.length).equals(2, "Expected search results to match both data components")
        expect(search_2_results.data.length).equals(1, "Expected search two results to match only the second data component")
        deep_equals(
            search_2_results.data,
            [inserted_data_component_2],
            "Expected search results to match inserted and updated second data component"
        )
    })
})


describe(`when value_type == "function"`, function ()
{
    this.timeout(5000)

    const data_component_fixture: DataComponent = Object.freeze(init_data_component({
        title: "summation or increment function",
        value_type: "function",
        input_value: "a + b",
        result_value: "", // Will be set by edge function when value_type == "function"
        function_arguments: [
            // `id` values will be ignored on insert and update but we set them
            // here to make it easier to compare the entire object later
            { id: 0, name: "a" },
            { id: 1, name: "b", default_value: "1" },
        ],
        scenarios: [
            {
                id: 0,
                description: "basic addition",
                values: {
                    a: { value: "2" },
                    b: { value: "-3" },
                },
                expected_result: "-1",
                expectation_met: true,
            },
            {
                id: 1,
                description: "use default to increment",
                values: {
                    a: { value: "5" },
                },
                expected_result: "6",
                expectation_met: true,
            },
        ]
    }, true))


    afterEach(async () =>
    {
        // Clean up test data after all tests have run
        await delete_test_data_in_db("data_components_history")
        await delete_test_data_in_db("data_components")
    })


    it("should insert data component", async function ()
    {
        const user_id = await check_user_is_logged_in()
        if (!user_id) expect.fail("Should be logged in for this test")

        const data_component = {
            ...data_component_fixture,
            editor_id: user_id,
            test_run_id: data_component_fixture.test_run_id + ` - ${this.test?.title}`,
        }

        const response = await insert_data_component(get_supabase, data_component)
        if (response.error !== null) expect.fail(`Failed to insert data component: ${JSON.stringify(response.error)}`)
        const inserted_data_component = response.data

        expect(inserted_data_component.result_value).equals("(a, b = 1) => a + b", "result_value should be set by edge function to the function expression")
        expect(inserted_data_component.function_arguments).to.deep.equal(data_component.function_arguments, "function_arguments should match those inserted")
        expect(inserted_data_component.scenarios).to.deep.equal(data_component.scenarios, "scenarios should match those inserted")
    })

    it("should include references to other functions and data components", async function ()
    {
        this.timeout(10000)

        const user_id = await check_user_is_logged_in()
        if (!user_id) expect.fail("Should be logged in for this test")

        const increment_function: DataComponent = {
            ...data_component_fixture,
            id: new IdAndVersion(-2, 1),
            title: "increment",
            value_type: "function",
            input_value: "x + 1",
            result_value: "", // Will be set by edge function when value_type == "function"
            function_arguments: [
                { id: 0, name: "x" },
            ],
            test_run_id: data_component_fixture.test_run_id + ` - ${this.test?.title} - increment function`,
        }
        const increment_function_response = await insert_data_component(get_supabase, increment_function)
        if (increment_function_response.error !== null) expect.fail(`Failed to insert increment function data component: ${JSON.stringify(increment_function_response.error)}`)
        expect(increment_function_response.data.result_value).equals("(x) => x + 1", "result_value of increment function should be set by edge function to the function expression")

        const data_point_value: DataComponent = {
            ...data_component_fixture,
            id: new IdAndVersion(-3, 1),
            title: "Some Number",
            value_type: "number",
            input_value: "42",
            result_value: "42", // Will not be set by edge function when value_type == "number"
            test_run_id: data_component_fixture.test_run_id + ` - ${this.test?.title} - data point`,
        }
        const data_point_response = await insert_data_component(get_supabase, data_point_value)
        if (data_point_response.error !== null) expect.fail(`Failed to insert data point data component: ${JSON.stringify(data_point_response.error)}`)
        expect(data_point_response.data.result_value).equals("42", "result_value of data point should remain as 42")

        const data_component: DataComponent = {
            ...data_component_fixture,
            editor_id: user_id,
            input_value: `<p>value = <span class="mention-chip" data-type="customMention" data-id="-3v1" data-label="Some Number">@Some Number</span>/10</p><p><span class="mention-chip" data-type="customMention" data-id="-2v1" data-label="increment">@increment</span>(value)</p>`,
            function_arguments: [],
            test_run_id: data_component_fixture.test_run_id + ` - ${this.test?.title}`,
        }

        const response = await insert_data_component(get_supabase, data_component)
        if (response.error !== null) expect.fail(`Failed to insert data component: ${JSON.stringify(response.error)}`)
        expect(response.data.result_value).equals(deindent(`
            () => {
                value = d_3v1/10
                return d_2v1(value)
            }
        `)
        , "result_value should reference other data components correctly")
    })
})


describe("can init, insert, update, and search user owned data components", function ()
{
    this.timeout(5000)

    const data_component_fixture: DataComponent = Object.freeze(init_data_component({}, true))

    afterEach(async () =>
    {
        // Clean up test data after all tests have run
        await delete_test_data_in_db("data_components_history")
        await delete_test_data_in_db("data_components")
    })


    it("should not have any test data components in the database", async () =>
    {
        await check_no_test_data_in_db_and_delete_if_present()
    })


    let user_id: string
    it("should be logged in", async () =>
    {
        user_id = await check_user_is_logged_in()
        expect(user_id).not.equals(OTHER_USER_ID, `Must not be logged in with user_id "${OTHER_USER_ID}"`)
    })


    it("ERR10 should disallow inserting new data component when owner_id does not match user logged in", async function ()
    {
        user_id = await check_user_is_logged_in(user_id)

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
        expect(response.error).equals("ERR10.v2. owner_id must match your user id or be NULL")
    })


    async function helper_insert_user_owned_data_component(test_title: string | undefined)
    {
        user_id = await check_user_is_logged_in(user_id)

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
            function_arguments: undefined,
            scenarios: undefined,
            plain_title: "",
            plain_description: "",
            test_run_id: data_component_fixture.test_run_id + ` - ${test_title}`,
        }

        const response = await insert_data_component(get_supabase, data_component)
        if (response.error !== null)
        {
            expect.fail(`Failed to insert data component: ${JSON.stringify(response.error)}`)
        }
        return { data_component, response }
    }

    // let inserted_user_owned_data_component: DataComponent
    it(`should allow inserting "user owned" (which are public) data component to the database`, async function ()
    {
        user_id = await check_user_is_logged_in(user_id)

        const { data_component, response } = await helper_insert_user_owned_data_component(this.test?.title)

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
            recursive_dependency_ids: undefined,
            value_type: "number",
            value_number_display_type: "bare",
            value_number_sig_figs: 2,
            datetime_range_start: new Date("2023-01-01T00:00:00Z"),
            datetime_range_end: new Date("2023-01-02T00:00:00Z"),
            datetime_repeat_every: "day",
            units: "kg",
            dimension_ids: [new IdAndVersion(1, 2), new IdAndVersion(3, 4)],
            function_arguments: undefined,
            scenarios: undefined,
            // Should be set by the server (edge function)
            plain_title: "Test User Owned Component (which is public not private)",
            // Should be set by the server (edge function)
            plain_description: "Test Description",
            test_run_id: data_component.test_run_id,
        }

        compare_data_components(response.data, expected_response, "Data component from insertion should match expected response")

        // Double check that the data component was inserted correctly into
        // both the main table and historical table
        const row_from_data_components = await request_data_components(get_supabase, { ids: [new IdOnly(-1)] })
        const row_from_data_components_history = await request_historical_data_components(get_supabase, [new IdOnly(-1)])
        compare_data_component_lists(row_from_data_components.data!, [expected_response], "Fetched data components should match expected")
        compare_data_component_lists(row_from_data_components_history.data!, [expected_response], "Fetched data components history fetched should match expected")
    })


    it("should silently ignore updating owner_id of data component", async function ()
    {
        user_id = await check_user_is_logged_in(user_id)

        const inserted_user_owned_data_component = (await helper_insert_user_owned_data_component(this.test?.title)).response.data

        const data_component = {
            ...inserted_user_owned_data_component,
            editor_id: user_id,
            test_run_id: inserted_user_owned_data_component.test_run_id + ` - ${this.test?.title}`,
            owner_id: OTHER_USER_ID, // Attempt to change owner_id
        }

        const response = await update_data_component(get_supabase, data_component)
        if (response.error !== null) expect.fail(`Should not have failed to update data component, but got response: ${JSON.stringify(response)}`)
        expect(response.data.owner_id).equals(user_id, "owner_id should not have changed on the data component")
    })


    it("should update the user owned (test) data component in the database", async function ()
    {
        user_id = await check_user_is_logged_in(user_id)

        const inserted_user_owned_data_component = (await helper_insert_user_owned_data_component(this.test?.title)).response.data

        const data_component = {
            ...inserted_user_owned_data_component,
            title: "<p>Test Updated User Owned Component (which is public not private)</p>",
            plain_title: "",
            test_run_id: data_component_fixture.test_run_id + ` - ${this.test?.title}`,
        }

        const response = await update_data_component(get_supabase, data_component)
        if (response.error !== null)
        {
            expect.fail(`Failed to update data component: ${JSON.stringify(response.error)}`)
        }

        const expected_response: DataComponent = {
            // The version number should have been increased by the DB
            id: new IdAndVersion(-1, 2),
            // The title and plain_title should have been updated
            title: "<p>Test Updated User Owned Component (which is public not private)</p>",
            // Should be updated by the server (edge function)
            plain_title: "Test Updated User Owned Component (which is public not private)",
            // The test_run_id should remain the same
            test_run_id: inserted_user_owned_data_component.test_run_id!,

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
            recursive_dependency_ids: undefined,
            value_type: "number",
            value_number_display_type: "bare",
            value_number_sig_figs: 2,
            datetime_range_start: new Date("2023-01-01T00:00:00.000Z"),
            datetime_range_end: new Date("2023-01-02T00:00:00.000Z"),
            datetime_repeat_every: "day",
            units: "kg",
            dimension_ids: [new IdAndVersion(1, 2), new IdAndVersion(3, 4)],
            plain_description: "Test Description",
            function_arguments: undefined,
            scenarios: undefined,
        }

        compare_data_components(response.data, expected_response)

        // Double check that the data component was inserted correctly into
        // both the main table and historical table
        const row_from_data_components = await request_data_components(get_supabase, { ids: [new IdOnly(-1)] })
        const row_from_data_components_history = await request_historical_data_components(get_supabase, [new IdOnly(-1)])
        compare_data_component_lists(row_from_data_components.data!, [expected_response])
        expect(row_from_data_components_history.data!.length).equals(2, "Should now have 2 rows in the historical table")
        compare_data_components(row_from_data_components_history.data![0]!, expected_response)
    })


    it("ERR09 should disallow updating data component belonging to another user", async function ()
    {
        user_id = await check_user_is_logged_in(user_id)

        // TODO replace this with ability to just log out of this current user,
        // log in as another user, make this change, then log back in as the
        // original user.
        const response1 = await get_supabase().rpc("__testing_insert_test_data_component", {
            p_id: -10,
            p_test_run_id: data_component_fixture.test_run_id + ` - ${this.test?.title}`,
        })
        if (response1.error) expect.fail(`Should have run __testing_insert_test_data_component without error to insert a test data component with owner_id who is different to logged in user, but got response: ${JSON.stringify(response1)}`)
        expect(response1.data.owner_id).equals(OTHER_USER_ID)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const inserted_component_for_other_user: DataComponent = {
            ...(response1.data as any),
            id: new IdAndVersion(response1.data.id, response1.data.version_number),
            created_at: new Date(response1.data.created_at),
        }

        const modified_data_component_a = {
            ...inserted_component_for_other_user,
            title: "Attempt to update data component belonging to another user",
        }

        const response_a = await update_data_component(get_supabase, modified_data_component_a)
        if (response_a.data) expect.fail(`Should have failed to update data component with owner_id who is different to logged in user, but got response: ${JSON.stringify(response_a)}`)
        expect(response_a.error).includes("ERR09.v2. Update failed: id -10 with version_number 1 not found or version mismatch, or owner_id editor_id mismatch.")


        const modified_data_component_b = {
            ...inserted_component_for_other_user,
            owner_id: user_id, // Attempt to change the owner_id to that of the logged in user
        }

        const response_b = await update_data_component(get_supabase, modified_data_component_b)
        if (response_b.data) expect.fail(`Should have failed to update data component to change owner_id, but got response: ${JSON.stringify(response_b)}`)
        expect(response_b.error).includes("ERR09.v2. Update failed: id -10 with version_number 1 not found or version mismatch, or owner_id editor_id mismatch.")
    })


    it(`until there are moderation tools we should not include "user owned" (which are public) data by default on the home page.  Only show when a specific owner_id is given (i.e. the user can see their own content on the home page)`, async function ()
    {
        user_id = await check_user_is_logged_in(user_id)

        const inserted_user_owned_data_component = (await helper_insert_user_owned_data_component(this.test?.title)).response.data

        const response = await insert_data_component(get_supabase, {
            ...data_component_fixture,
            id: new IdAndVersion(-2, 1),
            title: "Wiki Component",
            plain_title: "Wiki Component",
            owner_id: undefined,
        })
        if (response.error !== null)
        {
            expect.fail(`Failed to insert wiki data component: ${JSON.stringify(response.error)}`)
        }
        const inserted_wiki_data_component = response.data

        expect(inserted_user_owned_data_component.owner_id).equals(user_id, "User owned inserted data component should have owner_id set to user logged in")
        expect(inserted_wiki_data_component.owner_id).equals(undefined, "Wiki inserted data component should have owner_id set to undefined")

        const data_components_1 = await request_data_components(get_supabase, { __only_test_data: true })
        const ids = [inserted_wiki_data_component.id.as_IdOnly(), inserted_user_owned_data_component.id.as_IdOnly()]
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
                inserted_wiki_data_component,
                inserted_user_owned_data_component,
            ]),
            "Expected historical data components"
        )
        deep_equals(
            get_ids_and_versions(data_components_1_with_owner.data!),
            get_ids_and_versions([
                inserted_wiki_data_component,
                inserted_user_owned_data_component,
            ]),
            "Expected historical data components with owner_id filter"
        )
    })


    it(`should search over all data components including a users' own "user owned" (which are public) data components`, async function ()
    {
        user_id = await check_user_is_logged_in(user_id)

        const inserted_user_owned_data_component = (await helper_insert_user_owned_data_component(this.test?.title)).response.data

        const search_results = await search_data_components(get_supabase, `"User Owned Component"`)
        if (search_results.error) expect.fail(`Error whilst searching for data components: ${JSON.stringify(search_results.error)}`)

        expect(search_results.data, "Expected search results to be an array").to.be.an("array")
        deep_equals(
            get_ids_and_versions(search_results.data),
            get_ids_and_versions([
                // inserted_wiki_data_component,
                inserted_user_owned_data_component,
            ]),
            `Expected search results to match "user owned" data component`
        )
    })
})


async function check_user_is_logged_in(user_id?: string): Promise<string>
{
    if (user_id) return user_id

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
