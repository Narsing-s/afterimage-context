import fs from 'node:fs';

const store = fs.readFileSync('lib/encrypted-memory-store.ts','utf8');
const vault = fs.readFileSync('app/memory-vault/page.tsx','utf8');
const home = fs.readFileSync('app/page.tsx','utf8');

const required = [
  ['AES-GCM encryption', store.includes("AES-GCM")],
  ['PBKDF2 250000 iterations', store.includes('iterations: 250000')],
  ['versioned encrypted payload', store.includes("afterimage.encrypted-memory.v1")],
  ['passphrase unlock', store.includes('unlockMemoryVault')],
  ['recovery-key unlock', store.includes('recoverMemoryVault')],
  ['explicit lock', store.includes('lockMemoryVault')],
  ['vault metadata', store.includes('vault-meta')],
  ['user-facing vault setup', vault.includes('Enable encrypted Memory Vault')],
  ['recovery-key confirmation', vault.includes('I saved the recovery key somewhere safe.')],
  ['locked home boundary', home.includes('Memory Vault is locked.')],
];

const failed = required.filter(([,ok]) => !ok);
if (failed.length) {
  console.error('Memory Vault checks failed:', failed.map(([name]) => name).join(', '));
  process.exit(1);
}
console.log('Memory Vault checks passed:', required.map(([name]) => name).join(', '));
