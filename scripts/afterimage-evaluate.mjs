import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source=readFileSync(new URL('../lib/context-engine.ts',import.meta.url),'utf8');
const dataset=JSON.parse(readFileSync(new URL('../data/memory-evaluation.json',import.meta.url),'utf8'));
assert(source.includes('export function matchContext'),'context matcher must exist');
assert(Array.isArray(dataset) && dataset.length>=20,'evaluation dataset must contain at least 20 scenarios');
assert(dataset.every(x=>typeof x.memory==='string'&&typeof x.context==='string'&&typeof x.expected==='boolean'),'scenario schema is invalid');
const positives=dataset.filter(x=>x.expected).length;
const negatives=dataset.length-positives;
assert(positives>0&&negatives>0,'dataset needs positive and negative scenarios');
console.log('Afterimage evaluation dataset: '+dataset.length+' scenarios ('+positives+' positive, '+negatives+' negative).');
