# Browser Extension Releases

Afterimage ships the browser extension separately from the web app so browser contributors can test and distribute a small, auditable artifact.

## Current extension

The Manifest V3 extension lives in `extension/` and currently provides:

- local memory capture from the active page
- explicit contextual resurfacing
- Useful / Not now feedback
- browser → app memory handoff through `/extension-bridge`
- app → browser memory handoff
- configurable Afterimage app destination
- no browsing-history permission
- no analytics or background remote memory sync

## Local testing

1. Open Chrome or Edge.
2. Open `chrome://extensions` or `edge://extensions`.
3. Enable **Developer mode**.
4. Choose **Load unpacked**.
5. Select the repository's `extension/` directory.
6. Open a normal web page.
7. Capture a clue, then use **Check context**.
8. Test the explicit bridge actions from the extension popup.

After changing extension files, reload the unpacked extension before retesting.

## Automated validation

`.github/workflows/extension-validate.yml` checks every extension change for:

- valid `manifest.json`
- JavaScript syntax errors
- required entrypoints
- a successful ZIP smoke package

This keeps extension contributions cheap to review and catches broken packaging before release.

## Release a tagged extension build

The release workflow is `.github/workflows/release-extension.yml`.

Create and push a tag using the `extension-v*` pattern, for example:

```bash
git tag extension-v0.9.2
git push origin extension-v0.9.2
```

GitHub Actions then packages the complete `extension/` directory and attaches the ZIP to the generated GitHub Release.

You can also run the packaging workflow manually from GitHub Actions to produce a workflow artifact without creating a release tag.

## Release checklist

Before tagging:

- [ ] Load the extension successfully in Chrome.
- [ ] Load the extension successfully in Edge.
- [ ] Save a memory locally.
- [ ] Confirm a relevant memory can resurface.
- [ ] Test **Useful** and **Not now**.
- [ ] Test browser → app sync.
- [ ] Test app → browser import.
- [ ] Verify the app URL in extension settings.
- [ ] Run the repository build.
- [ ] Confirm no personal memory data is included in release artifacts.

## Privacy boundary

The extension is intentionally user-controlled. Release work must not introduce silent browsing-history collection, hidden telemetry, advertising, or remote storage of personal memory content without an explicit product and privacy review.
