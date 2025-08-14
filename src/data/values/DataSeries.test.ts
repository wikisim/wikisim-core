/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from "chai"
import { describe } from "mocha"

import { DataSeries, IIndexManager } from "./DataSeries"
import { DatetimeRange } from "./DatetimeRange"
import { LatLon, LatLonDataSeries } from "./LatLon"
import {
    DatetimeRangeLatLonKey,
    DatetimeRangeLatLonMultipleKeys,
    factory_IndexManager_for_datetime_range_lat_lon,
} from "./datetime_lat_lon"


describe("DataSeries", () =>
{
    const index_manager = {
        get_index: (index: number) => index // Simple index mapping for testing
    }

    describe("init DataSeries instance and get_entries", () =>
    {
        it("should accept valid initial data", () =>
        {
            const initial_data: string[] = ["a", "b"]
            const series = new DataSeries<number, string>(initial_data, index_manager)

            expect(series.get_entries()).to.deep.equal(["a", "b"])
        })


        it("should return empty data if no initial data is provided", () =>
        {
            const series = new DataSeries<number, string>([], index_manager)
            expect(series.get_entries()).to.deep.equal([])
        })


        it("should raise an error if validation fails", () =>
        {
            const index_manager_with_validation: IIndexManager<number> = {
                validate: data_count => data_count === 10 ? [] : [`Expected exactly 10 entries for this DataSeries but got ${data_count}`],
                get_index: (key: number) => key
            }
            expect(() => new DataSeries<number, string>([], index_manager_with_validation))
                .to.throw("DataSeries validation failed: \n * Expected exactly 10 entries for this DataSeries but got 0")

            const data_10_strings = Array.from({ length: 10 }, (_, i) => `item${i}`)
            expect(() => new DataSeries<number, string>(data_10_strings, index_manager_with_validation))
                .to.not.throw()
        })
    })


    describe("get method", () =>
    {
        it("should return the value for a given index", () =>
        {
            const series = new DataSeries<number, string>(["a", "b"], {
                get_index: (key: number) => key - 1,
            })
            expect(series.get(1)).to.equal("a")
            expect(series.get(2)).to.equal("b")
        })

        it("should return undefined for an index that does not exist", () =>
        {
            const series = new DataSeries<number, string>([], index_manager)
            expect(series.get(3)).to.be.undefined
        })
    })


    describe("get_multiple method", () =>
    {
        it("should handle multi-dimensional data", () =>
        {
            const datetime_range = new DatetimeRange(
                new Date("2023-01-01T00:00:00Z"),
                new Date("2023-01-05T00:00:00Z"),
                "day"
            )

            const lat_lon_series = new LatLonDataSeries([
                new LatLon({ lat: 10, lon: 20 }),
                new LatLon({ lat: 30, lon: 40 }),
                new LatLon({ lat: 50, lon: 60 }),
            ])

            // One-dimensional DataSeries of 4 datetimes x 3 lat/lon pairs
            const initial_data = [
                0, 1, 2, 3,
                4, 5, 6, 7,
                8, 9, 10, 11,
            ]

            const index_manager = factory_IndexManager_for_datetime_range_lat_lon(datetime_range, lat_lon_series, false)
            const series = new DataSeries<DatetimeRangeLatLonKey, number, DatetimeRangeLatLonMultipleKeys>(initial_data, index_manager)

            const datetimes_ms = datetime_range.get_time_stamps()
            const lat_lons = lat_lon_series.get_entries()
            expect(series.get({ datetime_ms: datetimes_ms[1]!, lat_lon: lat_lons[1]! })).to.deep.equal(5)
            expect(series.get_multiple({ datetime_ms: datetimes_ms[1]!, lat_lon: undefined })).to.deep.equal([1, 5, 9])
            expect(series.get_multiple({ datetime_ms: undefined, lat_lon: lat_lons[1]! })).to.deep.equal([4, 5, 6, 7])
            expect(series.get_entries()).to.deep.equal(initial_data)
        })
    })
})
