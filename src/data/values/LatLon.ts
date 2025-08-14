
export interface ILatLon
{
    lat: number
    lon: number
}


export class LatLon implements ILatLon
{
    static from_str(str: string): ILatLon
    {
        const [lat_str, lon_str] = str.split(",")
        if (!lat_str || !lon_str) throw new Error(`Invalid LatLon string: ${str}`)
        return new LatLon({ lat: parseFloat(lat_str), lon: parseFloat(lon_str) })
    }

    static to_str(lat_lon: ILatLon): string
    {
        return `${lat_lon.lat},${lat_lon.lon}`
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
            this.index.set(LatLon.to_str(lat_lon), index)
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

    get_index_of(lat_lon: ILatLon): number
    {
        const index = this.index.get(LatLon.to_str(lat_lon))
        if (index === undefined) throw new Error(LAT_LON_SERIES_ERRORS.LAT_LON_NOT_IN_DATA_SERIES + `: ${LatLon.to_str(lat_lon)}`)
        return index
    }
}
