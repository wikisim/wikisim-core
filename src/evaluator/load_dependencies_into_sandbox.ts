import type { DataComponent, NewDataComponent } from "../data/interface.ts"
import { deep_freeze } from "../utils/deep_freeze.ts"
import { deindent } from "../utils/deindent.ts"
import type { EvaluationRequest, EvaluationResponse } from "./interface.ts"



interface LoadDependenciesIntoSandboxArgs
{
    component: DataComponent | NewDataComponent
    data_component_by_id_and_version: Record<string, DataComponent>
    evaluate_code_in_sandbox: (request: EvaluationRequest) => Promise<EvaluationResponse>
    no_deep_freeze?: boolean
}
export function load_dependencies_into_sandbox(args: LoadDependenciesIntoSandboxArgs): Promise<EvaluationResponse>
{
    const {
        component,
        data_component_by_id_and_version,
        evaluate_code_in_sandbox,
        no_deep_freeze,
    } = args
    const dependency_ids = component.recursive_dependency_ids || []

    let js_dependencies = deindent(`
    ${no_deep_freeze ? `function deep_freeze(a) { return a }` : deep_freeze.toString()}
    `)

    for (const id of dependency_ids)
    {
        const dep = data_component_by_id_and_version[id.to_str()]
        if (!dep)
        {
            return Promise.reject(new Error(`Missing dependency with id ${id.to_str()}`))
        }

        if (dep.result_value === undefined)
        {
            js_dependencies += `\n// Dependency with id ${id.to_str()} has no result_value`
        }
        const dependency_js_value = dep.result_value ?? `undefined`
        // Do not use `const` here so that subsequent calls to `eval` will be
        // able to access these values
        js_dependencies += `\n${id.to_javascript_str()} = deep_freeze(${dependency_js_value});`
    }

    return evaluate_code_in_sandbox({
        js_input_value: js_dependencies,
        requested_at: performance.now(),
        timeout_ms: 10000,
    })
}
