# Recovery & Privacy

Afterimage treats the browser's local memory library as user-owned state.

## Recovery

Memory mutations should be reversible where practical. The recovery layer stores a single local snapshot before destructive library operations. A snapshot contains only the local memory array, an action label, and a timestamp.

Recovery is intentionally local and is not uploaded or synchronized.

## Import safety

Imported JSON is validated as an array of memory-like records. Existing IDs are merged deterministically rather than duplicated. Invalid records are ignored and the application keeps the existing library.

## Privacy boundary

- Memory content is stored in browser local storage.
- Context matching runs locally.
- The browser extension requires an explicit user action to hand memories to the app.
- There is no background memory upload.
- Export files are created locally by the browser.
- Clearing local memory should require explicit confirmation.

## Future encrypted export

Encrypted export is intentionally a separate opt-in feature. The planned design uses Web Crypto with a user-supplied passphrase and never sends the passphrase or plaintext memory payload to a server.
