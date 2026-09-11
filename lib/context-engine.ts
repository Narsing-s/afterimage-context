export type ReturnMode = 'signal' | 'pattern';
export type MemoryState = 'active' | 'confirmed' | 'outdated' | 'archived';
export type MemorySensitivity = 'quiet' | 'balanced' | 'eager';

export type ContextMemory = {
  id: string;
  text: string;
  mode: ReturnMode;
  createdAt: string;
  trigger?: string;
  why?: string;
  state?: MemoryState;
  confidence?: number;
  sensitivity?: MemorySensitivity;
  resurfacedAt?: string;
  snoozedUntil?: string;
  resurfacedCount?: number;
};

export type ContextMatch = { memory: ContextMemory; score: number; reason: string; matchedTerms: string[] };
export type MatchOptions = { sensitivity?: number };
export type ContradictionSignal = { memory: ContextMemory; score: number; reason: string; type: 'changed' | 'conflict' };

const STOP_WORDS = new Set(['the','and','that','this','with','from','have','your','you','for','are','was','were','when','what','why','how','into','just','again','about','then','than','still','next','last','today','tomorrow','because','already','another','keep','keeps','i','a','an','to','of','in','on','is','it','my','me','we','our','should','show','remind','remember','again']);
const CONCEPT_GROUPS: Record<string, string[]> = {
  deploy: ['deploy','deployment','deployed','release','releases'],
  hosting: ['host','hosting','hosted'],
  database: ['database','databases','db','datastore'],
  purchase: ['buy','buying','bought','purchase','purchasing','shopping','shop'],
  travel: ['travel','trip','trips','vacation','journey'],
  api: ['api','apis','endpoint','endpoints'],
  credential: ['credential','credentials','password','passwords','secret','secrets'],
  incident: ['incident','incidents','outage','outages','downtime','production','prod'],
};
const CONCEPT_BY_TERM = new Map<string, string>();
for (const [concept, variants] of Object.entries(CONCEPT_GROUPS)) for (const variant of variants) CONCEPT_BY_TERM.set(variant, concept);

function terms(text: string) {
  return [...new Set((text.toLowerCase().match(/[a-z0-9₹]+/g) ?? []).filter(t => t.length > 2 && !STOP_WORDS.has(t)).map(t => CONCEPT_BY_TERM.get(t) ?? t))];
}
function daysSince(iso?: string) { if (!iso) return 0; return Math.max(0, (Date.now() - new Date(iso).getTime()) / 86400000); }
function sensitivityValue(memory: ContextMemory, fallback: number) { return memory.sensitivity === 'quiet' ? Math.max(.05, fallback - .12) : memory.sensitivity === 'eager' ? Math.min(.8, fallback + .12) : fallback; }

/** Local, deterministic and explainable relevance matching. Per-memory sensitivity adjusts the return threshold. */
export function matchContext(memories: ContextMemory[], currentContext: string, options: MatchOptions = {}): ContextMatch[] {
  const currentTerms = terms(currentContext); const current = new Set(currentTerms); if (!current.size) return [];
  const now = Date.now(); const globalSensitivity = Math.min(0.8, Math.max(0.05, options.sensitivity ?? 0.25));
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
    const threshold = Math.min(.62, Math.max(.08, .42 - sensitivityValue(memory, globalSensitivity) * .3));
    if (score < threshold) return null;
    const reason = matchedTrigger.length ? `The return condition matches ${matchedTrigger.slice(0, 4).join(', ')}.` : `This context overlaps with ${matchedMemory.slice(0, 4).join(', ')} from an earlier memory.`;
    return { memory, score, matchedTerms, reason };
  }).filter((match): match is ContextMatch => Boolean(match)).sort((a, b) => b.score - a.score);
}

/** Detects explicit change/conflict language locally; it never rewrites or deletes memory. */
export function detectContradictions(memories: ContextMemory[], currentContext: string): ContradictionSignal[] {
  const current = currentContext.toLowerCase();
  const changeWords = ['changed','change','no longer','not anymore','instead','switched','moved','replaced','different','decided against','stopped using','deprecated'];
  return memories.filter(m => m.state !== 'archived' && m.state !== 'outdated').map(memory => {
    const memoryText = `${memory.text} ${memory.trigger ?? ''}`.toLowerCase();
    const hits = changeWords.filter(word => current.includes(word) && memoryText.includes(word));
    const overlap = [...new Set(terms(memory.text).filter(t => terms(currentContext).includes(t)))];
    if (!hits.length || !overlap.length) return null;
    const score = Math.min(1, .45 + hits.length * .12 + overlap.length * .05);
    return { memory, score, type: 'changed' as const, reason: `The current context signals a change (${hits.slice(0, 2).join(', ')}). Review this memory before relying on it.` };
  }).filter((x): x is ContradictionSignal => Boolean(x)).sort((a,b) => b.score-a.score);
}

export function explainMatch(match: ContextMatch) { return match.reason; }
export function markResurfaced(memory: ContextMemory): ContextMemory { return { ...memory, resurfacedAt: new Date().toISOString(), resurfacedCount: (memory.resurfacedCount ?? 0) + 1 }; }
export function snoozeMemory(memory: ContextMemory, days = 30): ContextMemory { return { ...memory, snoozedUntil: new Date(Date.now() + days * 86400000).toISOString() }; }
