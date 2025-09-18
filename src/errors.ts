
class PostgreSQLError
{
    code: string
    message: string
    constructor(code: string, message: string)
    {
        this.code = code
        this.message = message
    }
}

class TSError extends Error
{
    code: string
    constructor(code: string, message: string)
    {
        super(message)
        this.code = code
    }
}


export const ERRORS =
{
    ERR01: new PostgreSQLError("ERR01", "ERR01. Inserts into data_components are only allowed when version_number = 1. Attempted value: %"),
    ERR02: new PostgreSQLError("ERR02", "ERR02. Update failed: version_number mismatch. Existing: %, Update Attempt: %, Expected: %"),
    ERR03: new PostgreSQLError("ERR03", "ERR03.v2. Must be authenticated"),
    ERR05: new PostgreSQLError("ERR05", "ERR05.v2. p_id must be negative for test runs, got %"),
    ERR06: new PostgreSQLError("ERR06", "ERR06.v2. p_test_run_id must be provided for test runs with negative id of %, but got %"),
    ERR07: new PostgreSQLError("ERR07", "ERR07.v2. Must be authenticated"),
    ERR09: new PostgreSQLError("ERR09", "ERR09.v2. Update failed: id % with version_number % not found or version mismatch, or owner_id editor_id mismatch."),
    ERR10: new PostgreSQLError("ERR10", "ERR10.v2. owner_id must match your user id or be NULL"),
    ERR11: new PostgreSQLError("ERR11", `ERR11. Update failed: owner_id mismatch for id "%.%".  Can not change owner_id once set.`),
    ERR12: new PostgreSQLError("ERR12", `ERR12. Update failed: existing owner_id and new editor_id mismatch for id "%.%".  Must be owner of component to update it but got: %`),
    ERR13: new PostgreSQLError("ERR13", "ERR13.v2. p_id must be negative for test runs but no smaller than -20, got %"),
    ERR14: new PostgreSQLError("ERR14", "ERR14. Invalid server secret"),
    ERR15: new PostgreSQLError("ERR15", "ERR15.% % is required"),
    ERR16_insert: new TSError("ERR16.insert", "ERR16.insert. Invalid request format, expected { batch: NewDataComponent[] }"),
    ERR16_update: new TSError("ERR16.update", "ERR16.update. Invalid request format, expected { batch: DataComponent[] }"),
    ERR17_insert: new TSError("ERR17.insert", "ERR17.insert. Invalid number of items in batch, must be between 1 and 10"),
    ERR17_update: new TSError("ERR17.update", "ERR17.update. Invalid number of items in batch, must be between 1 and 10"),
    ERR18_insert: new TSError("ERR18.insert", "ERR18.insert. Missing server secret"),
    ERR18_update: new TSError("ERR18.update", "ERR18.update. Missing server secret"),
    ERR19_insert: new TSError("ERR19.insert", "ERR19.insert. Unexpected error inserting data component."),
    ERR19_update: new TSError("ERR19.update", "ERR19.update. Unexpected error inserting data component."),
    ERR20: new TSError("ERR20", "ERR20. Internal server error - mismatched response and status code"),
    ERR21: new PostgreSQLError("ERR21", "ERR21. Invalid server secret"),
    ERR22: new TSError("ERR22", "ERR22. Invalid request format, expected { batch: DataComponentFields[] }"),
    ERR23: new TSError("ERR23", "ERR23. Invalid number of items in batch, must be between 1 and 10"),
    ERR24: new TSError("ERR24", "ERR24. Missing server secret"),
    ERR25: new PostgreSQLError("ERR25", "ERR25. No secrets found for key_name: %"),
    ERR27: new TSError("ERR27", "ERR27. Failed to calculate result value."),
    ERR28: new TSError("ERR28", "ERR28. Missing or invalid Authorization header."),
    ERR29: new TSError("ERR29", "ERR29. Unexpected error during ef_insert_data_component_v2."),
    ERR30: new PostgreSQLError("ERR30", "ERR30. Invalid user name. Must be 3-32 characters long and only contain letters, numbers, underscores, and hyphens."),
}
