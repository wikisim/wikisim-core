import { DatetimeRangeRepeatEvery } from "../data/interface"


export const DATETIME_ERRORS = {
    UNKNOWN_REPEAT_EVERY: "Unknown repeat_every value: ",
}


export function factory_change_date(repeat_every: DatetimeRangeRepeatEvery, change_by: number): (date: Date, change_by2?: undefined) => void
export function factory_change_date(repeat_every: DatetimeRangeRepeatEvery, change_by: undefined): (date: Date, change_by2: number) => void
export function factory_change_date(repeat_every: DatetimeRangeRepeatEvery, change_by: number | undefined): (date: Date, change_by2?: number) => void
{
    if (repeat_every === "second") return (date: Date, change_by2?: number) => date.setUTCSeconds(date.getUTCSeconds() + (change_by ?? change_by2!))
    if (repeat_every === "minute") return (date: Date, change_by2?: number) => date.setUTCMinutes(date.getUTCMinutes() + (change_by ?? change_by2!))
    if (repeat_every === "hour") return (date: Date, change_by2?: number) => date.setUTCHours(date.getUTCHours() + (change_by ?? change_by2!))
    if (repeat_every === "day") return (date: Date, change_by2?: number) => date.setUTCDate(date.getUTCDate() + (change_by ?? change_by2!))
    if (repeat_every === "month") return (date: Date, change_by2?: number) => date.setUTCMonth(date.getUTCMonth() + (change_by ?? change_by2!))
    if (repeat_every === "year") return (date: Date, change_by2?: number) => date.setUTCFullYear(date.getUTCFullYear() + (change_by ?? change_by2!))
    if (repeat_every === "decade") return (date: Date, change_by2?: number) => date.setUTCFullYear(date.getUTCFullYear() + (10 * (change_by ?? change_by2!)))
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (repeat_every === "century") return (date: Date, change_by2?: number) => date.setUTCFullYear(date.getUTCFullYear() + (100 * (change_by ?? change_by2!)))
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    throw new Error(DATETIME_ERRORS.UNKNOWN_REPEAT_EVERY + repeat_every)
}


// Commenting out these functions as they are not working correctly yet and I'm
// going to take the simpler approach for now of not using `AveragedDatetimeRange`
// and instead just taking whatever datetimes are present in the CSV / data as they
// are.


// /**
//  * Mutates the start_date by first changing it by the change_by_smaller_increment
//  * function and then when it exceeds the modulus_period by N times then using the
//  * change_by_larger_increment function to increase by N.
//  *
//  * This is useful for generating the datetimes for the average datetime range
//  * when it is hourly values averaged over all the days in one month.
//  *
//  * For example with:
//  *      * start_date of 2023-01-01T00:00:00Z
//  *      * change_by_smaller_increment of 1 hour
//  *      * modulus_period of "day"
//  *      * change_by_larger_increment of 1 month
//  * then the date will first be changed to 2023-01-01T01:00:00Z and after 23 more
//  * changes it will become 2023-01-02T00:00:00Z at which point it has crossed
//  * the modulus_period of "day" by 1 and so it will be changed to 2023-02-01T00:00:00Z.
//  *
//  * @param start_date
//  * @param change_by_smaller_increment
//  * @param modulus_period
//  * @param change_by_larger_increment
//  */
// export function modulus_date_change(
//     start_date: Date,
//     change_by_smaller_increment: (d: Date) => void,
//     modulus_period: DatetimeRangeRepeatEvery,
//     change_by_larger_increment: (d: Date, change_by: number) => void
// ): void
// {
//     const start_date_copy = new Date(start_date)

//     change_by_smaller_increment(start_date)

//     const modulus_periods_crossed = datetime_delta(start_date_copy, start_date, modulus_period)
//     // Subtract the modulus_periods_crossed from the start_date to get the date back within the modulus period
//     const change_by_modulus_period = factory_change_date(modulus_period, -modulus_periods_crossed)
//     change_by_modulus_period(start_date)

//     // Increment the date by the increment_period multiplied by the modulus_periods_crossed
//     change_by_larger_increment(start_date, modulus_periods_crossed)
// }


// export function datetime_delta(date1: Date, date2: Date, period: DatetimeRangeRepeatEvery): number
// {
//     const ms_delta = date2.getTime() - date1.getTime()

//     if (period === "second") return Math.ceil(ms_delta / 1000)
//     if (period === "minute") return Math.ceil(ms_delta / (1000 * 60))
//     if (period === "hour") return Math.ceil(ms_delta / (1000 * 60 * 60))
//     if (period === "day") return Math.ceil(ms_delta / (1000 * 60 * 60 * 24))
//     if (period === "month") return (date2.getUTCFullYear() - date1.getUTCFullYear()) * 12 + (date2.getUTCMonth() - date1.getUTCMonth())
//     if (period === "year") return date2.getUTCFullYear() - date1.getUTCFullYear()
//     if (period === "decade") return Math.floor(date2.getUTCFullYear() / 10) - Math.floor(date1.getUTCFullYear() / 10)
//     // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
//     if (period === "century") return Math.floor(date2.getUTCFullYear() / 100) - Math.floor(date1.getUTCFullYear() / 100)

//     throw new Error(`datetime_delta invalid period: ${period}`)
// }
