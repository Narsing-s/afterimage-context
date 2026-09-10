export type ReturnMode = 'signal' | 'pattern';

export type ContextMemory = {
  id: string;
  text: string;
  mode: ReturnMode;
  createdAt: string;
  trigger?: string;
};

export type ContextMatch = {
  memory: ContextMemory;
  score: number;
  reason: string;
  matchedTerms: string[];
};

const STOP_WORDS = new Set([
  'the','and','that','this','with','from','have','your','you','for','are','was','were','when','what','why','how','into','just','again','about','then','than','still','next','last','today','tomorrow','because','already','another','keep','keeps','i','a','an','to','of','in','on','is','it','my','me','we','our','should','show','remind','remember'
]);

function terms(text: string) {
  return [...new Set((text.toLowerCase().match(/[a-z0-9₹]+/g) ?? []).filter(t => t.length > 2 && !STOP_WORDS.has(t)))];
}

/**
 * Local, explainable relevance matching. This is deliberately not presented as
 * semantic AI: a memory returns when its saved context/trigger shares enough
 * useful terms with the situation the user is simulating.
 */
export function matchContext(memories: ContextMemory[], currentContext: string): ContextMatch[] {
  const currentTerms = terms(currentContext);
  const current = new Set(currentTerms);
  if (!current.size) return [];

  return memories.map(memory => {
    const memoryTerms = terms(memory.text);
    const triggerTerms = terms(memory.trigger ?? '');
    const allTerms = [...new Set([...memoryTerms, ...triggerTerms])];
    const matchedMemory = memoryTerms.filter(term => current.has(term));
    const matchedTrigger = triggerTerms.filter(term => current.has(term));
    const matchedTerms = [...new Set([...matchedTrigger, ...matchedMemory])];

    const memoryOverlap = matchedMemory.length / Math.max(1, memoryTerms.length);
    const triggerOverlap = matchedTrigger.length / Math.max(1, triggerTerms.length);
    const coverage = matchedTerms.length / Math.max(1, Math.min(allTerms.length, current.size));
    const triggerBoost = matchedTrigger.length ? 0.2 + Math.min(0.15, triggerOverlap * 0.15) : 0;
    const patternBoost = memory.mode === 'pattern' && matchedTerms.length >= 2 ? 0.1 : 0;
    const recencyDamp = memory.createdAt ? 0 : 0; // reserved for future decay policies; no hidden time penalty today

    const score = Math.min(1, coverage * 0.45 + memoryOverlap * 0.25 + triggerOverlap * 0.25 + triggerBoost + patternBoost + recencyDamp);

    const reason = matchedTrigger.length
      ? `The return condition matches ${matchedTrigger.slice(0, 4).join(', ')} in this context.`
      : matchedMemory.length
        ? `This context overlaps with ${matchedMemory.slice(0, 4).join(', ')} from an earlier memory.`
        : 'No meaningful context overlap yet.';

    return { memory, score, matchedTerms, reason };
  })
    .filter(match => match.score >= 0.25)
    .sort((a, b) => b.score - a.score);
}

export function explainMatch(match: ContextMatch) {
  return match.reason;
}
