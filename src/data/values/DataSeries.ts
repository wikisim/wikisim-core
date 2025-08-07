export interface IDataSeries<V, I, IM>
{
    get(index: I): V | undefined
    get_multiple(index: IM): V[]
    get_entries(): V[]
    // set(index: I, value: V): void
    clone(): DataSeries<V, I, IM>
}


export class DataSeries<V, I, IM=I> implements IDataSeries<V, I, IM>
{
    private data: V[]
    private get_index: (key: I | IM) => number | number[]

    constructor(initial_data: V[], get_index: ((key: I | IM) => number | number[]) = (key: I | IM) => key as unknown as number)
    {
        this.data = [...initial_data]
        this.get_index = get_index
    }

    get(index: I): V | undefined
    {
        const mapped_index = this.get_index(index)
        if (Array.isArray(mapped_index)) throw new Error("get method does not support multiple indices")
        return this.data[mapped_index]
    }

    get_multiple(indices: IM): V[]
    {
        const mapped_indices = this.get_index(indices)
        if (!Array.isArray(mapped_indices)) throw new Error("get_multiple expects multiple indices")
        return mapped_indices.map(i => this.data[i]!)
    }

    get_entries(): V[]
    {
        return [...this.data]
    }

    // set(index: I, value: V): void
    // {
    //     this.data.set(index, value)
    // }

    clone(): DataSeries<V, I, IM>
    {
        return new DataSeries(this.get_entries())
    }
}
