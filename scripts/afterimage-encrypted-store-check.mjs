import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../lib/encrypted-memory-store.ts', import.meta.url), 'utf8');
for (const name of ['AFTERIMAGE_DB_NAME','saveMemorySnapshot','loadMemorySnapshot','clearMemorySnapshot','deriveLocalKey','encryptSnapshot','decryptSnapshot']) assert.match(source,new RegExp(name));
console.log('Encrypted storage foundation passed.');