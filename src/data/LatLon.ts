
export interface ILatLon
{
    lat: number
    lon: number
}


export class LatLon implements ILatLon
{
    lat: number
    lon: number

    constructor(lat: number, lon: number)
    {
        this.lat = lat
        this.lon = lon
    }

    clone(): LatLon
    {
        return new LatLon(this.lat, this.lon)
    }
}


export class LatLonDataSeries
{
    private data: ILatLon[]
    private index: Map<string, number> = new Map()

    constructor(initial_data: ILatLon[])
    {
        this.data = [...initial_data]
        initial_data.forEach((lat_lon, index) => {
            this.index.set(`${lat_lon.lat},${lat_lon.lon}`, index)
        })
    }

    get_index_of(lat_lon: ILatLon): number
    {
        return this.index.get(`${lat_lon.lat},${lat_lon.lon}`) ?? -1
    }
}
