export interface IDataSeries<I, V, IM=I>
{
    get(index: I): V | undefined
    get_multiple(index: IM): V[]
    get_entries(): V[]
    clone(): IDataSeries<I, V, IM>
}


export class DataSeries<I, V, IndexMultiple=I> implements IDataSeries<I, V, IndexMultiple>
{
    private data: V[]
    private get_index: (key: I | IndexMultiple) => number | number[] | { start: number, end: number }

    constructor(initial_data: V[], get_index: ((key: I | IndexMultiple) => number | number[] | { start: number, end: number }))
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

    get_multiple(indices: IndexMultiple): V[]
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

    clone(): DataSeries<I, V, IndexMultiple>
    {
        return new DataSeries(this.get_entries(), this.get_index)
    }
}
