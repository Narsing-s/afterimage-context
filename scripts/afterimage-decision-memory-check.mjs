import { assessDecision } from '../lib/decision-memory.ts';

const pending = { id:'a', decision:'Choose Railway', reason:'Simple deployment', alternatives:'Render', constraints:'Time', expectedOutcome:'Fast deployment', actualOutcome:'', wouldChooseAgain:'', confidence:.8, createdAt:new Date().toISOString() };
const changed = { ...pending, actualOutcome:'Migration became expensive and deployment was slower than expected.' };
if (assessDecision(pending).outcomeGap !== 'unknown') throw new Error('Pending outcome should be unknown');
if (assessDecision(changed).outcomeGap !== 'changed') throw new Error('Changed outcome was not detected');
console.log('Decision Memory 2.0 checks passed.');
