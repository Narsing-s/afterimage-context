import type { ContextMemory, MemorySensitivity, MemoryState, ReturnMode } from './context-engine';

export const MEMORY_FORMAT_VERSION = 'afterimage.memory.v1';
export type PortableMemory = ContextMemory;
export type MemoryBundleV1 = {
  format: typeof MEMORY_FORMAT_VERSION;
  exportedAt: string;
  memories: PortableMemory[];
};

function validSensitivity(value: unknown): value is MemorySensitivity {
  return value === 'quiet' || value === 'balanced' || value === 'eager';
}
function validState(value: unknown): value is MemoryState {
  return value === 'active' || value === 'confirmed' || value === 'outdated' || value === 'archived';
}
function validMode(value: unknown): value is ReturnMode { return value === 'signal' || value === 'pattern'; }

export function toPortableMemory(value: unknown): PortableMemory | null {
  if (!value || typeof value !== 'object') return null;
  const x = value as Record<string, unknown>;
  if (typeof x.id !== 'string' || !x.id || typeof x.text !== 'string' || !x.text.trim() || !validMode(x.mode) || typeof x.createdAt !== 'string') return null;
  return {
    id: x.id, text: x.text.trim(), mode: x.mode, createdAt: x.createdAt,
    ...(typeof x.trigger === 'string' && x.trigger.trim() ? { trigger: x.trigger.trim() } : {}),
    ...(typeof x.why === 'string' && x.why.trim() ? { why: x.why.trim() } : {}),
    state: validState(x.state) ? x.state : 'active',
    confidence: typeof x.confidence === 'number' ? Math.min(1, Math.max(0, x.confidence)) : .7,
    sensitivity: validSensitivity(x.sensitivity) ? x.sensitivity : 'balanced',
    resurfacedAt: typeof x.resurfacedAt === 'string' ? x.resurfacedAt : undefined,
    snoozedUntil: typeof x.snoozedUntil === 'string' ? x.snoozedUntil : undefined,
    resurfacedCount: typeof x.resurfacedCount === 'number' ? Math.max(0, Math.floor(x.resurfacedCount)) : 0,
  };
}

export function createMemoryBundle(memories: unknown[]): MemoryBundleV1 {
  return { format: MEMORY_FORMAT_VERSION, exportedAt: new Date().toISOString(), memories: memories.map(toPortableMemory).filter((x): x is PortableMemory => Boolean(x)) };
}

export function parseMemoryBundle(value: unknown): PortableMemory[] {
  if (Array.isArray(value)) return value.map(toPortableMemory).filter((x): x is PortableMemory => Boolean(x));
  if (!value || typeof value !== 'object') return [];
  const x = value as Record<string, unknown>;
  if (x.format !== MEMORY_FORMAT_VERSION || !Array.isArray(x.memories)) return [];
  return x.memories.map(toPortableMemory).filter((m): m is PortableMemory => Boolean(m));
}
