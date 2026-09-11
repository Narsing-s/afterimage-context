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

## Current MVP — v0.9

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
- **Future Self Inbox at `/future-self`**
- **Decision Memory at `/decisions`**
- **Live browser extension with contextual resurfacing**
- **Explainable match confidence and explicit Useful / Not now feedback**
- **Local extension storage with no remote AI dependency**
- Memory Health review at `/memory-review`
- Fresh / familiar / fading / stale memory health
- Review queue for memories that may no longer be reliable
- Conflict Radar for potentially competing memories
- Explicit user confirmation before a memory is treated as changed truth
- No account, ads, feed, streaks, or notification spam
- GitHub Actions build workflow

### Browser resurfacing

The `extension/` folder now contains a working Manifest V3 browser layer. A user can save a clue from the current page, attach a return condition, and keep it in `chrome.storage.local`. When a later page has enough explainable text overlap, a small Afterimage card can appear directly on that page.

The extension deliberately avoids silent history collection. Matching is performed locally against the current page, and the user can dismiss or confirm the resurfaced memory. See `docs/BROWSER_EXTENSION.md` for installation and privacy details.

### Memory Health

Memories are not permanent truth. Afterimage can now identify memories that are fresh, familiar, fading, or stale based on age, confidence, and resurfacing history. The `/memory-review` screen gives the user a calm review queue instead of silently rewriting old context.

### Conflict Radar

Two memories can both be useful while pointing in different directions. The Conflict Radar highlights possible competing memories that share meaningful context and lets the user decide which one is still true. It is intentionally conservative: a possible conflict is a prompt for review, not an automatic merge or deletion.

The current matcher is intentionally lightweight and local. It uses explainable term overlap, return-condition weighting, confidence, repetition penalties and configurable sensitivity. It is **not** marketed as semantic AI yet.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Useful routes:

- `/` — capture, simulate, validate, and manage memories
- `/future-self` — contextual Future Self Inbox
- `/decisions` — decision capture and outcome memory
- `/memory-review` — review memory health and possible conflicts
- `/context-signals` — manage local context signal permissions
- `/graph` — explore local memory relationships

### Load the browser extension

1. Open Chrome or Edge and go to its extensions page.
2. Enable **Developer mode**.
3. Choose **Load unpacked**.
4. Select this repository's `extension/` directory.
5. Open a normal web page and click the Afterimage toolbar icon.

The extension is local-first and does not require a server for capture or matching.

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
- 🌐 **Browser Builder** — permission-aware browser capture and resurfacing
- 🎨 **Experience Designer** — calm resurfacing interactions
- 🧪 **Reality Tester** — real-world scenario testing

## Context Signals

Context signals are deliberately opt-in. The current prototype does **not** silently read browser history, calendar data, location, or apps.

The Context Signals center lets users grant or revoke prototype signal categories, preview the composed context, tune matching sensitivity, and import portable memories. A granted signal automatically expires after 30 days and can be revoked earlier. Expired signals are excluded from matching.

The browser integration uses least-privilege, user-initiated capture rather than background surveillance. Calendar integration will likewise require explicit account permission before reading any event context.

The production direction is explicit: every future context source must be **opt-in, explainable, revocable, expiring, privacy-preserving, and locally processed wherever practical**.

## Privacy direction

The MVP is local-first: captured memories and signal preferences are stored in browser `localStorage` and extension memories are stored in `chrome.storage.local`; they are not sent to a server by the current product. Future integrations should keep sensitive context on-device wherever practical.

See `ARCHITECTURE.md`, `SECURITY.md`, `docs/PRODUCT_PRINCIPLES.md`, and `docs/BROWSER_EXTENSION.md`.

## Roadmap

See `ROADMAP.md` for the public roadmap and research questions.

1. ~~Real permission-aware browser extension~~
2. Calendar integration with explicit permission
3. Signal history and per-memory sensitivity
4. Local encrypted memory store
5. On-device semantic matching option
6. Android client
7. Stronger memory conflict / contradiction detection
8. Optional encrypted synchronization
9. Extension ↔ web-app portable memory bridge
10. User-controlled context permission center

## Community standards

Please read `CODE_OF_CONDUCT.md` before participating.

## License

Apache-2.0
