import { useEffect } from "preact/hooks"

import { EvaluationRequest, EvaluationResponse } from "./interface"


let next_evaluation_id = 0

let iframe: HTMLIFrameElement
let resolve_iframe_loaded: (value: true | PromiseLike<true>) => void
const iframe_loaded = new Promise<true>(resolve => {
    resolve_iframe_loaded = resolve
})

interface ExtendedEvaluationRequest extends EvaluationRequest
{
    evaluation_id: number
    requested_at: number
    start_time: number
    timeout_id?: ReturnType<typeof setTimeout>
    promise_result: Promise<EvaluationResponse>
    resolve: (response: EvaluationResponse) => void
}

export async function evaluate_code_in_browser_sandbox(basic_request: EvaluationRequest): Promise<EvaluationResponse>
{
    let resolve: (response: EvaluationResponse) => void
    const promise_result = new Promise<EvaluationResponse>(resolv => resolve = resolv)
    const request: ExtendedEvaluationRequest = {
        timeout_ms: 100, // Default timeout of 100 ms
        ...basic_request,
        evaluation_id: ++next_evaluation_id,
        requested_at: performance.now(),
        start_time: -1,
        promise_result,
        resolve: resolve!,
    }


    // Wait for iframe to load, with timeout
    const iframe_loading_timeout = new Promise<void>(resolve_iframe_loaded =>
    {
        setTimeout(resolve_iframe_loaded, request.timeout_ms)
    })
    const loaded = await Promise.race([iframe_loaded, iframe_loading_timeout])
    if (!loaded) return {
        ...request,
        error: "Timeout waiting for sandboxed iframe to load.",
        result: null,
        end_time: performance.now(),
    }


    // Ensure evaluations are processed in order, one at a time
    await request_next_evaluation(request)


    request.start_time = performance.now()
    // type guard, should never be null unless during dev when the
    // iframe can be removed
    if (iframe.contentWindow === null) return {
        ...request,
        error: "sandboxed iframe has gone missing",
        result: null,
        end_time: performance.now(),
    }

    // Send stringified call request object into iframe
    // console .log(`Sending evaluation request to sandboxed iframe: ${call.evaluation_id} with code: ${call.value} at ${existing_call_in_progress.start_time}ms`)
    iframe.contentWindow.postMessage(JSON.stringify(request), "*")

    // Timeout if no response
    request.timeout_id = setTimeout(() => {
        const existing_call_in_progress = requests[request.evaluation_id]
        if (!existing_call_in_progress) return
        delete requests[existing_call_in_progress.evaluation_id]

        const failure: EvaluationResponse = {
            ...request,
            error: `Timeout waiting for response from sandboxed iframe.`,
            result: null,
            end_time: performance.now(),
        }

        request.resolve(failure)
    }, request.timeout_ms)

    return promise_result
}


const requests: Record<number, ExtendedEvaluationRequest> = {}
let previous_request: ExtendedEvaluationRequest | undefined
async function request_next_evaluation(request: ExtendedEvaluationRequest)
{
    requests[request.evaluation_id] = request

    const previous_promise_result = previous_request?.promise_result
    previous_request = request

    await previous_promise_result
}


export function Evaluator()
{
    useEffect(() => {
        // --- Create hidden sandboxed iframe ---
        iframe = document.createElement("iframe")

        // The sandbox attribute is key:
        // - allow-scripts: lets code inside run
        // - no same-origin, no storage, no network
        iframe.setAttribute("sandbox", "allow-scripts")
        iframe.style.display = "none"

        // Load a blank page with a script that listens for code
        const raw_src_doc = `
        // Add mathjs from https://unpkg.com/mathjs@14.7.0/lib/browser/math.js
        // Alternatives listed here: https://mathjs.org/download.html
        <script src="https://unpkg.com/mathjs@14.7.0/lib/browser/math.js"></script>

        <script>
            // Expose some global functions for easier use
            window.range = (...args) => math.range(...args).toArray();
        </script>

        <script>
            // console .log(' [iFrame] ==========> Sandboxed iframe loaded');
            // console .log(' [iFrame] ==========> mathjs...', window.math);

            window.addEventListener('message', (e) => {
                const payload = JSON.parse(e.data);
                // console .log(' [iFrame] ==========> received payload:', payload);
                try {
                    // Evaluate the code inside the sandboxed iframe
                    const result = eval(payload.value);
                    const result_json = JSON.stringify(result);
                    console .log(' [iFrame] ==========> Success, result:', result_json);
                    e.source.postMessage({
                        evaluation_id: payload.evaluation_id,
                        result: result_json,
                        error: null,
                    }, '*');
                } catch (err) {
                    // console .log(' [iFrame] ==========> Error:', err);
                    e.source.postMessage({
                        evaluation_id: payload.evaluation_id,
                        result: null,
                        error: err.toString(),
                    }, '*');
                }
            });
        </script>
        `
        iframe.srcdoc = raw_src_doc

        iframe.onload = () => resolve_iframe_loaded(true)
        iframe.onerror = e => console .error('Iframe error:', e)

        document.body.appendChild(iframe)


        // --- Communication setup ---
        function handle_message_from_iframe(event: MessageEvent<EvaluationResponse>)
        {
            // console .log("Received message from sandboxed iframe:", event.data)
            if (event.source === iframe.contentWindow)
            {
                const existing_call_in_progress = requests[event.data.evaluation_id]
                if (!existing_call_in_progress) return
                delete requests[existing_call_in_progress.evaluation_id]

                clearTimeout(existing_call_in_progress.timeout_id)

                let response: EvaluationResponse = {
                    ...existing_call_in_progress,
                    result: "",
                    error: null,
                    end_time: performance.now(),
                }

                if (event.data.error)
                {
                    response = {
                        ...response,
                        result: null,
                        error: event.data.error,
                    }
                }
                else if (event.data.result !== null)
                {
                    response = {
                        ...response,
                        // Ensure result is a string if it's not null
                        result: `${event.data.result}`,
                        error: null,
                    }
                }

                existing_call_in_progress.resolve(response)
            }
        }
        window.addEventListener("message", handle_message_from_iframe)


        return () =>
        {
            window.removeEventListener("message", handle_message_from_iframe)
            // Remove sandboxed iframe
            document.body.removeChild(iframe)
        }
    }, [])

    return null
}
