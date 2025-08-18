import { binary_search } from "../../utils/binary_search"
import { DatetimeRangeRepeatEvery, IDatetimeRange } from "../interface"


export const DATETIME_RANGE_ERRORS = {
    START_AFTER_END: "DatetimeRange requires start date be before end date.",
    NOT_DIVISIBLE_BY_REPEAT_EVERY: "DatetimeRange requires difference between start and end dates to be divisible by repeat_every.",
    UNKNOWN_REPEAT_EVERY: "Unknown repeat_every value: ",
    UNDEFINED_DATE_ARG_FOR_GET_INDEX: "DatetimeRange get_index_of requires a defined date argument.",
    DATETIME_NOT_IN_RANGE: "Datetime not in range.",
}

export class DatetimeRange implements IDatetimeRange
{
    static factory_change_date(repeat_every: DatetimeRangeRepeatEvery, change_by: number): (date: Date) => void
    {
        if (repeat_every === "second") return (date: Date) => date.setUTCSeconds(date.getUTCSeconds() + change_by)
        if (repeat_every === "minute") return (date: Date) => date.setUTCMinutes(date.getUTCMinutes() + change_by)
        if (repeat_every === "hour") return (date: Date) => date.setUTCHours(date.getUTCHours() + change_by)
        if (repeat_every === "day") return (date: Date) => date.setUTCDate(date.getUTCDate() + change_by)
        if (repeat_every === "month") return (date: Date) => date.setUTCMonth(date.getUTCMonth() + change_by)
        if (repeat_every === "year") return (date: Date) => date.setUTCFullYear(date.getUTCFullYear() + change_by)
        if (repeat_every === "decade") return (date: Date) => date.setUTCFullYear(date.getUTCFullYear() + (10 * change_by))
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (repeat_every === "century") return (date: Date) => date.setUTCFullYear(date.getUTCFullYear() + (100 * change_by))
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        throw new Error(DATETIME_RANGE_ERRORS.UNKNOWN_REPEAT_EVERY + repeat_every)
    }

    start: Date
    end: Date
    repeat_every: DatetimeRangeRepeatEvery

    private time_stamps: number[] | undefined = undefined

    constructor(args: { start: Date, end: Date, repeat_every: DatetimeRangeRepeatEvery })
    {
        if (args.start >= args.end) throw new Error(DATETIME_RANGE_ERRORS.START_AFTER_END)

        check_start_end_divisible_by_repeat_every(args.start, args.end, args.repeat_every)

        this.start = args.start
        this.end = args.end
        this.repeat_every = args.repeat_every
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

        const change_date = DatetimeRange.factory_change_date(this.repeat_every, 1)

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


function check_start_end_divisible_by_repeat_every(start: Date, end: Date, repeat_every: DatetimeRangeRepeatEvery): void
{
    const diff_ms = end.getTime() - start.getTime()
    let interval_ms: number | undefined = undefined

    if (repeat_every === "second") interval_ms = 1000
    else if (repeat_every === "minute") interval_ms = 1000 * 60
    else if (repeat_every === "hour") interval_ms = 1000 * 60 * 60
    else if (repeat_every === "day") interval_ms = 1000 * 60 * 60 * 24
    else
    {
        let same = (
            start.getUTCMilliseconds() === end.getUTCMilliseconds()
            && start.getUTCSeconds() === end.getUTCSeconds()
            && start.getUTCHours() === end.getUTCHours()
            && start.getUTCDate() === end.getUTCDate()
        )
        if (repeat_every === "year" || repeat_every === "decade" || repeat_every === "century")
        {
            same = same && start.getUTCMonth() === end.getUTCMonth()
        }
        if (repeat_every === "decade" || repeat_every === "century")
        {
            const mod = repeat_every === "decade" ? 10 : 100
            same = same && start.getUTCFullYear() % mod === end.getUTCFullYear() % mod
        }
        if (!same)
        {
            throw new Error(DATETIME_RANGE_ERRORS.NOT_DIVISIBLE_BY_REPEAT_EVERY)
        }
        return
    }

    if (interval_ms && diff_ms % interval_ms !== 0)
    {
        throw new Error(DATETIME_RANGE_ERRORS.NOT_DIVISIBLE_BY_REPEAT_EVERY)
    }
}
