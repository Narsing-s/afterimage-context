'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, Check, Clock3, RefreshCw, ShieldCheck, Sparkles, X } from 'lucide-react';
import type { ContextMemory } from '../../lib/context-engine';

const KEY = 'afterimage:memories:v2';

type Health = 'fresh' | 'familiar' | 'fading' | 'stale';

function ageDays(memory: ContextMemory) {
  const base = memory.resurfacedAt || memory.createdAt;
  return Math.max(0, Math.floor((Date.now() - new Date(base).getTime()) / 86400000));
}

function health(memory: ContextMemory): Health {
  const days = ageDays(memory);
  const confidence = memory.confidence ?? 0.7;
  if (memory.state === 'outdated' || memory.state === 'archived' || days > 365 || confidence < 0.42) return 'stale';
  if (days > 180 || confidence < 0.58) return 'fading';
  if (days > 45 || confidence < 0.76) return 'familiar';
  return 'fresh';
}

function terms(text: string) {
  return [...new Set((text.toLowerCase().match(/[a-z0-9₹]+/g) || []).filter(x => x.length > 3))];
}

function conflicts(memories: ContextMemory[]) {
  const result: Array<{ a: ContextMemory; b: ContextMemory; overlap: string[] }> = [];
  for (let i = 0; i < memories.length; i++) {
    for (let j = i + 1; j < memories.length; j++) {
      const a = new Set(terms(memories[i].text));
      const overlap = terms(memories[j].text).filter(t => a.has(t));
      if (overlap.length >= 2 && memories[i].text !== memories[j].text) result.push({ a: memories[i], b: memories[j], overlap });
    }
  }
  return result.slice(0, 8);
}

export default function MemoryReview() {
  const [memories, setMemories] = useState<ContextMemory[]>([]);
  const [selected, setSelected] = useState<ContextMemory | null>(null);

  function load() {
    try {
      const raw = localStorage.getItem(KEY) || '[]';
      const data = JSON.parse(raw);
      setMemories(Array.isArray(data) ? data : []);
    } catch { setMemories([]); }
  }

  useEffect(() => { load(); }, []);

  function update(id: string, patch: Partial<ContextMemory>) {
    const next = memories.map(m => m.id === id ? { ...m, ...patch } : m);
    setMemories(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    if (selected?.id === id) setSelected({ ...selected, ...patch });
  }

  const healthCounts = useMemo(() => ({
    fresh: memories.filter(m => health(m) === 'fresh').length,
    familiar: memories.filter(m => health(m) === 'familiar').length,
    fading: memories.filter(m => health(m) === 'fading').length,
    stale: memories.filter(m => health(m) === 'stale').length,
  }), [memories]);
  const conflictsFound = useMemo(() => conflicts(memories.filter(m => m.state !== 'archived')), [memories]);
  const needsReview = memories.filter(m => health(m) === 'fading' || health(m) === 'stale');

  return <main className="graph-page">
    <nav className="graph-nav"><Link className="graph-back" href="/"><ArrowLeft size={14}/> BACK TO AFTERIMAGE</Link><div className="brand"><span className="mark"><Sparkles size={15}/></span> MEMORY REVIEW</div></nav>
    <section className="graph-hero"><div className="section-kicker">MEMORY HEALTH</div><h1>Keep your past<br/><em>honest.</em></h1><p>Memories change. Review fading context, spot possible conflicts, and decide what future-you should still trust. Everything stays local.</p></section>

    <section className="graph-stats">
      <div><span>FRESH</span><b>{healthCounts.fresh}</b></div>
      <div><span>FADING</span><b>{healthCounts.fading}</b></div>
      <div><span>STALE</span><b>{healthCounts.stale}</b></div>
    </section>

    {needsReview.length > 0 && <section className="graph-board">
      <div className="graph-board-head"><div><span>REVIEW QUEUE</span><p>These memories may no longer be reliable.</p></div><RefreshCw size={16}/></div>
      <div className="memory-list">{needsReview.map(memory => <article className="memory" key={memory.id}>
        <span>{health(memory).toUpperCase()} · {Math.round((memory.confidence ?? .7) * 100)}% CONFIDENCE</span>
        <p>{memory.text}</p>
        {memory.trigger && <small>Returns when: {memory.trigger}</small>}
        <small>Last surfaced {ageDays(memory)} days ago</small>
        <div className="memory-actions"><button onClick={() => update(memory.id, { state: 'confirmed', confidence: Math.min(1, (memory.confidence ?? .7) + .12), resurfacedAt: new Date().toISOString() })}><Check size={13}/> Still true</button><button onClick={() => update(memory.id, { state: 'outdated', confidence: Math.max(0.1, (memory.confidence ?? .7) - .2) })}><X size={13}/> No longer true</button></div>
      </article>)}</div>
    </section>}

    <section className="graph-board" style={{ marginTop: 18 }}>
      <div className="graph-board-head"><div><span>CONFLICT RADAR</span><p>Possible competing memories based on shared context.</p></div><AlertTriangle size={16}/></div>
      {conflictsFound.length === 0 ? <div className="graph-empty"><ShieldCheck size={25}/><b>No obvious conflicts.</b><p>As your memory grows, Afterimage will surface pairs that deserve a second look.</p></div> : <div className="graph-links">{conflictsFound.map((item, i) => <article className="graph-edge" key={i}><div><span>POSSIBLE CONFLICT</span><span>{item.overlap.slice(0, 4).join(' · ')}</span></div><p>“{item.a.text}”</p><i>↕ same context ↕</i><p>“{item.b.text}”</p><button className="export" onClick={() => { setSelected(item.a); }}>Review memory</button></article>)}</div>}
    </section>

    <section className="why"><div className="section-kicker">THE RULE</div><h2>Never silently rewrite the past.</h2><div className="grid"><article className="feature"><div className="feature-icon"><ShieldCheck/></div><h3>User decides</h3><p>Afterimage can identify a possible conflict, but it never decides which memory is true for you.</p></article><article className="feature"><div className="feature-icon"><Clock3/></div><h3>Memory can fade</h3><p>Old or repeatedly unconfirmed memories become less trusted instead of being treated as permanent truth.</p></article><article className="feature"><div className="feature-icon"><Sparkles/></div><h3>Context stays local</h3><p>This review uses the same local memory store as the MVP. No server account is required.</p></article></div></section>

    {selected && <div className="inspector-backdrop" onClick={() => setSelected(null)}><aside className="inspector" onClick={e => e.stopPropagation()}><button className="inspector-close" onClick={() => setSelected(null)}><X size={16}/></button><div className="section-kicker">MEMORY REVIEW</div><h3>Does this still describe you?</h3><p className="inspector-memory">“{selected.text}”</p><div className="inspect-row"><span>HEALTH</span><b>{health(selected).toUpperCase()}</b></div><div className="inspect-row"><span>CONFIDENCE</span><b>{Math.round((selected.confidence ?? .7) * 100)}%</b></div><button className="inspector-action" onClick={() => { update(selected.id, { state: 'confirmed', confidence: Math.min(1, (selected.confidence ?? .7) + .12), resurfacedAt: new Date().toISOString() }); setSelected(null); }}><Check size={15}/> Yes, keep this true</button><button className="inspector-action danger" onClick={() => { update(selected.id, { state: 'outdated', confidence: Math.max(0.1, (selected.confidence ?? .7) - .2) }); setSelected(null); }}><X size={15}/> No longer true</button></aside></div>}
  </main>;
}
