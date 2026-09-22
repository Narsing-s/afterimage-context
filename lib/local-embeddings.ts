import type { MemoryRecord } from './memory-core';
export type Vector=number[];
export type EmbeddingProvider={name:string;dimensions:number;embed:(text:string)=>Promise<Vector>};
export type VectorEntry={id:string;vector:Vector;updatedAt:string};
export type VectorIndex={version:1;provider:string;dimensions:number;entries:VectorEntry[]};
const STOP=new Set(['the','and','that','this','with','from','have','your','you','for','are','was','were','when','what','why','how','into','just','again','about','then','than','still','next','last','today','tomorrow','because','already','another','keep','keeps','i','a','an','to','of','in','on','is','it','my','me','we','our','should','show','remind','remember']);
function tokens(v:string){return(v.toLowerCase().match(/[a-z0-9₹]+/g)||[]).filter(x=>x.length>2&&!STOP.has(x));}
export function localEmbedding(text:string,dimensions=384):Vector{const v=new Array<number>(dimensions).fill(0);for(const token of tokens(text)){let h=2166136261;for(let i=0;i<token.length;i++){h^=token.charCodeAt(i);h=Math.imul(h,16777619)}const i=(h>>>0)%dimensions,s=((h>>>8)&1)?1:-1;v[i]+=s;v[((h>>>16)>>>0)%dimensions]+=s*.5}const n=Math.sqrt(v.reduce((a,x)=>a+x*x,0))||1;return v.map(x=>x/n);}
export function cosineSimilarity(a:Vector,b:Vector){if(a.length!==b.length||!a.length)return 0;return Math.max(-1,Math.min(1,a.reduce((s,x,i)=>s+x*b[i],0)));}
export function memoryEmbeddingText(m:MemoryRecord){return[m.text,m.trigger||'',m.why||'',...(m.tags||[])].join(' ');}
export function buildLocalIndex(ms:MemoryRecord[],dimensions=384):VectorIndex{return{version:1,provider:'afterimage-local-hash-v1',dimensions,entries:ms.map(m=>({id:m.id,vector:localEmbedding(memoryEmbeddingText(m),dimensions),updatedAt:new Date().toISOString()}))};}
export function searchVectorIndex(ms:MemoryRecord[],index:VectorIndex,query:string,limit=20){const q=localEmbedding(query,index.dimensions),byId=new Map(ms.map(m=>[m.id,m]));return index.entries.map(e=>({id:e.id,score:(cosineSimilarity(q,e.vector)+1)/2,reason:'Local vector similarity'})).filter(x=>byId.has(x.id)).sort((a,b)=>b.score-a.score).slice(0,limit);}
export async function buildIndexWithProvider(ms:MemoryRecord[],provider:EmbeddingProvider):Promise<VectorIndex>{const entries=[];for(const m of ms)entries.push({id:m.id,vector:await provider.embed(memoryEmbeddingText(m)),updatedAt:new Date().toISOString()});return{version:1,provider:provider.name,dimensions:provider.dimensions,entries};}
