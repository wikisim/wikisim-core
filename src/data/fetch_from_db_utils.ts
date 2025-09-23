
import { IdAndMaybeVersion, IdAndVersion, IdOnly } from "./id.ts"


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
