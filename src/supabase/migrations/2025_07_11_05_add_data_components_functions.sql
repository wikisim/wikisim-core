CREATE SCHEMA IF NOT EXISTS internal_functions;


CREATE OR REPLACE FUNCTION internal_functions.get_edge_function_base_url()
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = 'public'
AS $$
    SELECT 'https://sfkgqscbwofiphfxhnxg.supabase.co/functions/v1';
$$;


CREATE OR REPLACE FUNCTION internal_functions.get_supabase_public_anon_key()
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = 'public'
AS $$
    SELECT 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMjA2MTkwNSwiZXhwIjoxOTQ3NjM3OTA1fQ.or3FBQDa4CtAA8w7XQtYl_3NTmtFFYPWoafolOpPKgA';
$$;


CREATE SCHEMA IF NOT EXISTS extension_http;
GRANT USAGE ON SCHEMA extension_http TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA extension_http TO authenticated;
-- Enable the http extension for making HTTP requests from PostgreSQL
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extension_http;



CREATE OR REPLACE FUNCTION internal_functions.calculate_plain_text(
    p_id integer,
    p_title text,
    p_description text,
    p_plain_title text,
    p_plain_description text
)
RETURNS TABLE (
    id integer,
    plain_title text,
    plain_description text,
    warning_message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'internal_functions'
AS $$
DECLARE
    edge_function_url text;
    http_response record;
    conversion_response jsonb;
    converted_plain_title text := p_plain_title;
    converted_plain_description text := p_plain_description;
    warning_message text := NULL;
BEGIN

    -- Call Edge Function to convert TipTap content to plain text
    BEGIN
        -- Get the Edge Function URL
        edge_function_url := internal_functions.get_edge_function_base_url() || '/convert_tiptap_to_plain';

        -- Set a default timeout for HTTP requests to prevent long waits.
        SET extension_http.http.curlopt_timeout_msec = 500;

        -- Make HTTP request to Edge Function
        -- I don't like doing this in a transaction because I assume this will
        -- tie up DB resources and block other inserts whilst it waits for the
        -- Edge Function to respond.
        SELECT * FROM extension_http.http((
            'POST',
            edge_function_url,
            ARRAY[
                extension_http.http_header('Authorization', 'Bearer ' || internal_functions.get_supabase_public_anon_key())
            ],
            'application/json',
            jsonb_build_object(
                'batch', jsonb_build_array(
                    jsonb_build_object(
                        'id', p_id,
                        'title', p_title,
                        'description', p_description
                    )
                )
            )::text
        )::extension_http.http_request) INTO http_response;

        -- Parse the response
        IF http_response.status = 200 THEN
            conversion_response := http_response.content::jsonb;

            -- Extract converted plain text
            converted_plain_title := COALESCE(
                (conversion_response->'results'->0->>'plain_title'),
                ''
            );
            converted_plain_description := COALESCE(
                (conversion_response->'results'->0->>'plain_description'),
                ''
            );
        ELSE
            -- Log the error but don't fail the insert
            warning_message := format(
                'Edge Function call failed with status %s. Using plain text fields from client. Error content: %s',
                http_response.status,
                http_response.content
            );
            RAISE WARNING '%', warning_message;
        END IF;

    EXCEPTION WHEN OTHERS THEN
        -- If Edge Function fails, log warning and continue with empty plain text
        warning_message := format('Failed to call Edge Function convert_tiptap_to_plain for TipTap conversion: %s. Using plain text fields from client.', SQLERRM);
        RAISE WARNING '%', warning_message;
    END;

    -- Return the converted plain text
    RETURN QUERY SELECT
        p_id as id,
        converted_plain_title AS plain_title,
        converted_plain_description AS plain_description,
        warning_message;
END;
$$;



CREATE OR REPLACE FUNCTION update_data_component(
    p_id integer,

    p_version_number integer,

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
-- RETURNS data_components
RETURNS TABLE (
    id INTEGER,
    owner_id uuid,
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
    warning_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    updated_row data_components;
    converted_plain_text_result RECORD;
BEGIN
    IF auth.role() <> 'authenticated' THEN
        -- This check is essential in stopping a non-authenticated user because
        -- the `GRANT EXECUTE ... TO authenticated` does not work at this level.
        RAISE EXCEPTION 'ERR07. Must be authenticated';
    END IF;

    -- IF p_editor_id IS DISTINCT FROM auth.uid() THEN
    --     RAISE EXCEPTION 'ERR08. editor_id must match your user id';
    -- END IF;

    -- Call Edge Function to convert TipTap content to plain text
    SELECT * FROM internal_functions.calculate_plain_text(
        p_id,
        p_title,
        p_description,
        p_plain_title,
        p_plain_description
    ) INTO converted_plain_text_result;

    UPDATE data_components
    SET
        version_number = p_version_number + 1,
        editor_id = auth.uid(),
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

        plain_title = converted_plain_text_result.plain_title, -- Server-side converted plain text
        plain_description = converted_plain_text_result.plain_description -- Server-side converted plain text
    WHERE (
        data_components.id = p_id AND data_components.version_number = p_version_number
        AND (
            data_components.owner_id = auth.uid() -- Ensure the owner is the editor
            OR data_components.owner_id IS NULL -- Allow updates if original owner_id is NULL, i.e. is a wiki component
        )
    )
    RETURNING * INTO updated_row;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'ERR09. Update failed: id % with version_number % not found or version mismatch.', p_id, p_version_number;
    END IF;

    RETURN QUERY SELECT
        updated_row.id,
        updated_row.owner_id,
        updated_row.version_number,
        updated_row.editor_id,
        updated_row.created_at,
        updated_row.comment,
        updated_row.bytes_changed,
        updated_row.version_type,
        updated_row.version_rolled_back_to,
        updated_row.title,
        updated_row.description,
        updated_row.label_ids,
        updated_row.value,
        updated_row.value_type,
        updated_row.value_number_display_type,
        updated_row.value_number_sig_figs,
        updated_row.datetime_range_start,
        updated_row.datetime_range_end,
        updated_row.datetime_repeat_every,
        updated_row.units,
        updated_row.dimension_ids,
        updated_row.plain_title,
        updated_row.plain_description,
        updated_row.test_run_id,
        converted_plain_text_result.warning_message -- Include any warning message from Edge Function call
    ;
END;
$$;



CREATE OR REPLACE FUNCTION update_data_component(
    p_id integer,

    p_version_number integer,

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
-- RETURNS data_components
RETURNS TABLE (
    id INTEGER,
    owner_id uuid,
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
    warning_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    updated_row data_components;
    converted_plain_text_result RECORD;
BEGIN
    IF auth.role() <> 'authenticated' THEN
        -- This check is essential in stopping a non-authenticated user because
        -- the `GRANT EXECUTE ... TO authenticated` does not work at this level.
        RAISE EXCEPTION 'ERR07. Must be authenticated';
    END IF;

    -- IF p_editor_id IS DISTINCT FROM auth.uid() THEN
    --     RAISE EXCEPTION 'ERR08. editor_id must match your user id';
    -- END IF;

    -- Call Edge Function to convert TipTap content to plain text
    SELECT * FROM internal_functions.calculate_plain_text(
        p_id,
        p_title,
        p_description,
        p_plain_title,
        p_plain_description
    ) INTO converted_plain_text_result;

    UPDATE data_components
    SET
        version_number = p_version_number + 1,
        editor_id = auth.uid(),
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

        plain_title = converted_plain_text_result.plain_title, -- Server-side converted plain text
        plain_description = converted_plain_text_result.plain_description -- Server-side converted plain text
    WHERE (
        id = p_id AND version_number = p_version_number
        AND (
            owner_id = auth.uid() -- Ensure the owner is the editor
            OR owner_id IS NULL -- Allow updates if original owner_id is NULL, i.e. is a wiki component
        )
    )
    RETURNING * INTO updated_row;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'ERR09. Update failed: id % with version_number % not found or version mismatch.', p_id, p_version_number;
    END IF;

    RETURN QUERY SELECT
        updated_row.id,
        updated_row.owner_id,
        updated_row.version_number,
        updated_row.editor_id,
        updated_row.created_at,
        updated_row.comment,
        updated_row.bytes_changed,
        updated_row.version_type,
        updated_row.version_rolled_back_to,
        updated_row.title,
        updated_row.description,
        updated_row.label_ids,
        updated_row.value,
        updated_row.value_type,
        updated_row.value_number_display_type,
        updated_row.value_number_sig_figs,
        updated_row.datetime_range_start,
        updated_row.datetime_range_end,
        updated_row.datetime_repeat_every,
        updated_row.units,
        updated_row.dimension_ids,
        updated_row.plain_title,
        updated_row.plain_description,
        updated_row.test_run_id,
        converted_plain_text_result.warning_message -- Include any warning message from Edge Function call
    ;
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
    owner_id uuid,
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
        LEAST(GREATEST(offset_n, 0), 500) AS final_offset,  -- clamp to [0, 500]
        (
            query LIKE '%"%'
            OR query LIKE '% OR %'
            OR query LIKE '% AND %'
            OR query LIKE '% -%'
        ) as use_websearch
)

SELECT
    d.id,
    d.owner_id,
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
        -- Full-text search using websearch_to_tsquery (for queries with quotes/operators)
        SELECT
            id,
            ts_rank_cd(search_vector, websearch_to_tsquery('english', query), 32) AS score,
            1 AS method
        FROM data_components, params
        WHERE params.use_websearch
        AND search_vector @@ websearch_to_tsquery('english', query)

        UNION ALL

        -- Trigram similarity (for queries without quotes/operators)
        SELECT
            id,
            extension_pg_trgm.similarity(plain_search_text, query) AS score,
            2 AS method
        FROM data_components, params
        WHERE NOT params.use_websearch
        AND extension_pg_trgm.similarity(plain_search_text, query) > similarity_threshold

        UNION ALL

        -- Full-text search (as backup method)
        SELECT
            id,
            ts_rank_cd(search_vector, websearch_to_tsquery('english', query), 32) AS score,
            1 AS method
        FROM data_components, params
        WHERE NOT params.use_websearch
        AND search_vector @@ websearch_to_tsquery('english', query)

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


-- TODO remove this once we have improved integration test to allow logging in/out
-- with different users.
CREATE OR REPLACE FUNCTION __testing_insert_test_data(
    p_id INTEGER,
    p_test_run_id TEXT
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
        RAISE EXCEPTION 'ERR07. Must be authenticated';
    END IF;

    IF p_id IS NULL OR p_test_run_id IS NULL THEN
        RAISE EXCEPTION 'Must provide p_id and p_test_run_id';
    END IF;

    IF p_id >= 0 THEN
        RAISE EXCEPTION 'Must give negative id for test data';
    END IF;

    INSERT INTO data_components (
        id,
        owner_id,
        version_number,
        editor_id,
        bytes_changed,
        title,
        description,
        plain_title,
        plain_description,
        test_run_id
    ) VALUES (
        p_id,
        -- Hard code to AJPtest2 user id
        'c3b9d96b-dc5c-4f5f-9698-32eaf601b7f2',
        1, -- initial version number
        auth.uid(),
        0,
        '',
        '',
        '',
        '',
        p_test_run_id
    ) RETURNING * INTO new_row;

    RETURN new_row;
END;
$$;
