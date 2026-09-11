# Afterimage Community

Afterimage is an open-source experiment in **contextual memory**: helping useful knowledge return when its context becomes relevant again.

We are looking for contributors across engineering, design, research, privacy, testing, and documentation.

## Pick a mission

### 🟢 First contribution

Start with issues marked `good first issue`.

Good starter work includes accessibility, mobile polish, documentation, tests, and browser compatibility.

### 🧠 Context & matching

Help answer the hardest product question:

> **When should an old memory return — and when should it stay quiet?**

Ideas:
- Improve relevance scoring
- Study false-positive resurfacing
- Design return-condition schemas
- Build evaluation datasets using synthetic/local examples
- Improve conflict detection

### 🔐 Privacy

Help make contextual memory trustworthy.

Ideas:
- Local encryption
- Permission boundaries
- Data lifecycle reviews
- Import/export safety
- Threat modeling
- Privacy-preserving integrations

### 🌐 Browser

Help make the extension useful without becoming surveillance software.

Ideas:
- Chromium compatibility
- Context extraction
- Permission UX
- Offline behavior
- Extension/app handoff

### 📱 Mobile

Help explore an offline-first mobile companion without notification spam.

### 🎨 Product & design

Help make resurfacing calm, understandable, and useful.

Ideas:
- “Why now?” explanations
- Memory review flows
- Empty states
- Accessibility
- Responsive layouts
- Interaction design

### 🧪 Reality testing

Use Afterimage with real workflows and report:
- memories that should have resurfaced
- memories that resurfaced too early
- false positives
- missing context
- confusing explanations

## Before opening a PR

1. Read `CONTRIBUTING.md`.
2. Pick an existing issue when possible.
3. Keep the change focused.
4. Run `npm run build`.
5. Include screenshots for UI changes.
6. Explain privacy/security implications when context data is involved.

## What we do not want

Afterimage should remain calm and user-controlled.

Please do not introduce:
- hidden browsing-history collection
- advertising
- engagement/streak mechanics
- analytics that capture personal memory content
- remote storage of private memories without an explicit design review
- background context collection without clear permission

## Recognition

Contributors who make meaningful improvements can be highlighted in the project changelog and contributor documentation.

Small improvements matter. A better test, clearer explanation, accessibility fix, browser compatibility patch, or thoughtful research note can materially improve Afterimage.
