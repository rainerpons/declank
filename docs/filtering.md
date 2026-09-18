# Filtering

## Filter Model
Each filter implements a standard interface with properties:
- `id`
- `name`
- `description`
- `enabled`/`disabled`
- `requiredData` (data needed for the filter to evaluate)
- `matches()` (evaluation logic)

## Evaluation Logic
- **OR semantics:** A comment is collapsed if ANY enabled filter matches.
- **Short-circuit:** Local filters are evaluated first. If a local filter matches, evaluation stops. Network requests (like account lookups) are only performed if needed.
- **Evaluation order:** Local filters first for performance.

## Filter Details

### Account Age Filter
- Calendar-aware comparison.
- Configurable threshold (value + unit).
- Fail-open on missing data.

### Generated Username Filter
- Matches Reddit's auto-generated formats:
  - PascalCase+digits
  - Underscore_Words_Digits
  - Hyphen-Words-Digits
- Includes known non-generated exclusions.
- No account lookup needed.

### Media-only Filter
- Detects `img`, `video`, `iframe`, `embed` tags.
- Detects media hosting links (e.g., giphy, tenor, imgur, redd.it).
- Strips media URLs from text to check for meaningful prose.
- No account lookup needed.

## Data Dependencies
Each filter declares what data it needs. Account lookups only happen when an account-requiring filter (like Account Age) is enabled and other filters have not already triggered a collapse.
