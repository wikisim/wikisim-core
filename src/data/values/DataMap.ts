export interface IDataMap<I, V>
{
    get(index: I): V | undefined
    get_entries(): [I, V][]
    set(index: I, value: V): void
    clone(): IDataMap<I, V>
}


export class DataMap<I, V> implements IDataMap<I, V>
{
    private data: Record<string, V>
    private get_key: (index: I) => string
    private get_index: (key: string) => I

    constructor(initial_data: [I, V][], get_key: (index: I) => string, get_index: (key: string) => I)
    {
        this.data = initial_data.reduce((acc, [key, value]) => {
            acc[get_key(key)] = value
            return acc
        }, {} as Record<string, V>)
        this.get_key = get_key
        this.get_index = get_index
    }

    get(index: I): V | undefined
    {
        const key = this.get_key(index)
        const v: V | undefined = this.data[key]
        return v
    }

    get_entries(): [I, V][]
    {
        return Object.entries(this.data).map(([key, value]) => [this.get_index(key), value] as [I, V])
    }

    set(index: I, value: V): void
    {
        const key = this.get_key(index)
        this.data[key] = value
    }

    clone(): IDataMap<I, V>
    {
        return new DataMap<I, V>(
            this.get_entries(),
            this.get_key,
            this.get_index
        )
    }
}
