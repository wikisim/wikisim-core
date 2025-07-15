

export interface IdOnly
{
    id: number
    version: null
    to_str(): string
}

export interface IdAndVersion
{
    id: number
    version: number
    to_str(): string
}



export class IdAndMaybeVersion
{
    constructor(
        public id: number,
        public version: number | null
    ) {}

    to_str(): string
    {
        return this.version === null
            ? `${this.id}`
            : `${this.id}v${this.version}`
    }

    static from_str(instance: string | IdAndMaybeVersion, enforce_version?: false): IdOnly | IdAndVersion
    static from_str(instance: string | IdAndMaybeVersion, enforce_version?: true): IdAndVersion
    static from_str(instance: string | IdAndMaybeVersion, enforce_version?: boolean): IdOnly | IdAndVersion
    {
        let instance_id: IdAndMaybeVersion
        if (instance instanceof IdAndMaybeVersion)
        {
            instance_id = instance
        }
        else
        {
            const [id, version] = instance.includes("v")
                ? instance.split("v").map(Number)
                : [Number(instance), undefined]

            if (isNaN(id))
            {
                throw new Error(`Invalid id in DataComponentId string: ${instance}`)
            }
            if (version !== undefined && isNaN(version))
            {
                throw new Error(`Invalid version in DataComponentId string: ${instance}`)
            }

            instance_id = new IdAndMaybeVersion(id, version ?? null)
        }

        if (enforce_version && instance_id.version === null)
        {
            throw new Error(`DataComponentId string must include version: ${instance}`)
        }

        return instance_id.version === null
            ? instance_id as IdOnly
            : instance_id as IdAndVersion
    }
}
