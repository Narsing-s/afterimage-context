'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Network, Sparkles } from 'lucide-react';
import Link from 'next/link';
import type { ContextMemory } from '../../lib/context-engine';
import { buildContextGraph, graphClusters } from '../../lib/context-graph';

const KEY='afterimage:memories:v2';
export default function GraphPage(){
  const [memories,setMemories]=useState<ContextMemory[]>([]);
  useEffect(()=>{try{const raw=localStorage.getItem(KEY)||localStorage.getItem('afterimage:memories:v1')||localStorage.getItem('afterimage:memories')||'[]';const data=JSON.parse(raw);if(Array.isArray(data))setMemories(data)}catch{setMemories([])}},[]);
  const edges=useMemo(()=>buildContextGraph(memories),[memories]);
  const clusters=useMemo(()=>graphClusters(memories,edges),[memories,edges]);
  const active=memories.filter(m=>m.state!=='outdated'&&m.state!=='archived');
  return <main className="graph-page"><header className="graph-nav"><Link href="/" className="graph-back"><ArrowLeft size={15}/> Back to Afterimage</Link><div className="brand"><span className="mark"><Sparkles size={15}/></span> AFTERIMAGE</div></header><section className="graph-hero"><div className="section-kicker">AFTERIMAGE / PERSONAL CONTEXT GRAPH</div><h1>See the connections<br/><em>your memories make.</em></h1><p>These relationships are computed locally from shared context and return conditions. Nothing is uploaded.</p></section><section className="graph-stats"><div><span>ACTIVE MEMORIES</span><b>{active.length}</b></div><div><span>CONNECTIONS</span><b>{edges.length}</b></div><div><span>CLUSTERS</span><b>{clusters.length}</b></div></section><section className="graph-board"><div className="graph-board-head"><div><span>LOCAL GRAPH</span><p>Strongest relationships first.</p></div><Network size={20}/></div>{active.length<2?<div className="graph-empty"><b>Leave at least two memories to reveal connections.</b><p>The graph becomes useful as your personal memory grows.</p></div>:<div className="graph-content"><div className="graph-links">{edges.slice(0,20).map(e=>{const a=memories.find(m=>m.id===e.from),b=memories.find(m=>m.id===e.to);if(!a||!b)return null;return <article className="graph-edge" key={a.id+b.id}><div><span>{e.relation.replaceAll('-',' ').toUpperCase()}</span><b>{Math.round(e.strength*100)}%</b></div><p>{a.text}</p><i>↕</i><p>{b.text}</p></article>})}</div><div className="cluster-list"><div className="section-kicker">EMERGING PATTERNS</div>{clusters.length===0?<p className="muted">No multi-memory clusters yet.</p>:clusters.slice(0,8).map((group,i)=><article className="cluster" key={group[0].id}><span>CLUSTER {String(i+1).padStart(2,'0')} · {group.length} MEMORIES</span><b>{group.map(m=>m.mode==='pattern'?'Pattern':'Context').join(' + ')}</b><p>{group.map(m=>m.text).join(' · ')}</p></article>)}</div></div>}</section><footer><span>AFTERIMAGE / v0.6</span><span>Graph is local · deterministic · explainable</span></footer></main>}
