import { IIndexManager } from "./DataSeries"
import { DatetimeRange } from "./DatetimeRange"
import { ILatLon, LatLonDataSeries } from "./LatLon"


export type DatetimeRangeLatLonKey = { datetime_ms: number, lat_lon: ILatLon }
export type DatetimeRangeLatLonMultipleKeys = { datetime_ms: number, lat_lon?: undefined } | { datetime_ms?: undefined, lat_lon: ILatLon }

export function factory_IndexManager_for_datetime_range_lat_lon (datetime_range: DatetimeRange, lat_lon_series: LatLonDataSeries, lat_lon_first: boolean = true): IIndexManager<DatetimeRangeLatLonKey, DatetimeRangeLatLonMultipleKeys>
{
    const validate = (data_count: number) =>
    {
        const errors: string[] = []

        if (data_count % datetime_range.size() !== 0)
        {
            errors.push("DataSeries length must be a multiple of the datetime range size")
        }
        if (data_count % lat_lon_series.size() !== 0)
        {
            errors.push("DataSeries length must be a multiple of the lat_lon series size")
        }

        return errors
    }


    let get_index = ({ datetime_ms, lat_lon }: DatetimeRangeLatLonKey | DatetimeRangeLatLonMultipleKeys): number | number[] | { start: number, end: number } =>
    {
        if (datetime_ms === undefined)
        {
            const lat_lon_index = lat_lon_series.get_index_of(lat_lon)
            const lat_lon_series_size = lat_lon_series.size()
            // Might be more perfomant to use a generator here as we
            // don't need the datetime_range entries themselves just
            // their indices
            const time_stamp_indicies = datetime_range.get_time_stamps().map((_, index) => index)
            return time_stamp_indicies.map(i => (i * lat_lon_series_size) + lat_lon_index)
        }

        const date_index = datetime_range.get_index_of(datetime_ms)
        if (lat_lon === undefined)
        {
            const lat_lon_series_size = lat_lon_series.size()
            const lat_lon_index_offset = date_index * lat_lon_series_size
            return { start: lat_lon_index_offset, end: lat_lon_index_offset + lat_lon_series_size }
        }
        else
        {
            const lat_lon_index = lat_lon_series.get_index_of(lat_lon)
            return date_index * lat_lon_series.size() + lat_lon_index
        }
    }

    if (lat_lon_first) return { validate, get_index }


    get_index = ({ datetime_ms, lat_lon }: DatetimeRangeLatLonKey | DatetimeRangeLatLonMultipleKeys): number | number[] | { start: number, end: number } =>
    {
        if (datetime_ms === undefined)
        {
            const lat_lon_index = lat_lon_series.get_index_of(lat_lon)
            const datetime_range_size = datetime_range.size()
            const lat_lon_index_offset = lat_lon_index * datetime_range_size
            return { start: lat_lon_index_offset, end: lat_lon_index_offset + datetime_range_size }
        }

        const date_index = datetime_range.get_index_of(datetime_ms)
        if (lat_lon === undefined)
        {
            const datetime_range_size = datetime_range.size()
            // Might be more perfomant to use a generator here as we
            // don't need the lat_lon entries themselves just their indices
            const lat_lon_indices = lat_lon_series.get_entries().map((_, index) => index)
            return lat_lon_indices.map(i => (i * datetime_range_size) + date_index)
        }
        else
        {
            const lat_lon_index = lat_lon_series.get_index_of(lat_lon)
            return lat_lon_index * datetime_range.size() + date_index
        }
    }

    return { validate, get_index }
}
