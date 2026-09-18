# Account Cache

## Two-Tier Cache Architecture
- **L1 Cache (In-memory):** A Map scoped to the current page. Provides instant lookups for repeated comments from the same user on a single thread.
- **L2 Cache (Persistent):** Uses `chrome.storage.local`. Persists across page loads and browser restarts.

## Lookup Hierarchy
Page cache (L1) → Persistent cache (L2) → Network (Reddit API)

## Source of Truth
`chrome.storage.local` is authoritative. The page cache is strictly for performance during a single session.

## Stored Data
- **Cache Key:** Username (unique on Reddit).
- **Stored Data:** `AccountRecord` object containing:
  - `username`
  - `status`
  - `createdUtc`
  - `fetchedAtUtc`
- Stores facts (e.g., `createdUtc`), not conclusions (e.g., `isYoung`).

## Deduplication & Updates
- Concurrent lookups for the same username share a single network request.
- Immutable facts are preserved. For example, if an account is later suspended, the existing `createdUtc` is kept if previously known.

## Cache Lifecycle
- Persists through browser restarts.
- Lost if the user clears extension data (this is acceptable behavior).
- Rebuilds automatically on cache misses.
- No user-facing cache management in MVP.
