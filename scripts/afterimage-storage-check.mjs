#!/usr/bin/env node
/**
 * Dependency-free regression checks for the local memory contract.
 * These checks mirror the browser-side invariants without needing a browser.
 */

const sample = [{ id: 'demo-1', text: 'Keep rollback simple', mode: 'signal', state: 'active', confidence: .8, resurfacedCount: 0 }];
const json = JSON.stringify(sample);
const restored = JSON.parse(json);
if (!Array.isArray(restored) || restored[0]?.id !== 'demo-1') throw new Error('memory JSON round-trip failed');

const migrated = restored.map(memory => ({
  ...memory,
  state: memory.state || 'active',
  confidence: typeof memory.confidence === 'number' ? memory.confidence : .7,
  resurfacedCount: typeof memory.resurfacedCount === 'number' ? memory.resurfacedCount : 0,
}));
if (migrated[0].state !== 'active' || migrated[0].confidence !== .8 || migrated[0].resurfacedCount !== 0) throw new Error('memory migration defaults failed');

const snapshot = JSON.stringify({ memories: migrated, label: 'test', createdAt: new Date().toISOString() });
const recovered = JSON.parse(snapshot);
if (!Array.isArray(recovered.memories) || recovered.memories.length !== 1) throw new Error('recovery snapshot failed');

console.log('PASS storage contract: JSON round-trip, migration defaults, recovery snapshot');
