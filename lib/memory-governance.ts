import type { MemoryEvent, MemoryRecord } from './memory-core';

export const MEMORY_FORMAT_VERSION = 2;
export type MemoryEnvelope = { formatVersion: number; exportedAt: string; memories: MemoryRecord[]; events?: MemoryEvent[] };

const SECRET_PATTERNS: Array<[string,RegExp]> = [
  ['email', /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi],
  ['phone', /\b(?:\+?91[- ]?)?[6-9]\d{9}\b/g],
  ['api-key', /\b(?:sk|pk|api|key|token)[_-]?[A-Za-z0-9]{16,}\b/gi],
  ['jwt', /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g],
  ['private-key', /-----BEGIN [A-Z ]*PRIVATE KEY-----/g],
  ['password-assignment', /\b(?:password|passwd|secret|token)\s*[:=]\s*[^\s,;]+/gi],
];

export function detectSensitiveContent(value: string) {
  const findings: Array<{kind:string; sample:string}> = [];
  for (const [kind, pattern] of SECRET_PATTERNS) {
    const match = value.match(pattern);
    if (match) findings.push({ kind, sample: match[0].slice(0, 12) + (match[0].length > 12 ? '…' : '') });
  }
  return findings;
}

export function scrubSensitiveContent(value: string) {
  let output = value;
  for (const [kind, pattern] of SECRET_PATTERNS) output = output.replace(pattern, `[REDACTED:${kind}]`);
  return output;
}

export function shouldResurface(memory: MemoryRecord, now = Date.now()) {
  if (memory.state === 'archived' || memory.state === 'outdated') return false;
  if (memory.snoozedUntil && new Date(memory.snoozedUntil).getTime() > now) return false;
  const minHours = memory.sensitivity === 'quiet' ? 168 : memory.sensitivity === 'eager' ? 12 : 48;
  if (memory.resurfacedAt && now - new Date(memory.resurfacedAt).getTime() < minHours * 3600000) return false;
  return true;
}

export function migrateMemoryEnvelope(input: unknown): MemoryEnvelope {
  const source = (input && typeof input === 'object' ? input : {}) as Partial<MemoryEnvelope> & { memories?: unknown };
  const memories = Array.isArray(source.memories) ? source.memories.filter(Boolean).map((memory) => ({
    ...(memory as MemoryRecord),
    confidence: Math.max(.05, Math.min(1, (memory as MemoryRecord).confidence ?? .7)),
    state: (memory as MemoryRecord).state ?? 'active'
  })) : [];
  return { formatVersion: MEMORY_FORMAT_VERSION, exportedAt: typeof source.exportedAt === 'string' ? source.exportedAt : new Date().toISOString(), memories, events: Array.isArray(source.events) ? source.events as MemoryEvent[] : [] };
}

export async function integrityHash(value: string) {
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi?.subtle) return null;
  const digest = await cryptoApi.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('');
}
