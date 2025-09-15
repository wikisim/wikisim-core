import type {
    DBDataComponentInsertV2ArgsComponent,
    DBDataComponentInsertV2Returns,
    DBDataComponentUpdateV2ArgsComponent,
    DBDataComponentUpdateV2Returns,
} from "./index.ts"


export interface EFInsertDataComponentV2Args
{
    // Use the same input type for this edge function as the RPC function
    batch: DBDataComponentInsertV2ArgsComponent[]
}


// InsertDataComponentV2Response is what the client of the edge function
// receives.
export type ClientInsertDataComponentV2Response =
{
    response: Response
    data: DBDataComponentInsertV2Returns
    error?: null
} | {
    response: Response
    data?: null
    error: Error | { code: number, message: string }
}


export interface EFUpdateDataComponentV2Args
{
    // Use the same input type for this edge function as the RPC function
    batch: DBDataComponentUpdateV2ArgsComponent[]
}


// UpdateDataComponentV2Response is what the client of the edge function
// receives.
export type ClientUpdateDataComponentV2Response =
{
    response: Response
    data: DBDataComponentUpdateV2Returns
    error?: null
} | {
    response: Response
    data?: null
    error: Error | { code: number, message: string }
}
