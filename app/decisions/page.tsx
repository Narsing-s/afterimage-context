'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, Plus, Sparkles, Trash2, ArrowLeft, CircleHelp } from 'lucide-react';
import { assessDecision, createDecisionId, decisionMemoryToContext, type DecisionMemory } from '../../lib/decision-memory';
import type { ContextMemory } from '../../lib/context-engine';

const KEY='afterimage:decisions:v2';
const MEMORY_KEY='afterimage:memories:v2';
const LEGACY_KEY='afterimage:decisions:v1';
const empty={decision:'',reason:'',alternatives:'',constraints:'',expectedOutcome:'',actualOutcome:'',wouldChooseAgain:'' as DecisionMemory['wouldChooseAgain']};

function loadItems(): DecisionMemory[]{try{const raw=localStorage.getItem(KEY)||localStorage.getItem(LEGACY_KEY)||'[]';const x=JSON.parse(raw);return Array.isArray(x)?x.map((d:any)=>({...empty,...d,id:d.id||createDecisionId(),confidence:d.confidence??.7,createdAt:d.createdAt||new Date().toISOString()})):[]}catch{return []}}
function loadMemories(): ContextMemory[]{try{const x=JSON.parse(localStorage.getItem(MEMORY_KEY)||'[]');return Array.isArray(x)?x:[]}catch{return []}}
function syncDecisionMemory(decision:DecisionMemory, remove=false){
 const memories=loadMemories();
 if(remove){localStorage.setItem(MEMORY_KEY,JSON.stringify(memories.filter(m=>m.id!==decision.linkedMemoryId)));return}
 const context=decisionMemoryToContext(decision);
 const next:ContextMemory={...context,trigger:`When a similar decision returns: ${decision.decision}`,why:`${decision.reason}${decision.alternatives?` Alternatives considered: ${decision.alternatives}.`:''}${decision.constraints?` Constraints: ${decision.constraints}.`:''}${decision.expectedOutcome?` Expected outcome: ${decision.expectedOutcome}.`:''}${decision.actualOutcome?` Actual outcome: ${decision.actualOutcome}.`:''}${decision.wouldChooseAgain?` Would choose again: ${decision.wouldChooseAgain}.`:''}`};
 const index=memories.findIndex(m=>m.id===next.id); if(index>=0) memories[index]=next; else memories.unshift(next); localStorage.setItem(MEMORY_KEY,JSON.stringify(memories.slice(0,100)));
}

