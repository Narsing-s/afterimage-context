'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Download, KeyRound, RotateCcw, ShieldCheck, Trash2, Undo2, Upload } from 'lucide-react';
import { saveRecovery, restoreRecovery } from '../../lib/recovery';
import { decryptBackup, encryptBackup } from '../../lib/secure-export';

const MEMORY_KEY = 'afterimage:memories:v2';
const WELCOME_KEY = 'afterimage:welcome:v1';
const PREF_KEY = 'afterimage:signal-preferences:v1';
const AFTERIMAGE_PREFIX = 'afterimage:';

function readAfterimageData() {
  const data: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(AFTERIMAGE_PREFIX)) continue;
    const raw = localStorage.getItem(key);
    if (raw === null) continue;
    try { data[key] = JSON.parse(raw); } catch { data[key] = raw; }
  }
  return data;
}

export default function SettingsPage() {
  const [message, setMessage] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmErase, setConfirmErase] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [backupPassword, setBackupPassword] = useState('');
  const [backupConfirm, setBackupConfirm] = useState('');
  const [importPassword, setImportPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [localKeyCount, setLocalKeyCount] = useState(0);

  function refreshInventory() {
    setLocalKeyCount(Object.keys(readAfterimageData()).length);
  }

  useEffect(() => { refreshInventory(); }, []);

  function replayWelcome() { localStorage.removeItem(WELCOME_KEY); setMessage('Welcome introduction reset. It will appear the next time you open Afterimage.'); refreshInventory(); }

  function exportData() {
    const payload = { format: 'afterimage.local-export.v2', exportedAt: new Date().toISOString(), data: readAfterimageData() };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'afterimage-local-data.json'; a.click(); URL.revokeObjectURL(url); setMessage('All Afterimage local data was exported. Nothing was uploaded.');
  }

  async function exportEncrypted() {
    if (backupPassword !== backupConfirm) { setMessage('Backup passwords do not match.'); return; }
    setBusy(true);
    try {
      const data = readAfterimageData();
      const memories = Array.isArray(data[MEMORY_KEY]) ? data[MEMORY_KEY] : [];
      const preferences = data[PREF_KEY] ?? {};
      const encrypted = await encryptBackup({ memories, preferences: { signalPreferences: preferences, localData: data } }, backupPassword);
      const url = URL.createObjectURL(new Blob([encrypted], { type: 'application/json' }));
      const a = document.createElement('a'); a.href = url; a.download = 'afterimage-secure-backup.json'; a.click(); URL.revokeObjectURL(url);
      setBackupPassword(''); setBackupConfirm(''); setMessage('Encrypted backup created locally. Your password was not stored.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to create encrypted backup.'); }
    finally { setBusy(false); }
  }

  async function importEncrypted(file: File) {
    if (!importPassword) { setMessage('Enter the backup password first.'); return; }
    setBusy(true);
    try {
      const raw = await file.text();
      const backup = await decryptBackup(raw, importPassword);
      const current = JSON.parse(localStorage.getItem(MEMORY_KEY) || '[]');
      saveRecovery(current, 'encrypted backup import');
      const existing = new Map(current.map((memory: { id?: string }) => [memory.id, memory]));
      for (const memory of backup.memories) {
        if (memory && typeof memory === 'object') {
          const item = memory as { id?: string };
          if (item.id) existing.set(item.id, memory);
        }
      }
      localStorage.setItem(MEMORY_KEY, JSON.stringify([...existing.values()]));
      const preferences = backup.preferences as { signalPreferences?: unknown } | undefined;
      if (preferences?.signalPreferences) localStorage.setItem(PREF_KEY, JSON.stringify(preferences.signalPreferences));
      setImportPassword(''); setMessage(`Encrypted backup restored and merged. ${backup.memories.length} memories were processed.`); refreshInventory();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to import encrypted backup.'); }
    finally { setBusy(false); }
  }

  function clearAll() {
    const memories = JSON.parse(localStorage.getItem(MEMORY_KEY) || '[]');
    saveRecovery(memories, 'clear local memory');
    localStorage.removeItem(MEMORY_KEY); localStorage.removeItem('afterimage:memories:v1'); localStorage.removeItem('afterimage:memories'); localStorage.removeItem(PREF_KEY);
    setConfirmClear(false); setCanUndo(true); setMessage('Local memory cleared. You can undo this from the control center.'); refreshInventory();
  }

  function undoClear() {
    const restored = restoreRecovery();
    if (!restored) { setMessage('No recoverable local snapshot is available.'); return; }
    setCanUndo(false); setMessage(`Restored ${restored.length} local memor${restored.length === 1 ? 'y' : 'ies'}.`); refreshInventory();
  }

  function eraseEverything() {
    let removed = 0;
    for (let i = localStorage.length - 1; i >= 0; i -= 1) {
      const key = localStorage.key(i);
      if (key?.startsWith(AFTERIMAGE_PREFIX)) { localStorage.removeItem(key); removed += 1; }
    }
    setConfirmErase(false); setConfirmClear(false); setCanUndo(false); setMessage(`Permanently erased ${removed} Afterimage local storage entries. No recovery snapshot was kept.`); refreshInventory();
  }

  return <main className="settings-page"><div className="settings-shell">
    <Link href="/" className="settings-back"><ArrowLeft size={15}/> Back to Afterimage</Link>
    <div className="section-kicker">AFTERIMAGE / CONTROL CENTER</div><h1>Your memory. Your controls.</h1>
    <p className="settings-lead">Manage storage, context influence, recovery, and privacy without sending your memory to a server.</p>
    <section className="settings-card"><div className="settings-card-icon"><RotateCcw size={18}/></div><div><h2>Replay the introduction</h2><p>See the three-step Afterimage introduction again on this browser.</p></div><button onClick={replayWelcome}><RotateCcw size={14}/> Replay</button></section>
    <section className="settings-card"><div className="settings-card-icon"><Download size={18}/></div><div><h2>Export all local data</h2><p>Download every Afterimage local-storage record, including memories, signals, history, preferences, and recovery metadata.</p></div><button onClick={exportData}><Download size={14}/> Export</button></section>
    <section className="settings-card"><div className="settings-card-icon"><KeyRound size={18}/></div><div><h2>Encrypted backup</h2><p>Create an AES-256-GCM backup in your browser. The password never leaves this device.</p><div className="settings-inline-fields"><input type="password" value={backupPassword} onChange={e=>setBackupPassword(e.target.value)} placeholder="Backup password (8+ chars)" autoComplete="new-password"/><input type="password" value={backupConfirm} onChange={e=>setBackupConfirm(e.target.value)} placeholder="Confirm password" autoComplete="new-password"/></div></div><button disabled={busy||!backupPassword||!backupConfirm} onClick={exportEncrypted}><Download size={14}/> Secure export</button></section>
    <section className="settings-card"><div className="settings-card-icon"><Upload size={18}/></div><div><h2>Restore encrypted backup</h2><p>Import and merge a secure backup. A recovery snapshot is created before changes.</p><div className="settings-inline-fields"><input type="password" value={importPassword} onChange={e=>setImportPassword(e.target.value)} placeholder="Backup password" autoComplete="off"/><input type="file" accept="application/json,.json" disabled={busy} onChange={e=>{const file=e.target.files?.[0]; if(file) void importEncrypted(file); e.currentTarget.value='';}}/></div></div><span className="settings-status"><ShieldCheck size={13}/> Local</span></section>
    <section className="settings-card"><div className="settings-card-icon"><Undo2 size={18}/></div><div><h2>Recovery</h2><p>Destructive library clearing creates one local recovery snapshot before removal.</p></div>{canUndo&&<button onClick={undoClear}><Undo2 size={14}/> Undo clear</button>}</section>
    <section className="settings-card privacy-card"><div className="settings-card-icon"><ShieldCheck size={18}/></div><div><h2>Privacy inventory</h2><p>Afterimage currently has <b>{localKeyCount}</b> local storage entries. They stay in this browser unless you explicitly export them.</p></div><span className="settings-status"><Check size={13}/> Local only</span></section>
    <section className="settings-danger"><div><h2>Delete local memory</h2><p>A recoverable snapshot is created before this browser's memory library and context preferences are removed.</p></div>{!confirmClear?<button onClick={()=>setConfirmClear(true)}><Trash2 size={14}/> Delete everything</button>:<div className="settings-confirm"><span>Delete memory + preferences?</span><button onClick={clearAll}>Yes, delete</button><button onClick={()=>setConfirmClear(false)}>Cancel</button></div>}</section>
    <section className="settings-danger"><div><h2>Permanently erase Afterimage</h2><p>This removes every <code>afterimage:</code> local-storage entry, including recovery snapshots and signal history. It cannot be undone.</p></div>{!confirmErase?<button onClick={()=>setConfirmErase(true)}><Trash2 size={14}/> Permanently erase</button>:<div className="settings-confirm"><span>Erase all Afterimage data?</span><button onClick={eraseEverything}>Yes, erase</button><button onClick={()=>setConfirmErase(false)}>Cancel</button></div>}</section>
    {message&&<div className="settings-message" role="status">{message}</div>}
    <p className="settings-footnote">Afterimage stays quiet by default. Every future context source should be opt-in, explainable, revocable, and expiring.</p>
  </div></main>;
}
