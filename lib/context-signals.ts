export type SignalKind = 'browser' | 'calendar' | 'topic' | 'manual';
export type Signal = { id:string; kind:SignalKind; label:string; value:string; enabled:boolean; permission:'off'|'granted'; updatedAt:string; expiresAt?:string };
export type SignalPreferences = { browser:boolean; calendar:boolean; topics:boolean; sensitivity:number };
export const DEFAULT_SIGNAL_PREFERENCES:SignalPreferences={browser:false,calendar:false,topics:false,sensitivity:0.25};
export const DEMO_SIGNALS:Signal[]=[
 {id:'browser',kind:'browser',label:'Browser category',value:'hosting comparison',enabled:false,permission:'off',updatedAt:''},
 {id:'calendar',kind:'calendar',label:'Calendar topic',value:'planning a migration',enabled:false,permission:'off',updatedAt:''},
 {id:'topic',kind:'topic',label:'Current topic',value:'infrastructure costs',enabled:false,permission:'off',updatedAt:''}
];
export function normalizePreferences(value:unknown):SignalPreferences{if(!value||typeof value!=='object')return DEFAULT_SIGNAL_PREFERENCES;const v=value as Partial<SignalPreferences>;return {browser:Boolean(v.browser),calendar:Boolean(v.calendar),topics:Boolean(v.topics),sensitivity:Math.min(0.8,Math.max(0.05,Number(v.sensitivity??0.25)))}}
export function isSignalActive(s:Signal,now=Date.now()){return s.enabled&&s.permission==='granted'&&(!s.expiresAt||new Date(s.expiresAt).getTime()>now)}
export function buildSignalContext(signals:Signal[],manual=''){const active=signals.filter(s=>isSignalActive(s)).map(s=>`${s.label}: ${s.value}`);return [...active,manual.trim()].filter(Boolean).join(' · ')}
export function grantSignal(signal:Signal,days=30):Signal{return {...signal,enabled:true,permission:'granted',updatedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+days*86400000).toISOString()}}
export function revokeSignal(signal:Signal):Signal{return {...signal,enabled:false,permission:'off',updatedAt:new Date().toISOString(),expiresAt:undefined}}
export function expireSignals(signals:Signal[],now=Date.now()){return signals.map(s=>s.expiresAt&&new Date(s.expiresAt).getTime()<=now?{...s,enabled:false,permission:'off'}:s)}
export function isValidMemory(value:unknown){if(!value||typeof value!=='object')return false;const m=value as Record<string,unknown>;return typeof m.id==='string'&&typeof m.text==='string'&&typeof m.mode==='string'&&typeof m.createdAt==='string'}
