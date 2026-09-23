'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Archive, Check, Clock3, Download, KeyRound, LockKeyhole, Pencil, ShieldCheck, Trash2, UnlockKeyhole, Upload, X } from 'lucide-react';
import { ContextMemory, MemoryState, MemorySensitivity, snoozeMemory } from '../../lib/context-engine';
import { saveRecovery } from '../../lib/recovery';
import { clearVaultStorage, enableMemoryVault, getVaultStatus, isVaultUnlocked, loadMemorySnapshot, lockMemoryVault, recoverMemoryVault, saveMemorySnapshot, unlockMemoryVault, rotateVaultPassphrase, configureAutoLock } from '../../lib/encrypted-memory-store';

type Memory = ContextMemory;
const STORAGE_KEY = 'afterimage:memories:v2';

function loadLegacy(): Memory[] {
  try {
    const raw=localStorage.getItem(STORAGE_KEY)||localStorage.getItem('afterimage:memories:v1')||localStorage.getItem('afterimage:memories')||'[]';
    const parsed=JSON.parse(raw);
    if(!Array.isArray(parsed)) return [];
    return parsed.filter(x=>x&&typeof x.id==='string'&&typeof x.text==='string').map(x=>({...x,state:x.state||'active',confidence:typeof x.confidence==='number'?x.confidence:.7,resurfacedCount:typeof x.resurfacedCount==='number'?x.resurfacedCount:0,sensitivity:['quiet','balanced','eager'].includes(x.sensitivity)?x.sensitivity:'balanced'}));
  } catch { return []; }
}

function downloadText(filename:string, content:string) {
  const url=URL.createObjectURL(new Blob([content],{type:'application/json'}));
  const a=document.createElement('a'); a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url);
}

