# Memory Firewall

The Memory Firewall is the permission boundary between AI agents/integrations and durable user memory.

## Permissions

- read — retrieve approved memories.
- propose — suggest a durable change without applying it.
- write — create durable memory.
- update — change an existing memory.
- consolidate — merge memories.
- delete — delete memory.

Agents should normally start with read and propose.

## Core rule

**A proposal is not a mutation.**

AI may suggest a memory, update, feedback action or consolidation, but durable user-owned memory changes require an explicit authorized operation.

Every authorization decision produces an audit event containing agent, action, memory ID when applicable, timestamp and allow/deny result.

## Future integrations

MCP, desktop, Android and other clients should use this same permission contract rather than creating separate semantics.
