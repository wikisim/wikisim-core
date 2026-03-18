import { AsyncDataComponentAndDependencies, DataComponent } from "../data/interface"
import { __dangerously_evaluate_code_without_sandbox } from "../evaluator/implementation/__dangerously_evaluate_code_without_sandbox"
import { evaluate_code_in_browser_sandbox } from "../evaluator/implementation/browser_sandboxed_javascript"
import { load_dependencies_into_runtime } from "../evaluator/load_dependencies_into_runtime"


export type SetupRuntimeResponse =
{
    error: Error
    component: null
} |
{
    error: null
    component: DataComponent
}


interface SetupRuntimeParams
{
    components: AsyncDataComponentAndDependencies
    debugging?: boolean
    /**
     * SECURITY WARNING:
     *
     * Setting __dangerously_skip_sandboxing to true will run the code of the
     * component and all of its dependencies directly in the main browser thread
     * or a node environment without any sandboxing or security protections.
     * This can be very dangerous and can lead to malicious code running on your
     * computer, which could steal your data, damage your files, or worse.
     *
     * Be sure to check the page's (component's) code, and the code of all of
     * the pages it depends on are safe to run on your computer.  At the moment
     * all code on WikiSim should be treated as unsafe until you personally verify it.
     *
     * Otherwise you should not enable this setting and you will instead need to
     * run this code in a sandboxed environment, such
     * as a separate browser profile or a virtual machine, to protect your
     * computer from potentially malicious code.
     */
    __dangerously_skip_sandboxing?: boolean
}


export function setup_runtime(args: SetupRuntimeParams): Promise<SetupRuntimeResponse[]>
{
    const { components, debugging, __dangerously_skip_sandboxing } = args

    if (components.status !== "loaded")
    {
        return Promise.resolve<SetupRuntimeResponse[]>([{
            error: new Error(`Components not loaded, cannot setup runtime. Status: ${components.status}`),
            component: null
        }])
    }
    if (components.error)
    {
        return Promise.resolve<SetupRuntimeResponse[]>([{
            error: new Error(`Error in components passed to setup_runtime ${components.error}`),
            component: null
        }])
    }

    const { component, dependencies: async_dependencies } = components
    if (!component)
    {
        return Promise.resolve<SetupRuntimeResponse[]>([{
            error: new Error(`Component not found for id ${components.id.to_str()}`),
            component: null
        }])
    }

    const dependencies = async_dependencies.filter(d => d.component).map(d => d.component as DataComponent)
    if (dependencies.length !== async_dependencies.length)
    {
        return Promise.resolve<SetupRuntimeResponse[]>([{
            error: new Error(`Some dependencies not found for component id ${component.id.to_str()}`),
            component: null
        }])
    }


    const data_components_by_id_and_version: Record<string, DataComponent> = {}
    for (const dc of dependencies)
    {
        data_components_by_id_and_version[dc.id.to_str()] = dc
    }

    return load_dependencies_into_runtime({
        component,
        data_components_by_id_and_version,
        evaluate_code_in_runtime: __dangerously_skip_sandboxing
            ? __dangerously_evaluate_code_without_sandbox
            : evaluate_code_in_browser_sandbox,
        debugging,
    })
    .then(sandbox_response =>
    {
        if (sandbox_response.error)
        {
            console.error("Error loading dependencies into sandbox:", sandbox_response.error)

            return Promise.resolve<SetupRuntimeResponse[]>([{
                error: new Error(sandbox_response.error),
                component: null
            }])
        }

        return Promise.resolve([{ error: null, component }])
    })
}
