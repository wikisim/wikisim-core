import {
    request_versioned_data_component_and_dependencies
} from "../data/fetch_from_db"
import { IdAndVersion } from "../data/id"
import { DataComponent } from "../data/interface"
import { evaluate_code_in_browser_sandbox } from "../evaluator/browser_sandboxed_javascript"
import { load_dependencies_into_sandbox } from "../evaluator/load_dependencies_into_sandbox"
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

export function request_dependencies_and_setup_sandbox(get_supabase: GetSupabase, id: IdAndVersion, debugging = false): Promise<RequestDependenciesAndSetupSandboxResponse>
{
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

        return load_dependencies_into_sandbox({
            component,
            data_components_by_id_and_version,
            evaluate_code_in_sandbox: evaluate_code_in_browser_sandbox,
            debugging,
        })
        .then(sandbox_response =>
        {
            if (sandbox_response.error)
            {
                return Promise.resolve<RequestDependenciesAndSetupSandboxResponse>({
                    error: new Error(sandbox_response.error),
                    component: null
                })
            }

            return Promise.resolve({ error: null, component })
        })
    })
}
