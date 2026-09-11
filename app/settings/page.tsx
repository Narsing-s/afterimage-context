'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Download, RotateCcw, ShieldCheck, Trash2, Undo2 } from 'lucide-react';
import { saveRecovery, restoreRecovery } from '../../lib/recovery';

const MEMORY_KEY = 'afterimage:memories:v2';
const WELCOME_KEY = 'afterimage:welcome:v1';
const PREF_KEY = 'afterimage:signal-preferences:v1';

export default function SettingsPage() {
  const [message, setMessage] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const [canUndo, setCanUndo] = useState(false);

  function replayWelcome() { localStorage.removeItem(WELCOME_KEY); setMessage('Welcome introduction reset. It will appear the next time you open Afterimage.'); }

  function exportData() {
    const memories = JSON.parse(localStorage.getItem(MEMORY_KEY) || '[]');
    const preferences = JSON.parse(localStorage.getItem(PREF_KEY) || '{}');
    const payload = { exportedAt: new Date().toISOString(), memories, signalPreferences: preferences };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'afterimage-data.json'; a.click(); URL.revokeObjectURL(url); setMessage('Your local Afterimage data was exported.');
  }

  function clearAll() {
    const memories = JSON.parse(localStorage.getItem(MEMORY_KEY) || '[]');
    saveRecovery(memories, 'clear local memory');
    localStorage.removeItem(MEMORY_KEY); localStorage.removeItem('afterimage:memories:v1'); localStorage.removeItem('afterimage:memories'); localStorage.removeItem(PREF_KEY);
    setConfirmClear(false); setCanUndo(true); setMessage('Local memory cleared. You can undo this from the control center.');
  }

  function undoClear() {
    const restored = restoreRecovery();
    if (!restored) { setMessage('No recoverable local snapshot is available.'); return; }
    setCanUndo(false); setMessage(`Restored ${restored.length} local memor${restored.length === 1 ? 'y' : 'ies'}.`);
  }

  return <main className="settings-page"><div className="settings-shell">
    <Link href="/" className="settings-back"><ArrowLeft size={15}/> Back to Afterimage</Link>
    <div className="section-kicker">AFTERIMAGE / CONTROL CENTER</div><h1>Your memory. Your controls.</h1>
    <p className="settings-lead">Manage storage, context influence, recovery, and the product introduction without sending your memory to a server.</p>
    <section className="settings-card"><div className="settings-card-icon"><RotateCcw size={18}/></div><div><h2>Replay the introduction</h2><p>See the three-step Afterimage introduction again on this browser.</p></div><button onClick={replayWelcome}><RotateCcw size={14}/> Replay</button></section>
    <section className="settings-card"><div className="settings-card-icon"><Download size={18}/></div><div><h2>Export local data</h2><p>Download your memories and context preferences as portable JSON.</p></div><button onClick={exportData}><Download size={14}/> Export</button></section>
    <section className="settings-card"><div className="settings-card-icon"><Undo2 size={18}/></div><div><h2>Recovery</h2><p>Destructive library clearing creates one local recovery snapshot before removal.</p></div>{canUndo&&<button onClick={undoClear}><Undo2 size={14}/> Undo clear</button>}</section>
    <section className="settings-card privacy-card"><div className="settings-card-icon"><ShieldCheck size={18}/></div><div><h2>Local-first privacy</h2><p>Memories and signal preferences remain in this browser. No account, advertising profile, or silent browsing-history upload.</p></div><span className="settings-status"><Check size={13}/> Local</span></section>
    <section className="settings-danger"><div><h2>Delete local memory</h2><p>A recoverable snapshot is created before this browser's memory library and context preferences are removed.</p></div>{!confirmClear?<button onClick={()=>setConfirmClear(true)}><Trash2 size={14}/> Delete everything</button>:<div className="settings-confirm"><span>Delete all local data?</span><button onClick={clearAll}>Yes, delete</button><button onClick={()=>setConfirmClear(false)}>Cancel</button></div>}</section>
    {message&&<div className="settings-message" role="status">{message}</div>}
    <p className="settings-footnote">Afterimage stays quiet by default. Every future context source should be opt-in, explainable, revocable, and expiring.</p>
  </div></main>;
}
