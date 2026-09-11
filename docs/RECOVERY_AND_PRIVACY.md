# Recovery & Privacy

Afterimage treats the browser's local memory library as user-owned state.

## Recovery

Memory mutations should be reversible where practical. The recovery layer stores a local snapshot before destructive library operations. A snapshot contains only the local memory array, an action label, and a timestamp.

Recovery is intentionally local and is not uploaded or synchronized.

The Memory Vault creates recovery snapshots before forget, archive, and JSON import/merge operations. The Settings control center also provides an explicit undo path for clear-all operations.

## Import safety

Imported JSON is validated as an array of memory-like records. Existing IDs are merged deterministically rather than duplicated. Invalid records are ignored and the application keeps the existing library.

Encrypted backups use the same local merge model after successful authentication.

## Encrypted backups

Afterimage supports an opt-in encrypted backup format implemented with the browser Web Crypto API:

- AES-256-GCM encryption
- PBKDF2-SHA-256 key derivation
- Random 128-bit salt
- Random 96-bit initialization vector
- 210,000 PBKDF2 iterations
- User-supplied password is never stored
- Encryption and decryption happen in the browser
- Wrong passwords fail authentication without exposing plaintext
- Restores create a recovery snapshot before merging

The encrypted file is portable JSON containing only cryptographic metadata and ciphertext. It is not uploaded by Afterimage.

## Privacy boundary

- Memory content is stored in browser local storage.
- Context matching runs locally.
- Context vocabulary expansion is curated and deterministic; it does not call a remote AI model.
- The browser extension requires an explicit user action to hand memories to the app.
- There is no background memory upload.
- Export files are created locally by the browser.
- Clearing local memory requires explicit confirmation.
- Backup passwords are never persisted by the application.

## Browser verification

GitHub Actions runs a Playwright Chromium smoke test covering capture, contextual resurfacing, persistence, settings, and the encrypted-backup controls. The project also runs a dependency-free relevance evaluation and storage contract check in CI.
