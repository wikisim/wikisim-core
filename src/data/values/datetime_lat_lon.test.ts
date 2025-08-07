import { expect } from "chai"
import { describe } from "mocha"

import { DataSeries } from "./DataSeries"
import { DatetimeRangeLatLonKey, DatetimeRangeLatLonMultipleKeys, factory_get_index_for_datetime_range_lat_lon } from "./datetime_lat_lon"
import { DatetimeRange } from "./DatetimeRange"
import { LatLonDataSeries } from "./LatLon"


describe("factory_get_index method", () =>
{
    const datetime_range = new DatetimeRange(
        new Date("2023-01-01T00:00:00Z"),
        new Date("2023-01-05T00:00:00Z"),
        "day"
    )

    const lat_lon_series = new LatLonDataSeries([
        { lat: 10, lon: 20 },
        { lat: 30, lon: 40 },
        { lat: 50, lon: 60 },
    ])


    it("should handle datetime_range and lat_lon", () =>
    {
        // One-dimensional DataSeries of 4 datetimes x 3 lat/lon pairs
        const initial_data = [
            0, 1, 2, 3,
            4, 5, 6, 7,
            8, 9, 10, 11,
        ]

        tests(initial_data, false)
    })

    it("should handle lat_lon and datetime_range (opposite order to previous test)", () =>
    {
        // One-dimensional DataSeries of 3 lat/lon pairs x 4 datetimes
        const initial_data = [
            0, 4, 8,
            1, 5, 9,
            2, 6, 10,
            3, 7, 11,
        ]

        tests(initial_data, true)
    })


    function tests(initial_data: number[], lat_lon_first: boolean)
    {
        const get_index = factory_get_index_for_datetime_range_lat_lon(datetime_range, lat_lon_series, lat_lon_first)
        const series = new DataSeries<number, DatetimeRangeLatLonKey, DatetimeRangeLatLonMultipleKeys>(initial_data, get_index)

        const datetimes = datetime_range.get_entries()
        const lat_lons = lat_lon_series.get_entries()
        expect(series.get({ date: datetimes[1]!, lat_lon: lat_lons[1]! })).to.deep.equal(5)
        expect(series.get_multiple({ date: datetimes[1]!, lat_lon: undefined })).to.deep.equal([1, 5, 9])
        expect(series.get_multiple({ date: undefined, lat_lon: lat_lons[1]! })).to.deep.equal([4, 5, 6, 7])
        expect(series.get_entries()).to.deep.equal(initial_data)
    }
})
