# Memory Evaluation

Afterimage is a contextual retrieval system, so retrieval quality should be measured rather than judged only by UI behavior.

## Metrics

- Recall — relevant memories resurfaced.
- Precision — resurfaced memories that were relevant.
- False-positive rate — irrelevant memories shown.
- Miss rate — relevant memories not shown.
- Rank quality — position of the expected memory.
- Explanation coverage — whether every result has an observable local reason.
- Feedback quality — whether Useful / Not useful / Wrong context changes priority.

## Dataset

Scenarios must be synthetic, deterministic and free of personal data. Each scenario defines memory text, return condition, current context and an expected yes/no result.

No remote AI or network service is required.

## Regression report

Retrieval changes should report scenario count, true positives, false positives, false negatives, precision, recall and mean reciprocal rank.

Do not optimize one metric alone: retrieving everything can improve recall while making resurfacing noisy.

## Privacy

Evaluation data must never contain real memories, browsing history, credentials or private context.
