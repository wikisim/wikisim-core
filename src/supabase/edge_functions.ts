import type { DBDataComponentRow } from "."
import type { DataComponentFields } from "../data/interface"


export interface InsertDataComponentV2Args
{
    batch: DataComponentFields[]
}

export type InsertDataComponentV2Response =
{
    results: DBDataComponentRow[]
    error?: undefined
} | {
    results?: undefined
    error: string
}
