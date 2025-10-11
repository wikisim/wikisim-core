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


export interface EFUploadInteractableFilesMap
{
    [file_path: string]: File
}


// UpdateDataComponentV2Response is what the client of the edge function
// receives.
export type UploadInteractableFilesResponse =
{
    response: Response
    data: { [file_path: string]: string } // map of file_path to Supabase storage's file_id
    error?: null
} | {
    response: Response
    data?: null
    error: Error
}
