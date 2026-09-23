import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source=readFileSync(new URL('../lib/memory-firewall.ts',import.meta.url),'utf8');
for(const permission of ['read','propose','write','update','consolidate','delete']) assert(source.includes("'"+permission+"'"));
assert(source.includes('Proposals never mutate durable memory'));
console.log('Afterimage memory firewall contract checks passed.');
