function assessDecision(decision) {
  const expected = String(decision.expectedOutcome || '').trim().toLowerCase();
  const actual = String(decision.actualOutcome || '').trim().toLowerCase();
  if (!actual) return { outcomeGap: 'unknown' };
  if (!expected) return { outcomeGap: 'unknown' };
  const expectedWords = new Set(expected.match(/[a-z0-9]+/g) || []);
  const actualWords = new Set(actual.match(/[a-z0-9]+/g) || []);
  const overlap = [...expectedWords].filter(word => word.length > 3 && actualWords.has(word));
  const aligned = overlap.length >= Math.max(1, Math.min(3, Math.ceil(expectedWords.size * 0.18)));
  return { outcomeGap: aligned ? 'aligned' : 'changed' };
}

const pending = { expectedOutcome:'Fast deployment', actualOutcome:'' };
const changed = { expectedOutcome:'Fast deployment', actualOutcome:'Migration became expensive and deployment was slower than expected.' };
if (assessDecision(pending).outcomeGap !== 'unknown') throw new Error('Pending outcome should be unknown');
if (assessDecision(changed).outcomeGap !== 'changed') throw new Error('Changed outcome was not detected');
console.log('Decision Memory 2.0 checks passed.');
