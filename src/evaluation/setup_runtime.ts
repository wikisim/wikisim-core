import {
    request_versioned_data_component_and_dependencies
} from "../data/fetch_from_db"
import { IdAndVersion } from "../data/id"
import { DataComponent } from "../data/interface"
import { __dangerously_evaluate_code_without_sandbox } from "../evaluator/implementation/__dangerously_evaluate_code_without_sandbox"
import { evaluate_code_in_browser_sandbox } from "../evaluator/implementation/browser_sandboxed_javascript"
import { load_dependencies_into_runtime } from "../evaluator/load_dependencies_into_runtime"
import { GetSupabase } from "../supabase/browser"


export type RequestDependenciesAndSetupSandboxResponse =
{
    error: Error
    component: null
} |
{
    error: null
    component: DataComponent
}


interface RequestDependenciesAndSetupRuntimeParams
{
    get_supabase: GetSupabase
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

type id_or_ids = ({
    id: IdAndVersion
    ids?: never
} | {
    ids: IdAndVersion[]
    id?: never
})

export function request_dependencies_and_setup_runtime(args: RequestDependenciesAndSetupRuntimeParams & id_or_ids): Promise<RequestDependenciesAndSetupSandboxResponse[]>
{
    const ids = args.ids ?? [args.id]

    return Promise.all(ids.map(id => _request_dependencies_and_setup_runtime(id, args)))
}


function _request_dependencies_and_setup_runtime(id: IdAndVersion, args: RequestDependenciesAndSetupRuntimeParams): Promise<RequestDependenciesAndSetupSandboxResponse>
{
    const { get_supabase, debugging = false, __dangerously_skip_sandboxing = false } = args

    let component: DataComponent

    return request_versioned_data_component_and_dependencies(get_supabase, id)
    .then(components_response =>
    {
        if (components_response.error)
        {
            return Promise.resolve({ error: components_response.error, component: null })
        }

        const maybe_component = components_response.data[0]
        if (!maybe_component)
        {
            return Promise.resolve<RequestDependenciesAndSetupSandboxResponse>({
                error: new Error(`Component not found for id ${id.to_str()}`),
                component: null
            })
        }
        component = maybe_component

        const data_components_by_id_and_version: Record<string, DataComponent> = {}
        for (const dc of components_response.data.slice(1))
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

                return Promise.resolve<RequestDependenciesAndSetupSandboxResponse>({
                    error: new Error(sandbox_response.error),
                    component: null
                })
            }

            return Promise.resolve({ error: null, component })
        })
    })
}
