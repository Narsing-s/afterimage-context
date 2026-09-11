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
- **Encrypted local backup with AES-256-GCM + PBKDF2-SHA-256**
- **Recovery snapshots before destructive memory operations**
- Configurable context sensitivity
- Privacy-first Context Signals center at `/context-signals`
- Browser-category, calendar-topic and manual/topic signal prototypes
- Explicit signal grant/revoke controls
- 30-day expiring signal permissions with automatic expiry
- Local signal preview showing exactly what would influence matching
- **Curated context vocabulary matching for common equivalent terms**
- **Memory Health review at `/memory-review`**
- **Future Self Inbox at `/future-self`**
- **Decision Memory at `/decisions`**
- **Live contextual browser resurfacing extension**
- **Browser → main-app memory bridge at `/extension-bridge`**
- **One shared `afterimage:memories:v2` browser memory model**
- **Explicit Useful / Not now resurfacing feedback**
- **Deterministic relevance evaluation harness with CI gating**
- **Playwright Chromium browser smoke testing in CI**
- No account, ads, feed, streaks, or notification spam
- GitHub Actions build + evaluation + browser verification workflows

### Unified browser memory

The browser extension is now part of the same Afterimage memory system. The extension keeps its own local capture cache so it can work offline, then provides an explicit **Sync with Afterimage app** action. Sync opens the public `/extension-bridge` using a URL fragment, so memory payloads are not placed in the server request URL. The bridge merges memories into the main app's `afterimage:memories:v2` store by ID, preventing duplicate entries.

This is intentionally a user-controlled handoff: there is no background synchronization, browsing-history upload, analytics endpoint, or server-side memory database.

### Memory Health

Memories are not permanent truth. Afterimage can now identify memories that are fresh, familiar, fading, or stale based on age, confidence, and resurfacing history. The `/memory-review` screen gives the user a calm review queue instead of silently rewriting old context.

### Conflict Radar

Two memories can both be useful while pointing in different directions. The Conflict Radar highlights possible competing memories that share meaningful context and lets the user decide which one is still true. It is intentionally conservative: a possible conflict is a prompt for review, not an automatic merge or deletion.

### Explainable context vocabulary

The local matcher remains intentionally transparent. A small curated vocabulary maps common variants such as `db` → `database`, `buying` → `purchase`, and `deployment` → `deploy`. This improves contextual recall without a remote model, hidden embeddings, or server-side processing. The matcher is still **not** marketed as semantic AI.

## Evaluation

The project includes a dependency-free synthetic evaluation harness:

```bash
node scripts/afterimage-evaluate.mjs
```

It tests relevant and unrelated scenarios using the same explainable lexical baseline plus curated context vocabulary. It runs automatically in CI. See [`docs/EVALUATION.md`](docs/EVALUATION.md) for methodology and the roadmap toward a larger versioned benchmark.

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
- `/memory-review` — review memory health and possible conflicts
- `/context-signals` — manage local context signal permissions
- `/graph` — explore local memory relationships
- `/extension-bridge` — explicitly merge browser-extension memories into the main library
- `/settings` — control center, recovery, export, and encrypted backup
- `/memory-vault` — edit, quiet, archive, import, export, and forget memories

## Browser extension

The `extension/` directory contains a Manifest V3 Chrome/Edge extension.

1. Open `chrome://extensions` or `edge://extensions`.
2. Enable **Developer mode**.
3. Choose **Load unpacked**.
4. Select the repository's `extension` folder.
5. Open a normal web page and use the Afterimage extension to save a clue.
6. Use **Check context** to test local resurfacing.
7. Use **Sync with Afterimage app** to send the local browser memories to the public bridge.
8. On `/extension-bridge`, choose **Merge into Memory library**.

The extension is deliberately least-privilege and user initiated. It does not silently collect browsing history.

## Encrypted backup

From `/settings`, users can create an encrypted backup with a local password. The password never leaves the browser and is never stored by Afterimage. Restoring a backup authenticates and decrypts locally, validates the memory payload, creates a recovery snapshot, and merges records by ID.

See [`docs/RECOVERY_AND_PRIVACY.md`](docs/RECOVERY_AND_PRIVACY.md) for the security boundary.

## Build

```bash
npm run build
```

## Open-source project

Afterimage is being built in public. We want contributors interested in context, memory, privacy, human-computer interaction, and calm software.

### Contribute in 10 minutes

You do **not** need to understand the entire codebase before contributing.

1. Read [`START_HERE.md`](START_HERE.md).
2. Pick an issue labeled **good first issue**.
3. Make one focused change.
4. Run `npm run build`.
5. Open a pull request with what changed and how you tested it.

Current starter missions include keyboard accessibility, local memory tests, clearer “Why now?” explanations, Chrome/Edge compatibility, mobile polish, evaluation scenarios, and a short contributor demo.

Useful contributor paths:

- [`CONTRIBUTING.md`](CONTRIBUTING.md) — workflow and design principles
- [`GOOD_FIRST_ISSUES.md`](GOOD_FIRST_ISSUES.md) — starter missions
- [`COMMUNITY.md`](COMMUNITY.md) — community expectations
- [`START_HERE.md`](START_HERE.md) — fastest route into the project
- [`ROADMAP.md`](ROADMAP.md) — product direction
- [`docs/EVALUATION.md`](docs/EVALUATION.md) — quality methodology
- [`docs/RECOVERY_AND_PRIVACY.md`](docs/RECOVERY_AND_PRIVACY.md) — storage and backup boundary

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

The browser integration uses least-privilege, user-initiated capture rather than background surveillance. Calendar integration will likewise require explicit account permission before reading any event context.

The production direction is explicit: every future context source must be **opt-in, explainable, revocable, expiring, privacy-preserving, and locally processed wherever practical**.

## Privacy direction

The MVP is local-first: captured memories and signal preferences are stored in browser `localStorage` and are not sent to a server. Future integrations should keep sensitive context on-device wherever practical.

See `ARCHITECTURE.md`, `SECURITY.md`, `docs/PRODUCT_PRINCIPLES.md`, and `docs/RECOVERY_AND_PRIVACY.md`.

## Roadmap

See `ROADMAP.md` for the public roadmap and research questions.

1. Real permission-aware browser extension
2. Calendar integration with explicit permission
3. Signal history and per-memory sensitivity
4. Local encrypted memory store
5. On-device semantic matching option
6. Android client
7. Stronger memory conflict / contradiction detection
8. Optional encrypted synchronization

## Community standards

Please read `CODE_OF_CONDUCT.md` before participating.

## License

Apache-2.0
