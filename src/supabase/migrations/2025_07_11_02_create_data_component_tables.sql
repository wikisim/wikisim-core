-- Enums for value_type and version_type
CREATE TYPE data_component_value_type AS ENUM ('number', 'datetime_range', 'number_array');
CREATE TYPE data_component_datetime_repeat_every AS ENUM ('second', 'minute', 'hour', 'day', 'month', 'year', 'decade', 'century');
CREATE TYPE data_component_version_type AS ENUM ('minor', 'rollback');
CREATE TYPE data_component_value_number_display_type AS ENUM (
    'bare', -- only the number so that numbers like 2023 do not have a comma
    'simple', -- formats numbers to have a comma like 2,023
    'scaled', -- replaces zeros in large numbers like 2.0 million
    'abbreviated_scaled', -- abbreviates to 2.0 M
    'percentage', -- formats numbers as a percentage like 2.0%
    'scientific' -- formats numbers in scientific notation like 2.0e6
);

CREATE TABLE data_components
(
    id SERIAL PRIMARY KEY,

    -- For managing personal / private data
    owner_id uuid NULL, -- The user who owns this component

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
    value_number_display_type data_component_value_number_display_type,
    value_number_sig_figs SMALLINT, -- Number of significant figures to display for numbers
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

    CONSTRAINT data_components_owner_id_fk FOREIGN KEY (owner_id) REFERENCES auth.users(id),
    CONSTRAINT data_components_editor_id_fk FOREIGN KEY (editor_id) REFERENCES auth.users(id),
    CONSTRAINT data_components_test_data_id_and_run_id_consistency
    CHECK (
        (id < 0 AND test_run_id IS NOT NULL AND test_run_id <> '')
        OR
        (id >= 0 AND test_run_id IS NULL)
    )
);


-- Create search indices for data_components
CREATE INDEX idx_data_components_search_vector ON data_components USING GIN (search_vector);

-- Create extension_pg_trgm schema if not exists
CREATE SCHEMA IF NOT EXISTS extension_pg_trgm;
GRANT USAGE ON SCHEMA extension_pg_trgm TO authenticated, anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA extension_pg_trgm TO authenticated, anon;

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extension_pg_trgm;
CREATE INDEX idx_data_components_plain_search_text_trgm
  ON data_components USING GIN (plain_search_text gin_trgm_ops);



CREATE TABLE data_components_archive
(
    id INTEGER NOT NULL, -- This is the ID of the data component, not the version

    -- For managing personal / private data
    owner_id uuid NULL, -- The user who owns this component

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
    value_number_display_type data_component_value_number_display_type,
    value_number_sig_figs SMALLINT, -- Number of significant figures to display for numbers
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
    CONSTRAINT data_components_archive_owner_id_fk FOREIGN KEY (owner_id) REFERENCES auth.users(id),
    CONSTRAINT data_components_archive_editor_id_fk FOREIGN KEY (editor_id) REFERENCES auth.users(id),
    CONSTRAINT data_components_archive_test_data_id_and_run_id_consistency
    CHECK (
        (id < 0 AND test_run_id IS NOT NULL AND test_run_id <> '')
        OR
        (id >= 0 AND test_run_id IS NULL)
    )
);
