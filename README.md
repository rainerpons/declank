# Declank

**What is Declank?**
Declank is a Chrome extension that automatically collapses selected comments on old Reddit based on configurable filters.

**How it works:**
Comments matching any enabled filter are collapsed (not deleted). You can always expand them manually.

**Filters available:**
- **Account age:** Collapse comments from accounts younger than a configurable age (default: 1 year).
- **Generated usernames:** Collapse comments from usernames matching Reddit's auto-generated format (e.g., AdjectiveNoun1234).
- **Media-only:** Collapse comments that contain only a GIF, image, or video with no meaningful text.

**Configuration:**
Right-click the extension icon → Options (or go to `chrome://extensions` → Declank → Options).

**Important:**
Works on **old.reddit.com** only (not new Reddit or mobile).

**Privacy:**
All data stays in your browser. No external servers, no tracking, no accounts required. The extension only contacts Reddit to look up public account creation dates when the account age filter is enabled.

**Installation:**
Currently available as an unpacked extension for development. Chrome Web Store listing planned.

**Status:**
MVP / Early development.

For developer documentation, please see the [docs/](file:///Users/rainerpons/Documents/github/declank/docs/) folder.
