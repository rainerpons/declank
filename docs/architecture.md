# Architecture

## Extension Components
- **Content script:** Runs on old Reddit pages, scans comments, and applies filters.
- **Background service worker:** Handles background tasks, like caching and network requests.
- **Options page:** A React application to configure extension settings.

## Data Flow
Page load → Comment scan → Filter evaluation → Native collapse

## Module Boundaries
- `content/`: DOM manipulation and comment parsing.
- `filters/`: Filter logic and rules.
- `services/`: Network requests, caching.
- `models/`: Type definitions and data models.
- `storage/`: Persistence for settings and cache.

## Technology Stack
- TypeScript
- React 19
- Vite
- Tailwind CSS
- shadcn/ui
- p-limit
- p-retry

## Build System
Uses Vite with a multi-entry configuration to produce `content.js`, `background.js`, and `options.html` (with associated JS and CSS).

## Storage & Backend
- Uses Chrome storage (`chrome.storage.local`) for settings and the account cache.
- **No external backend.** Everything runs locally in the browser or interacts directly with Reddit's public APIs.
