
CREATE OR REPLACE FUNCTION set_lowercase_name()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $BODY$
BEGIN
    IF new.name <> '' THEN
        new.name_lowercase = LOWER(new.name);
    END IF;
RETURN new;
END;
$BODY$;



CREATE TRIGGER users_on_update_set_lowercase_name
BEFORE UPDATE OR INSERT
ON public.users
FOR EACH ROW
EXECUTE PROCEDURE set_lowercase_name();
