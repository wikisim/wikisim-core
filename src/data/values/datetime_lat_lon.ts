import { DatetimeRange } from "./DatetimeRange"
import { ILatLon, LatLonDataSeries } from "./LatLon"



export type DatetimeRangeLatLonKey = { date: Date, lat_lon: ILatLon }
export type DatetimeRangeLatLonMultipleKeys = { date: Date, lat_lon: undefined } | { date: undefined, lat_lon: ILatLon }

export function factory_get_index_for_datetime_range_lat_lon (datetime_range: DatetimeRange, lat_lon_series: LatLonDataSeries, lat_lon_first: boolean = true)
{
    let get_index = ({ date, lat_lon }: DatetimeRangeLatLonKey | DatetimeRangeLatLonMultipleKeys): number | number[] | { start: number, end: number } =>
    {
        if (date === undefined)
        {
            const lat_lon_index = lat_lon_series.get_index_of(lat_lon)
            const lat_lon_series_size = lat_lon_series.size()
            // Might be more perfomant to use a generator here as we
            // don't need the datetime_range entries themselves just
            // their indices
            const time_stamp_indicies = datetime_range.get_time_stamps().map((_, index) => index)
            return time_stamp_indicies.map(i => (i * lat_lon_series_size) + lat_lon_index)
        }

        const date_index = datetime_range.get_index_of(date)
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

    if (lat_lon_first) return get_index


    get_index = ({ date, lat_lon }: DatetimeRangeLatLonKey | DatetimeRangeLatLonMultipleKeys): number | number[] | { start: number, end: number } =>
    {
        if (date === undefined)
        {
            const lat_lon_index = lat_lon_series.get_index_of(lat_lon)
            const datetime_range_size = datetime_range.size()
            const lat_lon_index_offset = lat_lon_index * datetime_range_size
            return { start: lat_lon_index_offset, end: lat_lon_index_offset + datetime_range_size }
        }

        const date_index = datetime_range.get_index_of(date)
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

    return get_index
}
