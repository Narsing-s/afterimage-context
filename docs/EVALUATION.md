# Afterimage Evaluation

Afterimage should be evaluated as a **context-relevance system**, not as a generic chatbot or reminder app.

## What we measure

The first evaluation layer is deliberately deterministic and dependency-free:

- Does relevant context resurface a matching memory?
- Does unrelated context stay quiet?
- Can the system explain which terms contributed to relevance?
- Does the threshold remain conservative enough to avoid noisy resurfacing?

Run the baseline locally:

```bash
node scripts/afterimage-evaluate.mjs
```

The same harness runs in GitHub Actions.

## Why lexical evaluation first?

The current product matcher is intentionally explainable term overlap with return-condition weighting, confidence, repetition penalties, and sensitivity controls. It is not marketed as semantic AI. A deterministic baseline makes regressions visible before more advanced matching is introduced.

## Scenario design

Every evaluation case should include:

1. A realistic current context.
2. A stored memory.
3. A return condition.
4. Expected relevance.
5. An explanation of why the case should or should not resurface.

Prefer synthetic or anonymized scenarios. Never add real private memories, browsing history, credentials, health information, or customer data to the repository.

## Quality gates

A matching change should be checked for:

- **Precision:** irrelevant memories remain quiet.
- **Recall:** clearly relevant memories can return.
- **Explainability:** users can see why a memory appeared.
- **Stability:** small unrelated context changes do not cause large relevance swings.
- **Control:** users can dismiss, snooze, archive, or correct memories.
- **Privacy:** evaluation data contains no personal memory content.

## Future benchmark

The next evaluation layer can add a versioned synthetic dataset covering hosting, software architecture, production incidents, travel decisions, purchases, recurring work, and conflicting decisions. Future semantic models should be compared against this baseline rather than replacing it without evidence.
