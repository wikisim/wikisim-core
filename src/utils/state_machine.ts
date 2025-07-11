

// Implement a simple generic state machine
export class StateMachine<T extends string | number | symbol>
{
    private _state: T
    private _allowed_transitions: Record<T, T[]>

    constructor(initial_state: T, allowed_transitions: Record<T, T[]>)
    {
        this._state = initial_state
        this._allowed_transitions = allowed_transitions
    }

    get_state(): T
    {
        return this._state
    }

    set_state(new_state_or_updater: T | ((state: T) => T)): void
    {
        const { valid, new_state } = this.validate_transition(new_state_or_updater)
        if (!valid)
        {
            throw new Error(`Invalid state transition from ${String(this._state)} to ${String(new_state)}`)
        }
        this._state = new_state
    }

    validate_transition(new_state_or_updater: T | ((state: T) => T)): { valid: boolean, new_state: T }
    {
        let new_state: T
        if (typeof new_state_or_updater === "function")
        {
            new_state = new_state_or_updater(this._state)
        }
        else
        {
            new_state = new_state_or_updater
        }

        return {
            valid: this._allowed_transitions[this._state].includes(new_state),
            new_state,
        }
    }
}
