import { clamp } from "../utils/clamp"
import { IdAndMaybeVersion, IdAndVersion, IdOnly } from "./id.ts"


export function limit_ids(ids: IdAndMaybeVersion[], min: number = 0, max: number = 1000)
{
    if (ids.length > max)
    {
        throw new Error(`Too many IDs provided, maximum is ${max} but got ${ids.length}`)
    }
    if (ids.length < min)
    {
        throw new Error(`Too few IDs provided, minium is ${min} but got ${ids.length}`)
    }
}


export function get_range_from_options(options: { page?: number, size?: number } = {}): { from: number, to: number }
{
    let { page, size } = options
    page = Math.max(page ?? 0, 0)
    size = clamp_page_size(size)
    const limit = size
    const offset = page * limit
    const from = offset
    const to = offset + limit - 1
    return { from, to }
}


export function clamp_page_size(size: number = 20)
{
    return clamp(size, 1, 101)
}


export function make_or_clause_for_ids(ids: IdAndMaybeVersion[]): string
{
    if (ids.length === 0) throw new Error("ids for make_or_clause_for_ids must not be empty")

    const or_clauses: string[] = []
    ids.forEach(id =>
    {
        if (id instanceof IdOnly)
        {
            or_clauses.push(`id.eq.${id.to_str_without_version()}`)
        }
        else if (id instanceof IdAndVersion)
        {
            or_clauses.push(`and(id.eq.${id.id},version_number.eq.${id.version})`)
        }
        else
        {
            throw new Error(`Invalid ID type: ${id}, typeof: ${typeof id}, expected IdAndVersion or IdOnly`)
        }
    })
    return or_clauses.join(",")
}
