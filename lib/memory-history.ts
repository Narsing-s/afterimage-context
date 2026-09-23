import type {MemoryEvent,MemoryRecord} from './memory-core';
export type MemoryVersion={id:string;memoryId:string;version:number;at:string;snapshot:MemoryRecord;reason:string};
export function appendMemoryVersion(history:MemoryVersion[],memory:MemoryRecord,reason:string){const n=history.filter(v=>v.memoryId===memory.id).length;return[...history,{id:'version-'+memory.id+'-'+(n+1),memoryId:memory.id,version:n+1,at:new Date().toISOString(),snapshot:structuredClone(memory),reason}]}
export function latestVersion(history:MemoryVersion[],id:string){return history.filter(v=>v.memoryId===id).sort((a,b)=>b.version-a.version)[0]}
export function revertMemory(history:MemoryVersion[],id:string,version:number){const v=history.find(x=>x.memoryId===id&&x.version===version);if(!v)throw new Error('Memory version was not found.');return structuredClone(v.snapshot)}
export function supersedeEvents(events:MemoryEvent[],oldIds:string[],newId:string){const at=new Date().toISOString();return[...events,...oldIds.map(id=>({id:'supersede-'+id+'-'+newId,memoryId:id,kind:'superseded' as const,at,summary:'Superseded by '+newId,metadata:{supersededBy:newId}}))]}
