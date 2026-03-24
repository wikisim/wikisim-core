import { DataComponent, NewDataComponent } from "./interface"


/**
 * This does not guarantee that it is valid
 */
export function component_is_an_alternative(component: DataComponent | NewDataComponent): component is ((DataComponent | NewDataComponent) & { subject_id: number, according_to_id: number })
{
    return !!(component.subject_id && component.according_to_id)
}
