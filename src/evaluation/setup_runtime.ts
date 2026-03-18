import { request_versioned_data_component_and_dependencies } from "../data/fetch_from_db"
import { IdAndVersion } from "../data/id"
import { AsyncDataComponent, AsyncDataComponentAndDependencies, DataComponent } from "../data/interface"
import { __dangerously_evaluate_code_without_sandbox } from "../evaluator/implementation/__dangerously_evaluate_code_without_sandbox"
import { evaluate_code_in_browser_sandbox } from "../evaluator/implementation/browser_sandboxed_javascript"
import { load_dependencies_into_runtime } from "../evaluator/load_dependencies_into_runtime"
import { GetSupabase } from "../supabase/browser"


export type SetupRuntimeResponse =
{
    error: Error
    component: null
} |
{
    error: null
    component: DataComponent
}


interface SetupRuntimeArgs
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


export function setup_runtime(args: SetupRuntimeArgs): Promise<SetupRuntimeResponse[]>
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



/*******************************************************************************
 *
 * Added this function back just in case it is needed by a client, it's just
 * a convenience wrapper around request_versioned_data_component_and_dependencies
 * that returns the dependencies as AsyncDataComponentAndDependencies which
 * allows for easier use by setup_runtime.
 *
 * TODO: move this to a more appropriate file / refactor
 ******************************************************************************/
interface RequestDependenciesArgs
{
    get_supabase: GetSupabase
}

type id_or_ids = ({
    id: IdAndVersion
    ids?: never
} | {
    ids: IdAndVersion[]
    id?: never
})

export function request_dependencies(args: RequestDependenciesArgs & id_or_ids): Promise<AsyncDataComponentAndDependencies[]>
{
    const ids = args.ids ?? [args.id]

    return Promise.all(ids.map(id => _request_dependencies(id, args)))
}


function _request_dependencies(id: IdAndVersion, args: RequestDependenciesArgs): Promise<AsyncDataComponentAndDependencies>
{
    const { get_supabase } = args

    let response: AsyncDataComponentAndDependencies = {
        id,
        component: null,
        status: "loading",
        dependencies: [],
        to_load: 1,
        loaded: 0,
        all_loaded: false,
    }

    return request_versioned_data_component_and_dependencies(get_supabase, id)
    .then(components_response =>
    {
        if (components_response.error)
        {
            return Promise.resolve<AsyncDataComponentAndDependencies>({
                ...response,
                status: "error",
                error: components_response.error,
            })
        }

        const component = components_response.data[0]
        if (!component)
        {
            return Promise.resolve<AsyncDataComponentAndDependencies>({
                ...response,
                status: "not_found",
            })
        }

        const dependencies = components_response.data.slice(1)
        const { recursive_dependency_ids = [] } = component
        if (dependencies.length !== recursive_dependency_ids.length)
        {
            const error = new Error(`Expected ${recursive_dependency_ids.length } dependencies but got ${dependencies.length}.`)
            return Promise.resolve<AsyncDataComponentAndDependencies>({
                ...response,
                status: "error",
                error,
            })
        }

        // Just wrap the dependencies for now
        const async_dependencies: AsyncDataComponent[] = dependencies.map(d => ({
            id: d.id,
            component: d,
            status: "loaded",
        }))

        return Promise.resolve<AsyncDataComponentAndDependencies>({
            ...response,
            status: "loaded",
            component,
            dependencies: async_dependencies,
            to_load: 1 + dependencies.length,
            loaded: 1 + dependencies.length,
            all_loaded: true,
        })
    })
}
