import { Database } from "../supabase/interface"
import { IdAndVersion } from "./id"


type DBEnums = Database["public"]["Enums"]

export type YesNoMaybe = "yes" | "no" | "maybe"

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
    value_type?: DBEnums["data_component_value_type"]
    datetime_range_start?: Date
    datetime_range_end?: Date
    datetime_repeat_every?: DBEnums["data_component_datetime_repeat_every"]
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

    // Derived properties for managing versions
    version_is_current: YesNoMaybe
    // Meta data
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
