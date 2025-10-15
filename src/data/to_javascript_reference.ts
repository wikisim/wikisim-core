import { DataComponent } from "./interface.ts"


export function to_javascript_reference(component: DataComponent): string
{
    let safe_title = component.title//.toLowerCase()
        .replace(/[^a-z0-9_]+/gi, "_")  // Replace non-alphanumeric characters with underscores
        .replace(/^_+/g, "")  // Trim leading underscores
        .replace(/_+$/g, "")  // Trim trailing underscores
        .replace(/(_)_+/g, "$1")  // Replace multiple underscores with single
        .slice(0, 30)  // Limit to 30 characters

    return safe_title || `d${component.id.to_str()}`
}
