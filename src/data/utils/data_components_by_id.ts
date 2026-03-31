import type { DataComponent, DataComponentsById } from "../interface"


export function data_components_by_id(components: DataComponent[] = []): DataComponentsById
{
    const map: Record<string, DataComponent> = {}
    for (const component of components)
    {
        map[component.id.as_IdOnly().to_str()] = component

        const existing = map[component.id.to_str()]
        // Always keep the latest version of each component in the map
        if (!existing) map[component.id.to_str()] = component
        else if (existing.id.version !== component.id.version)
        {
            throw new Error(`Multiple versions of component with id ${component.id.id} found in data. Please ensure only the latest version is included. Found versions: ${existing.id.to_str()} and ${component.id.to_str()}`)
        }
    }

    return map
}
