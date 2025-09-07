import { DataComponent, FunctionArgument, NewDataComponent } from "./interface"


export const DATA_COMPONENT_ERRORS = {
    FUNCTION_ARGUMENT_NAME_EMPTY: "All inputs must have a name or be deleted",
    FUNCTION_ARGUMENT_NAME_INVALID_START: (name: string) => `Input name must start with a letter or underscore but got "${name[0]}" as the first character of "${name}"`,
    FUNCTION_ARGUMENT_NAME_INVALID_CONTENT: (name: string) => `Input name must only contain letters, numbers, and underscores but got "${name}"`,
    FUNCTION_ARGUMENT_NAME_NOT_UNIQUE: (name: string) => `Input names must be unique but "${name}" is duplicated`,
}


export function is_data_component_invalid(component: DataComponent | NewDataComponent): false | string
{
    const { error } = calc_function_arguments_errors(component.function_arguments || [])
    if (error) return error

    return false
}


interface NameCounts { [name: string]: number }

export function calc_function_arguments_errors(function_arguments: FunctionArgument[] | undefined): { error: string | null, name_counts: NameCounts }
{
    function_arguments = function_arguments || []

    let error: string | null = null
    const name_counts: NameCounts = {}

    function_arguments.forEach(arg =>
    {
        name_counts[arg.name] = (name_counts[arg.name] || 0) + 1

        error = error || calc_function_argument_error(arg, name_counts)
    })

    return { error, name_counts }
}


export function calc_function_argument_error(arg: FunctionArgument, name_counts: NameCounts)
{
    const name = arg.name.trim()
    let error: string | null = null

    if (arg.name.trim() === "")
    {
        error = DATA_COMPONENT_ERRORS.FUNCTION_ARGUMENT_NAME_EMPTY
    }

    if (!/^[A-Za-z_]/.test(name))
    {
        error = error || DATA_COMPONENT_ERRORS.FUNCTION_ARGUMENT_NAME_INVALID_START(name)
    }

    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name))
    {
        error = error || DATA_COMPONENT_ERRORS.FUNCTION_ARGUMENT_NAME_INVALID_CONTENT(name)
    }

    if ((name_counts[name] || 0) > 1)
    {
        error = error || DATA_COMPONENT_ERRORS.FUNCTION_ARGUMENT_NAME_NOT_UNIQUE(name)
    }

    return error
}
