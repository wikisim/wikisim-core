// TODO: rename this file

import { IdAndVersion, TempId } from "./id"
import { DataComponent, FunctionArgument, NewDataComponent } from "./interface"


export function init_data_component(partial: Partial<DataComponent> = {}, for_testing = false): DataComponent
{
    return {
        id: new IdAndVersion(-1, 1), // Use a negative ID for test data

        owner_id: undefined,

        editor_id: "",
        created_at: new Date(),
        bytes_changed: 0,

        title: "",
        // Use the default values produced by the TipTap editor so that the
        // new form does not show changes to the title and description when none
        // were made.
        description: "<p></p>",

        // value: "",
        // value_type: "number",
        // datetime_range_start: new Date(),
        // datetime_range_end: new Date(),
        // datetime_repeat_every: "day",
        // units: "",
        // dimension_ids: [],

        plain_title: "",
        plain_description: "",

        // Default to current time for test runs
        test_run_id: for_testing ? `test_run_id_${new Date().toISOString()}` : undefined,

        ...partial,
    }
}


export function init_new_data_component(partial: Partial<DataComponent> = {}): NewDataComponent
{
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...rest } = init_data_component(partial)
    return {
        ...rest,
        // Use a temporary ID for draft components
        temporary_id: new TempId(),
    }
}


export function changes_made(component_1: DataComponent | NewDataComponent, component_2: DataComponent | NewDataComponent, compare_meta_fields?: boolean): boolean
{
    const diff = component_1.title !== component_2.title
        || component_1.description !== component_2.description
        || JSON.stringify(component_1.label_ids) !== JSON.stringify(component_2.label_ids)

        || component_1.input_value !== component_2.input_value
        || component_1.result_value !== component_2.result_value
        || component_1.value_type !== component_2.value_type
        || component_1.value_number_display_type !== component_2.value_number_display_type
        || component_1.value_number_sig_figs !== component_2.value_number_sig_figs
        || component_1.datetime_range_start?.getTime() !== component_2.datetime_range_start?.getTime()
        || component_1.datetime_range_end?.getTime() !== component_2.datetime_range_end?.getTime()
        || component_1.datetime_repeat_every !== component_2.datetime_repeat_every
        || component_1.units !== component_2.units
        || JSON.stringify(component_1.dimension_ids) !== JSON.stringify(component_2.dimension_ids)
        || function_arguments_changed(component_1.function_arguments, component_2.function_arguments)
        || scenarios_changed(component_1.scenarios, component_2.scenarios)

    if (diff || !compare_meta_fields) return diff

    return component_1.comment !== component_2.comment
        || component_1.version_type !== component_2.version_type
        || component_1.version_rolled_back_to !== component_2.version_rolled_back_to
        || component_1.bytes_changed !== component_2.bytes_changed
        // || component_1.test_run_id !== component_2.test_run_id
        // || component_1.editor_id !== component_2.editor_id
        // || component_1.created_at.getTime() !== component_2.created_at.getTime()

        // We do not allow changing owner_id at the moment.
        // || component_1.owner_id !== component_2.owner_id
}


function function_arguments_changed(args1: FunctionArgument[] = [], args2: FunctionArgument[] = []): boolean
{
    if (args1.length !== args2.length) return true

    const args1_sans_id = args1.map(arg => ({ ...arg, id: null }))
    const args2_sans_id = args2.map(arg => ({ ...arg, id: null }))

    return JSON.stringify(args1_sans_id) !== JSON.stringify(args2_sans_id)
}


function scenarios_changed(scenarios1: DataComponent["scenarios"] = [], scenarios2: DataComponent["scenarios"] = []): boolean
{
    if (scenarios1.length !== scenarios2.length) return true

    const scenarios1_sans_id = scenarios1.map(scenario => ({ ...scenario, id: null }))
    const scenarios2_sans_id = scenarios2.map(scenario => ({ ...scenario, id: null }))

    return JSON.stringify(scenarios1_sans_id) !== JSON.stringify(scenarios2_sans_id)
}
