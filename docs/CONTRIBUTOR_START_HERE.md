# Contributor Start Here

Welcome to Afterimage. You can make a useful contribution without understanding the entire codebase.

## Pick a 30–90 minute mission

### 🟢 Easiest
- Improve an empty state
- Add an accessibility label
- Fix a responsive spacing issue
- Improve a README example
- Add a keyboard interaction
- Add a focused test around local memory behavior

### 🧠 Context
- Improve return-condition parsing
- Test relevance scoring with realistic examples
- Reduce false-positive resurfacing
- Add explainable matching signals

### 🔐 Privacy
- Review a permission boundary
- Improve import/export safety
- Document a threat model
- Prototype local encryption without adding a server dependency

### 🌐 Browser
- Improve extension permission UX
- Add a context extraction experiment
- Improve the explicit app ↔ extension handoff
- Add Chrome/Edge compatibility testing

### 🎨 Product
- Improve the “Why now?” explanation
- Make resurfacing calmer and clearer
- Improve mobile layouts
- Add an empty-state teaching moment

### 🧪 Reality testing
Try Afterimage for one real scenario:

- comparing hosting providers
- choosing a technology stack
- making a purchase decision
- repeating a production workflow
- planning a trip

Report where the memory should return, should not return, and what context was missing.

## Before coding

1. Read `CONTRIBUTING.md`.
2. Check `GOOD_FIRST_ISSUES.md` and open issues.
3. Search the repository before creating a new abstraction.
4. Keep the change small and explainable.
5. Never add hidden tracking, advertising, or silent collection of personal context.

## Local setup

```bash
npm install
npm run dev
```

Build before opening a PR:

```bash
npm run build
```

## Pull request checklist

Explain:

- the problem
- the smallest useful solution
- how you tested it
- privacy/security implications
- screenshots for UI changes

## The Afterimage rule

**Do not make Afterimage louder just to make it more engaging. Make it more useful when context returns.**

Small, careful contributions are valuable here. If you are unsure where to start, open an issue describing what you observed and we can turn it into a focused task.
