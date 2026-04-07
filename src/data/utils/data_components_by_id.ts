import type { DataComponent, DataComponentsByIdo, DataComponentsByIdv } from "../interface"


export function data_components_by_idv<C extends DataComponent>(components: C[] = []): DataComponentsByIdv<C>
{
    const map: Record<string, C> = {}
    for (const component of components)
    {
        map[component.id.to_str()] = component
    }

    return map
}


export function data_components_by_ido<C extends DataComponent>(components: C[] = []): DataComponentsByIdo<C>
{
    const map: Record<number, C> = {}
    for (const component of components)
    {
        const existing = map[component.id.id]
        if (!existing || existing.id.version < component.id.version)
        {
            map[component.id.id] = component
        }
    }

    return map
}
