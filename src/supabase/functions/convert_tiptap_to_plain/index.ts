import { deno_convert_tiptap_text_to_plain_text } from "./convert_tiptap_text_to_plain_text.deno.ts"


Deno.serve(async (req) =>
{
    // Handle CORS
    if (req.method === "OPTIONS")
    {
        return new Response("ok", { headers: corsHeaders })
    }

    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const { batch } = await req.json()

        if (!batch || !Array.isArray(batch))
        {
            return new Response(
                JSON.stringify({ error: "Invalid request format" }),
                {
                    status: 400,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json"
                    }
                }
            )
        }

        interface Item
        {
            id: string
            title: string
            description: string
        }

        // Handle batch conversion (for efficiency when processing multiple items)
        const results = batch.map((item: Item) =>
        ({
            id: item.id, // ID to match results back
            plain_title: deno_convert_tiptap_text_to_plain_text(item.title),
            plain_description: deno_convert_tiptap_text_to_plain_text(item.description),
        }))

        return new Response(
            JSON.stringify({ results }),
            {
                headers: {
                    ...corsHeaders,
                    "Content-Type": "application/json"
                }
            }
        )

    }
    catch (error)
    {
        return new Response(
            JSON.stringify({ error: (error as Error).message }),
            {
                status: 500,
                headers: {
                    ...corsHeaders,
                    "Content-Type": "application/json"
                }
            }
        )
    }
})


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}
