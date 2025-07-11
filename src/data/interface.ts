import { Database } from "../supabase/interface"


type DBEnums = Database["public"]["Enums"]


export interface DataComponent
{
    id: number

    // For managing versions
    version_number: number
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
    // Default to "number" if not set in DB
    value_type?: DBEnums["data_component_value_type"]
    datetime_range_start?: Date
    datetime_range_end?: Date
    datetime_repeat_every?: DBEnums["data_component_datetime_repeat_every"]
    units?: string
    // Dimension IDs & version numbers parsed from format: `5678#2`
    dimension_ids?: { id: number, version: number }[]
    // // Not implementing yet until we get more use cases to check it against.
    // // For now we'll add these to the bottom of the description and when it's
    // // clearer what format of display, functionality (queries to make regarding
    // // references) and the corresponding data structure that is needed then
    // // we'll add references then.
    // references?: string[]

    // For indexing and searching
    plain_title: string
    plain_description: string

    // Derived properties for managing versions
    version_is_current: boolean
    // meta data
    version_requires_save: boolean

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


export type DBDataComponentRow = Database["public"]["Tables"]["data_components"]["Row"]
export type DBDataComponentInsert = Database["public"]["Tables"]["data_components"]["Insert"]
export type DBDataComponentUpdate = Database["public"]["Tables"]["data_components"]["Update"]
