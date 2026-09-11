'use client';

const FORMAT = 'afterimage-secure-v1';
const ITERATIONS = 210000;

function toBase64(bytes: Uint8Array) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string) {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

async function deriveKey(password: string, salt: Uint8Array) {
  const materialBytes = new TextEncoder().encode(password);
  const material = await crypto.subtle.importKey('raw', toArrayBuffer(materialBytes), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: toArrayBuffer(salt), iterations: ITERATIONS, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export type SecureBackup = {
  memories: unknown[];
  preferences?: unknown;
};

export async function encryptBackup(data: SecureBackup, password: string) {
  if (password.length < 8) throw new Error('Password must be at least 8 characters.');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const plaintext = new TextEncoder().encode(JSON.stringify(data));
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: toArrayBuffer(iv) }, key, toArrayBuffer(plaintext)));
  return JSON.stringify({ format: FORMAT, kdf: 'PBKDF2-SHA-256', iterations: ITERATIONS, cipher: 'AES-256-GCM', salt: toBase64(salt), iv: toBase64(iv), ciphertext: toBase64(ciphertext) }, null, 2);
}

export async function decryptBackup(raw: string, password: string): Promise<SecureBackup> {
  const envelope = JSON.parse(raw) as Record<string, unknown>;
  if (envelope.format !== FORMAT || envelope.kdf !== 'PBKDF2-SHA-256' || envelope.cipher !== 'AES-256-GCM') throw new Error('Unsupported encrypted backup format.');
  if (envelope.iterations !== ITERATIONS) throw new Error('Unsupported backup KDF parameters.');
  const salt = fromBase64(String(envelope.salt));
  const iv = fromBase64(String(envelope.iv));
  const ciphertext = fromBase64(String(envelope.ciphertext));
  const key = await deriveKey(password, salt);
  let plaintext: ArrayBuffer;
  try {
    plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: toArrayBuffer(iv) }, key, toArrayBuffer(ciphertext));
  } catch {
    throw new Error('Unable to decrypt backup. Check the password or backup file.');
  }
  const data = JSON.parse(new TextDecoder().decode(plaintext)) as SecureBackup;
  if (!data || !Array.isArray(data.memories)) throw new Error('Backup is missing a valid memories array.');
  return data;
}
