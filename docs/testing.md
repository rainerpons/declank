# Testing

## Framework
The project uses **vitest** with **jsdom** for running tests in a simulated browser environment.

## Running Tests
- Run all tests: `npm test`
- Run in watch mode: `npm run test:watch`

## Test Setup
- Uses a `chrome.storage` mock.
- State is auto-reset between tests to ensure isolation.

## Test Categories
- **Filter logic:** Evaluates generated usernames, account age parsing, and media-only rules.
- **Filter engine:** Tests OR semantics, short-circuit evaluation, and data dependencies.
- **Account parsing:** Tests handling of active, suspended, and malformed account data.
- **Cache hierarchy:** Verifies L1, L2, network lookups, and deduplication logic.
- **Settings service:** Tests loading, saving, and merging configuration.
- **Comment parsing:** Validates parsing using DOM fixtures and scoped selectors.
- **Collapse behavior:** Ensures native click and class fallback logic works.

## DOM Fixtures
Tests use DOM fixtures to create old Reddit-style comment elements, ensuring parsers work as expected on realistic DOM structures.

## Manual Testing
Always load the extension on `old.reddit.com` and verify the collapse behavior manually to ensure real-world functionality aligns with test results.
