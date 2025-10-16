import { Constants, Database } from "../supabase/interface.ts"
import { IdAndVersion, TempId } from "./id.ts"


type DBEnums = Database["public"]["Enums"]


export type ValueType = DBEnums["data_component_value_type"]
export const VALUE_TYPES = Constants.public.Enums.data_component_value_type
export const VALUE_TYPES_OBJ = Object.values(VALUE_TYPES).reduce((o, k) =>
{
    o[k] = k
    return o
}, {} as Record<ValueType, ValueType>)


export type NumberDisplayType = DBEnums["data_component_value_number_display_type"]
export const NUMBER_DISPLAY_TYPES = Constants.public.Enums.data_component_value_number_display_type
export const NUMBER_DISPLAY_TYPES_OBJ = Object.values(NUMBER_DISPLAY_TYPES).reduce((o, k) =>
{
    o[k] = k
    return o
}, {} as Record<NumberDisplayType, NumberDisplayType>)


export type DatetimeRangeRepeatEvery = DBEnums["data_component_datetime_repeat_every"]
export const DATETIME_RANGE_REPEAT_EVERY = Constants.public.Enums.data_component_datetime_repeat_every
export const DATETIME_RANGE_REPEAT_EVERY_OBJ = Object.values(DATETIME_RANGE_REPEAT_EVERY).reduce((o, k) =>
{
    o[k] = k
    return o
}, {} as Record<DatetimeRangeRepeatEvery, DatetimeRangeRepeatEvery>)
export interface IDatetimeRange
{
    start: Date
    end: Date
    repeat_every: DatetimeRangeRepeatEvery
}


export interface DBFunctionArgument
{
    name: string
    description?: string
    // If we want to use value_type for asserting the type of value then we
    // should either have a broader set of typescript types like "string", etc,
    // or turn this into a text field and leverage typescript's type system.
    // value_type: "number"// | "data_component_id" | "datetime_range" | "datetime" | "boolean" | "string"
    default_value?: string
}
export interface FunctionArgument extends DBFunctionArgument
{
    id: number // temporary id, not stored to DB
}


export interface ScenarioValue
{
    value: string
    iterate_over?: boolean
}
export interface ScenarioValues
{
    [argument_name: string]: ScenarioValue
}

export type DBScenario = DBInlineScenario

export interface DBInlineScenario
{
    description?: string
    values: ScenarioValues
    expected_result?: string
    expectation_met?: boolean
}

export type Scenario = InlineScenario
export interface InlineScenario extends DBInlineScenario
{
    id: number // temporary id, not stored to DB
}


export interface DataComponentFields
{
    // For managing user owned (currently only public, maybe later private as well) data
    owner_id?: string

    // For managing versions
    editor_id: string
    created_at: Date
    comment?: string
    bytes_changed: number
    version_type?: DBEnums["data_component_version_type"]
    version_rolled_back_to?: number

    title: string
    description: string
    label_ids?: number[]

    input_value?: string
    /** Will be partially set by the server-side (edge function):
     *  when value_type === "function" result_value will be set by edge function
     *  when value_type === "number" result_value will be left as that provided
     *  by users (because otherwise this would require executing user javascript
     *  inside the edge functions).
     */
    result_value?: string
    /** IDs & version numbers recursively parsed from input_value.  Will be set
     *  on server-side (edge function)
     */
    recursive_dependency_ids?: IdAndVersion[]
    value_type?: ValueType
    value_number_display_type?: NumberDisplayType
    value_number_sig_figs?: number
    datetime_range_start?: Date
    datetime_range_end?: Date
    datetime_repeat_every?: DatetimeRangeRepeatEvery
    units?: string
    // Dimension IDs & version numbers parsed from format: `5678v2`
    dimension_ids?: IdAndVersion[]
    function_arguments?: FunctionArgument[]
    scenarios?: Scenario[]

    // // Not implementing yet until we get more use cases to check it against.
    // // For now we'll add these to the bottom of the description and when it's
    // // clearer what format of display, functionality (queries to make regarding
    // // references) and the corresponding data structure that is needed then
    // // we'll add references then.
    // // We'll also want to support finding references where we have to show
    // // attribution, e.g. for CC-BY licensed data etc.
    // references?: string[]

    // For indexing and searching
    plain_title: string
    plain_description: string

    test_run_id?: string

    // // Not implementing yet until we get more use cases to check it against.
    // // Alternatives
    // alternative_for_id?: number
    // alternative_for_version?: number
    // // This will (could) be used to append onto the title of the target
    // // component, e.g. if this component is based on data from
    // // "MNO organisation" and is an alternative to a component called
    // // "Number of X in Y", then this could result in this component's title
    // // being formatted as:
    // // "Number of X in Y - Alternative according to MNO organisation".
    // source_of_alternative?: string
}

export interface DataComponent extends DataComponentFields
{
    id: IdAndVersion
}

/**
 * This interface is used to create a new data component that is not yet saved
 * to the database.
 */
export interface NewDataComponent extends DataComponentFields
{
    temporary_id: TempId
}


export function is_data_component(data_component?: DataComponent | NewDataComponent | null): data_component is DataComponent
{
    return !!data_component && "id" in data_component && data_component.id instanceof IdAndVersion
}

export function is_new_data_component(data_component?: DataComponent | NewDataComponent | null): data_component is NewDataComponent
{
    return !!data_component && "temporary_id" in data_component && data_component.temporary_id instanceof TempId
}


export type DataComponentsById = Record<string, DataComponent>
