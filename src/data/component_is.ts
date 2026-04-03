import { DataComponent, NewDataComponent } from "./interface"


/**
 * This does not guarantee that it is valid, i.e. subject_id and or according_to_id
 * may reference a non-existent component.
 */
export function component_is_an_alternative(component: DataComponent | NewDataComponent | undefined | null): component is ((DataComponent | NewDataComponent) & { subject_id: number, according_to_id: number })
{
    return component?.subject_id !== undefined && component.according_to_id !== undefined
}


export function component_is_number(component: DataComponent | NewDataComponent | undefined | null): boolean
{
    if (!component) return false
    return component.value_type === "number" || component.value_type === undefined
}
