import type { ContextMemory } from './context-engine';

export type DecisionMemory = {
  id: string;
  decision: string;
  reason: string;
  alternatives: string;
  constraints: string;
  expectedOutcome: string;
  actualOutcome: string;
  wouldChooseAgain: 'yes' | 'no' | 'unsure' | '';
  confidence: number;
  createdAt: string;
  reviewedAt?: string;
  linkedMemoryId?: string;
};

export type DecisionAssessment = {
  hasOutcome: boolean;
  outcomeGap: 'unknown' | 'aligned' | 'changed';
  evidence: string[];
  nextQuestion: string;
};

export function createDecisionId() {
  return `decision_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function assessDecision(decision: DecisionMemory): DecisionAssessment {
  const expected = decision.expectedOutcome.trim().toLowerCase();
  const actual = decision.actualOutcome.trim().toLowerCase();
  if (!actual) return { hasOutcome: false, outcomeGap: 'unknown', evidence: [], nextQuestion: 'What actually happened after you made this choice?' };
  if (!expected) return { hasOutcome: true, outcomeGap: 'unknown', evidence: [actual], nextQuestion: 'Was the outcome better, worse, or roughly what you expected?' };
  const expectedWords = new Set(expected.match(/[a-z0-9]+/g) ?? []);
  const actualWords = new Set(actual.match(/[a-z0-9]+/g) ?? []);
  const overlap = [...expectedWords].filter(word => word.length > 3 && actualWords.has(word));
  const aligned = overlap.length >= Math.max(1, Math.min(3, Math.ceil(expectedWords.size * 0.18)));
  return { hasOutcome: true, outcomeGap: aligned ? 'aligned' : 'changed', evidence: overlap.slice(0, 6), nextQuestion: aligned ? 'Did the decision hold up as expected?' : 'What changed between the assumption and the real outcome?' };
}

export function decisionMemoryToContext(memory: DecisionMemory): ContextMemory {
  const outcome = memory.actualOutcome ? ` Outcome: ${memory.actualOutcome}` : '';
  return {
    id: memory.linkedMemoryId || memory.id,
    text: `${memory.decision}. Why: ${memory.reason}.${outcome}`,
    mode: 'signal',
    createdAt: memory.createdAt,
    state: 'active',
    confidence: memory.confidence,
    sensitivity: 'balanced',
    trigger: `When a similar decision returns: ${memory.decision}`,
    why: memory.reason,
  };
}
