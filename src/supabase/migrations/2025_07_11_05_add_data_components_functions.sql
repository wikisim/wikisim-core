
CREATE OR REPLACE FUNCTION update_data_component(
    p_id integer,

    p_version_number integer,
    p_editor_id uuid,
    p_comment text,
    p_bytes_changed integer,
    p_version_type data_component_version_type,
    p_version_rolled_back_to integer,

    p_title text,
    p_description text,
    p_label_ids integer[],

    p_value text,
    p_value_type data_component_value_type,
    p_datetime_range_start timestamptz,
    p_datetime_range_end timestamptz,
    p_datetime_repeat_every data_component_datetime_repeat_every,
    p_units text,
    p_dimension_ids text[],

    p_plain_title text,
    p_plain_description text
)
RETURNS void AS $$
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
    WHERE id = p_id AND version_number = p_version_number;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Update failed: id % with version_number % not found or version mismatch.', p_id, p_version_number;
    END IF;
END;
$$ LANGUAGE plpgsql;


-- Grant execute to authenticated users only
GRANT EXECUTE ON FUNCTION update_data_component(
    integer,
    integer,
    uuid,
    text,
    integer,
    data_component_version_type,
    integer,
    text,
    text,
    integer[],
    text,
    data_component_value_type,
    timestamptz,
    timestamptz,
    data_component_datetime_repeat_every,
    text,
    text[],
    text,
    text
) TO authenticated;
