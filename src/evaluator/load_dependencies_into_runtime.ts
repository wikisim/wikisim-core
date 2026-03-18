import type { DataComponent, NewDataComponent } from "../data/interface.js"
import { ERRORS } from "../errors.js"
import { deep_freeze_str } from "../utils/deep_freeze.js"
import type { EvaluationRequest, EvaluationResponse } from "./interface.js"



interface LoadDependenciesIntoSandboxArgs
{
    component: DataComponent | NewDataComponent
    data_components_by_id_and_version: Record<string, DataComponent>
    evaluate_code_in_runtime: (request: EvaluationRequest) => Promise<EvaluationResponse>
    is_node?: boolean
    no_deep_freeze?: boolean
    debugging?: boolean
}
export function load_dependencies_into_runtime(args: LoadDependenciesIntoSandboxArgs): Promise<EvaluationResponse>
{
    const {
        component,
        data_components_by_id_and_version,
        evaluate_code_in_runtime,
        is_node = false,
        no_deep_freeze,
    } = args
    const dependency_ids = component.recursive_dependency_ids || []

    if (dependency_ids.length !== Object.keys(data_components_by_id_and_version).length)
    {
        return errored(ERRORS.ERR39.message + ` Expected ${dependency_ids.length} dependencies but got ${Object.keys(data_components_by_id_and_version).length}`)
    }

    let js_dependencies = (
        (args.debugging ? "debugger;\n\n" : "") +
        // Have to use `deep_freeze_str` here instead of importing and using
        // `deep_freeze.toString()` directly because the code is going to be
        // minified on build and deploy and that will break the function
        (no_deep_freeze ? `function deep_freeze(a) { return a }` : deep_freeze_str) + "\n"
    )

    for (const id of dependency_ids)
    {
        const dep = data_components_by_id_and_version[id.to_str()]
        if (!dep)
        {
            return errored(ERRORS.ERR40.message + ` Missing dependency with id ${id.to_str()}`)
        }

        if (dep.result_value === undefined)
        {
            js_dependencies += `\n// Dependency with id ${id.to_str()} has no result_value`
        }
        const dependency_js_value = dep.result_value ?? `undefined`
        // Do not use `const` here so that subsequent calls to `eval` will be
        // able to access these values as global variables.
        // But we use `var` to allow this to run (potentially unsafe code) in
        // node.  I do not think we can use `let` because if the code is run
        // multiple times in the same context then the second time it will throw
        // an error because the variable has already been declared.
        js_dependencies += `\n${is_node ? "var " : ""}${id.to_javascript_str()} = deep_freeze(${dependency_js_value});`
    }

    js_dependencies += `\n\n"loaded_dependencies";`

    return evaluate_code_in_runtime({
        js_input_value: js_dependencies,
        requested_at: performance.now(),
        timeout_ms: 10000,
    })
}


function errored(message: string): Promise<EvaluationResponse>
{
    return Promise.resolve({
        result: null,
        error: message,
        evaluation_id: 0,
        js_input_value: "",
        requested_at: 0,
        start_time: 0,
        end_time: 0,
    })
}
