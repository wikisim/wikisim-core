import { DatetimeRange } from "./DatetimeRange"
import { ILatLon, LatLonDataSeries } from "./LatLon"



export type DatetimeRangeLatLonKey = { date: Date, lat_lon: ILatLon }
export type DatetimeRangeLatLonMultipleKeys = { date: Date, lat_lon: undefined } | { date: undefined, lat_lon: ILatLon }

export function factory_get_index (datetime_range: DatetimeRange, lat_lon_series: LatLonDataSeries)
{
    const get_index = ({ date, lat_lon }: DatetimeRangeLatLonKey | DatetimeRangeLatLonMultipleKeys): number | number[] =>
    {
        if (date === undefined)
        {
            const lat_lon_index = lat_lon_series.get_index_of(lat_lon)
            const lat_lon_index_offset = lat_lon_index * datetime_range.size()
            // Might be more perfomant to use a generator here as we
            // don't need the datetime_range entries themselves just
            // their indices
            const time_stamps = datetime_range.get_time_stamps()
            return time_stamps.map((_, i) => lat_lon_index_offset + i)
        }

        const date_index = datetime_range.get_index_of(date)
        if (lat_lon === undefined)
        {
            const datetime_range_size = datetime_range.size()
            // Might be more perfomant to use a generator here as we
            // don't need the lat_lon entries themselves just their indices
            const lat_lon_indices = lat_lon_series.get_entries().map((_, index) => index)
            return lat_lon_indices.map(lat_lon_index => (lat_lon_index * datetime_range_size) + date_index)
        }
        else
        {
            const lat_lon_index = lat_lon_series.get_index_of(lat_lon)
            return lat_lon_index * datetime_range.size() + date_index
        }
    }

    return get_index
}