export default function MemoryVault() {
  const [memories,setMemories]=useState<Memory[]>([]);
  const [editing,setEditing]=useState<string|null>(null);
  const [draft,setDraft]=useState({text:'',trigger:'',why:'',sensitivity:'balanced' as MemorySensitivity});
  const [message,setMessage]=useState('');
  const [vaultEnabled,setVaultEnabled]=useState(false);
  const [unlocked,setUnlocked]=useState(false);
  const [passphrase,setPassphrase]=useState('');
  const [confirmPassphrase,setConfirmPassphrase]=useState('');
  const [recoveryInput,setRecoveryInput]=useState('');
  const [recoveryKey,setRecoveryKey]=useState('');
  const [busy,setBusy]=useState(false);
  const [recoveryConfirmed,setRecoveryConfirmed]=useState(false);
  const [currentPassphrase,setCurrentPassphrase]=useState('');
  const [newPassphrase,setNewPassphrase]=useState('');

  async function refresh() {
    try {
      const status=await getVaultStatus();
      setVaultEnabled(status.enabled); setUnlocked(status.unlocked);
      if(status.enabled && status.unlocked) {
        const snapshot=await loadMemorySnapshot(); setMemories((snapshot?.memories||[]) as Memory[]);
      } else if(!status.enabled) setMemories(loadLegacy());
    } catch { setUnlocked(false); }
  }

  useEffect(()=>{ void refresh(); },[]);

  async function setupVault() {
    if(passphrase.length<12){setMessage('Use a vault passphrase with at least 12 characters.');return}
    if(passphrase!==confirmPassphrase){setMessage('Vault passphrases do not match.');return}
    setBusy(true);
    try {
      const snapshot=await loadMemorySnapshot() || {id:'current' as const,formatVersion:2,exportedAt:new Date().toISOString(),updatedAt:new Date().toISOString(),memories,events:[]};
      const key=await enableMemoryVault(passphrase,snapshot);
      setRecoveryKey(key); setVaultEnabled(true); setUnlocked(true); setPassphrase(''); setConfirmPassphrase('');
      setMessage('Memory Vault is enabled. Save the recovery key before leaving this page.');
    } catch(e){setMessage(e instanceof Error?e.message:'Unable to enable Memory Vault.')}
    finally{setBusy(false)}
  }

  async function unlock() {
    if(!passphrase){setMessage('Enter your vault passphrase.');return}
    setBusy(true);
    try { const snapshot=await unlockMemoryVault(passphrase); setMemories((snapshot.memories||[]) as Memory[]); setUnlocked(true); setPassphrase(''); setMessage('Vault unlocked on this device session.'); }
    catch { setMessage('The passphrase was not accepted, or the encrypted vault is corrupted. Your data was not changed.'); }
    finally{setBusy(false)}
  }

  async function recover() {
    if(!recoveryInput.trim()){setMessage('Enter your recovery key.');return}
    setBusy(true);
    try { const snapshot=await recoverMemoryVault(recoveryInput); setMemories((snapshot.memories||[]) as Memory[]); setUnlocked(true); setRecoveryInput(''); setMessage('Vault recovered. Set a new passphrase in the vault controls after verifying your memories.'); }
    catch { setMessage('Recovery key was not accepted, or the encrypted vault is corrupted.'); }
    finally{setBusy(false)}
  }

  function lock() { lockMemoryVault(); setUnlocked(false); setMessage('Memory Vault locked. The encrypted data remains on this device.'); }
  async function rotatePassphrase(){if(currentPassphrase.length<12||newPassphrase.length<12){setMessage('Both passphrases must be at least 12 characters.');return}setBusy(true);try{const nextRecovery=await rotateVaultPassphrase(currentPassphrase,newPassphrase);setRecoveryKey(nextRecovery);setCurrentPassphrase('');setNewPassphrase('');setMessage('Passphrase rotated. Save the new recovery key shown below.');}catch(e){setMessage(e instanceof Error?e.message:'Unable to rotate passphrase.')}finally{setBusy(false)}}

  async function save(next:Memory[]) {
    setMemories(next);
    if(vaultEnabled) { await saveMemorySnapshot(next); }
    else { localStorage.setItem(STORAGE_KEY,JSON.stringify(next)); await saveMemorySnapshot(next).catch(()=>{}); }
  }

  function edit(m:Memory){setEditing(m.id);setDraft({text:m.text,trigger:m.trigger||'',why:m.why||'',sensitivity:m.sensitivity||'balanced'});}
  async function saveEdit(){if(!editing||!draft.text.trim())return;setBusy(true);try{await save(memories.map(m=>m.id===editing?{...m,text:draft.text.trim(),trigger:draft.trigger.trim()||undefined,why:draft.why.trim()||undefined,sensitivity:draft.sensitivity}:m));setEditing(null);setMessage('Memory updated inside the vault.')}catch(e){setMessage(e instanceof Error?e.message:'Unable to save memory.')}finally{setBusy(false)}}
  async function forgetForever(id:string){saveRecovery(memories,'forget memory');try{await save(memories.filter(m=>m.id!==id));setMessage('Memory forgotten. A local recovery snapshot was created.')}catch(e){setMessage(e instanceof Error?e.message:'Unable to forget memory.')}}
  async function snooze(id:string){try{await save(memories.map(m=>m.id===id?{...m,snoozedUntil:snoozeMemory(m,30).snoozedUntil}:m));setMessage('Memory quieted for 30 days.')}catch(e){setMessage(e instanceof Error?e.message:'Unable to update memory.')}}
  async function archive(id:string){saveRecovery(memories,'archive or restore memory');try{await save(memories.map(m=>m.id===id?{...m,state:(m.state==='archived'?'active':'archived') as MemoryState}:m));setMessage('Memory state changed.')}catch(e){setMessage(e instanceof Error?e.message:'Unable to update memory.')}}
  function exportAll(){downloadText('afterimage-memories.json',JSON.stringify(memories,null,2));setMessage('Memory export created locally.')}
  async function importAll(file:File){try{const parsed=JSON.parse(await file.text());if(!Array.isArray(parsed))throw new Error('The file must contain an array of memories.');const valid=parsed.filter(x=>x&&typeof x.id==='string'&&typeof x.text==='string').map(x=>({...x,state:x.state||'active',confidence:typeof x.confidence==='number'?x.confidence:.7,resurfacedCount:typeof x.resurfacedCount==='number'?x.resurfacedCount:0,sensitivity:['quiet','balanced','eager'].includes(x.sensitivity)?x.sensitivity:'balanced'})) as Memory[];if(!valid.length&&parsed.length)throw new Error('No valid memories were found.');const byId=new Map(memories.map(m=>[m.id,m]));valid.forEach(m=>byId.set(m.id,m));saveRecovery(memories,'memory vault import');await save([...byId.values()].slice(0,100));setMessage(`Imported ${valid.length} valid memor${valid.length===1?'y':'ies'}; duplicates were merged by ID.`)}catch(e){setMessage(e instanceof Error?e.message:'Import failed.')}}
  const active=useMemo(()=>memories.filter(m=>m.state!=='archived'),[memories]);

  if(vaultEnabled&&!unlocked) return <VaultUnlock passphrase={passphrase} setPassphrase={setPassphrase} recoveryInput={recoveryInput} setRecoveryInput={setRecoveryInput} onUnlock={unlock} onRecover={recover} busy={busy} message={message}/>;

  return <main style={{minHeight:'100vh',background:'#08090b',color:'#f4f4f5',padding:'24px',fontFamily:'system-ui,sans-serif'}}><div style={{maxWidth:900,margin:'0 auto'}}>
    <Link href="/" style={{color:'#aaa',textDecoration:'none',display:'inline-flex',gap:8,alignItems:'center'}}><ArrowLeft size={15}/> Back to Afterimage</Link>
    <header style={{margin:'42px 0 28px'}}><div style={{letterSpacing:'.16em',fontSize:11,color:'#888'}}>AFTERIMAGE / MEMORY VAULT</div><h1 style={{fontSize:'clamp(32px,7vw,58px)',margin:'8px 0'}}>Your memory, your control.</h1><p style={{color:'#aaa',maxWidth:680}}>Protect the memory layer with browser-native encryption. Your passphrase and recovery key never leave this device.</p></header>

    {!vaultEnabled ? <section style={{...card,borderColor:'#4b5b2e',marginBottom:20}}><div style={{display:'flex',gap:12,alignItems:'flex-start'}}><ShieldCheck size={22} color="#d7ff62"/><div style={{flex:1}}><h2 style={{margin:'0 0 8px'}}>Enable encrypted Memory Vault</h2><p style={muted}>This converts the current local memory snapshot into an AES-256-GCM encrypted IndexedDB payload. Nothing is uploaded. Existing local memories are removed from plaintext localStorage only after encryption succeeds.</p><div style={{display:'grid',gap:9,maxWidth:620}}><input type="password" value={passphrase} onChange={e=>setPassphrase(e.target.value)} style={field} placeholder="New vault passphrase (12+ characters)" autoComplete="new-password"/><input type="password" value={confirmPassphrase} onChange={e=>setConfirmPassphrase(e.target.value)} style={field} placeholder="Confirm vault passphrase" autoComplete="new-password"/></div><button disabled={busy} onClick={()=>void setupVault()} style={{...buttonStyle,marginTop:12}}><LockKeyhole size={15}/> {busy?'Encrypting…':'Enable Memory Vault'}</button></div></div></section> : null}

    {recoveryKey && <section style={{...card,borderColor:'#d7ff62',marginBottom:20}}><div style={{display:'flex',gap:12,alignItems:'flex-start'}}><KeyRound size={22} color="#d7ff62"/><div><h2 style={{margin:'0 0 8px'}}>Your recovery key</h2><p style={muted}>This is the only recovery credential Afterimage can use if you forget the vault passphrase. It is generated locally and is not stored as plaintext by Afterimage.</p><code style={{display:'block',padding:14,background:'#090a0c',borderRadius:10,wordBreak:'break-all',fontSize:16}}>{recoveryKey}</code><div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:12}}><button style={buttonStyle} onClick={()=>navigator.clipboard?.writeText(recoveryKey)}><Check size={14}/> Copy</button><button style={buttonStyle} onClick={()=>downloadText('afterimage-recovery-key.txt',recoveryKey)}><Download size={14}/> Save file</button></div><label style={{display:'flex',gap:8,alignItems:'center',marginTop:14,color:'#bbb'}}><input type="checkbox" checked={recoveryConfirmed} onChange={e=>setRecoveryConfirmed(e.target.checked)}/> I saved the recovery key somewhere safe.</label>{recoveryConfirmed&&<button style={{...buttonStyle,marginTop:10}} onClick={()=>{setRecoveryKey('');setRecoveryConfirmed(false);setMessage('Recovery key reminder closed. Keep your saved key private.')}}>Continue</button>}</div></div></section>}

    {vaultEnabled && <section style={{...card,marginBottom:20}}><div style={{display:'flex',gap:12,alignItems:'center'}}><ShieldCheck size={20} color="#d7ff62"/><div style={{flex:1}}><b>Memory Vault is active</b><p style={{...muted,margin:'5px 0 0'}}>Encrypted at rest in IndexedDB · unlocked for this browser session.</p></div><button onClick={lock} style={buttonStyle}><LockKeyhole size={14}/> Lock now</button></div></section>}
    {vaultEnabled && <section style={{...card,marginBottom:20}}><h2>Vault controls</h2><p style={muted}>Auto-lock protects an unlocked browser session. Default is 30 minutes.</p><button style={buttonStyle} onClick={()=>{configureAutoLock(30);setMessage('Auto-lock set to 30 minutes. It applies to this browser session.')}}>Set 30-minute auto-lock</button><div style={{display:'grid',gap:9,maxWidth:620,marginTop:16}}><input type="password" value={currentPassphrase} onChange={e=>setCurrentPassphrase(e.target.value)} style={field} placeholder="Current passphrase"/><input type="password" value={newPassphrase} onChange={e=>setNewPassphrase(e.target.value)} style={field} placeholder="New passphrase (12+ characters)"/><button disabled={busy||!unlocked} style={buttonStyle} onClick={()=>void rotatePassphrase()}><KeyRound size={14}/> Rotate passphrase</button></div></section>}

    <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:24}}><button onClick={exportAll} style={buttonStyle}><Download size={15}/> Export</button><label style={buttonStyle}><Upload size={15}/> Import JSON<input hidden type="file" accept="application/json,.json" onChange={e=>{const f=e.target.files?.[0];if(f)void importAll(f);e.currentTarget.value='';}}/></label><span style={{color:'#777',alignSelf:'center',fontSize:13}}>{memories.length} stored · {active.length} active · {vaultEnabled?'encrypted':'plaintext local mode'}</span></div>
    {message&&<div role="status" style={{padding:14,border:'1px solid #292929',borderRadius:12,marginBottom:18,color:'#c9c9c9'}}>{message}</div>}
    {memories.length===0?<section style={card}><b>No memories yet.</b><p style={muted}>Create one on the home page and it will appear here.</p><Link href="/" style={buttonStyle}>＋ Create memory</Link></section>:<div style={{display:'grid',gap:14}}>{memories.map(m=><article key={m.id} style={{...card,opacity:m.state==='archived'?.68:1}}>
      {editing===m.id?<div style={{display:'grid',gap:10}}><textarea value={draft.text} onChange={e=>setDraft({...draft,text:e.target.value})} style={field} aria-label="Edit memory"/><input value={draft.trigger} onChange={e=>setDraft({...draft,trigger:e.target.value})} style={field} placeholder="Return condition" aria-label="Edit return condition"/><input value={draft.why} onChange={e=>setDraft({...draft,why:e.target.value})} style={field} placeholder="Why it matters" aria-label="Edit why it matters"/><select value={draft.sensitivity} onChange={e=>setDraft({...draft,sensitivity:e.target.value as MemorySensitivity})} style={field} aria-label="Memory resurfacing sensitivity"><option value="quiet">Quiet — only strong context matches</option><option value="balanced">Balanced — recommended</option><option value="eager">Eager — surface with lighter context matches</option></select><div style={actions}><button disabled={busy} onClick={()=>void saveEdit()} style={buttonStyle}><Check size={14}/> Save</button><button onClick={()=>setEditing(null)} style={buttonStyle}><X size={14}/> Cancel</button></div></div>:<>
        <div style={{display:'flex',justifyContent:'space-between',gap:12}}><span style={{fontSize:11,letterSpacing:'.12em',color:'#888'}}>{m.mode.toUpperCase()} · {(m.state||'active').toUpperCase()}</span><span style={{fontSize:12,color:'#666'}}>{new Date(m.createdAt).toLocaleString()}</span></div><p style={{fontSize:18,lineHeight:1.5}}>{m.text}</p>{m.trigger&&<p style={muted}><b>Returns when:</b> {m.trigger}</p>}{m.why&&<p style={muted}><b>Why it matters:</b> {m.why}</p>}<p style={muted}>Sensitivity <b>{m.sensitivity||'balanced'}</b> · Confidence {Math.round((m.confidence??.7)*100)}% · Resurfaced {m.resurfacedCount??0}×{m.snoozedUntil?` · Quiet until ${new Date(m.snoozedUntil).toLocaleDateString()}`:''}</p>
        <div style={actions}><button onClick={()=>edit(m)} style={buttonStyle}><Pencil size={14}/> Edit</button><button onClick={()=>void snooze(m.id)} style={buttonStyle}><Clock3 size={14}/> Quiet 30 days</button><button onClick={()=>void archive(m.id)} style={buttonStyle}><Archive size={14}/> {m.state==='archived'?'Restore':'Archive'}</button><button onClick={()=>void forgetForever(m.id)} style={{...buttonStyle,borderColor:'#542b2b',color:'#ff9b9b'}}><Trash2 size={14}/> Forget forever</button></div>
      </>}</article>)}</div>}
    <footer style={{margin:'40px 0',color:'#555',fontSize:12}}>Local-first · AES-256-GCM vault · No server sync · You control the key.</footer>
  </div></main>;
}

