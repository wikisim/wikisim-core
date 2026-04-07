import type { DataComponent, DataComponentsByIdo, DataComponentsByIdv } from "../interface"


export function data_components_by_idv(components: DataComponent[] = []): DataComponentsByIdv
{
    const map: Record<string, DataComponent> = {}
    for (const component of components)
    {
        map[component.id.to_str()] = component
    }

    return map
}


export function data_components_by_ido(components: DataComponent[] = []): DataComponentsByIdo
{
    const map: Record<number, DataComponent> = {}
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
