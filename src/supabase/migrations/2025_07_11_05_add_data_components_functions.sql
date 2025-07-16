CREATE OR REPLACE FUNCTION insert_data_component(
    p_editor_id uuid,

    p_title text,
    p_description text,
    p_plain_title text,
    p_plain_description text,
    p_bytes_changed integer,

    p_comment text DEFAULT NULL,
    p_version_type data_component_version_type DEFAULT NULL,
    p_version_rolled_back_to integer DEFAULT NULL,

    p_label_ids integer[] DEFAULT NULL,

    p_value text DEFAULT NULL,
    p_value_type data_component_value_type DEFAULT NULL,
    p_datetime_range_start timestamptz DEFAULT NULL,
    p_datetime_range_end timestamptz DEFAULT NULL,
    p_datetime_repeat_every data_component_datetime_repeat_every DEFAULT NULL,
    p_units text DEFAULT NULL,
    p_dimension_ids text[] DEFAULT NULL,

    -- Optional field for test runs
    p_test_run_id text DEFAULT NULL,
    -- Optional id field for test runs, can only be negative
    p_id integer DEFAULT NULL
)
RETURNS data_components AS $$
DECLARE
    new_row data_components;
BEGIN
    IF auth.role() <> 'authenticated' THEN
        RAISE EXCEPTION 'Must be authenticated';
    END IF;

    IF p_editor_id IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'editor_id must match your user id';
    END IF;

    IF p_id IS NULL THEN
        p_id := nextval('data_components_id_seq'); -- Use sequence for new IDs
    ELSIF p_id >= 0 THEN
        RAISE EXCEPTION 'p_id must be negative for test runs, got %', p_id;
    ELSIF p_test_run_id IS NULL THEN
        RAISE EXCEPTION 'p_test_run_id must be provided for test runs with negative id of %, but got %', p_id, p_test_run_id;
    END IF;

    INSERT INTO data_components (
        version_number,
        editor_id,
        comment,
        bytes_changed,
        version_type,
        version_rolled_back_to,
        title,
        description,
        label_ids,
        value,
        value_type,
        datetime_range_start,
        datetime_range_end,
        datetime_repeat_every,
        units,
        dimension_ids,
        plain_title,
        plain_description,
        test_run_id,
        id
    ) VALUES (
        1, -- initial version number
        p_editor_id,
        p_comment,
        p_bytes_changed,
        p_version_type,
        p_version_rolled_back_to,
        p_title,
        p_description,
        p_label_ids,
        p_value,
        p_value_type,
        p_datetime_range_start,
        p_datetime_range_end,
        p_datetime_repeat_every,
        p_units,
        p_dimension_ids,
        p_plain_title,
        p_plain_description,
        p_test_run_id,
        p_id
    ) RETURNING * INTO new_row;

    RETURN new_row;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Grant execute to authenticated users only
GRANT EXECUTE ON FUNCTION insert_data_component(
    uuid,
    text,
    text,
    text,
    text,
    integer,
    text,
    data_component_version_type,
    integer,
    integer[],
    text,
    data_component_value_type,
    timestamptz,
    timestamptz,
    data_component_datetime_repeat_every,
    text,
    text[],
    text,
    integer
) TO authenticated;


CREATE OR REPLACE FUNCTION update_data_component(
    p_id integer,

    p_version_number integer,
    p_editor_id uuid,

    p_title text,
    p_description text,
    p_plain_title text,
    p_plain_description text,
    p_bytes_changed integer,

    p_comment text DEFAULT NULL,
    p_version_type data_component_version_type DEFAULT NULL,
    p_version_rolled_back_to integer DEFAULT NULL,

    p_label_ids integer[] DEFAULT NULL,

    p_value text DEFAULT NULL,
    p_value_type data_component_value_type DEFAULT NULL,
    p_datetime_range_start timestamptz DEFAULT NULL,
    p_datetime_range_end timestamptz DEFAULT NULL,
    p_datetime_repeat_every data_component_datetime_repeat_every DEFAULT NULL,
    p_units text DEFAULT NULL,
    p_dimension_ids text[] DEFAULT NULL

    -- Optional field for test runs should not be updatable
    -- p_test_run_id text DEFAULT NULL
)
RETURNS data_components AS $$
DECLARE
    updated_row data_components;
BEGIN
    IF auth.role() <> 'authenticated' THEN
        -- This error should never be raised because a non-authenticated user
        -- should be stopped by the `GRANT EXECUTE ... TO authenticated`.
        RAISE EXCEPTION 'Must be authenticated';
    END IF;

    IF p_editor_id IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'editor_id must match your user id';
    END IF;

    UPDATE data_components
    SET
        version_number = p_version_number + 1,
        editor_id = p_editor_id,
        comment = p_comment,
        bytes_changed = p_bytes_changed,
        version_type = p_version_type,
        version_rolled_back_to = p_version_rolled_back_to,

        title = p_title,
        description = p_description,
        label_ids = p_label_ids,

        value = p_value,
        value_type = p_value_type,
        datetime_range_start = p_datetime_range_start,
        datetime_range_end = p_datetime_range_end,
        datetime_repeat_every = p_datetime_repeat_every,
        units = p_units,
        dimension_ids = p_dimension_ids,

        plain_title = p_plain_title,
        plain_description = p_plain_description
    WHERE id = p_id AND version_number = p_version_number
    RETURNING * INTO updated_row;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Update failed: id % with version_number % not found or version mismatch.', p_id, p_version_number;
    END IF;

    RETURN updated_row;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Grant execute to authenticated users only
GRANT EXECUTE ON FUNCTION update_data_component(
    integer,
    integer,
    uuid,
    text,
    text,
    text,
    text,
    integer,
    text,
    data_component_version_type,
    integer,
    integer[],
    text,
    data_component_value_type,
    timestamptz,
    timestamptz,
    data_component_datetime_repeat_every,
    text,
    text[]
) TO authenticated;
