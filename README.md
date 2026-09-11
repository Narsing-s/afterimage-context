# Afterimage

> **Remember what matters when it matters.**

Afterimage is a local-first contextual memory layer for your future self.

Most software asks **when** to remind you. Afterimage asks **when this becomes relevant again**.

Capture a useful piece of knowledge today, attach a return condition, and let Afterimage bring it back when related context returns.

## The primitive

```text
capture → return condition → context → relevance → feedback → resurfacing → learning
```

## Current MVP — v0.9

- Premium responsive dark interface
- Explicit return-condition capture
- Signal and pattern trigger modes
- Adaptive lifecycle: active, confirmed, outdated, archived, snoozed
- Confidence, resurfacing history and per-memory sensitivity
- **Memory Health** with fresh / familiar / fading / stale states
- **Health-ranked Memory Review** at `/memory-review`
- **Conflict Radar** for possible competing memories
- Conservative contradiction detection with explicit user review
- Future Self Inbox and contextual resurfacing
- Decision Memory and outcome tracking
- Local context graph and relationship explorer at `/graph`
- Search/filtering across local memories
- Schema-checked JSON import/export
- **Portable, versioned `afterimage.memory.v1` bundles**
- **Encrypted local backup with AES-256-GCM + PBKDF2-SHA-256**
- Recovery snapshots before destructive operations
- Privacy-first Context Signals center at `/context-signals`
- Browser-category, calendar-topic and manual/topic signal prototypes
- Explicit signal grant/revoke controls with 30-day expiry
- **Bounded local signal history for permission changes and expiry**
- Local signal preview showing exactly what would influence matching
- Curated context vocabulary and deterministic local semantic matching
- Playwright Chromium smoke testing and deterministic validation checks in CI
- No account, ads, feed, streaks, notification spam or silent browsing surveillance

## Memory Health

Memory is not treated as permanent truth. Afterimage estimates whether a memory is **fresh, familiar, fading or stale** using local confidence, reuse and age signals.

The `/memory-review` queue surfaces weaker memories first. You decide whether a memory is still true or outdated; Afterimage never silently rewrites the past.

## Conflict Radar

Related memories can be shown as possible conflicts when they share meaningful local context. These are review prompts—not automatic conclusions. The user remains the source of truth.

## Portable Memory Format v1

Afterimage uses a small versioned interchange format: `afterimage.memory.v1`.

A bundle contains an export timestamp and validated memory records, including return conditions, confidence, lifecycle state, sensitivity and resurfacing history. `/context-signals` provides **Export Memory v1** and **Import Memory v1**. Legacy memory arrays remain importable, while malformed records are rejected locally.

This is intentionally a file format, not a cloud-sync protocol. It allows future desktop, Android, browser and other clients to exchange memories without coupling them to the current `localStorage` implementation.

## Signal history

Context permissions leave a small local audit trail. Afterimage records permission events—grant, revoke, update and expiry—with the signal label/value and timestamp. It does **not** record browsing history, calendar events, location trails or raw app activity.

The history is bounded locally to 200 events and is shown in `/context-signals`.

## Explainable matching

The local matcher is deterministic and inspectable. Curated concept groups improve recall without remote embeddings or server-side processing. Per-memory sensitivity can make individual memories quieter or more eager than the global setting.

Change/contradiction signals are conservative prompts for review rather than automatic deletion or rewriting.

## Privacy

Afterimage is local-first by design. Memories, preferences and signal history remain in the browser unless you explicitly export, move or integrate them.

Privacy principles:

- **Local by default**
- **Explicit permissions**
- **Explainable resurfacing**
- **Revocable and expiring context access**
- **No silent browsing surveillance**
- **Permanent local-data erase controls**
- **Portable user-owned memory format**

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Useful routes:

- `/` — capture, simulate, validate and manage memories
- `/future-self` — Future Self Inbox and resurfacing review
- `/decisions` — decision history and outcomes
- `/memory-review` — memory health and conflict review
- `/context-signals` — permissions, signal history and Memory Format v1
- `/graph` — local memory relationships
- `/extension-bridge` — explicit browser-memory merge
- `/settings` — recovery, export, encrypted backup and deletion controls
- `/memory-vault` — edit, sensitivity, quiet, archive, import, export and forget

## Build and validate

```bash
npm run build
node scripts/afterimage-evaluate.mjs
node scripts/afterimage-storage-check.mjs
node scripts/afterimage-memory-quality.mjs
node scripts/afterimage-memory-format-check.mjs
node scripts/afterimage-memory-health-check.mjs
```

The CI pipeline also runs the Chromium browser smoke suite.

## Open-source project

Afterimage is being built in public. See `START_HERE.md`, `CONTRIBUTING.md`, `GOOD_FIRST_ISSUES.md`, `ROADMAP.md`, `SECURITY.md` and `docs/RECOVERY_AND_PRIVACY.md` for contributor and product guidance.

## License

Apache-2.0
