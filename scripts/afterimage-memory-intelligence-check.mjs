import assert from 'node:assert/strict';

const signals = [
  { text: 'I chose Railway because migration cost mattered.', trigger: 'When I compare hosting again', context: 'I am comparing hosting providers and migration costs again' },
  { text: 'I chose the old database because it was simpler.', trigger: 'When I revisit the database choice', context: 'The database choice changed and I am considering a replacement' },
];

function words(value) {
  return new Set((value.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter(x => x.length > 2));
}
function explain(memory, current) {
  const left = words(memory.trigger || memory.text);
  const right = words(current);
  const shared = [...left].filter(x => right.has(x));
  const changed = ['changed','change','no longer','instead','switched','replaced'].filter(x => current.toLowerCase().includes(x));
  return { shared, changed, status: changed.length && shared.length ? 'changed' : shared.length ? 'aligned' : 'uncertain' };
}

const aligned = explain(signals[0], signals[0].context);
assert.equal(aligned.status, 'aligned');
assert.ok(aligned.shared.length > 0);

const changed = explain(signals[1], signals[1].context);
assert.equal(changed.status, 'changed');
assert.ok(changed.changed.length > 0);

const quiet = explain(signals[0], 'I am cooking dinner tonight');
assert.equal(quiet.status, 'uncertain');

console.log('Memory intelligence checks passed.');
