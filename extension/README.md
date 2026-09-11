# Afterimage Browser Extension

The Afterimage browser extension is a Manifest V3 companion for **contextual memory**.

It keeps browser memories locally, lets you explicitly capture a useful clue, and can resurface a matching memory when the current page becomes relevant again.

## What it does

- Captures a memory from the active page.
- Stores browser memories in `chrome.storage.local`.
- Matches page context using a small, explainable local scorer.
- Shows a contextual resurfacing card with confidence and return-condition information.
- Records explicit **Useful** feedback.
- Lets you dismiss a resurfacing with **Not now**.
- Sends browser memories to the main Afterimage app only when you press the bridge button.
- Imports memories back from the main app through the explicit bridge flow.
- Supports a configurable Afterimage app URL from extension settings.

## Privacy boundary

The extension is intentionally user-controlled.

- No browsing-history permission.
- No analytics endpoint.
- No silent remote memory synchronization.
- No advertising or engagement tracking.
- Context is processed locally for the extension's matching behavior.
- Browser → app transfer happens only after an explicit user action.
- The bridge payload is placed in the URL fragment rather than the normal request path.

The extension does use a content script because contextual resurfacing needs the current page's visible text. This is different from collecting browsing history: the extension does not build or upload a history of visited pages.

## Install locally

1. Open Chrome or Edge.
2. Open `chrome://extensions` or `edge://extensions`.
3. Enable **Developer mode**.
4. Choose **Load unpacked**.
5. Select this repository's `extension/` directory.
6. Open a normal web page.
7. Open the Afterimage extension.
8. Capture a clue and press **Save Afterimage**.
9. Press **Check context** to test resurfacing.

Reload the unpacked extension after changing extension files.

## Main app bridge

To send browser memories to the main app:

1. Open the extension popup.
2. Press **Send browser memories to Afterimage**.
3. The Afterimage `/extension-bridge` page opens.
4. Review the incoming memories.
5. Press **Merge into Memory library**.

The reverse flow can import exported Afterimage memories into the extension through the bridge handoff.

## Settings

Open **Extension settings** from the popup to choose the Afterimage app URL.

The destination is normalized to its origin before storage. Sync remains explicit; changing the destination does not enable background synchronization.

## Release packaging

See [`docs/EXTENSION_RELEASES.md`](../docs/EXTENSION_RELEASES.md) for local testing, automated validation and tagged release instructions.

The extension release workflow uses tags such as `extension-v0.9.2` and attaches a packaged ZIP to the GitHub Release.
