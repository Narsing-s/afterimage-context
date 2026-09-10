# Afterimage Architecture

## Core loop

```text
Capture memory
     ↓
Define return condition
     ↓
Observe approved context
     ↓
Match context locally
     ↓
Explain relevance
     ↓
Resurface memory
```

## Principles

### Local-first
The MVP stores memories in browser storage. Future context processing should prefer on-device computation.

### Explicit signals
Integrations should require clear user permission. Context should never become an excuse for silent surveillance.

### Explainable resurfacing
Every surfaced memory should be able to answer: **Why am I seeing this now?**

### User-owned memory
Users should be able to inspect, export, disable, and permanently delete their data.

## Planned layers

### Memory layer
Stores the user's captured thought, metadata, sensitivity, and return condition.

### Context layer
Normalizes signals such as user-entered topics, browser context, calendar context, or repeated behavior.

### Matching layer
Determines whether current context is sufficiently related to a return condition.

### Resurfacing layer
Presents one useful memory with a concise explanation and user controls.

## Privacy boundary

A future implementation should make it possible to keep sensitive context processing on-device. Remote services, if introduced, must be optional, documented, and designed around encrypted data rather than raw personal memory.
