const memories = [
  { id: 'a', text: 'Choose Railway for the smaller deployment.', createdAt: '2026-01-01T00:00:00.000Z', state: 'active', resurfacedAt: '2026-02-01T00:00:00.000Z' },
  { id: 'b', text: 'The old provider is no longer preferred.', createdAt: '2026-01-02T00:00:00.000Z', state: 'outdated' },
];

function timeline(items) {
  const events = [];
  for (const memory of items) {
    events.push({ kind: 'captured', at: memory.createdAt });
    if (memory.resurfacedAt) {
      events.push({ kind: 'resurfaced', at: memory.resurfacedAt });
      if (memory.state === 'active' || memory.state === 'confirmed') events.push({ kind: 'confirmed', at: memory.resurfacedAt });
    }
    if (memory.state === 'outdated') events.push({ kind: 'changed', at: memory.resurfacedAt || memory.createdAt });
    if (memory.state === 'archived') events.push({ kind: 'archived', at: memory.resurfacedAt || memory.createdAt });
  }
  return events.sort((a, b) => new Date(b.at) - new Date(a.at));
}

const result = timeline(memories);
if (result.length !== 5) throw new Error(`Expected 5 timeline events, got ${result.length}`);
if (result[0].kind !== 'resurfaced') throw new Error('Timeline is not sorted newest-first');
if (!result.some(event => event.kind === 'changed')) throw new Error('Changed-state event missing');
console.log('Memory timeline checks passed.');
