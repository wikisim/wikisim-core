import { DataComponent, NewDataComponent, Scenario } from "../data/interface"
import { indent } from "../utils/indent"


interface ScenarioCalculationRequest
{
    component: DataComponent | NewDataComponent
    scenario: Scenario
}
export function prepare_scenario_javascript(request: ScenarioCalculationRequest)
{
    let javascript = "function calc()\n{\n"
    javascript += prepare_function_call_javascript(request)
    javascript += "\n}\ncalc();"
    return javascript
}

function prepare_function_call_javascript(request: ScenarioCalculationRequest): string
{
    // Get function string and inputs
    const function_string = request.component.result_value || ""
    const function_inputs = request.component.function_arguments || []
    const scenario_inputs = request.scenario.values

    // Build argument list in order, using scenario value or undefined
    // if no scenario value
    // If usage is "iterate_over" then the argument will be filled in
    // by the iteration code below
    const args: string[] = []

    const indentation = "    "
    let indentation_level = 1

    let javascript = indent(`func = ${function_string};\n\n`, indentation, indentation_level)
    // Wrap in iteration if any inputs are marked as iterate_over
    function_inputs.forEach((input, index) =>
    {
        const scenario_value = scenario_inputs[input.name]
        if (scenario_value?.usage === "iterate_over")
        {
            javascript += indent(`// iterate over argument "${input.name}"\n`, indentation, indentation_level)
            javascript += indent(`return ${scenario_value.value}.map(${input.name} =>\n{\n`, indentation, indentation_level)
            indentation_level++

            // Argument will be filled in by this iteration
            args.push(input.name)
        }
        else
        {
            args.push(scenario_value ? scenario_value.value : "undefined")
        }
    })

    // Normal function call
    javascript += indent(`return func(${args.join(", ")});`, indentation, indentation_level)

    // Close any iteration blocks
    function_inputs.forEach((input) =>
    {
        const scenario_value = scenario_inputs[input.name]
        if (scenario_value?.usage === "iterate_over")
        {
            indentation_level--
            javascript += indent("\n});", indentation, indentation_level)
        }
    })

    return javascript
}
