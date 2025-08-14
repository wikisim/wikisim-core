
export interface IIndexManager<I, IndexMultiple=I>
{
    // Optional validation function for the data
    validate?: (data_count: number) => string[]
    get_index: (key: I | IndexMultiple) => number | number[] | { start: number, end: number }
}

export interface IDataSeries<I, V, IM=I>
{
    get(index: I): V | undefined
    get_multiple(index: IM): V[]
    get_entries(): V[]
}


export class DataSeries<I, V, IndexMultiple=I> implements IDataSeries<I, V, IndexMultiple>
{
    private data: V[]
    private index_manager: IIndexManager<I, IndexMultiple>

    constructor(initial_data: V[], index_manager: IIndexManager<I, IndexMultiple>)
    {
        this.data = [...initial_data]
        Object.freeze(this.data) // Ensure data is immutable

        this.index_manager = index_manager
        if (this.index_manager.validate)
        {
            const errors = this.index_manager.validate(this.data.length)
            if (errors.length > 0) throw new Error("DataSeries validation failed: \n * " + errors.join("\n * "))
        }
    }

    get(index: I): V | undefined
    {
        const mapped_index = this.index_manager.get_index(index)

        // Type guard.  Should never happen in practice.
        if (typeof mapped_index !== "number") throw new Error("get method does not support multiple indices")

        return this.data[mapped_index]
    }

    get_multiple(indices: IndexMultiple): V[]
    {
        const mapped_indices = this.index_manager.get_index(indices)

        // Type guard.  Should never happen in practice.
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
}
