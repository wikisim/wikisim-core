# Supabase Edge Function Deployment Guide

Suggest installed Denoland extension for Deno support in VS Code: https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno

## Prerequisites
1. Install Supabase CLI: `npm install -g supabase`
2. Login to Supabase: `supabase login`
3. Link your project: `supabase link --project-ref sfkgqscbwofiphfxhnxg`

## Deploy the Edge Function

From your project root, run:
```bash
supabase functions deploy convert_tiptap_to_plain
```

## Test the Function

```bash
curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/convert_tiptap_to_plain' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "batch": [
      {
        "id": "1",
        "title": "<h1>Title</h1>",
        "description": "<p>Description <em>text</em></p>"
      }
    ]
  }'
```

## Environment Variables (if needed)
Create a `.env.local` file in your functions directory:
```
CUSTOM_VAR=value
```

## Adding JavaScript Dependencies
To add npm packages to your Edge Function:

1. Create an `import_map.json` file:
```json
{
  "imports": {
    "tiptap": "https://esm.sh/@tiptap/core@2.0.0"
  }
}
```

2. Update your function to use the import map:
```typescript
// At the top of index.ts
import { Editor } from "tiptap"
```

3. Deploy with the import map:
```bash
supabase functions deploy convert_tiptap_to_plain --import-map ./import_map.json
```

## Performance Considerations
- Edge Functions have a 30-second timeout
- Consider batching multiple conversions in one call
- Functions auto-scale based on demand
- Cold starts may add ~100-200ms latency

## Error Handling
The function includes:
- CORS headers for browser requests
- Graceful error handling with fallbacks
- Input validation for request format
