

export function deep_freeze<T>(obj: T): T
{
    if (typeof obj !== "object" || obj === null) return obj

    Object.freeze(obj)

    Object.getOwnPropertyNames(obj)
        .forEach((prop) =>
        {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (obj[prop] && typeof obj[prop] === "object")
            {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                deep_freeze(obj[prop])
            }
        })

    return obj
}


export const deep_freeze_str = `
function deep_freeze(obj)
{
    if (typeof obj !== "object" || obj === null) return obj

    Object.freeze(obj)

    Object.getOwnPropertyNames(obj)
        .forEach((prop) =>
        {
            if (obj[prop] && typeof obj[prop] === "object")
            {
                deep_freeze(obj[prop])
            }
        })

    return obj
}
`
