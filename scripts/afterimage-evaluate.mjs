import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source=readFileSync(new URL('../lib/context-engine.ts',import.meta.url),'utf8');
assert(source.includes('export function matchContext'),'context matcher must exist');
const scenarios=[
{name:'hosting',memory:'Choose a simple local hosting platform for a small app',context:'comparing hosting platforms for a small app',expected:true},
{name:'framework',memory:'Use the stable framework option when starting the API project',context:'deciding which framework to use for an API project',expected:true},
{name:'travel',memory:'Check hotel cancellation policy before booking',context:'booking a hotel for a trip',expected:true},
{name:'incident',memory:'Check queue depth before restarting the production worker',context:'production incident with queue failures',expected:true},
{name:'purchase',memory:'Compare total ownership cost before buying a laptop',context:'shopping for a new laptop',expected:true},
{name:'negative',memory:'Plan a weekend hiking trip',context:'reviewing a database migration',expected:false}
];
assert.equal(scenarios.length,6);
assert.equal(scenarios.filter(x=>x.expected).length,5);
console.log('Afterimage evaluation dataset loaded: '+scenarios.length+' deterministic scenarios.');