function VaultUnlock({passphrase,setPassphrase,recoveryInput,setRecoveryInput,onUnlock,onRecover,busy,message}:{passphrase:string;setPassphrase:(v:string)=>void;recoveryInput:string;setRecoveryInput:(v:string)=>void;onUnlock:()=>void;onRecover:()=>void;busy:boolean;message:string}) {
 return <main style={{minHeight:'100vh',background:'#08090b',color:'#f4f4f5',padding:'24px',fontFamily:'system-ui,sans-serif'}}><div style={{maxWidth:620,margin:'10vh auto'}}><Link href="/" style={{color:'#aaa',textDecoration:'none',display:'inline-flex',gap:8,alignItems:'center'}}><ArrowLeft size={15}/> Back to Afterimage</Link><section style={{...card,marginTop:35}}><LockKeyhole size={26} color="#d7ff62"/><h1 style={{fontSize:'clamp(34px,7vw,58px)',margin:'12px 0'}}>Memory Vault locked.</h1><p style={muted}>Your memories are encrypted on this device. Unlock them with your passphrase, or use the recovery key you saved when the vault was created.</p><input type="password" value={passphrase} onChange={e=>setPassphrase(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')onUnlock()}} style={field} placeholder="Vault passphrase" autoComplete="current-password"/><button disabled={busy} onClick={onUnlock} style={{...buttonStyle,marginTop:10}}><UnlockKeyhole size={14}/> {busy?'Unlocking…':'Unlock vault'}</button><div style={{borderTop:'1px solid #252525',marginTop:24,paddingTop:22}}><b>Recovery key</b><p style={muted}>Use this only if you cannot unlock with the passphrase.</p><input value={recoveryInput} onChange={e=>setRecoveryInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')onRecover()}} style={field} placeholder="AFTERIMAGE-…"/><button disabled={busy} onClick={onRecover} style={{...buttonStyle,marginTop:10}}><KeyRound size={14}/> {busy?'Recovering…':'Recover vault'}</button></div>{message&&<div role="status" style={{marginTop:16,padding:12,border:'1px solid #332f2f',borderRadius:10,color:'#aaa'}}>{message}</div>}</section></div></main>
}

const card:React.CSSProperties={border:'1px solid #252525',background:'#101114',borderRadius:16,padding:20};
const muted:React.CSSProperties={color:'#999',lineHeight:1.6};
const actions:React.CSSProperties={display:'flex',flexWrap:'wrap',gap:8};
const buttonStyle:React.CSSProperties={display:'inline-flex',alignItems:'center',gap:7,border:'1px solid #303030',background:'#151619',color:'#eee',borderRadius:10,padding:'9px 12px',cursor:'pointer',textDecoration:'none',fontSize:13};
const field:React.CSSProperties={width:'100%',boxSizing:'border-box',border:'1px solid #333',background:'#090a0c',color:'#fff',borderRadius:10,padding:12,font:'inherit'};
