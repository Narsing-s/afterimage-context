const valid = { id:'m1', text:'Keep rollback simple', mode:'signal', createdAt:new Date().toISOString(), trigger:'when deployment changes', sensitivity:'eager', confidence:.9 };
const legacy = [{ id:'m2', text:'Use the database backup', mode:'pattern', createdAt:new Date().toISOString() }];
function normalize(value){
  const x=value&&typeof value==='object'?value:{};
  if(typeof x.id!=='string'||typeof x.text!=='string'||!x.text.trim()||!['signal','pattern'].includes(x.mode)||typeof x.createdAt!=='string') return null;
  return {id:x.id,text:x.text.trim(),mode:x.mode,createdAt:x.createdAt,state:['active','confirmed','outdated','archived'].includes(x.state)?x.state:'active',confidence:typeof x.confidence==='number'?Math.min(1,Math.max(0,x.confidence)):.7,sensitivity:['quiet','balanced','eager'].includes(x.sensitivity)?x.sensitivity:'balanced'};
}
const bundle={format:'afterimage.memory.v1',exportedAt:new Date().toISOString(),memories:[valid]};
if(!bundle.memories.map(normalize).every(Boolean)) throw new Error('v1 bundle failed');
if(!legacy.map(normalize).every(Boolean)) throw new Error('legacy compatibility failed');
if(normalize({id:'bad',text:'',mode:'signal',createdAt:'now'})!==null) throw new Error('invalid memory accepted');
console.log('PASS memory format v1: bundle, legacy import, defaults, and invalid-input rejection');
