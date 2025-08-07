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
    private get_index: (key: I | IM) => number | number[] | { start: number, end: number }

    constructor(initial_data: V[], get_index: ((key: I | IM) => number | number[] | { start: number, end: number }) = (key: I | IM) => key as unknown as number)
    {
        this.data = [...initial_data]
        Object.freeze(this.data) // Ensure data is immutable
        this.get_index = get_index
    }

    get(index: I): V | undefined
    {
        const mapped_index = this.get_index(index)
        if (typeof mapped_index !== "number") throw new Error("get method does not support multiple indices")
        return this.data[mapped_index]
    }

    get_multiple(indices: IM): V[]
    {
        const mapped_indices = this.get_index(indices)
        if (typeof mapped_indices === "number") throw new Error("get_multiple expects multiple indices")
        if (Array.isArray(mapped_indices)) return mapped_indices.map(i => this.data[i]!)
        else
        {
            const { start, end } = mapped_indices
            return this.data.slice(start, end)
        }
    }

    get_entries(): V[]
    {
        return this.data
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
