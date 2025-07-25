-- Enums for value_type and version_type
CREATE TYPE data_component_value_type AS ENUM ('number', 'datetime_range', 'number_array');
CREATE TYPE data_component_datetime_repeat_every AS ENUM ('second', 'minute', 'hour', 'day', 'month', 'year', 'decade', 'century');
CREATE TYPE data_component_version_type AS ENUM ('minor', 'rollback');

CREATE TABLE data_components
(
    id SERIAL PRIMARY KEY,

    -- For managing versions
    version_number INTEGER NOT NULL,
    editor_id uuid NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    comment TEXT,
    bytes_changed INTEGER NOT NULL,
    version_type data_component_version_type,
    version_rolled_back_to INTEGER,

    title TEXT NOT NULL,
    description TEXT NOT NULL,
    label_ids INTEGER[], -- Array of dimension IDs numbers in format: 5678

    value TEXT,
    value_type data_component_value_type,
    datetime_range_start TIMESTAMPTZ,
    datetime_range_end TIMESTAMPTZ,
    datetime_repeat_every data_component_datetime_repeat_every,
    units TEXT,
    dimension_ids TEXT[], -- Array of dimension IDs & version numbers in format: `5678v2`

    plain_title TEXT NOT NULL,
    plain_description TEXT NOT NULL,

    plain_search_text TEXT GENERATED ALWAYS AS (plain_title || ' ' || plain_description) STORED,
    search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', plain_title || ' ' || plain_description)) STORED,

    test_run_id TEXT, -- Optional field for test runs

    CONSTRAINT data_components_editor_id_fk FOREIGN KEY (editor_id) REFERENCES auth.users(id),
    CONSTRAINT data_components_test_data_id_and_run_id_consistency
    CHECK (
        (id < 0 AND test_run_id IS NOT NULL AND test_run_id <> '')
        OR
        (id >= 0 AND test_run_id IS NULL)
    )
);

-- -- Alternatively we could add the search_vector column referencing
-- -- plain_search_text column to DRY the code a but but not sure if it is
-- -- worth it.
-- ALTER TABLE data_components
-- ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', plain_search_text)) STORED;

-- Create search indices for data_components
CREATE INDEX idx_data_components_search_vector ON data_components USING GIN (search_vector);

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_data_components_plain_search_text_trgm
  ON data_components USING GIN (plain_search_text gin_trgm_ops);



CREATE TABLE data_components_archive
(
    id INTEGER NOT NULL, -- This is the ID of the data component, not the version

    -- For managing versions
    version_number INTEGER NOT NULL,
    editor_id uuid NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    comment TEXT,
    bytes_changed INTEGER NOT NULL,
    version_type data_component_version_type,
    version_rolled_back_to INTEGER,

    title TEXT NOT NULL,
    description TEXT NOT NULL,
    label_ids INTEGER[], -- Array of dimension IDs numbers in format: 5678

    value TEXT,
    value_type data_component_value_type,
    datetime_range_start TIMESTAMPTZ,
    datetime_range_end TIMESTAMPTZ,
    datetime_repeat_every data_component_datetime_repeat_every,
    units TEXT,
    dimension_ids TEXT[], -- Array of dimension IDs & version numbers in format: `5678v2`

    plain_title TEXT NOT NULL,
    plain_description TEXT NOT NULL,

    test_run_id TEXT, -- Optional field for test runs

    CONSTRAINT data_components_archive_pkey PRIMARY KEY (id, version_number),
    CONSTRAINT data_components_archive_id_fkey FOREIGN KEY (id) REFERENCES data_components(id),
    CONSTRAINT data_components_archive_editor_id_fk FOREIGN KEY (editor_id) REFERENCES auth.users(id),
    CONSTRAINT data_components_archive_test_data_id_and_run_id_consistency
    CHECK (
        (id < 0 AND test_run_id IS NOT NULL AND test_run_id <> '')
        OR
        (id >= 0 AND test_run_id IS NULL)
    )
);
