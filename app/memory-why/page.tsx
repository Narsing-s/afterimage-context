'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Lightbulb, Save } from 'lucide-react';

type Memory = {
  id: string; text: string; trigger?: string; why?: string;
  mode?: 'signal'|'pattern'; state?: string; confidence?: number;
};
const KEY='afterimage:memories:v2';

export default function MemoryWhy(){
  const [memories,setMemories]=useState<Memory[]>([]);
  const [selected,setSelected]=useState('');
  const [why,setWhy]=useState('');
  const [saved,setSaved]=useState(false);
  useEffect(()=>{try{const raw=localStorage.getItem(KEY)||'[]';const data=JSON.parse(raw);if(Array.isArray(data)){setMemories(data);if(data[0]){setSelected(data[0].id);setWhy(data[0].why||'')}}}catch{}},[]);
  const active=useMemo(()=>memories.find(m=>m.id===selected),[memories,selected]);
  function choose(id:string){setSelected(id);const m=memories.find(x=>x.id===id);setWhy(m?.why||'');setSaved(false)}
  function save(){if(!active)return;const next=memories.map(m=>m.id===active.id?{...m,why:why.trim()||undefined}:m);localStorage.setItem(KEY,JSON.stringify(next));setMemories(next);setSaved(true)}
  return <main className="shell" style={{maxWidth:900,paddingBottom:80}}>
    <nav className="nav"><Link href="/" className="navlink"><ArrowLeft size={13}/> Back to Afterimage</Link><span className="navlink"><Lightbulb size={13}/> WHY IT MATTERS</span></nav>
    <section style={{padding:'85px 0 35px',maxWidth:760}}>
      <div className="section-kicker">MEMORY MEANING</div>
      <h1 style={{fontSize:'clamp(48px,7vw,82px)',margin:'15px 0'}}>Remember <em>why.</em></h1>
      <p className="lede" style={{marginBottom:30}}>A useful memory is more than a fact. Give future-you the reason behind the decision, intention, or lesson.</p>
    </section>
    {memories.length===0?<div className="empty-match"><span>NO MEMORIES</span><b>Create a memory first.</b><p>Go back to Afterimage and create your first memory. You can then attach the reason it matters here.</p><Link href="/" className="create-memory">Create memory</Link></div>:<>
      <div className="memory-list" style={{gridTemplateColumns:'1fr'}}>{memories.map(m=><button key={m.id} onClick={()=>choose(m.id)} className="example" style={{borderColor:m.id===selected?'#555e35':undefined}}><span className="tag">{(m.mode||'signal').toUpperCase()} · {(m.state||'active').toUpperCase()}</span><p>{m.text}</p>{m.trigger&&<small>Returns when: {m.trigger}</small>}<small>{m.why?'Why captured: '+m.why:'No reason added yet.'}</small></button>)}</div>
      {active&&<section className="capture" style={{marginTop:18}}><div className="capture-top"><span>WHY DOES THIS MATTER?</span><span className="hint">Shown when this memory resurfaces</span></div><div className="preview" style={{marginTop:0}}><div className="preview-icon"><Lightbulb size={18}/></div><div><b>Memory</b><p>“{active.text}”</p>{active.trigger&&<small>Returns when: {active.trigger}</small>}</div></div><textarea aria-label="Why this memory matters" value={why} onChange={e=>{setWhy(e.target.value);setSaved(false)}} placeholder="Tell future-you why this matters. What should they understand that the memory alone cannot say?" style={{minHeight:170,marginTop:12}}/><button className="create-memory" onClick={save}><Save size={16}/> Save why it matters</button>{saved&&<div className="preview" role="status"><div className="preview-icon"><Check size={18}/></div><div><b>Saved locally.</b><p>When this memory resurfaces, its reason can be shown alongside the match.</p></div></div>}</section>}
    </>}
  </main>
}
