# Encrypted Sync

Afterimage provides an encrypted sync-package primitive. A snapshot is encrypted with the existing AES-GCM vault primitive before transport. A future sync service can store the package without learning memory plaintext. Conflict resolution and device identity should be layered above this package format.
