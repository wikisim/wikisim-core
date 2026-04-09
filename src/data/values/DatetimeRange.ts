import { binary_search } from "../../utils/binary_search"
import { factory_change_date as factory_change_date_ } from "../../utils/datetime"

import { DatetimeRangeRepeatEvery, IDatetimeRange } from "../interface"


export const DATETIME_RANGE_ERRORS = {
    START_AFTER_END: "DatetimeRange requires start date be before end date.",
    NOT_DIVISIBLE_BY_AVERAGED_OVER: "DatetimeRange requires difference between start and end dates to be divisible by averaged_over.",
    NOT_DIVISIBLE_BY_REPEAT_EVERY: "DatetimeRange requires difference between start and end dates to be divisible by repeat_every.",
    UNKNOWN_REPEAT_EVERY: "Unknown repeat_every value: ",
    UNDEFINED_DATE_ARG_FOR_GET_INDEX: "DatetimeRange get_index_of requires a defined date argument.",
    DATETIME_NOT_IN_RANGE: "Datetime not in range.",
}
type DatetimeRangeErrorType = typeof DATETIME_RANGE_ERRORS[keyof typeof DATETIME_RANGE_ERRORS]

type DatetimeRangeArgs =
  | { start: Date; end: Date; repeat_every: DatetimeRangeRepeatEvery; time_stamps?: undefined }
  | { start: Date; end: Date; repeat_every?: undefined; time_stamps: number[] }

export class DatetimeRange implements IDatetimeRange
{
    static factory_change_date = factory_change_date_

    start: Date
    end: Date
    repeat_every: DatetimeRangeRepeatEvery | undefined

    private time_stamps: number[] | undefined = undefined

    constructor(args: DatetimeRangeArgs)
    {
        if (args.start >= args.end) throw new Error(DATETIME_RANGE_ERRORS.START_AFTER_END)

        this.start = args.start
        this.end = args.end

        if (args.repeat_every)
        {
            check_start_end_divisible_by_time_period(args.start, args.end, args.repeat_every, DATETIME_RANGE_ERRORS.NOT_DIVISIBLE_BY_REPEAT_EVERY)
            this.repeat_every = args.repeat_every
        }
        else
        {
            this.time_stamps = args.time_stamps
        }
    }


    size(): number
    {
        if (this.time_stamps) return this.time_stamps.length

        const time_stamps = this.get_time_stamps()  // Will also populate this.time_stamps
        return time_stamps.length
    }


    get_time_stamps(): number[]
    {
        if (this.time_stamps) return this.time_stamps
        this.time_stamps = []

        const change_date = factory_change_date_(this.repeat_every!, 1)

        const current = new Date(this.start)
        while (current < this.end)
        {
            this.time_stamps.push(current.getTime())
            change_date(current) // mutate current date
        }

        return this.time_stamps
    }


    get_entries(): Date[]
    {
        if (this.time_stamps) return this.time_stamps.map(ts => new Date(ts))
        const time_stamps = this.get_time_stamps()  // Will also populate this.time_stamps

        return time_stamps.map(ts => new Date(ts))
    }


    get_index_of(datetime_ms: number): number
    {
        // Because we haved assert in the tests that a date is present when
        // passing to this function then maybe this same error might happen in
        // consuming code so we catch and explicitly raise this error.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (datetime_ms === undefined) throw new Error(DATETIME_RANGE_ERRORS.UNDEFINED_DATE_ARG_FOR_GET_INDEX)

        const time_stamps = this.get_time_stamps()
        const index = binary_search(time_stamps, datetime_ms, (a, b) => a - b)
        if (index === -1) throw new Error(DATETIME_RANGE_ERRORS.DATETIME_NOT_IN_RANGE)
        return index
    }
}


// Commenting out this class for now as it's dependent functions not working correctly yet.
// Instead I'm going to take the simpler approach of taking whatever datetimes are
// present in the CSV / data as they are without checking them against this
// generic "AveragedDatetimeRange" class.  I suspect actually the solution will be
// to provide a third time period argument to specify at what boundary the averaging
// occured / should occur at.  So for the monthly averaged hourly values this would
// be "day".
// export class AveragedDatetimeRange implements IAveragedDatetimeRange
// {
//     static factory_change_date(args: { averaged_over: DatetimeRangeRepeatEvery, repeat_every: DatetimeRangeRepeatEvery }, change_by: number): (date: Date) => void
//     {
//         const { averaged_over, repeat_every } = args

