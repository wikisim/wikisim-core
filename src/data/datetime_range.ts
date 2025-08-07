import { DatetimeRangeRepeatEvery, IDatetimeRange } from "./interface"


export const DATETIME_RANGE_ERRORS = {
    MISSING_START_DATE: "DatetimeRange requires start date.",
    MISSING_END_DATE: "DatetimeRange requires end date.",
    MISSING_REPEAT_EVERY: "DatetimeRange requires repeat_every.",
    START_AFTER_END: "DatetimeRange requires start date be before end date.",
    NOT_DIVISIBLE_BY_REPEAT_EVERY: "DatetimeRange requires difference between start and end dates to be divisible by repeat_every.",
    UNKNOWN_REPEAT_EVERY: "Unknown repeat_every value: "
}

export class DatatimeRange implements IDatetimeRange
{
    start: Date
    end: Date
    repeat_every: DatetimeRangeRepeatEvery

    constructor(start?: Date, end?: Date, repeat_every?: DatetimeRangeRepeatEvery)
    {
        if (!start) throw new Error(DATETIME_RANGE_ERRORS.MISSING_START_DATE)
        if (!end) throw new Error(DATETIME_RANGE_ERRORS.MISSING_END_DATE)
        if (!repeat_every) throw new Error(DATETIME_RANGE_ERRORS.MISSING_REPEAT_EVERY)
        if (start >= end) throw new Error(DATETIME_RANGE_ERRORS.START_AFTER_END)

        check_start_end_divisible_by_repeat_every(start, end, repeat_every)

        this.start = start
        this.end = end
        this.repeat_every = repeat_every
    }

    get_entries(): Date[]
    {
        const entries: Date[] = []


        let increment_date: (current: Date) => void
        switch (this.repeat_every)
        {
            case "second":
                increment_date = c => c.setUTCSeconds(c.getUTCSeconds() + 1)
                break
            case "minute":
                increment_date = c => c.setUTCMinutes(c.getUTCMinutes() + 1)
                break
            case "hour":
                increment_date = c => c.setUTCHours(c.getUTCHours() + 1)
                break
            case "day":
                increment_date = c => c.setUTCDate(c.getUTCDate() + 1)
                break
            case "month":
                increment_date = c => c.setUTCMonth(c.getUTCMonth() + 1)
                break
            case "year":
                increment_date = c => c.setUTCFullYear(c.getUTCFullYear() + 1)
                break
            case "decade":
                increment_date = c => c.setUTCFullYear(c.getUTCFullYear() + 10)
                break
            case "century":
                increment_date = c => c.setUTCFullYear(c.getUTCFullYear() + 100)
                break
            default:
                // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
                throw new Error(DATETIME_RANGE_ERRORS.UNKNOWN_REPEAT_EVERY + this.repeat_every)
        }

        const current = new Date(this.start)
        while (current < this.end)
        {
            entries.push(new Date(current))
            increment_date(current) // mutate current date
        }

        return entries
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
