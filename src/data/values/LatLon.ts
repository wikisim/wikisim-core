
export interface ILatLonOnly
{
    lat: number
    lon: number
}

export interface ILatLon extends ILatLonOnly
{
    lat: number
    lon: number
    to_str(): string
    from_str(str: string): ILatLon
}


export class LatLon implements ILatLon
{
    static from_str(str: string): ILatLon
    {
        const [lat_str, lon_str] = str.split(",")
        if (!lat_str || !lon_str) throw new Error(`Invalid LatLon string: ${str}`)
        return new LatLon({ lat: parseFloat(lat_str), lon: parseFloat(lon_str) })
    }

    lat: number
    lon: number

    constructor(args: { lat: number, lon: number })
    {
        this.lat = args.lat
        this.lon = args.lon
    }

    clone(): LatLon
    {
        return new LatLon(this)
    }

    private str: string | null = null
    to_str(): string
    {
        if (this.str === null) this.str = `${this.lat},${this.lon}`
        return this.str
    }

    from_str(str: string): ILatLon
    {
        return LatLon.from_str(str)
    }
}

export const LAT_LON_SERIES_ERRORS = {
    LAT_LON_NOT_IN_DATA_SERIES: "LatLon not in DataSeries.",
}

export class LatLonDataSeries
{
    private data: ILatLon[]
    private index: Map<string, number> = new Map()

    constructor(initial_data: ILatLon[])
    {
        this.data = [...initial_data]
        Object.freeze(this.data) // Ensure data is immutable
        initial_data.forEach((lat_lon, index) => {
            this.index.set(lat_lon.to_str(), index)
        })
    }

    size(): number
    {
        return this.data.length
    }

    get_entries(): ILatLon[]
    {
        return this.data // Can return as is because data is shallow frozen
    }

    get_index_of(lat_lon: ILatLonOnly): number
    {
        const index = this.index.get(`${lat_lon.lat},${lat_lon.lon}`)
        if (index === undefined) throw new Error(LAT_LON_SERIES_ERRORS.LAT_LON_NOT_IN_DATA_SERIES + `: ${lat_lon.lat},${lat_lon.lon}`)
        return index
    }
}
