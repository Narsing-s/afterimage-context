# Memory Governance

Afterimage treats memory as user-owned data, not model-owned data.

- Sensitive-content detection runs locally before optional external integrations.
- Secrets and personal identifiers can be scrubbed before connector use.
- Durable AI/agent writes require explicit approval at the product layer.
- Archived, outdated and snoozed memories are excluded from resurfacing.
- Cooldowns prevent repetitive resurfacing.
- Portable exports carry a format version and are migrated forward.
- Optional SHA-256 integrity fingerprints detect accidental payload changes.

Detection never silently deletes memory. The user decides whether to redact, edit, export, archive or forget it.

> Integrity hashing is not encryption or authentication; encrypted storage and authenticated sync remain separate roadmap items.