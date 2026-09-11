'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Plus, Sparkles, Trash2 } from 'lucide-react';

type Decision = { id:string; decision:string; reason:string; alternatives:string; outcome:string; createdAt:string };
const KEY='afterimage:decisions:v1';

export default function DecisionsPage(){
 const [items,setItems]=useState<Decision[]>(()=>{try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x:[]}catch{return []}});
 const [draft,setDraft]=useState({decision:'',reason:'',alternatives:'',outcome:''});
 const [saved,setSaved]=useState(false);
 const recent=useMemo(()=>[...items].sort((a,b)=>+new Date(b.createdAt)-+new Date(a.createdAt)),[items]);
 function persist(next:Decision[]){setItems(next);localStorage.setItem(KEY,JSON.stringify(next));}
 function add(){if(!draft.decision.trim()||!draft.reason.trim())return;const d={...draft,id:crypto.randomUUID(),createdAt:new Date().toISOString()};persist([d,...items]);setDraft({decision:'',reason:'',alternatives:'',outcome:''});setSaved(true);setTimeout(()=>setSaved(false),2200)}
 return <main className="future-page">
  <nav className="graph-nav"><Link href="/" className="graph-back"><ArrowLeft size={14}/> Back to Afterimage</Link><span className="future-nav-mark"><Sparkles size={13}/> DECISION MEMORY</span></nav>
  <section className="future-hero"><div className="section-kicker">DECISION MEMORY</div><h1>Remember not just<br/><em>what you chose.</em></h1><p>Keep the reasoning behind important decisions. When a similar choice appears later, your past reasoning can become context instead of a forgotten note.</p></section>
  <section className="decision-layout">
   <div className="decision-form"><div className="section-kicker">LEAVE A DECISION</div><h2>Future-you gets the reasoning.</h2>
    <label>What did you decide?<input value={draft.decision} onChange={e=>setDraft({...draft,decision:e.target.value})} placeholder="Use PostgreSQL for the new service"/></label>
    <label>Why did you choose it?<textarea value={draft.reason} onChange={e=>setDraft({...draft,reason:e.target.value})} placeholder="The data is relational and the team already operates Postgres."/></label>
    <label>What alternatives did you consider?<input value={draft.alternatives} onChange={e=>setDraft({...draft,alternatives:e.target.value})} placeholder="MongoDB, DynamoDB"/></label>
    <label>What happened afterward?<textarea value={draft.outcome} onChange={e=>setDraft({...draft,outcome:e.target.value})} placeholder="Leave blank if the outcome is not known yet."/></label>
    <button className="future-primary decision-save" onClick={add}><Plus size={15}/> Save decision memory</button>{saved&&<div className="future-toast inline"><Check size={15}/> Decision saved locally.</div>}
   </div>
   <div className="decision-list"><div className="section-kicker">YOUR DECISIONS / {items.length}</div>{recent.length===0?<div className="future-empty"><b>No decision memories yet.</b><p>Start with a choice whose reasoning you know you will want later.</p></div>:recent.map(d=><article className="decision-card" key={d.id}><span>{new Date(d.createdAt).toLocaleDateString()}</span><h3>{d.decision}</h3><p><b>Why:</b> {d.reason}</p>{d.alternatives&&<p><b>Alternatives:</b> {d.alternatives}</p>}{d.outcome&&<p><b>Outcome:</b> {d.outcome}</p>}<button onClick={()=>persist(items.filter(x=>x.id!==d.id))}><Trash2 size={13}/> Remove</button></article>)}</div>
  </section>
  <section className="future-section"><div className="section-kicker">WHY THIS MATTERS</div><h2>Past decisions become evidence.</h2><div className="future-grid"><article className="future-card"><span>01 / CAPTURE</span><p className="future-quote">“I chose the cheaper option because migration wasn't expected.”</p></article><article className="future-card"><span>02 / OUTCOME</span><p className="future-quote">“Migration became expensive six months later.”</p></article><article className="future-card"><span>03 / RESURFACE</span><p className="future-quote">“You're making a similar choice. Last time, switching cost mattered more than price.”</p></article></div></section>
 </main>
}
