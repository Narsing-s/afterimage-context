import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../lib/memory-governance.ts', import.meta.url), 'utf8');
for (const name of ['MEMORY_FORMAT_VERSION','detectSensitiveContent','scrubSensitiveContent','shouldResurface','migrateMemoryEnvelope','integrityHash']) assert.match(source,new RegExp(name));
console.log('Memory governance foundation passed.');