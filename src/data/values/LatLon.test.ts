import { expect } from "chai"
import { describe } from "mocha"

import { LAT_LON_SERIES_ERRORS, LatLon, LatLonDataSeries, LatLonWithIsOnshore } from "./LatLon"


describe("LatLon", () =>
{
    it("should create an instance with correct lat and lon", () =>
    {
        const lat_lon = new LatLon({ lat: 34.0522, lon: -118.2437 })
        expect(lat_lon.lat).equals(34.0522)
        expect(lat_lon.lon).equals(-118.2437)
    })

    it("should parse from and go to string correctly", () =>
    {
        const lat_lon = LatLon.from_str("34.0522,-118.2437")
        expect(lat_lon.lat).equals(34.0522)
        expect(lat_lon.lon).equals(-118.2437)
        expect(LatLon.to_str(lat_lon)).equals("34.0522,-118.2437")
    })
})


describe("LatLonWithIsOnshore", () =>
{
    it("should create an instance with correct lat, lon, and is_onshore", () =>
    {
        const lat_lon = new LatLonWithIsOnshore({ lat: 34.0522, lon: -118.2437, is_onshore: true })
        expect(lat_lon.lat).equals(34.0522)
        expect(lat_lon.lon).equals(-118.2437)
        expect(lat_lon.is_onshore).equals(true)
    })

    it("should parse from and go to string correctly", () =>
    {
        const lat_lon = LatLonWithIsOnshore.from_str("34.0522,-118.2437,T")
        expect(lat_lon.lat).equals(34.0522)
        expect(lat_lon.lon).equals(-118.2437)
        expect(lat_lon.is_onshore).equals(true)
        expect(LatLonWithIsOnshore.to_str(lat_lon)).equals("34.0522,-118.2437,T")

        const lat_lon_offshore = LatLonWithIsOnshore.from_str("34.0522,-118.2437,F")
        expect(lat_lon_offshore.is_onshore).equals(false)
        expect(LatLonWithIsOnshore.to_str(lat_lon_offshore)).equals("34.0522,-118.2437,F")
    })
})


describe("LatLonDataSeries", () =>
{
    it("should return the correct size and correct index for a given LatLon", () =>
    {
        const lat_lon1 = new LatLon({ lat: 34.0522, lon: -118.2437 })
        const lat_lon2 = new LatLon({ lat: 40.7128, lon: -74.0060 })
        const series = new LatLonDataSeries([lat_lon1, lat_lon2])

        expect(series.size()).equals(2)

        expect(series.get_index_of(lat_lon1)).equals(0)
        expect(series.get_index_of(lat_lon2)).equals(1)
    })


    it("should raise an error when trying to get index of a LatLon not in the series", () =>
    {
        const lat_lon1 = new LatLon({ lat: 34.0522, lon: -118.2437 })
        const series = new LatLonDataSeries([lat_lon1])

        expect(() => series.get_index_of(new LatLon({ lat: 0, lon: 0 })))
            .to.throw(LAT_LON_SERIES_ERRORS.LAT_LON_NOT_IN_DATA_SERIES)
    })
})
