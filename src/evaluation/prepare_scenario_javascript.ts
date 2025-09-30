import { DataComponent, NewDataComponent, Scenario } from "../data/interface"
import { indent } from "../utils/indent"


const INDENTATION = "    "


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

    // Temporarily restrict to one iterate_over input.  This could be changed in
    // future to support multiple iterate_over inputs by using nested loops
    const iterate_over_inputs = Object.values(scenario_inputs).filter(v => v.iterate_over)
    if (iterate_over_inputs.length > 1)
    {
        throw new Error("Can only iterate over one input at a time")
    }

    // Build argument list in order, using scenario value or undefined
    // if no scenario value
    // If iterate_over flag is set to `true` then the argument will be filled in
    // by the iteration code below
    const args: string[] = []

    let indentation_level = 1

    let javascript = indent(`func = ${function_string};\n\n`, INDENTATION, indentation_level)
    // Wrap in iteration if any inputs are marked as iterate_over
    function_inputs.forEach(input =>
    {
        const scenario_value = scenario_inputs[input.name]
        if (scenario_value?.iterate_over)
        {
            javascript += indent(`// iterate over argument "${input.name}"\n`, INDENTATION, indentation_level)
            javascript += indent(`labels = ${scenario_value.value}\n`, INDENTATION, indentation_level)
            javascript += indent(`results = labels.map(${input.name} =>\n{\n`, INDENTATION, indentation_level)
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
    javascript += indent(`return func(${args.join(", ")});`, INDENTATION, indentation_level)

    // Close any iteration blocks
    function_inputs.forEach((input) =>
    {
        const scenario_value = scenario_inputs[input.name]
        if (scenario_value?.iterate_over)
        {
            indentation_level--
            javascript += indent("\n});\n\n", INDENTATION, indentation_level)
            javascript += indent(`return { labels, results };`, INDENTATION, indentation_level)
        }
    })

    return javascript
}
