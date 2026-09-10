# Afterimage Context Capture

A minimal Manifest V3 browser extension for **user-initiated** context capture.

## Privacy model

- Uses `activeTab` and `tabs` only.
- No browsing-history permission.
- No background page monitoring.
- No content scripts.
- No analytics or remote service.
- Nothing is inspected until the user opens the extension and clicks **Use this context**.
- The extension hands the selected tab's hostname to a local Afterimage instance at `http://localhost:3000/context-signals`.

## Install for local development

1. Open Chrome or another Chromium browser.
2. Open the extensions page.
3. Enable Developer mode.
4. Choose **Load unpacked**.
5. Select this `extension/` directory.
6. Run Afterimage locally with `npm run dev`.
7. Open a page, click the Afterimage extension, then click **Use this context**.

The handoff opens the local Context Signals page and grants the browser signal for 30 days. It can be revoked earlier from Afterimage.
