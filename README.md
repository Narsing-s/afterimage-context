# Afterimage

> **The memory layer for your future self.**

Afterimage explores a different relationship between software and memory.

Most software asks **when** to remind you. Afterimage asks **when this becomes relevant again**.

You leave a small piece of knowledge today and attach it to a return condition. When similar context appears later, the local context engine can bring the thought back.

## The primitive

```text
memory → return condition → context → relevance → feedback → resurfacing
```

## Current MVP — v0.9

- Premium responsive dark interface
- Explicit return-condition capture
- Context signal and pattern trigger modes
- Adaptive memory lifecycle: active, confirmed, outdated, archived, snoozed
- Confidence, resurfacing history and per-memory sensitivity
- Local context graph and relationship explorer at `/graph`
- Search/filtering across local memories
- Schema-checked JSON import/export
- **Portable, versioned `afterimage.memory.v1` bundles**
- **Encrypted local backup with AES-256-GCM + PBKDF2-SHA-256**
- **Recovery snapshots before destructive memory operations**
- Privacy-first Context Signals center at `/context-signals`
- Browser-category, calendar-topic and manual/topic signal prototypes
- Explicit signal grant/revoke controls with 30-day expiry
- **Local signal history for permission changes and expiry**
- Local signal preview showing exactly what would influence matching
- Curated context vocabulary matching
- Memory Health, Conflict Radar and Future Self Inbox
- Decision Memory
- Live contextual browser extension + explicit browser bridge
- One shared `afterimage:memories:v2` browser memory model
- Deterministic relevance and portable-format validation in CI
- Playwright Chromium browser smoke testing in CI
- No account, ads, feed, streaks, notification spam or silent browsing surveillance

## Portable Memory Format v1

Afterimage now has a small versioned interchange format: `afterimage.memory.v1`.

A bundle contains an export timestamp and validated memory records, including return conditions, confidence, lifecycle state, sensitivity and resurfacing history. `/context-signals` provides **Export Memory v1** and **Import Memory v1**. Legacy memory arrays remain importable, while malformed records are rejected locally.

This is intentionally a file format, not a cloud-sync protocol. It makes future desktop, Android, browser and other clients able to exchange memories without coupling them to the current `localStorage` implementation.

## Signal history

Context permissions now leave a small local audit trail. Afterimage records only permission events—grant, revoke and expiry—with the signal label/value and timestamp. It does **not** record browsing history, calendar events, location trails or raw app activity.

The history is bounded locally to 200 events and is shown in `/context-signals`, so users can understand what context has been allowed over time.

## Explainable matching

The local matcher remains deterministic and inspectable. Curated vocabulary groups improve recall without remote embeddings or server-side processing. Per-memory sensitivity can make individual memories quieter or more eager than the global setting.

Change/contradiction signals are conservative prompts for review rather than automatic deletion or rewriting.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Useful routes:

- `/` — capture, simulate, validate, and manage memories
- `/future-self` — Future Self Inbox and resurfacing review
- `/decisions` — decision history and outcomes
- `/memory-review` — memory health and possible conflicts
- `/context-signals` — permissions, signal history and portable Memory v1
- `/graph` — local memory relationships
- `/extension-bridge` — explicit browser-memory merge
- `/settings` — recovery, export and encrypted backup
- `/memory-vault` — edit, sensitivity, quiet, archive, import, export and forget

## Privacy direction

The MVP is local-first. Captured memories, preferences, signal history and portable import/export remain in the browser unless the user explicitly moves a file or uses an integration. Future context sources should remain **opt-in, explainable, revocable, expiring, privacy-preserving and locally processed wherever practical**.

## Build

```bash
npm run build
```

## Open-source project

Afterimage is being built in public. See `START_HERE.md`, `CONTRIBUTING.md`, `GOOD_FIRST_ISSUES.md`, `ROADMAP.md`, `SECURITY.md` and `docs/RECOVERY_AND_PRIVACY.md` for contributor and product guidance.

## License

Apache-2.0
