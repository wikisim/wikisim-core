import type {
    DataComponentAsJSON,
    NewDataComponentAsJSON
} from "./index.ts"


export interface EFInsertDataComponentV2Args
{
    batch: (NewDataComponentAsJSON | DataComponentAsJSON)[]
}


// InsertDataComponentV2Response is what the client of the edge function
// receives.
export type ClientInsertDataComponentV2Response =
{
    response: Response
    data: DataComponentAsJSON[]
    error?: null
} | {
    response: Response
    data?: null
    error: Error | { code: number, message: string }
}


export interface EFUpdateDataComponentV2Args
{
    batch: DataComponentAsJSON[]
}


// UpdateDataComponentV2Response is what the client of the edge function
// receives.
export type ClientUpdateDataComponentV2Response =
{
    response: Response
    data: DataComponentAsJSON[]
    error?: null
} | {
    response: Response
    data?: null
    error: Error | { code: number, message: string }
}
