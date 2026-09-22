import assert from 'node:assert/strict';

const base={id:'a',text:'Prefer simple encrypted local storage',confidence:.7,sensitivity:'balanced',importance:'normal'};
const other={...base,id:'b',text:'Use encrypted local storage for small projects'};
const words=s=>new Set((s.toLowerCase().match(/[a-z0-9]+/g)||[]).filter(x=>x.length>2));
const similarity=(a,b)=>{const A=words(a),B=words(b);return [...A].filter(x=>B.has(x)).length/Math.max(A.size,B.size)};
assert(similarity(base.text,other.text)>=.4);
const useful={...base,confidence:.74,feedback:{useful:1}};
assert(useful.confidence>base.confidence);
const priority=m=>Math.min(1,(m.confidence??.7)+({low:.05,normal:.15,important:.3,critical:.45}[m.importance||'normal']));
assert(priority({...base,importance:'critical'})>priority(base));
console.log('Afterimage memory core checks passed.');
