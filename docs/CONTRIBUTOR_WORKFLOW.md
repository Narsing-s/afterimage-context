# Contributor Workflow

Afterimage is easiest to improve through small, measurable changes.

## 1. Pick a mission

Choose one area before coding:

- **Context** — matching, return conditions, relevance, false positives
- **Memory** — lifecycle, import/export, confidence, decision memory
- **Browser** — extension capture, resurfacing, bridge behavior
- **Privacy** — permissions, local-first behavior, threat modeling
- **Experience** — accessibility, responsive UI, calm resurfacing
- **Research** — synthetic evaluation scenarios and benchmarks
- **Documentation** — examples, guides, screenshots, onboarding

## 2. Define the behavior

Write down:

- what should happen;
- what should not happen;
- how a user can tell why it happened;
- how the user can undo or dismiss it;
- how you will test it.

## 3. Keep the change narrow

Prefer one focused pull request over a large rewrite. Avoid changing the product model, storage format, permissions, or visual language unless the change specifically requires it.

## 4. Validate locally

Run:

```bash
npm install
npm run build
```

For browser-extension changes, load `extension/` as an unpacked Manifest V3 extension and test capture, matching, dismissal, and bridge flows affected by the change.

## 5. Explain the contribution

A good PR should answer:

1. **What changed?**
2. **Why does it matter?**
3. **How was it tested?**
4. **What privacy or permission surface changed?**
5. **What remains intentionally out of scope?**

## Contribution quality bar

A strong Afterimage contribution makes memory **more useful without making the product louder**.

Prefer behavior that is:

- explainable;
- reversible;
- accessible;
- local-first where practical;
- measurable;
- quiet when there is no useful context.

Avoid hidden tracking, engagement mechanics, silent remote memory collection, or background context collection without explicit permission.
