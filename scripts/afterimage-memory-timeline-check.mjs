import { memoryTimeline } from '../lib/memory-timeline.ts';

const memories = [
  { id: 'a', text: 'Choose Railway for the smaller deployment.', mode: 'signal', createdAt: '2026-01-01T00:00:00.000Z', state: 'active', confidence: .8, resurfacedAt: '2026-02-01T00:00:00.000Z', resurfacedCount: 1 },
  { id: 'b', text: 'The old provider is no longer preferred.', mode: 'pattern', createdAt: '2026-01-02T00:00:00.000Z', state: 'outdated', confidence: .4 },
];

const timeline = memoryTimeline(memories);
if (timeline.length !== 5) throw new Error(`Expected 5 timeline events, got ${timeline.length}`);
if (timeline[0].kind !== 'resurfaced') throw new Error('Timeline is not sorted newest-first');
if (!timeline.some(event => event.kind === 'changed')) throw new Error('Changed-state event missing');
console.log('Memory timeline checks passed.');
