import { StateMachine } from "./state_machine"


function allowed_transitions(): Record<string, string[]> {
    return {
        "initializing": ["created"],
        "created": ["updating", "deleting"],
        "updating": ["updated"],
        "updated": ["updating", "deleting"],
        "deleting": ["deleted"],
        "deleted": []
    }
}

describe("State Machine", () => {
    test("should initialize with the correct state", () => {
        const state_machine = new StateMachine("initializing", allowed_transitions())
        expect(state_machine.get_state()).toBe("initializing")
    })

    test("should allow valid state transitions", () => {
        const state_machine = new StateMachine("initializing", allowed_transitions())

        state_machine.set_state("created")
        expect(state_machine.get_state()).toBe("created")

        state_machine.set_state("updating")
        expect(state_machine.get_state()).toBe("updating")
    })

    test("should throw an error for invalid state transitions", () => {
        const state_machine = new StateMachine("initializing", allowed_transitions())

        expect(() => {
            state_machine.set_state("updating") // Invalid transition from initializing to updating
        }).toThrow("Invalid state transition from initializing to updating")
    })
})
