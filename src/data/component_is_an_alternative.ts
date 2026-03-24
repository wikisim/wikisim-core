import { DataComponent, NewDataComponent } from "./interface"


/**
 * This does not guarantee that it is valid
 */
export function component_is_an_alternative(component: DataComponent | NewDataComponent): boolean
{
    return !!(component.subject_id && component.according_to_id)
}
