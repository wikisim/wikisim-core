/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from "chai"
import { describe } from "mocha"

import { DataSeries } from "./DataSeries"
import { DatetimeRange } from "./DatetimeRange"
import { LatLonDataSeries } from "./LatLon"
import { DatetimeRangeLatLonKey, DatetimeRangeLatLonMultipleKeys, factory_get_index_for_datetime_range_lat_lon } from "./datetime_lat_lon"


describe("DataSeries", () =>
{
    const get_index = (index: number) => index // Simple index mapping for testing

    describe("init DataSeries instance and get_entries", () =>
    {
        it("should accept valid initial data", () =>
        {
            const initial_data: string[] = ["a", "b"]
            const series = new DataSeries<number, string>(initial_data, get_index)

            expect(series.get_entries()).to.deep.equal(["a", "b"])
        })

        it("should return empty data if no initial data is provided", () =>
        {
            const series = new DataSeries<number, string>([], get_index)
            expect(series.get_entries()).to.deep.equal([])
        })
    })


    describe("get method", () =>
    {
        it("should return the value for a given index", () =>
        {
            const series = new DataSeries<number, string>(["a", "b"], (key: number) => key - 1)
            expect(series.get(1)).to.equal("a")
            expect(series.get(2)).to.equal("b")
        })

        it("should return undefined for an index that does not exist", () =>
        {
            const series = new DataSeries<number, string>([], get_index)
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
                { lat: 10, lon: 20 },
                { lat: 30, lon: 40 },
                { lat: 50, lon: 60 },
            ])

            // One-dimensional DataSeries of 4 datetimes x 3 lat/lon pairs
            const initial_data = [
                0, 1, 2, 3,
                4, 5, 6, 7,
                8, 9, 10, 11,
            ]

            const get_index = factory_get_index_for_datetime_range_lat_lon(datetime_range, lat_lon_series, false)
            const series = new DataSeries<DatetimeRangeLatLonKey, number, DatetimeRangeLatLonMultipleKeys>(initial_data, get_index)

            const datetimes = datetime_range.get_entries()
            const lat_lons = lat_lon_series.get_entries()
            expect(series.get({ date: datetimes[1]!, lat_lon: lat_lons[1]! })).to.deep.equal(5)
            expect(series.get_multiple({ date: datetimes[1]!, lat_lon: undefined })).to.deep.equal([1, 5, 9])
            expect(series.get_multiple({ date: undefined, lat_lon: lat_lons[1]! })).to.deep.equal([4, 5, 6, 7])
            expect(series.get_entries()).to.deep.equal(initial_data)
        })
    })


    describe("clone method", () =>
    {
        it("should create a clone of the DataSeries with the same entries", () =>
        {
            const initial_data = ["a", "b"]
            const series = new DataSeries<number, string>(initial_data, get_index)
            const clone = series.clone()
            expect(clone.get_entries()).to.deep.equal(initial_data)
            expect(clone).to.not.equal(series) // Ensure it's a different instance
        })
    })
})
