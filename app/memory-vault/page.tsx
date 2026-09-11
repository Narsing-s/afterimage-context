'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Archive, Check, Clock3, Download, Pencil, RotateCcw, Trash2, Upload, X } from 'lucide-react';
import { ContextMemory, MemoryState, snoozeMemory } from '../../lib/context-engine';
import { saveRecovery } from '../../lib/recovery';

type Memory = ContextMemory;
const STORAGE_KEY = 'afterimage:memories:v2';

function load(): Memory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('afterimage:memories:v1') || localStorage.getItem('afterimage:memories') || '[]';
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(x => x && typeof x.id === 'string' && typeof x.text === 'string').map(x => ({
      ...x,
      state: x.state || 'active',
      confidence: typeof x.confidence === 'number' ? x.confidence : .7,
      resurfacedCount: typeof x.resurfacedCount === 'number' ? x.resurfacedCount : 0,
    }));
  } catch { return []; }
}

export default function MemoryVault() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState({ text: '', trigger: '', why: '' });
  const [message, setMessage] = useState('');

  useEffect(() => setMemories(load()), []);

  function save(next: Memory[]) {
    setMemories(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function edit(memory: Memory) {
    setEditing(memory.id);
    setDraft({ text: memory.text, trigger: memory.trigger || '', why: memory.why || '' });
  }

  function saveEdit() {
    if (!editing || !draft.text.trim()) return;
    save(memories.map(m => m.id === editing ? { ...m, text: draft.text.trim(), trigger: draft.trigger.trim() || undefined, why: draft.why.trim() || undefined } : m));
    setEditing(null);
    setMessage('Memory updated locally.');
  }

  function forgetForever(id: string) {
    saveRecovery(memories, 'forget memory');
    save(memories.filter(m => m.id !== id));
    setMessage('Memory forgotten on this device. A local recovery snapshot was created.');
  }

  function snooze(id: string) {
    save(memories.map(m => m.id === id ? snoozeMemory(m, 30) : m));
    setMessage('Memory quieted for 30 days.');
  }

  function archive(id: string) {
    saveRecovery(memories, 'archive or restore memory');
    save(memories.map(m => m.id === id ? { ...m, state: (m.state === 'archived' ? 'active' : 'archived') as MemoryState } : m));
    setMessage('Memory state changed. A local recovery snapshot was created.');
  }

  function exportAll() {
    const blob = new Blob([JSON.stringify(memories, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'afterimage-memories.json'; a.click(); URL.revokeObjectURL(url);
  }

  async function importAll(file: File) {
    try {
      const parsed = JSON.parse(await file.text());
      if (!Array.isArray(parsed)) throw new Error('The file must contain an array of memories.');
      const valid = parsed.filter(x => x && typeof x.id === 'string' && typeof x.text === 'string').map(x => ({
        ...x, state: x.state || 'active', confidence: typeof x.confidence === 'number' ? x.confidence : .7, resurfacedCount: typeof x.resurfacedCount === 'number' ? x.resurfacedCount : 0
      })) as Memory[];
      if (!valid.length && parsed.length) throw new Error('No valid memories were found.');
      const byId = new Map(memories.map(m => [m.id, m]));
      valid.forEach(m => byId.set(m.id, m));
      saveRecovery(memories, 'memory vault import');
      save([...byId.values()].slice(0, 100));
      setMessage(`Imported ${valid.length} valid memor${valid.length === 1 ? 'y' : 'ies'}; duplicates were merged by ID. A local recovery snapshot was created.`);
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Import failed.'); }
  }

  const active = useMemo(() => memories.filter(m => m.state !== 'archived'), [memories]);

  return <main style={{ minHeight: '100vh', background: '#08090b', color: '#f4f4f5', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <Link href="/" style={{ color: '#aaa', textDecoration: 'none', display: 'inline-flex', gap: 8, alignItems: 'center' }}><ArrowLeft size={15}/> Back to Afterimage</Link>
      <header style={{ margin: '42px 0 28px' }}><div style={{ letterSpacing: '.16em', fontSize: 11, color: '#888' }}>AFTERIMAGE / MEMORY VAULT</div><h1 style={{ fontSize: 'clamp(32px,7vw,58px)', margin: '8px 0' }}>Your memory, your control.</h1><p style={{ color: '#aaa', maxWidth: 680 }}>Edit, quiet, archive, export, import, or forget memories forever. Everything here stays in this browser.</p></header>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
        <button onClick={exportAll} style={buttonStyle}><Download size={15}/> Export</button>
        <label style={buttonStyle}><Upload size={15}/> Import JSON<input hidden type="file" accept="application/json,.json" onChange={e => { const f=e.target.files?.[0]; if(f) importAll(f); e.currentTarget.value=''; }}/></label>
        <span style={{ color: '#777', alignSelf: 'center', fontSize: 13 }}>{memories.length} stored · {active.length} active</span>
      </div>
      {message && <div role="status" style={{ padding: 14, border: '1px solid #292929', borderRadius: 12, marginBottom: 18, color: '#c9c9c9' }}>{message}</div>}
      {memories.length === 0 ? <section style={card}><b>No memories yet.</b><p style={muted}>Create one on the home page and it will appear here.</p><Link href="/" style={buttonStyle}><PlusIcon/> Create memory</Link></section> : <div style={{ display: 'grid', gap: 14 }}>
        {memories.map(m => <article key={m.id} style={{ ...card, opacity: m.state === 'archived' ? .68 : 1 }}>
          {editing === m.id ? <div style={{ display: 'grid', gap: 10 }}>
            <textarea value={draft.text} onChange={e=>setDraft({...draft,text:e.target.value})} style={field} aria-label="Edit memory" />
            <input value={draft.trigger} onChange={e=>setDraft({...draft,trigger:e.target.value})} style={field} placeholder="Return condition" aria-label="Edit return condition" />
            <input value={draft.why} onChange={e=>setDraft({...draft,why:e.target.value})} style={field} placeholder="Why it matters" aria-label="Edit why it matters" />
            <div style={actions}><button onClick={saveEdit} style={buttonStyle}><Check size={14}/> Save</button><button onClick={()=>setEditing(null)} style={buttonStyle}><X size={14}/> Cancel</button></div>
          </div> : <>
            <div style={{ display:'flex', justifyContent:'space-between', gap:12 }}><span style={{ fontSize:11, letterSpacing:'.12em', color:'#888' }}>{m.mode.toUpperCase()} · {(m.state || 'active').toUpperCase()}</span><span style={{ fontSize:12, color:'#666' }}>{new Date(m.createdAt).toLocaleString()}</span></div>
            <p style={{ fontSize:18, lineHeight:1.5 }}>{m.text}</p>
            {m.trigger && <p style={muted}><b>Returns when:</b> {m.trigger}</p>}{m.why && <p style={muted}><b>Why it matters:</b> {m.why}</p>}
            <p style={muted}>Confidence {Math.round((m.confidence ?? .7)*100)}% · Resurfaced {m.resurfacedCount ?? 0}×{m.snoozedUntil ? ` · Quiet until ${new Date(m.snoozedUntil).toLocaleDateString()}` : ''}</p>
            <div style={actions}><button onClick={()=>edit(m)} style={buttonStyle}><Pencil size={14}/> Edit</button><button onClick={()=>snooze(m.id)} style={buttonStyle}><Clock3 size={14}/> Quiet 30 days</button><button onClick={()=>archive(m.id)} style={buttonStyle}><Archive size={14}/> {m.state==='archived'?'Restore':'Archive'}</button><button onClick={()=>forgetForever(m.id)} style={{...buttonStyle,borderColor:'#542b2b',color:'#ff9b9b'}}><Trash2 size={14}/> Forget forever</button></div>
          </>}
        </article>)}
      </div>}
      <footer style={{ margin:'40px 0', color:'#555', fontSize:12 }}>Local-first · No server sync · You control the memory.</footer>
    </div>
  </main>
}

const card: React.CSSProperties = { border:'1px solid #252525', background:'#101114', borderRadius:16, padding:20 };
const muted: React.CSSProperties = { color:'#999', lineHeight:1.6 };
const actions: React.CSSProperties = { display:'flex', flexWrap:'wrap', gap:8 };
const buttonStyle: React.CSSProperties = { display:'inline-flex', alignItems:'center', gap:7, border:'1px solid #303030', background:'#151619', color:'#eee', borderRadius:10, padding:'9px 12px', cursor:'pointer', textDecoration:'none', fontSize:13 };
const field: React.CSSProperties = { width:'100%', boxSizing:'border-box', border:'1px solid #333', background:'#090a0c', color:'#fff', borderRadius:10, padding:12, font:'inherit' };
function PlusIcon(){ return <span style={{fontSize:16}}>＋</span>; }
