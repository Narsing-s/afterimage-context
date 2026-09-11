'use client';

export const MEMORY_KEY = 'afterimage:memories:v2';
export const RECOVERY_KEY = 'afterimage:recovery:v1';

type Snapshot = { memories: unknown[]; label: string; createdAt: string };

export function saveRecovery(memories: unknown[], label: string) {
  try {
    const snapshot: Snapshot = { memories, label, createdAt: new Date().toISOString() };
    localStorage.setItem(RECOVERY_KEY, JSON.stringify(snapshot));
  } catch {}
}

export function readRecovery(): Snapshot | null {
  try {
    const raw = localStorage.getItem(RECOVERY_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearRecovery() {
  try { localStorage.removeItem(RECOVERY_KEY); } catch {}
}

export function restoreRecovery(): unknown[] | null {
  const snapshot = readRecovery();
  if (!snapshot || !Array.isArray(snapshot.memories)) return null;
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(snapshot.memories));
    clearRecovery();
    return snapshot.memories;
  } catch { return null; }
}
