import { Constants, Database } from "../supabase/interface"
import { IdAndVersion, TempId } from "./id"


type DBEnums = Database["public"]["Enums"]
export type NumberDisplayType = DBEnums["data_component_value_number_display_type"]
export const NUMBER_DISPLAY_TYPES = Constants.public.Enums.data_component_value_number_display_type
export const NUMBER_DISPLAY_TYPES_OBJ = Object.values(NUMBER_DISPLAY_TYPES).reduce((o, k) => {
    o[k] = k
    return o
}, {} as Record<NumberDisplayType, NumberDisplayType>)


export type DatetimeRangeRepeatEvery = DBEnums["data_component_datetime_repeat_every"]
export const DATETIME_RANGE_REPEAT_EVERY = Constants.public.Enums.data_component_datetime_repeat_every
export const DATETIME_RANGE_REPEAT_EVERY_OBJ = Object.values(DATETIME_RANGE_REPEAT_EVERY).reduce((o, k) => {
    o[k] = k
    return o
}, {} as Record<DatetimeRangeRepeatEvery, DatetimeRangeRepeatEvery>)
export interface IDatetimeRange
{
    start: Date
    end: Date
    repeat_every: DatetimeRangeRepeatEvery
}


interface DataComponentFields
{
    // For managing personal / private data
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

    value?: string
    value_type?: DBEnums["data_component_value_type"]
    value_number_display_type?: NumberDisplayType
    value_number_sig_figs?: number
    datetime_range_start?: Date
    datetime_range_end?: Date
    datetime_repeat_every?: DatetimeRangeRepeatEvery
    units?: string
    // Dimension IDs & version numbers parsed from format: `5678v2`
    dimension_ids?: IdAndVersion[]
    // // Not implementing yet until we get more use cases to check it against.
    // // For now we'll add these to the bottom of the description and when it's
    // // clearer what format of display, functionality (queries to make regarding
    // // references) and the corresponding data structure that is needed then
    // // we'll add references then.
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
