// This was changed from "preact/hooks" to "react" to fix bug in EnergyExplorerV2
// where it would error with `Uncaught TypeError: can't access property "__H", r2 is undefined`
// but using `import { useEffect } from "react"` results in the integration tests
// (when running pnpm run dev and visiting http://localhost:5173/test/) failing with
// Uncaught (in promise) TypeError: error loading dynamically imported module: http://localhost:5173/node_modules/.vite/deps/preact_compat.js?t=1777223123107&v=8ce63fb1
// Changing back to "preact/hooks" for now but when the problem emerges again then
// we will document it and see if we can find a solution that meets both of these requirements
import { useEffect } from "preact/hooks"
// import { useEffect } from "react"

import { setup_sandboxed_iframe } from "./browser_sandboxed_javascript"


export function Evaluator()
{
    useEffect(() => {
        const { clean_up } = setup_sandboxed_iframe({ logging: false })
        return clean_up
    }, [])

    return null
}
