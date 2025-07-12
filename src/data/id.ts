

export interface DataComponentId
{
    id: number
    version?: undefined
    to_str(): string
}

export interface DataComponentIdAndVersion
{
    id: number
    version: number
    to_str(): string
}



export class DataComponentIdMaybeVersion
{
    constructor(
        public id: number,
        public version?: number
    ) {}

    to_str(allow_no_version?: boolean): string
    {
        if (this.version === undefined)
        {
            if (allow_no_version) return `${this.id}`
            else throw new Error(`Version is not defined for DataComponentId "${this.id}"`)
        }
        return `${this.id}v${this.version}`
    }

    static from_str(str: string | DataComponentIdMaybeVersion): DataComponentIdMaybeVersion
    {
        if (str instanceof DataComponentIdMaybeVersion)
        {
            return str
        }

        const [id, version] = str.includes("v")
            ? str.split("v").map(Number)
            : [Number(str), undefined]

        if (id === undefined || isNaN(id))
        {
            throw new Error(`Invalid id in DataComponentId string: ${str}`)
        }
        if (version !== undefined && isNaN(version))
        {
            throw new Error(`Invalid version in DataComponentId string: ${str}`)
        }

        return new DataComponentIdMaybeVersion(id, version)
    }
}
