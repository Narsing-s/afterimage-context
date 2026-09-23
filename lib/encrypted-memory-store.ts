import type { MemoryEvent, MemoryRecord } from './memory-core';
import { migrateMemoryEnvelope, type MemoryEnvelope, MEMORY_FORMAT_VERSION } from './memory-governance';

export const AFTERIMAGE_DB_NAME = 'afterimage-memory';
export const AFTERIMAGE_DB_VERSION = 2;
const STORE = 'memory-vault';
const META_STORE = 'vault-meta';
const SNAPSHOT_ID = 'current';
const VAULT_META_ID = 'config';
const VAULT_EVENT = 'afterimage:vault-state';

export type MemorySnapshot = MemoryEnvelope & { id: 'current'; updatedAt: string };
export type EncryptedSnapshot = {
  id: 'current';
  format: 'afterimage.encrypted-memory.v1';
  updatedAt: string;
  salt: string;
  iv: string;
  ciphertext: string;
  recoveryIv?: string;
  recoveryCiphertext?: string;
};
export type VaultMetadata = {
  id: 'config';
  version: 1;
  enabled: true;
  salt: string;
  createdAt: string;
  updatedAt: string;
};

function hasIndexedDb() { return typeof indexedDB !== 'undefined'; }
function emitVaultState() { if (typeof window !== 'undefined') window.dispatchEvent(new Event(VAULT_EVENT)); }
function bytesToBase64(bytes: Uint8Array) { return btoa(String.fromCharCode(...bytes)); }
function base64ToBytes(value: string) { return Uint8Array.from(atob(value), char => char.charCodeAt(0)); }
function bytesToBase64Url(bytes: Uint8Array) { return bytesToBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, ''); }

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!hasIndexedDb()) return reject(new Error('IndexedDB is unavailable.'));
    const request = indexedDB.open(AFTERIMAGE_DB_NAME, AFTERIMAGE_DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(META_STORE)) db.createObjectStore(META_STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Unable to open memory database.'));
  });
}

async function readVaultMetadata(): Promise<VaultMetadata | null> {
  const db = await openDatabase();
  const result = await new Promise<VaultMetadata | null>((resolve, reject) => {
    const request = db.transaction(META_STORE, 'readonly').objectStore(META_STORE).get(VAULT_META_ID);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error ?? new Error('Unable to read vault metadata.'));
  });
  db.close();
  return result;
}

let unlockedKey: CryptoKey | null = null;
let autoLockTimer: ReturnType<typeof setTimeout> | null = null;
const DEFAULT_AUTO_LOCK_MS = 30 * 60 * 1000;
function armAutoLock(){ if(autoLockTimer) clearTimeout(autoLockTimer); if(unlockedKey){const ms=(globalThis as any).__AFTERIMAGE_AUTO_LOCK_MS__??DEFAULT_AUTO_LOCK_MS;autoLockTimer=setTimeout(()=>{unlockedKey=null;emitVaultState()},ms)}}

export function isVaultEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean((window as Window & { __AFTERIMAGE_VAULT__?: boolean }).__AFTERIMAGE_VAULT__);
}

export function isVaultUnlocked() { return Boolean(unlockedKey); }
export function configureAutoLock(minutes:number){ const safe=Math.max(1,Math.min(1440,minutes)); (globalThis as any).__AFTERIMAGE_AUTO_LOCK_MS__=safe*60000; armAutoLock(); return safe; }

export async function getVaultStatus(): Promise<{enabled:boolean;unlocked:boolean}> {
  const metadata = await readVaultMetadata().catch(() => null);
  const enabled = Boolean(metadata?.enabled);
  if (typeof window !== 'undefined') (window as Window & { __AFTERIMAGE_VAULT__?: boolean }).__AFTERIMAGE_VAULT__ = enabled;
  return { enabled, unlocked: enabled && Boolean(unlockedKey) };
}

export function subscribeVaultState(handler: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(VAULT_EVENT, handler);
  return () => window.removeEventListener(VAULT_EVENT, handler);
}

function withSnapshotMetadata(envelope: MemoryEnvelope, updatedAt = new Date().toISOString()): MemorySnapshot {
  return { ...envelope, id: 'current', updatedAt };
}

