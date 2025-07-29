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
    p_value_number_display_type data_component_value_number_display_type DEFAULT NULL,
    p_value_number_sig_figs smallint DEFAULT NULL,
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
RETURNS data_components
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    new_row data_components;
BEGIN
    IF auth.role() <> 'authenticated' THEN
        -- This check is essential in stopping a non-authenticated user because
        -- the `GRANT EXECUTE ... TO authenticated` does not work at this level.
        RAISE EXCEPTION 'ERR03. Must be authenticated';
    END IF;

    IF p_editor_id IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'ERR04. editor_id must match your user id';
    END IF;

    IF p_id IS NULL THEN
        p_id := nextval('data_components_id_seq'); -- Use sequence for new IDs
    ELSIF p_id >= 0 THEN
        RAISE EXCEPTION 'ERR05. p_id must be negative for test runs, got %', p_id;
    ELSIF p_test_run_id IS NULL THEN
        RAISE EXCEPTION 'ERR06. p_test_run_id must be provided for test runs with negative id of %, but got %', p_id, p_test_run_id;
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
        value_number_display_type,
        value_number_sig_figs,
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
        p_value_number_display_type,
        p_value_number_sig_figs,
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
$$;



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
    p_value_number_display_type data_component_value_number_display_type DEFAULT NULL,
    p_value_number_sig_figs smallint DEFAULT NULL,
    p_datetime_range_start timestamptz DEFAULT NULL,
    p_datetime_range_end timestamptz DEFAULT NULL,
    p_datetime_repeat_every data_component_datetime_repeat_every DEFAULT NULL,
    p_units text DEFAULT NULL,
    p_dimension_ids text[] DEFAULT NULL

    -- Optional field for test runs should not be updatable
    -- p_test_run_id text DEFAULT NULL
)
RETURNS data_components
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    updated_row data_components;
BEGIN
    IF auth.role() <> 'authenticated' THEN
        -- This check is essential in stopping a non-authenticated user because
        -- the `GRANT EXECUTE ... TO authenticated` does not work at this level.
        RAISE EXCEPTION 'ERR07. Must be authenticated';
    END IF;

    IF p_editor_id IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'ERR08. editor_id must match your user id';
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
        value_number_display_type = p_value_number_display_type,
        value_number_sig_figs = p_value_number_sig_figs,
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
        RAISE EXCEPTION 'ERR09. Update failed: id % with version_number % not found or version mismatch.', p_id, p_version_number;
    END IF;

    RETURN updated_row;
END;
$$;



CREATE OR REPLACE FUNCTION search_data_components(
    query TEXT,
    similarity_threshold FLOAT DEFAULT 0.2,
    limit_n INT DEFAULT 20,
    offset_n INT DEFAULT 0
)
RETURNS TABLE (
    id INT,
    version_number INTEGER,
    editor_id uuid,
    created_at TIMESTAMPTZ,
    comment TEXT,
    bytes_changed INTEGER,
    version_type data_component_version_type,
    version_rolled_back_to INTEGER,
    title TEXT,
    description TEXT,
    label_ids INTEGER[],
    value TEXT,
    value_type data_component_value_type,
    value_number_display_type data_component_value_number_display_type,
    value_number_sig_figs SMALLINT,
    datetime_range_start TIMESTAMPTZ,
    datetime_range_end TIMESTAMPTZ,
    datetime_repeat_every data_component_datetime_repeat_every,
    units TEXT,
    dimension_ids TEXT[],
    plain_title TEXT,
    plain_description TEXT,
    test_run_id TEXT,
    score FLOAT,
    method INT
)
LANGUAGE SQL
-- Use caller's permissions in case in the future we add private data
SECURITY INVOKER
STABLE
SET search_path = 'public'
AS $$

WITH params AS (
    SELECT
        LEAST(GREATEST(limit_n, 1), 20) AS final_limit,  -- clamp to [1, 20]
        LEAST(GREATEST(offset_n, 0), 500) AS final_offset  -- clamp to [0, 500]
)

SELECT
    d.id,
    d.version_number,
    d.editor_id,
    d.created_at,
    d.comment,
    d.bytes_changed,
    d.version_type,
    d.version_rolled_back_to,
    d.title,
    d.description,
    d.label_ids,
    d.value,
    d.value_type,
    d.value_number_display_type,
    d.value_number_sig_figs,
    d.datetime_range_start,
    d.datetime_range_end,
    d.datetime_repeat_every,
    d.units,
    d.dimension_ids,
    d.plain_title,
    d.plain_description,
    d.test_run_id,
    combined_distinct.score,
    combined_distinct.method
FROM (
    SELECT DISTINCT ON (id)
        id,
        combined.score,
        combined.method
    FROM (
        -- Full-text search
        SELECT
            id,
            ts_rank(search_vector, websearch_to_tsquery('english', query)) AS score,
            1 AS method
        FROM data_components
        WHERE search_vector @@ websearch_to_tsquery('english', query)

        UNION ALL

        -- Trigram similarity on plain_search_text
        SELECT
            id,
            similarity(plain_search_text, query) AS score,
            2 AS method
        FROM data_components
        WHERE similarity(plain_search_text, query) > similarity_threshold
        LIMIT (SELECT final_limit FROM params)

    ) AS combined
    ORDER BY id

) as combined_distinct
JOIN data_components d ON d.id = combined_distinct.id
ORDER BY combined_distinct.score DESC, combined_distinct.method ASC

LIMIT (SELECT final_limit FROM params)
OFFSET (SELECT final_offset FROM params);

$$;
-- Example usage:
-- SELECT * FROM search_data_components('grav', 0, 10, 0);
