# Afterimage

> **Remember what matters when it matters.**

Afterimage is a local-first contextual memory layer for your future self.

Most software asks **when** to remind you. Afterimage asks **when this becomes relevant again**.

Capture a useful piece of knowledge today, attach a return condition, and let Afterimage bring it back when related context returns.

## The primitive

```text
capture → return condition → context → relevance → feedback → resurfacing → learning
```

## Current product foundation

- Contextual memories with explicit return conditions
- Future Self Inbox, Decision Memory and memory timeline
- Memory Health and conservative Conflict Radar
- Local context graph and explainable matching
- Portable versioned memory format
- Encrypted local backups and recovery snapshots
- Explicit, expiring context permissions
- Browser extension with explicit capture
- **Extensible Memory Core** with provenance, evidence, importance and feedback
- **Hybrid retrieval API**: deterministic local retrieval now, optional semantic provider later
- **Memory consolidation candidates** with explicit user approval
- **Memory feedback learning** for usefulness, noise and importance
- **Memory Firewall** enforced permission boundary for AI agents/integrations
- **Synthetic contextual evaluation dataset** and CI validation
- AI provider/extraction proposal flow with explicit approval
- MCP-compatible memory tools with namespace isolation
- Memory history, supersession tracking and consolidation UI
- Signed memory-event primitives, retention controls and encrypted sync packages
- Retrieval benchmark and anti-annoyance ranking
- GitHub/calendar/document connector interfaces
- Threat model and integration contract checks
- **Temporal/provenance primitives** for future desktop, mobile and agent clients
- **Local API route** at `/api/memory` for search, feedback, consolidation candidates and priorities
- No account, ads, feed, streaks, notification spam or silent browsing surveillance

## Future AI architecture

Afterimage is being evolved from a contextual-memory application into a reusable **private memory layer for humans and AI agents**:

```text
Context sources / AI agents / user input
                ↓
        Context normalization
                ↓
        Memory Core + provenance
                ↓
     Hybrid retrieval + ranking
                ↓
 Conflict / temporal reasoning
                ↓
   Explainable resurfacing
                ↓
       User feedback/control
```

The current semantic baseline remains deterministic and local. Optional embeddings or AI providers should plug into the retrieval interface rather than replacing the privacy-first baseline.

## Memory Core

The new `lib/memory-core.ts` layer provides:

- source/provenance metadata
- evidence records
- importance levels
- explicit feedback and adaptive confidence
- memory priority
- consolidation candidates
- explicitly approved consolidation
- temporal memory events

This keeps the core independent from the Next.js UI so future desktop, Android, CLI, MCP and agent clients can reuse it.

## Hybrid retrieval

`lib/hybrid-retrieval.ts` combines the existing explainable local matcher with an optional semantic retrieval provider. No remote provider is enabled by default.

This means Afterimage can evolve toward embeddings without making a privacy or infrastructure dependency mandatory.

## Memory Core API

The stateless route `/api/memory` accepts a memory collection supplied by a client and supports:

- `search`
- `feedback`
- `consolidation`
- `priorities`

A future encrypted store can sit behind the same core contracts without forcing today's local-first MVP to change.

## Privacy

Afterimage remains local-first:

- memories are user-owned
- context permissions are explicit, revocable and expiring
- resurfacing is explainable
- AI providers are optional
- the project does not silently upload personal context
- destructive actions remain user-controlled
- exported memory remains portable

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Useful routes:

- `/` — capture and contextual resurfacing
- `/future-self` — Future Self Inbox and timeline
- `/decisions` — decision history and outcomes
- `/memory-review` — memory health and conflict review
- `/context-signals` — permissions, signal history and portable memory
- `/graph` — local memory relationships
- `/extension-bridge` — explicit browser-memory merge
- `/memory-lifecycle` — consolidation and supersession review
- `/memory-lab` — AI extraction and agent/memory capability lab
- `/settings` — recovery, export, encrypted backup and deletion controls
- `/memory-vault` — edit, sensitivity, archive, import, export and forget

## Build and validate

```bash
npm run build
node scripts/afterimage-evaluate.mjs
node scripts/afterimage-storage-check.mjs
node scripts/afterimage-memory-quality.mjs
node scripts/afterimage-memory-format-check.mjs
node scripts/afterimage-memory-health-check.mjs
node scripts/afterimage-memory-core-check.mjs
```

The CI pipeline also runs the Chromium browser smoke suite.

## Open-source project

Afterimage is being built in public. See `START_HERE.md`, `CONTRIBUTING.md`, `GOOD_FIRST_ISSUES.md`, `ROADMAP.md`, `SECURITY.md` and `docs/RECOVERY_AND_PRIVACY.md`.

## License

Apache-2.0