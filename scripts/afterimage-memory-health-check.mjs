const assert = (condition, message) => { if (!condition) throw new Error(message); };

const now = Date.now();
const fresh = { id:'fresh', text:'Railway deployment decision', mode:'signal', createdAt:new Date(now - 5 * 86400000).toISOString(), confidence:.9, resurfacedCount:2 };
const fading = { id:'fading', text:'Old hosting decision', mode:'pattern', createdAt:new Date(now - 240 * 86400000).toISOString(), confidence:.55, resurfacedCount:0 };
const archived = { id:'archived', text:'Archived memory', mode:'signal', createdAt:new Date(now - 800 * 86400000).toISOString(), state:'archived', confidence:.2 };

function age(memory) { return Math.max(0, (now - new Date(memory.createdAt).getTime()) / 86400000); }
function score(memory) { const confidence=Math.min(1,Math.max(0,memory.confidence??.7)); const reuse=Math.min(1,(memory.resurfacedCount??0)/4); return Math.max(0,Math.min(1,confidence*.65+reuse*.2+(age(memory)<30?.15:0)-Math.min(.35,age(memory)/1500))); }
function health(memory) { if(memory.state==='archived') return 'archived'; const s=score(memory); return age(memory)<30?'fresh':s>=.62?'familiar':s>=.4?'fading':'stale'; }

assert(health(fresh)==='fresh','fresh memory should remain fresh');
assert(['fading','stale'].includes(health(fading)),'older unused memory should need review');
assert(health(archived)==='archived','archived memory must not enter active health states');
console.log('Afterimage memory health checks passed.');
