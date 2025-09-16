import type { DataComponentAsJSON, NewDataComponentAsJSON } from "../supabase/index.ts"
import type { Json } from "../supabase/interface.ts"
import { IdAndVersion, parse_id, TempId } from "./id.ts"
import {
    is_data_component,
    type DataComponent,
    type FunctionArgument,
    type NewDataComponent,
    type Scenario
} from "./interface.ts"
import {
    validate_function_arguments_from_json,
    validate_scenarios_from_json,
} from "./validate_fields.ts"


export function flatten_new_or_data_component_to_json(data_component: NewDataComponent): NewDataComponentAsJSON
export function flatten_new_or_data_component_to_json(data_component: DataComponent): DataComponentAsJSON
export function flatten_new_or_data_component_to_json(data_component: NewDataComponent | DataComponent): NewDataComponentAsJSON | DataComponentAsJSON
export function flatten_new_or_data_component_to_json(data_component: NewDataComponent | DataComponent): NewDataComponentAsJSON | DataComponentAsJSON
{
    return is_data_component(data_component)
        ? flatten_data_component_to_json(data_component)
        : flatten_new_data_component_to_json(data_component)
}


export function flatten_new_data_component_to_json(data_component: NewDataComponent): NewDataComponentAsJSON
{
    return {
        temporary_id: data_component.temporary_id.to_str(),

        owner_id: data_component.owner_id ?? null,

        editor_id: data_component.editor_id,
        created_at: data_component.created_at.toISOString(),
        comment: data_component.comment ?? null,
        bytes_changed: data_component.bytes_changed,
        version_type: data_component.version_type ?? null,
        version_rolled_back_to: data_component.version_rolled_back_to ?? null,

        title: data_component.title,
        description: data_component.description,
        label_ids: data_component.label_ids ?? null,

        input_value: data_component.input_value ?? null,
        value_type: data_component.value_type ?? null,
        value_number_display_type: data_component.value_number_display_type ?? null,
        value_number_sig_figs: data_component.value_number_sig_figs ?? null,
        datetime_range_start: data_component.datetime_range_start
            ? data_component.datetime_range_start.toISOString()
            : null,
        datetime_range_end: data_component.datetime_range_end
            ? data_component.datetime_range_end.toISOString()
            : null,
        datetime_repeat_every: data_component.datetime_repeat_every ?? null,
        units: data_component.units ?? null,
        dimension_ids: data_component.dimension_ids
            ? data_component.dimension_ids.map(d => d.to_str())
            : null,
        function_arguments: data_component.function_arguments
            ? data_component.function_arguments.map(({ id: _, ...args }) => args) as Json
            : null,
        scenarios: data_component.scenarios
            // deno-lint-ignore no-explicit-any
            ? data_component.scenarios.map(({ id: _, ...args }) => args as any as Json)
            : null,

        // Will be partially set by the server-side (edge function), i.e. when
        // value_type === "function" this will be set on edge function but not
        // when value_type === "number" (as this would require executing
        // user javascript inside the edge functions).
        result_value: data_component.result_value ?? null,

        // Will be set by the server-side (edge function)
        plain_title: "",
        plain_description: "",

        test_run_id: data_component.test_run_id ?? null,
    }
}


export function flatten_data_component_to_json(data_component: DataComponent): DataComponentAsJSON
{
    const flattened_as_new = flatten_new_data_component_to_json({ ...data_component, temporary_id: new TempId() })
    const { temporary_id: _, ...rest } = flattened_as_new

    return {
        ...rest,
        id: data_component.id.id,
        version_number: data_component.id.version,
    }
}



export function hydrate_data_component_from_json(row: DataComponentAsJSON): DataComponent
export function hydrate_data_component_from_json(row: NewDataComponentAsJSON): NewDataComponent
export function hydrate_data_component_from_json(row: DataComponentAsJSON | NewDataComponentAsJSON): DataComponent | NewDataComponent
export function hydrate_data_component_from_json(row: DataComponentAsJSON | NewDataComponentAsJSON): DataComponent | NewDataComponent
{
    const core = {
        owner_id: row.owner_id ?? undefined,

        editor_id: row.editor_id,
        created_at: new Date(row.created_at),
        comment: row.comment ?? undefined,
        bytes_changed: row.bytes_changed,
        version_type: row.version_type ?? undefined,
        version_rolled_back_to: row.version_rolled_back_to ?? undefined,

        title: row.title,
        description: row.description,
        label_ids: row.label_ids ?? undefined,

        input_value: row.input_value ?? undefined,
        result_value: row.result_value ?? undefined,
        value_type: row.value_type ?? undefined,
        value_number_display_type: row.value_number_display_type ?? undefined,
        value_number_sig_figs: row.value_number_sig_figs ?? undefined,
        datetime_range_start: convert_datetime(row.datetime_range_start),
        datetime_range_end: convert_datetime(row.datetime_range_end),
        datetime_repeat_every: row.datetime_repeat_every ?? undefined,
        units: row.units ?? undefined,
        dimension_ids: row.dimension_ids ? row.dimension_ids.map(id => parse_id(id, true)) : undefined,
        function_arguments: hydrate_function_arguments(row),
        scenarios: hydrate_scenarios(row),

        plain_title: row.plain_title,
        plain_description: row.plain_description,
    }

    if ("temporary_id" in row)
    {
        return {
            temporary_id: new TempId(row.temporary_id),
            ...core,
            test_run_id: row.test_run_id ?? undefined,
        }
    }
    else
    {
        return {
            id: new IdAndVersion(row.id, row.version_number),
            ...core,
            test_run_id: row.test_run_id ?? undefined,
        }
    }
}


function hydrate_function_arguments(row: NewDataComponentAsJSON | DataComponentAsJSON): FunctionArgument[] | undefined
{
    const function_arguments = validate_function_arguments_from_json(row.function_arguments)
    return function_arguments?.map((arg, index) => ({ id: index, ...arg }) )
}


function hydrate_scenarios(row: NewDataComponentAsJSON | DataComponentAsJSON): Scenario[] | undefined
{
    const scenarios = validate_scenarios_from_json(row.scenarios)
    return scenarios?.map((arg, index) => ({ id: index, ...arg }) )
}


function convert_datetime (datetime: string | null): Date | undefined
{
    return datetime ? new Date(datetime) : undefined
}
