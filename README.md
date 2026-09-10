# Afterimage

> **The memory layer for your future self.**

Afterimage is a context-memory product concept. Instead of scheduling a reminder, you leave behind a small piece of knowledge and define the *kind of situation* that should bring it back.

### Product primitive

`memory → return condition → context match → resurfacing`

The MVP is intentionally local-first: captured memories are stored in browser `localStorage` and are never sent to a server.

## Current build

- Premium, responsive dark interface
- Context signal vs pattern trigger capture
- Local browser persistence
- Local memory wall + explicit deletion
- Context timeline demonstration
- No account, ads, feed, streaks, or notification spam
- CI build workflow

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Product roadmap

1. Local encrypted memory store
2. Semantic return-condition engine
3. Android client
4. Browser capture extension
5. Calendar/topic/context signals
6. Personal pattern graph
7. Optional encrypted sync
8. Privacy controls, export/import, and complete deletion

## Positioning

This project does **not** claim that no similar idea has ever existed. Adjacent products exist around reminders, decision journals, personal knowledge bases, and context-aware software. Afterimage's intended differentiation is the product primitive: **a memory is attached to a return condition rather than a scheduled date.**

## License

Apache-2.0
