# Contributing to Afterimage

Thank you for helping explore a new computing primitive: **memory that returns when its context returns**.

## Quick start

1. Fork the repository.
2. Create a branch: `git checkout -b feat/your-idea`.
3. Install dependencies: `npm install`.
4. Start locally: `npm run dev`.
5. Make a focused change.
6. Run `npm run build` before opening a PR.
7. Open a pull request explaining the problem, solution, and how you tested it.

## What we welcome

- Context-matching experiments
- Local-first and privacy improvements
- Android and browser integrations
- Accessibility and UX improvements
- Performance improvements
- Documentation and examples
- Tests and developer tooling
- Research into when memories should and should not resurface

## Contributor missions

### Memory Engineer
Improve the memory model and storage layer.

### Context Explorer
Design reliable ways to identify when an old memory is relevant.

### Privacy Engineer
Keep personal context local, transparent, exportable, and controllable.

### Android Builder
Help bring Afterimage to Android without turning it into a notification-heavy app.

### Browser Builder
Explore useful, permission-aware browser capture.

### Experience Designer
Design calm resurfacing interactions that respect attention.

### Reality Tester
Try real scenarios and document false positives, missed context, and surprising behavior.

## Design principles

1. **Context over clocks.** A memory should return because it matters, not merely because a date arrived.
2. **Quiet by default.** No notification spam, streaks, feeds, or engagement tricks.
3. **Local-first.** Personal memory should not require a remote account.
4. **Explainability.** When something resurfaces, the user should understand why.
5. **User control.** Export, delete, disable, and inspect memory behavior.
6. **Small experiments.** Prefer focused, measurable changes over large speculative rewrites.

## Pull requests

Keep PRs small when possible. Include:

- What changed
- Why it changed
- Screenshots for UI changes
- Testing performed
- Privacy/security implications
- Any follow-up work

Please do not add analytics, advertising, hidden tracking, or remote collection of memory content without an explicit design and privacy review.
