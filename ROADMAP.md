# Afterimage Roadmap

Afterimage is an open exploration of context-memory computing. The roadmap is intentionally experimental.

## Shipped — v0.5 Adaptive Memory

- [x] Context simulation
- [x] Return-condition data model
- [x] Explain why a memory resurfaced
- [x] Versioned local persistence
- [x] Relevance scoring
- [x] Memory confidence
- [x] Resurfacing history
- [x] Snooze and outdated controls
- [x] Local export
- [x] Memory inspector

## Shipped — v0.6 Personal Context Graph

- [x] Local context graph engine
- [x] Shared-context relationships
- [x] Shared-return-condition relationships
- [x] Pattern relationships
- [x] Local graph/cluster explorer at `/graph`
- [x] Explainable deterministic graph generation

## Shipped — v0.7 Context Signals

- [x] Search and filtering of local memories
- [x] Import with schema validation
- [x] Context sensitivity control
- [x] Permission center for context signals
- [x] Browser-category signal prototype
- [x] Calendar-topic signal prototype
- [x] Manual/topic signal composition
- [x] Explicit grant/revoke controls
- [x] Local-only signal preview

## Shipped — v0.8 Context Signals Safety

- [x] Expiring signal permissions
- [x] Automatic expiry of stale grants
- [x] Visible permission expiry dates
- [x] Revocation before expiry
- [x] Non-expired signals only influence composed context
- [x] Memory health review at `/memory-review`
- [x] Fresh / familiar / fading / stale memory states
- [x] Review queue for fading and stale memories
- [x] Possible-conflict radar for related memories
- [x] Explicit user confirmation before changing memory truth
- [x] Signal history with automatic expiry events
- [x] Per-memory sensitivity
- [x] Versioned portable Memory Format v1
- [x] Stronger deterministic local semantic matching
- [x] Conservative local contradiction detection
- [ ] Real browser extension with explicit host permissions
- [ ] Calendar integration with explicit account permission
- [ ] Accessibility audit

## Platform — v0.9

- [ ] Android client
- [ ] Local encrypted memory store
- [x] On-device semantic matching option (deterministic, dependency-free baseline)
- [x] Stronger memory conflict / contradiction detection baseline
- [ ] Optional encrypted synchronization
- [x] Cross-device export/import through Memory Format v1

## v1.0 direction

- [x] Stable portable memory format v1 baseline
- [ ] Privacy center and complete deletion
- [x] Transparent resurfacing explanations
- [x] Extension/mobile integration foundations
- [ ] Public API for approved local integrations
- [x] Reliable automated test suite baseline

## Research questions

- When is a memory genuinely relevant?
- How can relevance be inferred without surveillance?
- How should users control sensitivity and confidence?
- How do we prevent repeated or annoying resurfacing?
- How should conflicting memories be represented?
- Can useful context matching happen entirely on-device?
- How far can local semantic matching improve without shipping personal context to a remote model?

## What is deliberately not on the roadmap

- Engagement streaks
- Advertising based on personal memory
- Selling memory data
- Infinite feeds
- Mandatory cloud accounts
- Silent browser or calendar surveillance
- Auto-deleting user conversations or memories
