import { DataComponent } from "./interface.ts"


export function to_javascript_identifier(component: Pick<DataComponent, "id" | "plain_title">): string
{
    const safe_title = component.plain_title//.toLowerCase()
        .replace(/[^a-z0-9_]+/gi, "_")  // Replace non-alphanumeric characters with underscores
        .replace(/^_+/g, "")  // Trim leading underscores
        .replace(/_+$/g, "")  // Trim trailing underscores
        .replace(/(_)_+/g, "$1")  // Replace multiple underscores with single
        .slice(0, 50)  // Limit to 50 characters

    return safe_title || component.id.to_javascript_str()
}
