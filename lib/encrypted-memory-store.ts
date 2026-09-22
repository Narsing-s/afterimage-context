import type { MemoryEvent, MemoryRecord } from './memory-core';
import { migrateMemoryEnvelope, type MemoryEnvelope, MEMORY_FORMAT_VERSION } from './memory-governance';

export const AFTERIMAGE_DB_NAME = 'afterimage-memory';
export const AFTERIMAGE_DB_VERSION = 1;
const STORE = 'memory-vault';

export type MemorySnapshot = MemoryEnvelope & { id: 'current'; updatedAt: string };

function hasIndexedDb() { return typeof indexedDB !== 'undefined'; }

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!hasIndexedDb()) return reject(new Error('IndexedDB is unavailable.'));
    const request = indexedDB.open(AFTERIMAGE_DB_NAME, AFTERIMAGE_DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Unable to open memory database.'));
  });
}

export async function saveMemorySnapshot(memories: MemoryRecord[], events: MemoryEvent[] = []): Promise<MemorySnapshot> {
  const snapshot: MemorySnapshot = {
    id: 'current',
    formatVersion: MEMORY_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    memories,
    events,
  };
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(snapshot);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Unable to save memory snapshot.'));
  });
  db.close();
  return snapshot;
}

export async function loadMemorySnapshot(): Promise<MemorySnapshot | null> {
  const db = await openDatabase();
  const result = await new Promise<MemorySnapshot | null>((resolve, reject) => {
    const request = db.transaction(STORE, 'readonly').objectStore(STORE).get('current');
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error ?? new Error('Unable to load memory snapshot.'));
  });
  db.close();
  if (!result) return null;
  const migrated = migrateMemoryEnvelope(result);
  return { ...result, ...migrated, id: 'current', updatedAt: result.updatedAt ?? result.exportedAt };
}

export async function clearMemorySnapshot(): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete('current');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Unable to clear memory database.'));
  });
  db.close();
}

export function isEncryptedStorageAvailable() {
  return typeof crypto !== 'undefined' && !!crypto.subtle && hasIndexedDb();
}

export async function deriveLocalKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  if (!crypto?.subtle) throw new Error('Web Crypto is unavailable.');
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 250000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

export async function encryptSnapshot(snapshot: MemorySnapshot, key: CryptoKey): Promise<{iv:string;ciphertext:string}> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(snapshot)));
  return { iv: btoa(String.fromCharCode(...iv)), ciphertext: btoa(String.fromCharCode(...new Uint8Array(encoded))) };
}

export async function decryptSnapshot(payload: {iv:string;ciphertext:string}, key: CryptoKey): Promise<MemorySnapshot> {
  const iv = Uint8Array.from(atob(payload.iv), char => char.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(payload.ciphertext), char => char.charCodeAt(0));
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return JSON.parse(new TextDecoder().decode(plaintext)) as MemorySnapshot;
}
