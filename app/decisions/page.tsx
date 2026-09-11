'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, Plus, Sparkles, Trash2, ArrowLeft, CircleHelp } from 'lucide-react';
import { assessDecision, createDecisionId, type DecisionMemory } from '../../lib/decision-memory';

const KEY='afterimage:decisions:v2';
const LEGACY_KEY='afterimage:decisions:v1';
const MEMORY_KEY='afterimage:memories:v2';
const empty={decision:'',reason:'',alternatives:'',constraints:'',expectedOutcome:'',actualOutcome:'',wouldChooseAgain:'' as DecisionMemory['wouldChooseAgain']};

export default function DecisionsPage(){
 const [items,setItems]=useState<DecisionMemory[]>([]); const [draft,setDraft]=useState(empty); const [saved,setSaved]=useState(false);
 useEffect(()=>{try{const raw=localStorage.getItem(KEY)||localStorage.getItem(LEGACY_KEY)||'[]';const x=JSON.parse(raw);if(Array.isArray(x))setItems(x.map((d:any)=>({...empty,...d,id:d.id||createDecisionId(),confidence:d.confidence??.7,createdAt:d.createdAt||new Date().toISOString()})))}catch{}},[]);
 const recent=useMemo(()=>[...items].sort((a,b)=>+new Date(b.createdAt)-+new Date(a.createdAt)),[items]);
 function persist(next:DecisionMemory[]){setItems(next);localStorage.setItem(KEY,JSON.stringify(next));}
 function syncToContext(d:DecisionMemory){try{const raw=JSON.parse(localStorage.getItem(MEMORY_KEY)||'[]');const memories=Array.isArray(raw)?raw:[];const text=`Decision: ${d.decision}. Why: ${d.reason}. Alternatives: ${d.alternatives||'none recorded'}. Constraints: ${d.constraints||'none recorded'}. Expected outcome: ${d.expectedOutcome||'not recorded'}.${d.actualOutcome?` Actual outcome: ${d.actualOutcome}.`:''}${d.wouldChooseAgain?` Would choose again: ${d.wouldChooseAgain}.`:''}`;const next={id:`decision-memory:${d.id}`,text,mode:'signal',createdAt:d.createdAt,trigger:`When a similar decision or choice returns: ${d.decision}`,why:`Past decision evidence: ${d.reason}`,state:'active',confidence:Math.min(1,Math.max(.35,d.confidence??.7)),sensitivity:'balanced',resurfacedCount:0};const without=memories.filter((m:any)=>m.id!==next.id);localStorage.setItem(MEMORY_KEY,JSON.stringify([next,...without].slice(0,100)))}catch{}}
 function syncAll(next:DecisionMemory[]){next.forEach(syncToContext)}
 function add(){if(!draft.decision.trim()||!draft.reason.trim())return;const d:DecisionMemory={...draft,id:createDecisionId(),confidence:.7,createdAt:new Date().toISOString()};const next=[d,...items];persist(next);syncToContext(d);setDraft(empty);setSaved(true);setTimeout(()=>setSaved(false),2200)}
 function updateDecision(id:string,patch:Partial<DecisionMemory>){const next=items.map(x=>x.id===id?{...x,...patch,reviewedAt:new Date().toISOString()}:x);persist(next);const updated=next.find(x=>x.id===id);if(updated)syncToContext(updated)}
 function remove(id:string){persist(items.filter(x=>x.id!==id));try{const memories=JSON.parse(localStorage.getItem(MEMORY_KEY)||'[]');localStorage.setItem(MEMORY_KEY,JSON.stringify((Array.isArray(memories)?memories:[]).filter((m:any)=>m.id!==`decision-memory:${id}`)))}catch{}}
 return <main className="future-page">
  <nav className="graph-nav"><Link href="/" className="graph-back"><ArrowLeft size={14}/> Back to Afterimage</Link><span className="future-nav-mark"><Sparkles size={13}/> DECISION MEMORY</span></nav>
  <section className="future-hero"><div className="section-kicker">DECISION MEMORY 2.0</div><h1>Remember not just<br/><em>what you chose.</em></h1><p>Preserve the reasoning, constraints, alternatives and expected outcome behind an important choice. When a similar decision returns, Afterimage can resurface the original reasoning as context.</p></section>
  <section className="decision-layout">
   <div className="decision-form"><div className="section-kicker">LEAVE A DECISION</div><h2>Give future-you the full context.</h2>
    <label>What did you decide?<input value={draft.decision} onChange={e=>setDraft({...draft,decision:e.target.value})} placeholder="Use PostgreSQL for the new service"/></label>
    <label>Why did you choose it?<textarea value={draft.reason} onChange={e=>setDraft({...draft,reason:e.target.value})} placeholder="The data is relational and the team already operates Postgres."/></label>
    <label>What alternatives did you consider?<input value={draft.alternatives} onChange={e=>setDraft({...draft,alternatives:e.target.value})} placeholder="MongoDB, DynamoDB"/></label>
    <label>What constraints mattered?<textarea value={draft.constraints} onChange={e=>setDraft({...draft,constraints:e.target.value})} placeholder="Budget, migration effort, team skills, reliability…"/></label>
    <label>What did you expect to happen?<textarea value={draft.expectedOutcome} onChange={e=>setDraft({...draft,expectedOutcome:e.target.value})} placeholder="Faster delivery without a migration project."/></label>
    <button className="future-primary decision-save" onClick={add}><Plus size={15}/> Save decision memory</button>{saved&&<div className="future-toast inline"><Check size={15}/> Decision saved locally. It will now be eligible for contextual resurfacing.</div>}
   </div>
   <div className="decision-list"><div className="section-kicker">YOUR DECISIONS / {items.length}</div>{recent.length===0?<div className="future-empty"><b>No decision memories yet.</b><p>Start with a choice whose reasoning you know you will want later.</p></div>:recent.map(d=>{const assessment=assessDecision(d);return <article className="decision-card" key={d.id}><span>{new Date(d.createdAt).toLocaleDateString()} · {assessment.outcomeGap==='changed'?'OUTCOME CHANGED':assessment.hasOutcome?'OUTCOME RECORDED':'AWAITING OUTCOME'}</span><h3>{d.decision}</h3><p><b>Why:</b> {d.reason}</p>{d.alternatives&&<p><b>Alternatives:</b> {d.alternatives}</p>}{d.constraints&&<p><b>Constraints:</b> {d.constraints}</p>}{d.expectedOutcome&&<p><b>Expected:</b> {d.expectedOutcome}</p>}{d.actualOutcome&&<p><b>Actual:</b> {d.actualOutcome}</p>}<div className="future-card-actions"><button onClick={()=>{const value=prompt('What actually happened?',d.actualOutcome);if(value?.trim())updateDecision(d.id,{actualOutcome:value.trim()})}}><Check size={13}/> Record outcome</button><button onClick={()=>{const value=prompt('Would you choose this again? (yes / no / unsure)',d.wouldChooseAgain);if(value?.trim())updateDecision(d.id,{wouldChooseAgain:value.trim().toLowerCase() as DecisionMemory['wouldChooseAgain']})}}><CircleHelp size={13}/> Would I choose again?</button><button onClick={()=>remove(d.id)}><Trash2 size={13}/> Remove</button></div>{d.wouldChooseAgain&&<small>Would choose again: <b>{d.wouldChooseAgain}</b></small>}</article>})}</div>
  </section>
  <section className="future-section"><div className="section-kicker">DECISION LOOP</div><h2>Choices become evidence.</h2><div className="future-grid"><article className="future-card"><span>01 / DECISION</span><p className="future-quote">“I chose the cheaper option because migration wasn't expected.”</p></article><article className="future-card"><span>02 / OUTCOME</span><p className="future-quote">“Migration became expensive six months later.”</p></article><article className="future-card"><span>03 / RESURFACE</span><p className="future-quote">“You're making a similar choice. Last time, switching cost mattered more than price.”</p></article></div></section>
 </main>
}
