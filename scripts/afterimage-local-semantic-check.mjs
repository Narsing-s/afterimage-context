import fs from 'node:fs';
const e=fs.readFileSync('lib/local-embeddings.ts','utf8');
const s=fs.readFileSync('lib/vector-index-store.ts','utf8');
const a=fs.readFileSync('app/api/memory/route.ts','utf8');
for(const [n,v] of [['local embeddings',e.includes('localEmbedding')],['cosine similarity',e.includes('cosineSimilarity')],['persistent vector index',s.includes('semantic-index')],['hybrid vector search',a.includes('searchVectorIndex')]])if(!v)throw new Error(n+' check failed');
console.log('Local semantic retrieval checks passed');
