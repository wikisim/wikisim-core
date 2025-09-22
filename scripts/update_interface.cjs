const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")
const { exit } = require("process")


execSync(
  "npx supabase gen types typescript --project-id sfkgqscbwofiphfxhnxg --schema public > src/supabase/interface2.ts",
  { stdio: "inherit" }
)


const target_file = path.resolve(__dirname, "../src/supabase/interface2.ts")
const regex_patterns = [
    /access_controls: \{/,
    /bases: \{/,
    /knowledge_views: \{/,
    /wcomponents: \{/,
    /get_bases_editable_for_authorised_user: \{/,
    /get_bases_editable_or_viewable_for_authorised_user: \{/,
    /get_fellow_access_control_user_ids_for_authorised_user: \{/,
    /get_owned_access_control_user_ids_for_authorised_user: \{/,
    /get_owned_base_ids_for_authorised_user: \{/,
    /get_owner_user_ids_for_authorised_user: \{/,
    /ids_of_public_bases: \{/,
    /invite_user_to_base: \{/,
    /move_ids_to_new_base: \{/,
    /owner_user_ids_of_public_bases: \{/,
    /update_knowledge_view: \{/,
    /update_wcomponent: \{/,
    /uuid_or_null: \{/,

    /access_control_level: \[/,
    /accesscontrollevel: \[/,
    /accesscontrollevel2: \[/,
]

// Read file
const content = fs.readFileSync(target_file, "utf8")
let lines = content.split("\n")


regex_patterns.forEach((regex_pattern) =>
{
    const bracket = regex_pattern.source.endsWith("{") ? "{" : "["
    let found_on_line = undefined
    let match = null
    lines.forEach((line, idx) =>
    {
        if (match) return
        found_on_line = idx
        match = regex_pattern.exec(line)
    })

    if (found_on_line === undefined || !match)
    {
        console.error(`Pattern not found: ${regex_pattern}`)
        exit(1)
    }

    // Find the closing brace at the same indentation level
    let brace_count = 0
    let end_line = undefined
    for (let i = found_on_line; i < lines.length; i++)
    {
        const line = lines[i]
        // Count opening and closing braces
        for (const char of line)
        {
            if (bracket === "{")
            {
                if (char === "{") brace_count++
                if (char === "}") brace_count--
            }
            else
            {
                if (char === "[") brace_count++
                if (char === "]") brace_count--
            }
        }

        if (brace_count === 0)
        {
            end_line = i
            break
        }
    }

    if (end_line === undefined)
    {
        console.error(`Could not find closing brace for pattern: ${regex_pattern}`)
        exit(1)
    }

    // console.log(`Removing lines from ${found_on_line + 1} to ${end_line + 1}`)

    // Remove lines from found_on_line to end_line
    lines.splice(found_on_line, end_line - found_on_line + 1)
})



fs.writeFileSync(path.resolve(__dirname, "../src/supabase/interface2.ts"), lines.join("\n"), "utf8")

console.log("Done: Removed lines matching patterns.")
