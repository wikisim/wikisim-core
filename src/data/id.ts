

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
