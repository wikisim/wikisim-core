import { DataComponent } from "./interface"


export function to_javascript_reference(component: DataComponent): string
{
    let safe_title = component.title.toLowerCase()
        .replace(/[^a-z0-9_]+/g, "_")
        .replace(/^_+/g, "")
        .replace(/(_)_+/g, "$1")
        .slice(0, 30) // Limit to 30 characters

    safe_title = safe_title ? `_${safe_title}` : ""

    return `d${component.id.to_str()}${safe_title}`
}
