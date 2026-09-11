# Start Here — Afterimage Contributors

Welcome. You do **not** need to understand the whole codebase before making a contribution.

Afterimage is exploring one idea:

> **A memory should return when its context becomes relevant again.**

## Your first 10 minutes

1. Fork the repository.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open `http://localhost:3000`.
5. Pick one small issue from GitHub labeled **good first issue**.
6. Make one focused change.
7. Run `npm run build`.
8. Open a pull request with what changed and how you tested it.

## Choose your mission

| If you enjoy... | Start with... |
| --- | --- |
| React / TypeScript | Memory UI, accessibility, local behavior |
| Matching / algorithms | Context Explorer and resurfacing |
| Privacy / security | Context permissions and local-first storage |
| Browser extensions | `extension/` and `/extension-bridge` |
| Mobile | Android offline-first client |
| Product / UX | Calm resurfacing and explainability |
| Testing / research | Evaluation scenarios and false-positive analysis |
| Documentation | Examples, guides, screenshots and demos |

## Safest first contributions

- Improve keyboard navigation.
- Add tests for local memory behavior.
- Improve the “Why now?” explanation.
- Test Chrome/Edge compatibility.
- Improve mobile layouts without changing the product model.
- Add synthetic evaluation scenarios.
- Improve contributor documentation.

## Important product boundaries

Please do not introduce:

- hidden browsing-history collection
- advertising or engagement mechanics
- silent remote storage of personal memories
- background context collection without explicit permission
- analytics that capture personal memory content

When unsure, open an issue before building a large change.

## Useful files

- `README.md` — product overview
- `CONTRIBUTING.md` — contribution rules
- `GOOD_FIRST_ISSUES.md` — starter missions
- `COMMUNITY.md` — community expectations
- `ROADMAP.md` — product direction
- `ARCHITECTURE.md` — technical structure
- `SECURITY.md` — security expectations
- `docs/PRODUCT_VISION.md` — product philosophy
- `extension/` — browser extension

## Definition of a good Afterimage contribution

A strong contribution makes the product **more useful without making it louder**.

Prefer changes that are:

- explainable
- local-first where practical
- reversible
- accessible
- measurable
- small enough to review

If your change makes Afterimage feel calmer, clearer, safer, or more context-aware, you are probably moving in the right direction.
