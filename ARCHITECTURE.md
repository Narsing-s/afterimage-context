# Afterimage Architecture

## Core loop

```text
Capture memory
     ↓
Define return condition
     ↓
Observe approved context
     ↓
Normalize context locally
     ↓
Hybrid retrieval
     ↓
Temporal/conflict reasoning
     ↓
Explain relevance
     ↓
Resurface
     ↓
User feedback
     ↓
Learn
```

## Layers

### 1. Clients
Web/PWA, browser extension, future Android and desktop clients.

### 2. Context adapters
Manual context, browser categories, calendar topics, documents, GitHub and future approved integrations. Every adapter must expose only the minimum context required.

### 3. Memory Core
The reusable domain layer in `lib/memory-core.ts` owns provenance, evidence, feedback, priority, consolidation and memory events.

### 4. Retrieval
The deterministic matcher remains the privacy-safe baseline. `lib/hybrid-retrieval.ts` allows optional semantic providers to be composed with lexical retrieval.

### 5. Intelligence
Future local/remote models may propose extraction, semantic retrieval, conflict reasoning or consolidation. Models never silently mutate memory.

### 6. Resurfacing
Ranking combines relevance, importance, confidence, history, sensitivity, feedback and anti-noise controls. Every return should explain itself.

### 7. Storage
Current MVP: browser storage. Target: encrypted IndexedDB/SQLite with portable migrations.

### 8. Sync
Optional end-to-end encrypted synchronization. Servers should store ciphertext, not plaintext personal memory.

## Memory contract

A future canonical memory record should contain:

```text
identity
content
return condition
state
confidence
importance
sensitivity
provenance
evidence
feedback
relationships
supersession
timestamps
```

## AI / agent boundary

AI is an advisor, not the owner of memory.

Allowed:
- propose a memory
- propose a merge
- retrieve approved memory
- explain relevance
- suggest an update

Requires user permission:
- write durable memory
- change a confirmed memory
- consolidate memories
- delete memory

The memory firewall should make these permissions explicit for every agent/integration.

## Public API direction

The first API foundation is intentionally stateless: clients supply their memory collection to `/api/memory`. This avoids introducing a cloud database into the local-first MVP.

Future clients can replace the storage layer without changing retrieval and domain contracts.

## Privacy boundary

Sensitive context processing should happen on-device wherever practical. Remote services, if introduced, must be optional, documented, minimised and compatible with encrypted memory storage.

## Non-goals

Afterimage is not a generic chatbot, social feed, engagement tracker or silent surveillance system.
