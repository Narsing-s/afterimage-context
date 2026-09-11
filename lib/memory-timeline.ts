import type { ContextMemory } from './context-engine';

export type MemoryTimelineEvent = {
  id: string;
  memoryId: string;
  kind: 'captured' | 'resurfaced' | 'confirmed' | 'changed' | 'archived';
  at: string;
  label: string;
  memory: ContextMemory;
};

export function memoryTimeline(memories: ContextMemory[]): MemoryTimelineEvent[] {
  const events: MemoryTimelineEvent[] = [];
  for (const memory of memories) {
    if (memory.createdAt) events.push({ id: `${memory.id}:created`, memoryId: memory.id, kind: 'captured', at: memory.createdAt, label: 'Captured', memory });
    if (memory.resurfacedAt) events.push({ id: `${memory.id}:resurfaced`, memoryId: memory.id, kind: 'resurfaced', at: memory.resurfacedAt, label: 'Returned to context', memory });
    if (memory.state === 'confirmed') events.push({ id: `${memory.id}:confirmed`, memoryId: memory.id, kind: 'confirmed', at: memory.resurfacedAt || memory.createdAt, label: 'Confirmed as still useful', memory });
    if (memory.state === 'outdated') events.push({ id: `${memory.id}:changed`, memoryId: memory.id, kind: 'changed', at: memory.resurfacedAt || memory.createdAt, label: 'Marked changed', memory });
    if (memory.state === 'archived') events.push({ id: `${memory.id}:archived`, memoryId: memory.id, kind: 'archived', at: memory.resurfacedAt || memory.createdAt, label: 'Archived', memory });
  }
  return events.filter(event => Number.isFinite(new Date(event.at).getTime())).sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 80);
}
