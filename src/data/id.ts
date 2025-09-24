import { ERRORS } from "../errors.ts"


export class IdOnly
{
    id: number
    constructor(id: number | string)
    {
        const parsed_id = typeof id === "string" ? parseInt(id, 10) : id
        if (isNaN(parsed_id))
        {
            throw new Error(`id must be a valid number but got "${id}"`)
        }
        this.id = parsed_id
    }

    to_str(): string { return `${this.id}` }

    to_str_without_version(): string { return `${this.id}` }

    add_version(v: number): IdAndVersion { return new IdAndVersion(this.id, v) }

    // This is used to differentiate between IdOnly and IdAndVersion
    _type_discriminator: string = "IdOnly"
}


export class IdAndVersion
{
    static
    from_str(str: string): IdAndVersion
    {
        return parse_id(str, true)
    }

    id: number
    version: number
    constructor(id: number | string, version: number | string)
    {
        const parsed_id = typeof id === "string" ? parseInt(id, 10) : id
        const parsed_version = typeof version === "string" ? parseInt(version, 10) : version
        if (isNaN(parsed_id))
        {
            throw new Error(`id must be a valid number but got "${id}"`)
        }
        if (isNaN(parsed_version) || parsed_version < 1)
        {
            throw new Error(`version must be a valid number >= 1 but got "${version}"`)
        }
        this.id = parsed_id
        this.version = parsed_version
    }

    as_IdOnly(): IdOnly
    {
        return new IdOnly(this.id)
    }

    to_str(): string { return `${this.id}v${this.version}` }

    to_str_without_version(): string { return `${this.id}` }

    // The replacing of - with _ is to allow for negative ids in tests
    to_javascript_str(): string { return "d" + this.to_str().replace("-", "_") }
}


export class TempId
{
    temp_id: string
    constructor(temp_id?: string)
    {
        if (temp_id && !temp_id.startsWith("temp_id_"))
        {
            throw new Error(`Temporary ID must start with "temp_id_" but got "${temp_id}"`)
        }
        this.temp_id = temp_id || `temp_id_${new Date().getTime()}`
    }

    to_str(): string { return this.temp_id }
}


export type IdAndMaybeVersion = IdAndVersion | IdOnly

export function parse_id(instance: string | IdAndMaybeVersion, enforce_version?: false): IdAndMaybeVersion
export function parse_id(instance: string | IdAndMaybeVersion, enforce_version?: true): IdAndVersion
export function parse_id(instance: string | IdAndMaybeVersion, enforce_version?: boolean): IdAndMaybeVersion
{
    let instance_id: IdAndMaybeVersion
    if (instance instanceof IdOnly || instance instanceof IdAndVersion)
    {
        instance_id = instance
    }
    else
    {
        const [id, version] = instance.includes("v")
            ? instance.split("v")
            : [instance, undefined]

        instance_id = version !== undefined
            ? new IdAndVersion(id, version)
            : new IdOnly(id)
    }

    if (enforce_version && instance_id instanceof IdOnly)
    {
        throw new Error(`DataComponentId string must include version: ${instance}`)
    }

    return instance_id
}


export function is_id_only(id: IdAndMaybeVersion): id is IdOnly
{
    return id instanceof IdOnly
}

export function is_id_and_version(id: IdAndMaybeVersion): id is IdAndVersion
{
    return id instanceof IdAndVersion
}

export function all_are_id_only(ids: IdAndMaybeVersion[]): ids is IdOnly[]
{
    return ids.every(is_id_only)
}

export function all_are_id_and_version(ids: IdAndMaybeVersion[]): ids is IdAndVersion[]
{
    return ids.every(is_id_and_version)
}


// The `_?` in the regex is to allow for negative ids in tests
export const REGEX_MATCH_IDS = /(?<=^|[^A-Za-z0-9_])d_?(\d+)v(\d+)(?=[^A-Za-z0-9_]|$)/gim
export function extract_ids_from_text(text: string): IdAndVersion[]
{
    const ids: IdAndVersion[] = []
    for (const match of text.matchAll(REGEX_MATCH_IDS))
    {
        const id = parseInt(match[1]!, 10)
        const version = parseInt(match[2]!, 10)
        ids.push(new IdAndVersion(id, version))
    }

    return ids
}


export class OrderedUniqueIdAndVersionList
{
    private items: IdAndVersion[] = []
    private id_set: Set<string> = new Set()
    private custom_error_message_when_id_only: string | null = null

    constructor(custom_error_message_when_id_only?: string)
    {
        this.custom_error_message_when_id_only = custom_error_message_when_id_only || null
    }

    add(item: IdAndVersion | string)
    {
        const key = typeof item === "string" ? item : item.to_str()
        if (this.id_set.has(key)) return

        const item_as_id = typeof item === "string" ? parse_id(item, false) : item
        if (item_as_id instanceof IdOnly)
        {
            const error_message = this.custom_error_message_when_id_only
                ? this.custom_error_message_when_id_only
                : ERRORS.ERR35.message

            throw new Error(`${error_message} ${item}`)
        }
        this.items.push(item_as_id)
        this.id_set.add(key)
    }

    add_multiple(items: IdAndVersion[])
    {
        for (const item of items)
        {
            this.add(item)
        }
    }

    get_all(): IdAndVersion[]
    {
        return this.items
    }
}
