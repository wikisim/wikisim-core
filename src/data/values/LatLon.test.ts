import { expect } from "chai"
import { describe } from "mocha"

import { LatLon, LatLonDataSeries } from "./LatLon"


describe("LatLon", () =>
{
    it("should create an instance with correct lat and lon", () =>
    {
        const latLon = new LatLon({ lat: 34.0522, lon: -118.2437 })
        expect(latLon.lat).to.equal(34.0522)
        expect(latLon.lon).to.equal(-118.2437)
    })
})


describe("LatLonDataSeries", () =>
{
    it("should return the correct size and correct index for a given LatLon", () =>
    {
        const lat_lon1 = new LatLon({ lat: 34.0522, lon: -118.2437 })
        const lat_lon2 = new LatLon({ lat: 40.7128, lon: -74.0060 })
        const series = new LatLonDataSeries([lat_lon1, lat_lon2])

        expect(series.size()).to.equal(2)

        expect(series.get_index_of(lat_lon1)).to.equal(0)
        expect(series.get_index_of(lat_lon2)).to.equal(1)
        expect(series.get_index_of(new LatLon({ lat: 0, lon: 0 }))).to.equal(-1) // Not in series
    })
})
