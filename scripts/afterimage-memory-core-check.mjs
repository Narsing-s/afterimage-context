import assert from 'node:assert/strict';
import { recordFeedback, findConsolidationCandidates, consolidate, memoryPriority } from '../lib/memory-core.ts';

const base={id:'a',text:'Prefer simple encrypted local storage',mode:'signal',createdAt:'2026-01-01T00:00:00.000Z',confidence:.7,sensitivity:'balanced'};
const other={...base,id:'b',text:'Use encrypted local storage for small projects'};
const useful=recordFeedback(base,'useful');
assert(useful.confidence>.7);
assert.equal(useful.feedback.useful,1);
assert(memoryPriority({...base,importance:'critical'})>memoryPriority(base));
assert(findConsolidationCandidates([base,other]).length===1);
const merged=consolidate([base,other],['a','b'],'Use encrypted local storage when practical.');
assert.equal(merged.memories.length,1);
assert.equal(merged.events.length,3);
console.log('Afterimage memory core checks passed.');
