export type ReturnMode = 'signal' | 'pattern';
export type MemoryState = 'active' | 'confirmed' | 'outdated' | 'archived';

export type ContextMemory = {
  id: string;
  text: string;
  mode: ReturnMode;
  createdAt: string;
  trigger?: string;
  state?: MemoryState;
  confidence?: number;
  resurfacedAt?: string;
  snoozedUntil?: string;
  resurfacedCount?: number;
};

export type ContextMatch = { memory: ContextMemory; score: number; reason: string; matchedTerms: string[] };
export type MatchOptions = { sensitivity?: number };

const STOP_WORDS = new Set(['the','and','that','this','with','from','have','your','you','for','are','was','were','when','what','why','how','into','just','again','about','then','than','still','next','last','today','tomorrow','because','already','another','keep','keeps','i','a','an','to','of','in','on','is','it','my','me','we','our','should','show','remind','remember','again']);
function terms(text: string) { return [...new Set((text.toLowerCase().match(/[a-z0-9₹]+/g) ?? []).filter(t => t.length > 2 && !STOP_WORDS.has(t)))]; }
function daysSince(iso?: string) { if (!iso) return 999; return Math.max(0, (Date.now() - new Date(iso).getTime()) / 86400000); }

/** Local, deterministic and explainable relevance matching. Sensitivity controls the return threshold. */
export function matchContext(memories: ContextMemory[], currentContext: string, options: MatchOptions = {}): ContextMatch[] {
  const currentTerms = terms(currentContext); const current = new Set(currentTerms); if (!current.size) return [];
  const now = Date.now(); const sensitivity = Math.min(0.8, Math.max(0.05, options.sensitivity ?? 0.25)); const threshold = Math.min(0.55, Math.max(0.12, 0.42 - sensitivity * 0.3));
  return memories.map(memory => {
    if (memory.state === 'archived' || memory.state === 'outdated') return null;
    if (memory.snoozedUntil && new Date(memory.snoozedUntil).getTime() > now) return null;
    const memoryTerms = terms(memory.text), triggerTerms = terms(memory.trigger ?? '');
    const matchedMemory = memoryTerms.filter(term => current.has(term)), matchedTrigger = triggerTerms.filter(term => current.has(term));
    const matchedTerms = [...new Set([...matchedTrigger, ...matchedMemory])]; if (!matchedTerms.length) return null;
    const memoryOverlap = matchedMemory.length / Math.max(1, memoryTerms.length), triggerOverlap = matchedTrigger.length / Math.max(1, triggerTerms.length);
    const coverage = matchedTerms.length / Math.max(1, Math.min(memoryTerms.length + triggerTerms.length, current.size));
    const confidence = Math.min(1, Math.max(0.35, memory.confidence ?? 0.7));
    const repetitionPenalty = Math.min(0.18, (memory.resurfacedCount ?? 0) * 0.04), stalePenalty = Math.min(0.15, daysSince(memory.resurfacedAt) / 3650);
    const triggerBoost = matchedTrigger.length ? 0.22 + Math.min(0.12, triggerOverlap * 0.12) : 0, patternBoost = memory.mode === 'pattern' && matchedTerms.length >= 2 ? 0.1 : 0;
    const score = Math.min(1, coverage * 0.4 + memoryOverlap * 0.2 + triggerOverlap * 0.2 + triggerBoost + patternBoost) * confidence - repetitionPenalty - stalePenalty;
    if (score < threshold) return null;
    const reason = matchedTrigger.length ? `The return condition matches ${matchedTrigger.slice(0, 4).join(', ')}.` : `This context overlaps with ${matchedMemory.slice(0, 4).join(', ')} from an earlier memory.`;
    return { memory, score, matchedTerms, reason };
  }).filter((match): match is ContextMatch => Boolean(match)).sort((a, b) => b.score - a.score);
}
export function explainMatch(match: ContextMatch) { return match.reason; }
export function markResurfaced(memory: ContextMemory): ContextMemory { return { ...memory, resurfacedAt: new Date().toISOString(), resurfacedCount: (memory.resurfacedCount ?? 0) + 1 }; }
export function snoozeMemory(memory: ContextMemory, days = 30): ContextMemory { return { ...memory, snoozedUntil: new Date(Date.now() + days * 86400000).toISOString() }; }
