// import { expect } from "chai"

// import { DatetimeRange } from "../data/values/DatetimeRange"
// import { datetime_delta, modulus_date_change } from "./datetime"


// describe("modulus_date_change", () =>
// {
//     it("should change date by smaller increment and then adjust by modulus period", () =>
//     {
//         let date: Date
//         let change_by_smaller_increment = DatetimeRange.factory_change_date("hour", 1)
//         const change_by_larger_increment = DatetimeRange.factory_change_date("month", undefined)


//         date = new Date("2023-01-01T00:00:00Z")
//         change_by_smaller_increment = DatetimeRange.factory_change_date("hour", 1)
//         modulus_date_change(date, change_by_smaller_increment, "day", change_by_larger_increment)
//         expect(date).deep.equal(new Date("2023-01-01T01:00:00Z"))

//         date = new Date("2023-01-01T00:00:00Z")
//         change_by_smaller_increment = DatetimeRange.factory_change_date("hour", 25)
//         modulus_date_change(date, change_by_smaller_increment, "day", change_by_larger_increment)
//         expect(date).deep.equal(new Date("2023-02-01T01:00:00Z"))
//     })
// })


// describe("datetime_delta", () =>
// {
//     it("should return correct deltas for different periods", () =>
//     {
//         const date1 = new Date("2023-01-01T00:00:00Z")
//         const date2 = new Date("2023-01-02T01:00:00Z")

//         expect(datetime_delta(date1, date2, "second")).equals(25 * 60 * 60)
//         expect(datetime_delta(date1, date2, "minute")).equals(25 * 60)
//         expect(datetime_delta(date1, date2, "hour")).equals(25)
//         expect(datetime_delta(date1, date2, "day")).equals(1)
//         expect(datetime_delta(date1, date2, "month")).equals(0)
//         expect(datetime_delta(date1, date2, "year")).equals(0)
//         expect(datetime_delta(date1, date2, "decade")).equals(0)
//         expect(datetime_delta(date1, date2, "century")).equals(0)
//     })

//     it("should return correct deltas for different periods overlapping boundaries", () =>
//     {
//         const date1 = new Date("1999-12-31T23:59:59Z")
//         const date2 = new Date("2000-01-01T00:00:00Z")

//         expect(datetime_delta(date1, date2, "second")).equals(1)
//         expect(datetime_delta(date1, date2, "minute")).equals(1)
//         expect(datetime_delta(date1, date2, "hour")).equals(1)
//         expect(datetime_delta(date1, date2, "day")).equals(1)
//         expect(datetime_delta(date1, date2, "month")).equals(1)
//         expect(datetime_delta(date1, date2, "year")).equals(1)
//         expect(datetime_delta(date1, date2, "decade")).equals(1)
//         expect(datetime_delta(date1, date2, "century")).equals(1)
//     })
// })