//         const change_by_smaller_increment = DatetimeRange.factory_change_date(repeat_every, change_by)
//         const change_by_larger_increment = DatetimeRange.factory_change_date(averaged_over, undefined)

//         return (date: Date) => modulus_date_change(date, change_by_smaller_increment, "day", change_by_larger_increment)
//     }

//     start: Date
//     end: Date
//     averaged_over: DatetimeRangeRepeatEvery
//     repeat_every: DatetimeRangeRepeatEvery

//     private time_stamps: number[] | undefined = undefined

//     constructor(args: { start: Date, end: Date, averaged_over: DatetimeRangeRepeatEvery, repeat_every: DatetimeRangeRepeatEvery })
//     {
//         if (args.start >= args.end) throw new Error(DATETIME_RANGE_ERRORS.START_AFTER_END)

//         check_start_end_divisible_by_time_period(args.start, args.end, args.averaged_over, DATETIME_RANGE_ERRORS.NOT_DIVISIBLE_BY_AVERAGED_OVER)

//         this.start = args.start
//         this.end = args.end
//         this.averaged_over = args.averaged_over
//         this.repeat_every = args.repeat_every
//     }

//     size(): number
//     {
//         if (this.time_stamps) return this.time_stamps.length

//         const time_stamps = this.get_time_stamps()  // Will also populate this.time_stamps
//         return time_stamps.length
//     }

//     get_time_stamps(): number[]
//     {
//         if (this.time_stamps) return this.time_stamps
//         this.time_stamps = []

//         const change_date = AveragedDatetimeRange.factory_change_date({ averaged_over: this.averaged_over, repeat_every: this.repeat_every }, 1)

//         const current = new Date(this.start)
//         while (current < this.end)
//         {
//             this.time_stamps.push(current.getTime())
//             change_date(current) // mutate current date by repeat_every and averaged_over periods
//         }

//         return this.time_stamps
//     }

//     get_entries(): Date[]
//     {
//         if (this.time_stamps) return this.time_stamps.map(ts => new Date(ts))
//         const time_stamps = this.get_time_stamps()  // Will also populate this.time_stamps

//         return time_stamps.map(ts => new Date(ts))
//     }

//     get_index_of(datetime_ms: number): number
//     {
//         // Because we haved assert in the tests that a date is present when
//         // passing to this function then maybe this same error might happen in
//         // consuming code so we catch and explicitly raise this error.
//         // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
//         if (datetime_ms === undefined) throw new Error(DATETIME_RANGE_ERRORS.UNDEFINED_DATE_ARG_FOR_GET_INDEX)

//         const time_stamps = this.get_time_stamps()
//         const index = binary_search(time_stamps, datetime_ms, (a, b) => a - b)
//         if (index === -1) throw new Error(DATETIME_RANGE_ERRORS.DATETIME_NOT_IN_RANGE)
//         return index
//     }
// }


function check_start_end_divisible_by_time_period(start: Date, end: Date, time_period: DatetimeRangeRepeatEvery, error: DatetimeRangeErrorType): void
{
    const diff_ms = end.getTime() - start.getTime()
    let interval_ms: number | undefined = undefined

    if (time_period === "second") interval_ms = 1000
    else if (time_period === "minute") interval_ms = 1000 * 60
    else if (time_period === "hour") interval_ms = 1000 * 60 * 60
    else if (time_period === "day") interval_ms = 1000 * 60 * 60 * 24
    else
    {
        let same = (
            start.getUTCMilliseconds() === end.getUTCMilliseconds()
            && start.getUTCSeconds() === end.getUTCSeconds()
            && start.getUTCHours() === end.getUTCHours()
            && start.getUTCDate() === end.getUTCDate()
        )
        if (time_period === "year" || time_period === "decade" || time_period === "century")
        {
            same = same && start.getUTCMonth() === end.getUTCMonth()
        }
        if (time_period === "decade" || time_period === "century")
        {
            const mod = time_period === "decade" ? 10 : 100
            same = same && start.getUTCFullYear() % mod === end.getUTCFullYear() % mod
        }
        if (!same)
        {
            throw new Error(error)
        }
        return
    }

    if (interval_ms && diff_ms % interval_ms !== 0)
    {
        throw new Error(error)
    }
}
