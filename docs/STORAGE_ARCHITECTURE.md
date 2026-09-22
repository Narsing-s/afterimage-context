# Storage Architecture

Afterimage now has a browser storage abstraction in `lib/encrypted-memory-store.ts`.

## Current behavior

- IndexedDB is the primary browser persistence path.
- Existing localStorage data is automatically migrated into IndexedDB when possible.
- localStorage remains as a compatibility fallback and migration source.
- Memory snapshots are versioned and passed through the migration layer.
- Web Crypto AES-GCM helpers are available for password-protected encrypted snapshots.
- PBKDF2 derives a 256-bit AES-GCM key from a user passphrase.

## Security boundary

The primary IndexedDB snapshot is currently **not encrypted by default**. This is intentional until the product has a user-facing vault/passphrase flow and recovery UX. The encryption primitives are implemented separately so enabling encrypted-at-rest storage does not require changing the memory domain model.

Never describe a plaintext IndexedDB snapshot as end-to-end encrypted.

## Next storage step

1. User-facing vault unlock/passphrase setup.
2. Encrypted IndexedDB payloads with versioned key metadata.
3. Recovery-key flow.
4. Lock-on-idle and explicit lock.
5. Cross-browser migration tests.
6. Encrypted sync only after local recovery is reliable.
