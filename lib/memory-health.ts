import type { ContextMemory, ContradictionSignal } from './context-engine';

export type MemoryHealth = 'fresh' | 'familiar' | 'fading' | 'stale';
export type MemoryHealthItem = { memory: ContextMemory; health: MemoryHealth; score: number; reason: string };

function daysSince(iso?: string) {
  if (!iso) return 0;
  const time = new Date(iso).getTime();
  if (!Number.isFinite(time)) return 0;
  return Math.max(0, (Date.now() - time) / 86400000);
}

export function memoryHealth(memory: ContextMemory): MemoryHealthItem {
  const age = daysSince(memory.createdAt);
  const reuse = memory.resurfacedCount ?? 0;
  const confidence = Math.min(1, Math.max(0, memory.confidence ?? 0.7));
  const recency = daysSince(memory.resurfacedAt);
  const score = Math.max(0, Math.min(1, confidence * 0.65 + Math.min(1, reuse / 4) * 0.2 + (recency < 30 ? 0.15 : 0) - Math.min(0.35, age / 1500)));
  const health: MemoryHealth = age < 30 || recency < 30 ? 'fresh' : score >= 0.62 ? 'familiar' : score >= 0.4 ? 'fading' : 'stale';
  const reason = health === 'fresh' ? 'Recently created or resurfaced.' : health === 'familiar' ? 'Still well-supported by confidence or repeated use.' : health === 'fading' ? 'Older or less recently used; consider reviewing it.' : 'Low freshness; review before relying on it.';
  return { memory, health, score, reason };
}

export function healthReview(memories: ContextMemory[]): MemoryHealthItem[] {
  return memories.filter(m => m.state !== 'archived').map(memoryHealth).sort((a, b) => a.score - b.score);
}

export function contradictionReview(memories: ContextMemory[], signals: ContradictionSignal[]) {
  const byId = new Map(memories.map(memory => [memory.id, memory]));
  return signals.filter(signal => byId.has(signal.memory.id)).sort((a, b) => b.score - a.score);
}
