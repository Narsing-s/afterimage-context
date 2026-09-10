# Afterimage

> **The memory layer for your future self.**

Afterimage explores a different relationship between software and memory.

Most software asks **when** to remind you. Afterimage asks **when this becomes relevant again**.

You leave a small piece of knowledge today and attach it to a return condition. When similar context appears later, the local context engine can bring the thought back.

## The primitive

```text
memory → return condition → context → relevance → feedback → resurfacing
```

### A simple example

**Today**

> I chose this hosting plan because migrating later would be more painful than paying a little extra.

**Return condition**

> When I compare hosting again.

**Months later**

You're comparing hosting again.

**Afterimage**

> You considered this before. You chose the other option because switching costs mattered more. Still true?

That's the experiment.

## Why it is different

A reminder is attached to a **time**.

A note is attached to **storage**.

A task is attached to **action**.

Afterimage is designed around **relevance**.

The project does not claim that no adjacent product exists. The intended differentiation is the product primitive: **a memory is attached to a return condition and contextual relevance rather than only a scheduled date.**

## Current MVP — v0.8

- Premium responsive dark interface
- Explicit return-condition capture
- Context signal and pattern trigger modes
- Adaptive memory lifecycle: active, confirmed, outdated, archived, snoozed
- Confidence and resurfacing history
- Local context graph and relationship explorer at `/graph`
- Search/filtering across local memories
- Local JSON export and schema-checked import
- Configurable context sensitivity
- Privacy-first Context Signals center at `/context-signals`
- Browser-category, calendar-topic and manual/topic signal prototypes
- Explicit signal grant/revoke controls
- 30-day expiring signal permissions with automatic expiry
- Local signal preview showing exactly what would influence matching
- No account, ads, feed, streaks, or notification spam
- GitHub Actions build workflow

The current matcher is intentionally lightweight and local. It uses explainable term overlap, return-condition weighting, confidence, repetition penalties and configurable sensitivity. It is **not** marketed as semantic AI yet.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run build
```

## Open-source project

Afterimage is being built in public. We want contributors interested in context, memory, privacy, human-computer interaction, and calm software.

Start with `CONTRIBUTING.md`, `GOOD_FIRST_ISSUES.md`, and `ROADMAP.md`.

### Contributor missions

- 🧠 **Memory Engineer** — memory model and storage
- 🧭 **Context Explorer** — relevance and matching experiments
- 🔐 **Privacy Engineer** — local-first security and user control
- 📱 **Android Builder** — offline-first mobile client
- 🌐 **Browser Builder** — permission-aware browser capture
- 🎨 **Experience Designer** — calm resurfacing interactions
- 🧪 **Reality Tester** — real-world scenario testing

## Context Signals

Context signals are deliberately opt-in. The current prototype does **not** silently read browser history, calendar data, location, or apps.

The Context Signals center lets users grant or revoke prototype signal categories, preview the composed context, tune matching sensitivity, and import portable memories. A granted signal automatically expires after 30 days and can be revoked earlier. Expired signals are excluded from matching.

The browser integration direction uses least-privilege, user-initiated capture rather than background surveillance. Calendar integration will likewise require explicit account permission before reading any event context.

The production direction is explicit: every future context source must be **opt-in, explainable, revocable, expiring, privacy-preserving, and locally processed wherever practical**.

## Privacy direction

The MVP is local-first: captured memories and signal preferences are stored in browser `localStorage` and are not sent to a server. Future integrations should keep sensitive context on-device wherever practical.

See `ARCHITECTURE.md`, `SECURITY.md`, and `docs/PRODUCT_PRINCIPLES.md`.

## Roadmap

See `ROADMAP.md` for the public roadmap and research questions.

1. Real permission-aware browser extension
2. Calendar integration with explicit permission
3. Signal history and per-memory sensitivity
4. Local encrypted memory store
5. On-device semantic matching option
6. Android client
7. Memory conflict / contradiction detection
8. Optional encrypted synchronization

## Community standards

Please read `CODE_OF_CONDUCT.md` before participating.

## License

Apache-2.0
