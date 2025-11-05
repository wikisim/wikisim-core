import { DebuggingState } from "./interface"


const state: DebuggingState = {
    logging_enabled: false,
    debugging_enabled: false,
}


export function initial_state(): DebuggingState
{
    return state
}


export function get_current_debugging_state(): DebuggingState
{
    return state
}