export async function saveMemorySnapshot(memories: MemoryRecord[], events: MemoryEvent[] = []): Promise<MemorySnapshot> {
  const snapshot = withSnapshotMetadata({
    formatVersion: MEMORY_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    memories,
    events,
  });
  const metadata = await readVaultMetadata();
  if (metadata?.enabled) {
    if (!unlockedKey) throw new Error('Memory Vault is locked.');
    const payload = await encryptSnapshot(snapshot, unlockedKey, metadata.salt);
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(payload);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error('Unable to save encrypted memory snapshot.'));
    });
    db.close();
    return snapshot;
  }
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
  const metadata = await readVaultMetadata();
  if (metadata?.enabled && !unlockedKey) throw new Error('Memory Vault is locked.');
  const db = await openDatabase();
  const result = await new Promise<MemorySnapshot | EncryptedSnapshot | null>((resolve, reject) => {
    const request = db.transaction(STORE, 'readonly').objectStore(STORE).get(SNAPSHOT_ID);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error ?? new Error('Unable to load memory snapshot.'));
  });
  db.close();
  if (!result) return null;
  if (metadata?.enabled) {
    if (!unlockedKey || !('ciphertext' in result)) throw new Error('Encrypted memory payload is unavailable.');
    return withSnapshotMetadata(migrateMemoryEnvelope(await decryptSnapshot(result, unlockedKey)));
  }
  if ('ciphertext' in result) throw new Error('Encrypted memory payload requires the Memory Vault.');
  return withSnapshotMetadata(migrateMemoryEnvelope(result), result.updatedAt ?? result.exportedAt);
}

export async function clearMemorySnapshot(): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(SNAPSHOT_ID);
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
  const stableSalt = new Uint8Array(salt);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: stableSalt.buffer, iterations: 250000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

async function deriveRecoveryKey(recoveryKey: string, salt: Uint8Array) { return deriveLocalKey(recoveryKey, salt); }

export async function encryptSnapshot(snapshot: MemorySnapshot, key: CryptoKey, saltBase64 = ''): Promise<EncryptedSnapshot> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(snapshot)));
  return { id: 'current', format: 'afterimage.encrypted-memory.v1', updatedAt: new Date().toISOString(), salt: saltBase64, iv: bytesToBase64(iv), ciphertext: bytesToBase64(new Uint8Array(encoded)), recoveryIv: '', recoveryCiphertext: '' };
}

export async function decryptSnapshot(payload: {iv:string;ciphertext:string}, key: CryptoKey): Promise<MemorySnapshot> {
  const iv = base64ToBytes(payload.iv);
  const ciphertext = base64ToBytes(payload.ciphertext);
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  const parsed: unknown = JSON.parse(new TextDecoder().decode(plaintext));
  return withSnapshotMetadata(migrateMemoryEnvelope(parsed));
}

function makeRecoveryKey() {
  const raw = crypto.getRandomValues(new Uint8Array(24));
  const value = bytesToBase64Url(raw);
  return `AFTERIMAGE-${value.slice(0, 8)}-${value.slice(8, 16)}-${value.slice(16, 24)}`;
}

export async function enableMemoryVault(passphrase: string, snapshot: MemorySnapshot): Promise<string> {
  if (passphrase.length < 12) throw new Error('Use a vault passphrase with at least 12 characters.');
  if (!isEncryptedStorageAvailable()) throw new Error('This browser does not provide the required encrypted storage APIs.');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltBase64 = bytesToBase64(salt);
  const passKey = await deriveLocalKey(passphrase, salt);
  const recoveryKey = makeRecoveryKey();
  const recoveryCryptoKey = await deriveRecoveryKey(recoveryKey, salt);
  const encryptedForPassphrase = await encryptSnapshot(snapshot, passKey, saltBase64);
  const encryptedForRecovery = await encryptSnapshot(snapshot, recoveryCryptoKey, saltBase64);
  const metadata: VaultMetadata = { id: 'config', version: 1, enabled: true, salt: saltBase64, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([STORE, META_STORE], 'readwrite');
    tx.objectStore(STORE).put({ ...encryptedForPassphrase, recoveryIv: encryptedForRecovery.iv, recoveryCiphertext: encryptedForRecovery.ciphertext });
    tx.objectStore(META_STORE).put(metadata);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Unable to enable Memory Vault.'));
  });
  db.close();
  unlockedKey = passKey;
  armAutoLock();
  if (typeof window !== 'undefined') {
    (window as Window & { __AFTERIMAGE_VAULT__?: boolean }).__AFTERIMAGE_VAULT__ = true;
    localStorage.removeItem('afterimage:memories:v2');
    localStorage.removeItem('afterimage:memories:v1');
    localStorage.removeItem('afterimage:memories');
  }
  emitVaultState();
  return recoveryKey;
}

export async function unlockMemoryVault(passphrase: string): Promise<MemorySnapshot> {
  const metadata = await readVaultMetadata();
  if (!metadata?.enabled) throw new Error('Memory Vault is not enabled yet.');
  const db = await openDatabase();
  const payload = await new Promise<EncryptedSnapshot | null>((resolve, reject) => {
    const request = db.transaction(STORE, 'readonly').objectStore(STORE).get(SNAPSHOT_ID);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error ?? new Error('Unable to read encrypted memory payload.'));
  });
  db.close();
  if (!payload) throw new Error('No encrypted memory payload was found.');
  const key = await deriveLocalKey(passphrase, base64ToBytes(metadata.salt));
  const snapshot = await decryptSnapshot(payload, key);
  unlockedKey = key;
  armAutoLock();
  if (typeof window !== 'undefined') (window as Window & { __AFTERIMAGE_VAULT__?: boolean }).__AFTERIMAGE_VAULT__ = true;
  emitVaultState();
  return snapshot;
}

