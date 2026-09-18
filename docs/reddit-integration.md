# Reddit Integration

## DOM Structure (Old Reddit)
Comments follow this basic structure:
`.comment > .entry > .tagline + .usertext-body > .md`

## Scoped Selectors
To avoid applying rules to nested replies incorrectly, scoped selectors like `:scope > .entry` are used.

## Collapse Behavior
- **Native collapse:** The extension clicks the native `.tagline .expand` button to toggle the collapse state, making it feel native to the user.
- **Fallback:** If the button cannot be interacted with, it falls back to toggling `.collapsed` / `.noncollapsed` CSS classes.

## Account Lookup API
To fetch account data (e.g., for the Account Age filter), the extension makes a request:
`GET https://www.reddit.com/user/{username}/about.json`

### Response Shapes
- **Active account:** `{ kind: "t2", data: { name, created_utc, id } }`
- **Suspended account:** `{ kind: "t2", data: { name, is_suspended: true } }` — may lack `created_utc`.
- **Deleted/Nonexistent accounts:** Returns a 404.

### Rate Limiting
Reddit may return a 429 status code with a `Retry-After` header. The extension respects this limit.
