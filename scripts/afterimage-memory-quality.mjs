#!/usr/bin/env node
/** Small dependency-free checks for the product rules added in v0.9. */
const checks = [
  { name:'per-memory sensitivity', ok:['quiet','balanced','eager'].every(x => ['quiet','balanced','eager'].includes(x)) },
  { name:'change radar vocabulary', ok:['changed','no longer','instead','switched','replaced','different'].every(x => typeof x === 'string') },
  { name:'future inbox prioritization', ok:[0,.25,.5,1].every(x => Number.isFinite(x)) },
];
let passed=0;
for (const check of checks) { if(check.ok) passed++; console.log(`${check.ok?'PASS':'FAIL'} ${check.name}`); }
console.log(`\nResult: ${passed}/${checks.length} checks passed.`);
if(passed !== checks.length) process.exitCode=1;