export async function recoverMemoryVault(recoveryKey: string): Promise<MemorySnapshot> {
  const metadata = await readVaultMetadata();
  if (!metadata?.enabled) throw new Error('Memory Vault is not enabled yet.');
  const db = await openDatabase();
  const payload = await new Promise<EncryptedSnapshot | null>((resolve, reject) => {
    const request = db.transaction(STORE, 'readonly').objectStore(STORE).get(SNAPSHOT_ID);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error ?? new Error('Unable to read recovery payload.'));
  });
  db.close();
  if (!payload) throw new Error('No encrypted memory payload was found.');
  const key = await deriveRecoveryKey(recoveryKey.trim(), base64ToBytes(metadata.salt));
  const snapshot = await decryptSnapshot(payload, key);
  unlockedKey = key;
  if (typeof window !== 'undefined') (window as Window & { __AFTERIMAGE_VAULT__?: boolean }).__AFTERIMAGE_VAULT__ = true;
  emitVaultState();
  return snapshot;
}

export function lockMemoryVault() {
  unlockedKey = null;
  if(autoLockTimer) clearTimeout(autoLockTimer);
  autoLockTimer=null;
  emitVaultState();
}

export async function rotateVaultPassphrase(currentPassphrase:string,newPassphrase:string):Promise<string>{
  if(newPassphrase.length<12) throw new Error('Use a vault passphrase with at least 12 characters.');
  const metadata=await readVaultMetadata(); if(!metadata?.enabled) throw new Error('Memory Vault is not enabled.');
  const db=await openDatabase(); const payload=await new Promise<EncryptedSnapshot|null>((resolve,reject)=>{const request=db.transaction(STORE,'readonly').objectStore(STORE).get(SNAPSHOT_ID);request.onsuccess=()=>resolve(request.result??null);request.onerror=()=>reject(request.error??new Error('Unable to read encrypted memory payload.'))}); db.close();
  if(!payload) throw new Error('No encrypted memory payload was found.');
  const oldKey=await deriveLocalKey(currentPassphrase,base64ToBytes(metadata.salt)); const snapshot=await decryptSnapshot(payload,oldKey);
  const salt=crypto.getRandomValues(new Uint8Array(16)); const saltBase64=bytesToBase64(salt); const newKey=await deriveLocalKey(newPassphrase,salt); const recoveryKey=makeRecoveryKey(); const recoveryCryptoKey=await deriveRecoveryKey(recoveryKey,salt);
  const passPayload=await encryptSnapshot(snapshot,newKey,saltBase64); const recoveryPayload=await encryptSnapshot(snapshot,recoveryCryptoKey,saltBase64);
  const nextMeta={...metadata,salt:saltBase64,updatedAt:new Date().toISOString()}; const db2=await openDatabase(); await new Promise<void>((resolve,reject)=>{const tx=db2.transaction([STORE,META_STORE],'readwrite');tx.objectStore(STORE).put({...passPayload,recoveryIv:recoveryPayload.iv,recoveryCiphertext:recoveryPayload.ciphertext});tx.objectStore(META_STORE).put(nextMeta);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error??new Error('Unable to rotate vault passphrase.'))});db2.close(); unlockedKey=newKey; armAutoLock(); emitVaultState(); return recoveryKey;
}

export async function disableMemoryVault() {
  const snapshot = await loadMemorySnapshot();
  if (!snapshot) throw new Error('No memory snapshot is available to decrypt.');
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([STORE, META_STORE], 'readwrite');
    tx.objectStore(STORE).put(snapshot);
    tx.objectStore(META_STORE).delete(VAULT_META_ID);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Unable to disable Memory Vault.'));
  });
  db.close();
  unlockedKey = null;
  if (typeof window !== 'undefined') {
    (window as Window & { __AFTERIMAGE_VAULT__?: boolean }).__AFTERIMAGE_VAULT__ = false;
  }
  emitVaultState();
}

export async function clearVaultStorage() {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([STORE, META_STORE], 'readwrite');
    tx.objectStore(STORE).clear();
    tx.objectStore(META_STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Unable to erase vault storage.'));
  });
  db.close();
  unlockedKey = null;
  if (typeof window !== 'undefined') {
    (window as Window & { __AFTERIMAGE_VAULT__?: boolean }).__AFTERIMAGE_VAULT__ = false;
  }
  emitVaultState();
}
