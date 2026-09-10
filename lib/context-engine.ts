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
  'the','and','that','this','with','from','have','your','you','for','are','was','were','when','what','why','how','into','just','again','about','then','than','still','next','last','today','tomorrow','because','already','another','keep','keeps','i','a','an','to','of','in','on','is','it','my','me','we','our'
]);

function terms(text: string) {
  return [...new Set((text.toLowerCase().match(/[a-z0-9₹]+/g) ?? []).filter(t => t.length > 2 && !STOP_WORDS.has(t)))];
}

export function matchContext(memories: ContextMemory[], currentContext: string): ContextMatch[] {
  const current = new Set(terms(currentContext));
  if (!current.size) return [];

  return memories.map(memory => {
    const memoryTerms = terms(`${memory.text} ${memory.trigger ?? ''}`);
    const matchedTerms = memoryTerms.filter(term => current.has(term));
    const overlap = matchedTerms.length / Math.max(1, Math.min(memoryTerms.length, current.size));
    const phraseBoost = memoryTerms.some(term => current.has(term)) ? 0.15 : 0;
    const modeBoost = memory.mode === 'pattern' && matchedTerms.length >= 2 ? 0.1 : 0;
    const score = Math.min(1, overlap + phraseBoost + modeBoost);

    return {
      memory,
      score,
      matchedTerms,
      reason: matchedTerms.length
        ? `This context overlaps with ${matchedTerms.slice(0, 4).join(', ')} from an earlier memory.`
        : 'No meaningful context overlap yet.'
    };
  }).filter(match => match.score >= 0.25).sort((a, b) => b.score - a.score);
}

export function explainMatch(match: ContextMatch) {
  return match.reason;
}
