
export interface GenericNode
{
    nodeType: number
    textContent: string | null
    childNodes: ArrayLike<GenericNode>
    tagName?: string
}

export interface GenericDocument
{
    body: GenericNode
}

export interface GenericDOMParser
{
    parseFromString(text: string, mimeType: string): GenericDocument
}
