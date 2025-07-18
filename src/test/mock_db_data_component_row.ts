import { DBDataComponentRow } from "../supabase"


export function create_mock_db_data_component_row(overrides: Partial<DBDataComponentRow> = {}): DBDataComponentRow
{
    const default_row: DBDataComponentRow = {
        id: -1,
        version_number: 1,
        // AJPtest2 user id:
        editor_id: "c3b9d96b-dc5c-4f5f-9698-32eaf601b7f2",
        created_at: new Date().toISOString(),
        comment: "",
        bytes_changed: 0,
        version_type: null,
        version_rolled_back_to: null,

        title: "<p>Mock Data Component</p>",
        description: "<p>This is a mock data component for testing purposes.</p>",
        label_ids: null,

        value: null,
        value_type: null,
        datetime_range_start: null,
        datetime_range_end: null,
        datetime_repeat_every: null,
        units: null,
        dimension_ids: null,

        plain_title: "Mock Data Component",
        plain_description: "This is a mock data component for testing purposes.",
        // search_vector tsvector,
        test_run_id: "",
    }

    return { ...default_row, ...overrides }
}
