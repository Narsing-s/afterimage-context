#!/usr/bin/env node
/**
 * Deterministic, dependency-free evaluation harness for Afterimage's core idea.
 * It intentionally tests explainable lexical relevance rather than pretending to
 * measure semantic AI quality. Return-condition terms are weighted because they
 * describe the user's explicit resurfacing intent.
 */

const cases = [
  { id:'hosting', context:'I am comparing hosting providers and migration costs for a production app', memory:'I chose this hosting plan because migrating later would be more painful than paying a little extra', trigger:'when I compare hosting again', expected:true },
  { id:'database', context:'I am reviewing a PostgreSQL database migration and backup strategy', memory:'Before the last database migration, I chose smaller incremental changes because rollback mattered', trigger:'when database migrations come up again', expected:true },
  { id:'travel', context:'I am choosing a weekend train trip and checking hotel prices', memory:'I selected a laptop because its repairability was better than the cheaper alternative', trigger:'when buying a laptop again', expected:false },
  { id:'unrelated', context:'I am reading about gardening and tomato plants', memory:'The production API needed a longer timeout because the upstream service was slow', trigger:'when troubleshooting production APIs', expected:false },
];

const stop = new Set(['the','and','for','with','when','again','because','this','that','from','into','than','was','were','are','is','a','an','to','of','i','am','it','my','your']);
const terms = value => [...new Set(String(value).toLowerCase().match(/[a-z0-9]+/g)?.filter(x => x.length > 2 && !stop.has(x)) ?? [])];
const overlap = (a,b) => { const A = new Set(terms(a)); return terms(b).filter(x => A.has(x)); };

let passed = 0;
console.log('Afterimage evaluation harness');
console.log('Metric: explainable lexical overlap with return-condition weighting; not a semantic-AI benchmark.\n');

for (const test of cases) {
  const memoryHits = overlap(test.context, test.memory);
  const triggerHits = overlap(test.context, test.trigger);
  const hits = [...new Set([...memoryHits, ...triggerHits])];
  const triggerBoost = triggerHits.length > 0 ? 1 : 0;
  const relevancePoints = memoryHits.length + triggerBoost;
  const score = hits.length / Math.max(1, terms(`${test.memory} ${test.trigger}`).length);
  // One explicit return-condition match is enough to justify a contextual candidate;
  // memory text can independently contribute additional evidence.
  const predicted = relevancePoints >= 1;
  const ok = predicted === test.expected;
  if (ok) passed++;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${test.id}: expected=${test.expected} predicted=${predicted} hits=[${hits.join(', ')}] score=${score.toFixed(3)}`);
}

const accuracy = passed / cases.length;
console.log(`\nResult: ${passed}/${cases.length} cases passed (${Math.round(accuracy * 100)}%).`);
if (accuracy < 1) process.exitCode = 1;
