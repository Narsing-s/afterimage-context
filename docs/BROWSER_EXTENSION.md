# Afterimage Browser Extension

Afterimage now has a local-first browser layer that turns contextual memory into a real-time product loop.

## What it does

1. Open the extension on any normal web page.
2. Write a clue for your future self and an optional return condition.
3. The memory is stored in `chrome.storage.local` on the device.
4. When a later page has enough textual overlap with the memory, Afterimage can show a small contextual card.
5. Choose **Useful** or **Not now**. Useful feedback increments the resurfacing count so the product can learn which memories actually help.

## Why this is different

The extension is intentionally not a browser history tracker. It does not need a remote AI service, does not build a browsing-history database, and only inspects the current page through the extension content script.

The first matching engine is deliberately simple and explainable: it compares meaningful words from the saved clue/trigger against the current page title, hostname, URL, and visible text. This gives us a deterministic baseline before introducing optional on-device semantic matching.

## Install locally

1. Open Chrome or Edge and visit the extensions page.
2. Enable **Developer mode**.
3. Choose **Load unpacked**.
4. Select the repository's `extension/` folder.
5. Open a normal HTTPS page and click the Afterimage toolbar icon.

Restricted pages such as browser settings pages may not allow content scripts; the popup still shows the current tab when the browser exposes it.

## Privacy boundary

- Storage: device-local `chrome.storage.local`.
- No analytics endpoint.
- No remote API is required for capture or matching.
- No automatic browser-history import.
- Resurfacing is explainable with a match-confidence indicator.
- Users can dismiss a resurfacing without deleting the memory.

## Next evolution

- Connect extension memories to the Afterimage web app import/export format.
- Add optional on-device embeddings for stronger semantic matching.
- Add explicit calendar/GitHub context providers.
- Add a user-controlled context permission center.
- Add memory expiry and confidence decay.
