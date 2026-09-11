import type { ContextMemory, ContextMatch } from './context-engine';

export type MemoryIntelligence = {
  originalContext: string;
  currentContext: string;
  sharedTerms: string[];
  changedSignals: string[];
  relevance: number;
  status: 'aligned' | 'changed' | 'uncertain';
  whyThisMatters: string;
};

const STOP = new Set(['the','and','that','this','with','from','have','your','you','for','are','was','were','when','what','why','how','into','just','again','about','then','than','still','next','last','today','tomorrow','because','already','another','keep','keeps','i','a','an','to','of','in','on','is','it','my','me','we','our','should','show','remind','remember']);
const CHANGE_SIGNALS = ['changed','change','no longer','not anymore','instead','switched','moved','replaced','different','deprecated','stopped using','decided against'];

function words(value: string) {
  return [...new Set((value.toLowerCase().match(/[a-z0-9₹]+/g) ?? []).filter(word => word.length > 2 && !STOP.has(word)))];
}

function similarity(a: string, b: string) {
  const left = new Set(words(a));
  const right = new Set(words(b));
  if (!left.size || !right.size) return 0;
  return [...left].filter(word => right.has(word)).length / Math.max(left.size, right.size);
}

export function explainWhyThisMatters(memory: ContextMemory, currentContext: string, match?: ContextMatch): MemoryIntelligence {
  const originalContext = memory.trigger?.trim() || memory.text;
  const current = currentContext.trim();
  const left = new Set(words(originalContext));
  const right = new Set(words(current));
  const sharedTerms = [...left].filter(term => right.has(term)).slice(0, 6);
  const changedSignals = CHANGE_SIGNALS.filter(signal => current.toLowerCase().includes(signal));
  const relevance = Math.max(0, Math.min(1, match?.score ?? similarity(originalContext, current)));
  const status: MemoryIntelligence['status'] = changedSignals.length && sharedTerms.length ? 'changed' : relevance >= 0.32 ? 'aligned' : 'uncertain';

  let whyThisMatters: string;
  if (status === 'changed') {
    whyThisMatters = `This looks like the same situation, but the current context signals a change (${changedSignals.slice(0, 2).join(', ')}). Use the old memory as context, not as a rule.`;
  } else if (status === 'aligned') {
    whyThisMatters = match?.reason
      ? `${match.reason} The earlier reason is relevant enough to review before you decide again.`
      : `The current context overlaps with the original return condition through ${sharedTerms.slice(0, 3).join(', ')}.`;
  } else {
    whyThisMatters = 'The connection is weak. Afterimage should stay quiet unless more context confirms that this memory is useful now.';
  }

  return { originalContext, currentContext: current, sharedTerms, changedSignals, relevance, status, whyThisMatters };
}