export default function DecisionsPage(){
 const [items,setItems]=useState<DecisionMemory[]>([]); const [draft,setDraft]=useState(empty); const [saved,setSaved]=useState(false);
 useEffect(()=>setItems(loadItems()),[]);
 const recent=useMemo(()=>[...items].sort((a,b)=>+new Date(b.createdAt)-+new Date(a.createdAt)),[items]);
 function persist(next:DecisionMemory[]){setItems(next);localStorage.setItem(KEY,JSON.stringify(next));}
 function add(){if(!draft.decision.trim()||!draft.reason.trim())return;const d:DecisionMemory={...draft,id:createDecisionId(),confidence:.7,createdAt:new Date().toISOString()};syncDecisionMemory(d);persist([d,...items]);setDraft(empty);setSaved(true);setTimeout(()=>setSaved(false),2200)}
 function updateDecision(id:string,patch:Partial<DecisionMemory>){const next=items.map(x=>x.id===id?{...x,...patch,reviewedAt:new Date().toISOString()}:x);const updated=next.find(x=>x.id===id);persist(next);if(updated)syncDecisionMemory(updated)}
 function remove(id:string){const decision=items.find(x=>x.id===id);if(decision)syncDecisionMemory(decision,true);persist(items.filter(x=>x.id!==id))}
 return <main className="future-page">
  <nav className="graph-nav"><Link href="/" className="graph-back"><ArrowLeft size={14}/> Back to Afterimage</Link><span className="future-nav-mark"><Sparkles size={13}/> DECISION MEMORY</span></nav>
  <section className="future-hero"><div className="section-kicker">DECISION MEMORY 2.0</div><h1>Remember not just<br/><em>what you chose.</em></h1><p>Preserve the reasoning, constraints, alternatives and expected outcome behind an important choice. After you save it, Afterimage can bring that decision back when similar context returns.</p></section>
  <section className="decision-layout">
   <div className="decision-form"><div className="section-kicker">LEAVE A DECISION</div><h2>Give future-you the full context.</h2>
    <label>What did you decide?<input value={draft.decision} onChange={e=>setDraft({...draft,decision:e.target.value})} placeholder="Use PostgreSQL for the new service"/></label>
    <label>Why did you choose it?<textarea value={draft.reason} onChange={e=>setDraft({...draft,reason:e.target.value})} placeholder="The data is relational and the team already operates Postgres."/></label>
    <label>What alternatives did you consider?<input value={draft.alternatives} onChange={e=>setDraft({...draft,alternatives:e.target.value})} placeholder="MongoDB, DynamoDB"/></label>
    <label>What constraints mattered?<textarea value={draft.constraints} onChange={e=>setDraft({...draft,constraints:e.target.value})} placeholder="Budget, migration effort, team skills, reliability…"/></label>
    <label>What did you expect to happen?<textarea value={draft.expectedOutcome} onChange={e=>setDraft({...draft,expectedOutcome:e.target.value})} placeholder="Faster delivery without a migration project."/></label>
    <button className="future-primary decision-save" onClick={add}><Plus size={15}/> Save decision memory</button>{saved&&<div className="future-toast inline"><Check size={15}/> Decision saved locally and connected to contextual resurfacing.</div>}
   </div>
   <div className="decision-list"><div className="section-kicker">YOUR DECISIONS / {items.length}</div>{recent.length===0?<div className="future-empty"><b>No decision memories yet.</b><p>Start with a choice whose reasoning you know you will want later.</p></div>:recent.map(d=>{const assessment=assessDecision(d);return <article className="decision-card" key={d.id}><span>{new Date(d.createdAt).toLocaleDateString()} · {assessment.outcomeGap==='changed'?'OUTCOME CHANGED':assessment.hasOutcome?'OUTCOME RECORDED':'AWAITING OUTCOME'}</span><h3>{d.decision}</h3><p><b>Why:</b> {d.reason}</p>{d.alternatives&&<p><b>Alternatives:</b> {d.alternatives}</p>}{d.constraints&&<p><b>Constraints:</b> {d.constraints}</p>}{d.expectedOutcome&&<p><b>Expected:</b> {d.expectedOutcome}</p>}{d.actualOutcome&&<p><b>Actual:</b> {d.actualOutcome}</p>}<div className="future-card-actions"><button onClick={()=>{const value=prompt('What actually happened?',d.actualOutcome);if(value!==null)updateDecision(d.id,{actualOutcome:value})}}><Check size={13}/> Record outcome</button><button onClick={()=>{const value=prompt('Would you choose this again? (yes / no / unsure)',d.wouldChooseAgain);if(value!==null)updateDecision(d.id,{wouldChooseAgain:value.trim().toLowerCase() as DecisionMemory['wouldChooseAgain']})}}><CircleHelp size={13}/> Would I choose again?</button><button onClick={()=>remove(d.id)}><Trash2 size={13}/> Remove</button></div>{d.wouldChooseAgain&&<small>Would choose again: <b>{d.wouldChooseAgain}</b></small>}<small>Context link: <b>Connected to Afterimage resurfacing</b></small></article>})}</div>
  </section>
  <section className="future-section"><div className="section-kicker">DECISION LOOP</div><h2>Choices become evidence.</h2><div className="future-grid"><article className="future-card"><span>01 / DECISION</span><p className="future-quote">“I chose the cheaper option because migration wasn't expected.”</p></article><article className="future-card"><span>02 / OUTCOME</span><p className="future-quote">“Migration became expensive six months later.”</p></article><article className="future-card"><span>03 / LEARNING</span><p className="future-quote">“Next time, switching cost matters more than the initial price.”</p></article></div></section>
 </main>
}
