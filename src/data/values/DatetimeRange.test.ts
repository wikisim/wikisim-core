import { expect } from "chai"
import { describe } from "mocha"

import { DatetimeRangeRepeatEvery, IDatetimeRange } from "../interface"
import { DATETIME_RANGE_ERRORS, DatetimeRange } from "./DatetimeRange"


describe("DatetimeRange", () =>
{
    describe("init DatetimeRange instance", () =>
    {
        it("should accept valid fields", () =>
        {
            const start = new Date("2023-01-01T00:00:00Z")
            const end = new Date("2023-01-02T00:00:00Z")
            const repeat_every: DatetimeRangeRepeatEvery = "day"

            const range: IDatetimeRange = new DatetimeRange(start, end, repeat_every)

            expect(range.start).equals(start)
            expect(range.end).equals(end)
            expect(range.repeat_every).equals(repeat_every)
        })

        it("should reject missing fields", () =>
        {
            const start = new Date("2023-01-01T00:00:00Z")
            const end = new Date("2023-01-02T00:00:00Z")
            const repeat_every: DatetimeRangeRepeatEvery = "day"

            expect(() => new DatetimeRange(undefined, end, repeat_every)).to.throw(DATETIME_RANGE_ERRORS.MISSING_START_DATE)
            expect(() => new DatetimeRange(start, undefined, repeat_every)).to.throw(DATETIME_RANGE_ERRORS.MISSING_END_DATE)
            expect(() => new DatetimeRange(start, end, undefined)).to.throw(DATETIME_RANGE_ERRORS.MISSING_REPEAT_EVERY)
        })

        it("should reject start being equal to or coming after end", () =>
        {
            const start = new Date("2023-01-01T00:00:00Z")
            const start_minus_1_second = new Date(start.getTime() - 1000) // 1 second before start
            const repeat_every: DatetimeRangeRepeatEvery = "day"

            expect(() => new DatetimeRange(start, start, repeat_every)).to.throw(DATETIME_RANGE_ERRORS.START_AFTER_END)
            expect(() => new DatetimeRange(start, start_minus_1_second, repeat_every)).to.throw(DATETIME_RANGE_ERRORS.START_AFTER_END)
        })

        it("should only accept start and end dates divisible by repeat_every", () =>
        {
            const start = new Date("2023-01-01T00:00:00Z")

            // const test_cases = Object.values(DATETIME_RANGE_REPEAT_EVERY).map(k =>
            const test_cases = (["decade"] as DatetimeRangeRepeatEvery[]).map(k =>
            {
                let seconds = start.getUTCSeconds()
                let minutes = start.getUTCMinutes()
                let hours = start.getUTCHours()
                let days = start.getUTCDate()
                let months = start.getUTCMonth()
                let years = start.getUTCFullYear()

                if (k === "second") seconds += 1
                else if (k === "minute") minutes += 1
                else if (k === "hour") hours += 1
                else if (k === "day") days += 1
                else if (k === "month") months += 1
                else if (k === "year") years += 1
                else if (k === "decade") years += 10
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                else if (k === "century") years += 100
                else throw new Error(`Unhandled repeat_every value: ${k}`)

                const end = new Date(Date.UTC(years, months, days, hours, minutes, seconds))

                return { repeat_every: k, end }
            })

            test_cases.forEach(({ end, repeat_every }) =>
            {
                expect(() => new DatetimeRange(start, end, repeat_every)).to.not.throw()
                const end_plus_1 = new Date(end.getTime() + 1) // 1 millisecond
                expect(() => new DatetimeRange(start, end_plus_1, repeat_every)).to.throw(DATETIME_RANGE_ERRORS.NOT_DIVISIBLE_BY_REPEAT_EVERY)
            })
        })
    })

    describe("factory_change_date", () =>
    {
        function apply_change_date(
            repeat_every: DatetimeRangeRepeatEvery,
            change_by_steps: number,
        ): Date
        {
            const date = new Date("2023-01-01T00:00:00Z")
            const change_date = DatetimeRange.factory_change_date(repeat_every, change_by_steps)
            change_date(date)
            return date
        }

        it("should mutate date by seconds", () =>
        {
            expect(apply_change_date("second", 120)).deep.equal(new Date("2023-01-01T00:02:00Z"))
            expect(apply_change_date("second", -120)).deep.equal(new Date("2022-12-31T23:58:00Z"))
        })

        it("should mutate date by minutes", () =>
        {
            expect(apply_change_date("minute", 120)).deep.equal(new Date("2023-01-01T02:00:00Z"))
            expect(apply_change_date("minute", -120)).deep.equal(new Date("2022-12-31T22:00:00Z"))
        })

        it("should mutate date by hours", () =>
        {
            expect(apply_change_date("hour", 120)).deep.equal(new Date("2023-01-06T00:00:00Z"))
            expect(apply_change_date("hour", -120)).deep.equal(new Date("2022-12-27T00:00:00Z"))
        })

        it("should mutate date by days", () =>
        {
            expect(apply_change_date("day", 120)).deep.equal(new Date("2023-05-01T00:00:00.00Z"))
            expect(apply_change_date("day", -120)).deep.equal(new Date("2022-09-03T00:00:00.00Z"))
        })

        it("should mutate date by months", () =>
        {
            expect(apply_change_date("month", 120)).deep.equal(new Date("2033-01-01T00:00:00Z"))
            expect(apply_change_date("month", -120)).deep.equal(new Date("2013-01-01T00:00:00Z"))
        })

        it("should mutate date by years", () =>
        {
            expect(apply_change_date("year", 120)).deep.equal(new Date("2143-01-01T00:00:00Z"))
            expect(apply_change_date("year", -120)).deep.equal(new Date("1903-01-01T00:00:00Z"))
        })

        it("should mutate date by decades", () =>
        {
            expect(apply_change_date("decade", 120)).deep.equal(new Date("3223-01-01T00:00:00Z"))
            expect(apply_change_date("decade", -120)).deep.equal(new Date("0823-01-01T00:00:00Z"))
        })

        it("should mutate date by centurys", () =>
        {
            expect(apply_change_date("century", 20)).deep.equal(new Date("4023-01-01T00:00:00Z"))
            expect(apply_change_date("century", -20)).deep.equal(new Date("0023-01-01T00:00:00Z"))
        })
    })

    describe("get_entries", () =>
    {
        it("should return correct entries for second repeat", () =>
        {
            const start = new Date("2023-01-01T00:00:01Z")
            const end = new Date("2023-01-01T00:00:03Z")

            const range = new DatetimeRange(start, end, "second")
            const entries = range.get_entries()

            expect(entries.length).to.equal(2)
            expect(entries[0]).to.deep.equal(new Date("2023-01-01T00:00:01Z"))
            expect(entries[1]).to.deep.equal(new Date("2023-01-01T00:00:02Z"))
        })

        it("should return correct entries for minute repeat", () =>
        {
            const start = new Date("2023-01-01T00:01:00Z")
            const end = new Date("2023-01-01T00:04:00Z")

            const range = new DatetimeRange(start, end, "minute")
            const entries = range.get_entries()

            expect(entries.length).to.equal(3)
            expect(entries[0]).to.deep.equal(new Date("2023-01-01T00:01:00Z"))
            expect(entries[2]).to.deep.equal(new Date("2023-01-01T00:03:00Z"))
        })

        it("should return correct entries for hour repeat", () =>
        {
            const start = new Date("2023-01-01T01:00:00Z")
            const end = new Date("2023-01-01T05:00:00Z")

            const range = new DatetimeRange(start, end, "hour")
            const entries = range.get_entries()

            expect(entries.length).to.equal(4)
            expect(entries[0]).to.deep.equal(new Date("2023-01-01T01:00:00Z"))
            expect(entries[3]).to.deep.equal(new Date("2023-01-01T04:00:00Z"))
        })

        it("should return correct entries for day repeat", () =>
        {
            const start = new Date("2023-01-01T00:00:00Z")
            const end = new Date("2023-01-06T00:00:00Z")

            const range = new DatetimeRange(start, end, "day")
            const entries = range.get_entries()

            expect(entries.length).to.equal(5)
            expect(entries[0]).to.deep.equal(new Date("2023-01-01T00:00:00Z"))
            expect(entries[4]).to.deep.equal(new Date("2023-01-05T00:00:00Z"))
        })

        it("should return correct entries for month repeat", () =>
        {
            const start = new Date("2023-01-01T00:00:00Z")
            const end = new Date("2023-07-01T00:00:00Z")

            const range = new DatetimeRange(start, end, "month")
            const entries = range.get_entries()

            expect(entries.length).to.equal(6)
            expect(entries[0]).to.deep.equal(new Date("2023-01-01T00:00:00Z"))
            expect(entries[5]).to.deep.equal(new Date("2023-06-01T00:00:00Z"))
        })

        it("should return correct entries for year repeat", () =>
        {
            const start = new Date("2023-04-05T00:00:00Z")
            const end = new Date("2030-04-05T00:00:00Z")

            const range = new DatetimeRange(start, end, "year")
            const entries = range.get_entries()

            expect(entries.length).to.equal(7)
            expect(entries[0]).to.deep.equal(new Date("2023-04-05T00:00:00Z"))
            expect(entries[6]).to.deep.equal(new Date("2029-04-05T00:00:00Z"))
        })

        it("should return correct entries for decade repeat", () =>
        {
            const start = new Date("2023-04-05T00:00:00Z")
            const end = new Date("2043-04-05T00:00:00Z")

            const range = new DatetimeRange(start, end, "decade")
            const entries = range.get_entries()

            expect(entries.length).to.equal(2)
            expect(entries[0]).to.deep.equal(new Date("2023-04-05T00:00:00Z"))
            expect(entries[1]).to.deep.equal(new Date("2033-04-05T00:00:00Z"))
        })

        it("should return correct entries for century repeat", () =>
        {
            const start = new Date("2023-04-05T00:00:00Z")
            const end = new Date("2223-04-05T00:00:00Z")

            const range = new DatetimeRange(start, end, "century")
            const entries = range.get_entries()

            expect(entries.length).to.equal(2)
            expect(entries[0]).to.deep.equal(new Date("2023-04-05T00:00:00Z"))
            expect(entries[1]).to.deep.equal(new Date("2123-04-05T00:00:00Z"))
        })
    })

    describe("get_index_of", () =>
    {
        it("should return correct index for existing date", () =>
        {
            const start = new Date("2023-01-01T00:00:00Z")
            const end = new Date("2023-01-05T00:00:00Z")
            const range = new DatetimeRange(start, end, "day")

            const entries = range.get_time_stamps()
            expect(range.get_index_of(entries[0]!)).to.equal(0)
            expect(range.get_index_of(entries[2]!)).to.equal(2)
        })

        it("should throw error for non-existing date", () =>
        {
            const start = new Date("2023-01-01T00:00:00Z")
            const end = new Date("2023-01-05T00:00:00Z")
            const range = new DatetimeRange(start, end, "day")

            expect(() => range.get_index_of([][0]!)).to.throw(DATETIME_RANGE_ERRORS.UNDEFINED_DATE_ARG_FOR_GET_INDEX)
            expect(() => range.get_index_of(new Date("2023-01-06T00:00:00Z").getTime())).to.throw(DATETIME_RANGE_ERRORS.DATETIME_NOT_IN_RANGE)
        })
    })
})
