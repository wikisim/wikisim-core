import { DataComponent, NewDataComponent, Scenario } from "../data/interface"
import { indent } from "../utils/indent"


const INDENTATION = "    "


interface ScenarioCalculationRequest
{
    component: DataComponent | NewDataComponent
    scenario: Scenario
    /**
     * optionally add a `debugger` statement at the start of the code
     * to help with debugging.  Default false.
     */
    debugging?: boolean
}
export function prepare_scenario_javascript(request: ScenarioCalculationRequest)
{
    let javascript = "function calc()\n{\n"
    if (request.debugging) javascript += (INDENTATION + "debugger;\n\n")
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

    const use_previous_results = Object.entries(scenario_inputs).filter(v => v[1].use_previous_result)
    if (use_previous_results.length > 1)
    {
        throw new Error("Can only use_previous_result on one input at a time")
    }
    const use_previous_result = use_previous_results[0]

    // Build argument list in order, using scenario value or undefined
    // if no scenario value
    // If iterate_over flag is set to `true` then the argument will be filled in
    // by the iteration code below
    const args: string[] = []

    let indentation_level = 1

    let javascript = indent(`func = ${function_string};\n\n`, INDENTATION, indentation_level)

    let initial_result_value = "undefined"
    if (use_previous_result)
    {
        javascript += indent(`// Set initial result to "${use_previous_result[0]}" argument value\n`, INDENTATION, indentation_level)
        initial_result_value = use_previous_result[1].value.trim() || "undefined"
    }

    javascript += indent(`let result = ${initial_result_value};\n`, INDENTATION, indentation_level)

    if (iterate_over_inputs.length > 0)
    {
        javascript += indent(`const results = [];\n\n`, INDENTATION, indentation_level)
    }

    // Wrap in iteration if any inputs are marked as iterate_over
    function_inputs.forEach(input =>
    {
        const scenario_value = scenario_inputs[input.name]
        if (scenario_value?.iterate_over)
        {
            javascript += indent(`// iterate over argument "${input.name}"\n`, INDENTATION, indentation_level)
            javascript += indent(`const labels = ${scenario_value.value.trim() || "[]"};\n\n`, INDENTATION, indentation_level)

            javascript += indent(`labels.forEach(${input.name} =>\n{`, INDENTATION, indentation_level)
            indentation_level++

            // Argument will be filled in by this iteration
            args.push(input.name)
        }
        else if (scenario_value?.use_previous_result)
        {
            // Use previous result as input value
            args.push("result")
        }
        else
        {
            args.push(scenario_value?.value.trim() || "undefined")
        }
    })

    // Normal function call
    javascript += indent(`\nresult = func(${args.join(", ")});\n`, INDENTATION, indentation_level)

    if (iterate_over_inputs.length > 0)
    {
        javascript += indent(`results.push(result);`, INDENTATION, indentation_level)
    }
    else
    {
        javascript += indent(`\nreturn result;`, INDENTATION, indentation_level)
    }

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
