-- Function and trigger on before insert to data_components to ensure version_number starts at 1
CREATE OR REPLACE FUNCTION check_inserting_data_component_version_number_starts_at_1()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    IF NEW.version_number <> 1 THEN
        RAISE EXCEPTION 'ERR01. Inserts into data_components are only allowed when version_number = 1. Attempted value: %', NEW.version_number;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER data_components_version_number_check_trigger
BEFORE INSERT ON data_components
FOR EACH ROW
EXECUTE FUNCTION check_inserting_data_component_version_number_starts_at_1();


-- Function and trigger to set the created_at timestamp on insert or update
CREATE OR REPLACE FUNCTION set_data_component_created_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    NEW.created_at := now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER data_components_set_created_at_trigger
BEFORE INSERT OR UPDATE ON data_components
FOR EACH ROW
EXECUTE FUNCTION set_data_component_created_at();


-- NOTE: we could disable this trigger and check altogether as the Postgres will
-- raise an error if p_owner_id is attempted to be sent to the `update_data_component`
-- function because it does not accept it as a parameter so there is no way to
-- update the owner_id of a data component once it is set.
--
-- Function and trigger to check owner_id on update does not change and that it
-- matches the current authenticated user (via the editor_id field which must match auth.uid())
CREATE OR REPLACE FUNCTION check_data_component_owner_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    -- Check that the provided owner_id is not changed during an update
    IF OLD.owner_id IS DISTINCT FROM NEW.owner_id THEN
        RAISE EXCEPTION 'ERR11. Update failed: owner_id mismatch for id "%.%".  Can not change owner_id once set.', OLD.id, OLD.version_number;
    -- Check that the previous owner_id (if present) matches the current authenticated user
    ELSIF OLD.owner_id IS NOT NULL AND OLD.owner_id IS DISTINCT FROM NEW.editor_id THEN
        RAISE EXCEPTION 'ERR12. Update failed: existing owner_id and new editor_id mismatch for id "%.%".  Must be owner of component to update it but got: %', OLD.id, OLD.version_number, NEW.editor_id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER data_components_owner_id_update_check_trigger
BEFORE UPDATE ON data_components
FOR EACH ROW
EXECUTE FUNCTION check_data_component_owner_id();


-- Function and trigger to check version_number on update and increment it
CREATE OR REPLACE FUNCTION check_data_component_version_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    -- Check that the provided version_number matches the current version_number + 1
    IF (OLD.version_number + 1) = NEW.version_number THEN
        -- pass
    ELSE
        -- This should actually never happen because ERR09 should be raised
        -- first from the update function.
        RAISE EXCEPTION 'ERR02. Update failed: version_number mismatch. Existing: %, Update Attempt: %, Expected: %', OLD.version_number, NEW.version_number, OLD.version_number + 1;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER data_components_version_number_update_check_trigger
BEFORE UPDATE ON data_components
FOR EACH ROW
EXECUTE FUNCTION check_data_component_version_number();


-- Function and trigger to archive the new row after insert or update
CREATE OR REPLACE FUNCTION archive_data_component_after_insert_or_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    INSERT INTO data_components_archive (
        id,

        owner_id,

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
        value_number_display_type,
        value_number_sig_figs,
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

        NEW.owner_id,

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
        NEW.value_number_display_type,
        NEW.value_number_sig_figs,
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
$$;


CREATE TRIGGER archive_data_component_after_insert_or_update_trigger
AFTER INSERT OR UPDATE ON data_components
FOR EACH ROW
EXECUTE FUNCTION archive_data_component_after_insert_or_update();
