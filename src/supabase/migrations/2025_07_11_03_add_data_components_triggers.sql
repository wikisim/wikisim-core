-- Function and trigger on before insert to data_components to ensure version_number starts at 1
CREATE OR REPLACE FUNCTION check_inserting_data_component_version_number_starts_at_1()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.version_number <> 1 THEN
        RAISE EXCEPTION 'Inserts into data_components are only allowed when version_number = 1. Attempted value: %', NEW.version_number;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER data_components_version_number_check_trigger
BEFORE INSERT ON data_components
FOR EACH ROW
EXECUTE FUNCTION check_inserting_data_component_version_number_starts_at_1();


-- Function and trigger to set the created_at timestamp on insert or update
CREATE OR REPLACE FUNCTION set_data_component_created_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.created_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER data_components_set_created_at_trigger
BEFORE INSERT OR UPDATE ON data_components
FOR EACH ROW
EXECUTE FUNCTION set_data_component_created_at();


-- Function and trigger to check version_number on update and increment it
CREATE OR REPLACE FUNCTION check_data_component_version_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Check that the provided version_number matches the current version_number + 1
    IF (OLD.version_number + 1) = NEW.version_number THEN
        -- pass
    ELSE
        RAISE EXCEPTION 'Update failed: version_number mismatch. Existing: %, Update Attempt: %, Expected: %', OLD.version_number, NEW.version_number, OLD.version_number + 1;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER data_components_version_number_update_check_trigger
BEFORE UPDATE ON data_components
FOR EACH ROW
EXECUTE FUNCTION check_data_component_version_number();


-- Function and trigger to archive the new row after insert or update
CREATE OR REPLACE FUNCTION archive_data_component_after_insert_or_update()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO data_components_archive (
        id,

        version_number,
        editor_id,
        created_at,
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

        test_run_id
    ) VALUES (
        NEW.id,

        NEW.version_number,
        NEW.editor_id,
        NEW.created_at,
        NEW.comment,
        NEW.bytes_changed,
        NEW.version_type,
        NEW.version_rolled_back_to,

        NEW.title,
        NEW.description,
        NEW.label_ids,

        NEW.value,
        NEW.value_type,
        NEW.datetime_range_start,
        NEW.datetime_range_end,
        NEW.datetime_repeat_every,
        NEW.units,
        NEW.dimension_ids,

        NEW.plain_title,
        NEW.plain_description,

        NEW.test_run_id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER archive_data_component_after_insert_or_update_trigger
AFTER INSERT OR UPDATE ON data_components
FOR EACH ROW
EXECUTE FUNCTION archive_data_component_after_insert_or_update();
