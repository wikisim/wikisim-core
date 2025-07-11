-- Enums for value_type and version_type
CREATE TYPE data_component_value_type AS ENUM ('number', 'datetime_range', 'number_array');
CREATE TYPE data_component_datetime_repeat_every AS ENUM ('second', 'minute', 'hour', 'day', 'month', 'year', 'decade', 'century');
CREATE TYPE data_component_version_type AS ENUM ('minor', 'rollback');

CREATE TABLE data_components (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,

    value TEXT,
    value_type data_component_value_type,
    datetime_range_start TIMESTAMPTZ,
    datetime_range_end TIMESTAMPTZ,
    datetime_repeat_every data_component_datetime_repeat_every,
    units TEXT,
    dimension_ids TEXT[], -- Array of dimension IDs & version numbers in format: `5678#2`

    plain_title TEXT NOT NULL,
    plain_description TEXT NOT NULL,

    version_number INTEGER NOT NULL,
    editor_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    comment TEXT,
    bytes_changed INTEGER NOT NULL,
    version_type data_component_version_type,
    version_rolled_back_to INTEGER
);
