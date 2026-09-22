import type { ContextMemory } from './context-engine';

export type MemorySourceKind = 'manual'|'browser'|'calendar'|'document'|'github'|'ai'|'agent'|'import';
export type MemoryFeedback = 'useful'|'not-useful'|'wrong-context'|'outdated'|'too-frequent'|'important';
export type MemoryEvidence = { id:string; kind:MemorySourceKind; summary:string; at:string; confidence?:number };
export type MemoryEventKind = 'created'|'observed'|'confirmed'|'edited'|'feedback'|'resurfaced'|'superseded'|'outdated'|'archived'|'restored';

export type MemoryProvenance = {
  source: MemorySourceKind;
  capturedAt: string;
  evidence?: MemoryEvidence[];
  agent?: { id:string; name?:string };
};

export type MemoryRecord = ContextMemory & {
  importance?: 'low'|'normal'|'important'|'critical';
  provenance?: MemoryProvenance;
  feedback?: Partial<Record<MemoryFeedback, number>>;
  supersedes?: string;
  supersededBy?: string;
  tags?: string[];
};

export type MemoryEvent = {
  id:string;
  memoryId:string;
  kind:MemoryEventKind;
  at:string;
  summary?:string;
  metadata?:Record<string,string|number|boolean>;
};

export type ConsolidationCandidate = {
  ids:string[];
  similarity:number;
  reason:string;
  suggestedText:string;
};

const STOP=new Set(['the','and','that','this','with','from','have','your','you','for','are','was','were','when','what','why','how','into','just','again','about','then','than','still','next','last','today','tomorrow','because','already','another','keep','keeps','i','a','an','to','of','in','on','is','it','my','me','we','our','should','show','remind','remember']);
function words(value:string){return [...new Set((value.toLowerCase().match(/[a-z0-9₹]+/g)||[]).filter(x=>x.length>2&&!STOP.has(x)))];}
function similarity(a:string,b:string){const A=new Set(words(a)),B=new Set(words(b));if(!A.size||!B.size)return 0;const overlap=[...A].filter(x=>B.has(x)).length;return overlap/Math.max(A.size,B.size);}

export function recordFeedback(memory:MemoryRecord, feedback:MemoryFeedback):MemoryRecord{
  const counts={...(memory.feedback||{})};
  counts[feedback]=(counts[feedback]||0)+1;
  const confidence=Math.max(0.05,Math.min(1,(memory.confidence??0.7)+(feedback==='useful'||feedback==='important'?0.04:feedback==='not-useful'||feedback==='wrong-context'?-0.08:feedback==='outdated'?-0.15:-0.05)));
  const sensitivity=feedback==='too-frequent'?'quiet':feedback==='important'?'eager':memory.sensitivity;
  return {...memory,feedback:counts,confidence,sensitivity};
}

export function memoryPriority(memory:MemoryRecord):number{
  const importance={low:0.05,normal:0.15,important:0.3,critical:0.45}[memory.importance||'normal'];
  const useful=(memory.feedback?.useful||0)*0.04;
  const negative=((memory.feedback?.['not-useful']||0)+(memory.feedback?.['wrong-context']||0))*0.06;
  return Math.max(0,Math.min(1,(memory.confidence??0.7)+importance+useful-negative));
}

export function findConsolidationCandidates(memories:MemoryRecord[],threshold=0.62):ConsolidationCandidate[]{
  const result:ConsolidationCandidate[]=[];
  for(let i=0;i<memories.length;i++) for(let j=i+1;j<memories.length;j++){
    const a=memories[i],b=memories[j]; if(a.state==='outdated'||b.state==='outdated')continue;
    const similarityScore=similarity(`${a.text} ${a.trigger||''}`,`${b.text} ${b.trigger||''}`);
    if(similarityScore>=threshold) result.push({ids:[a.id,b.id],similarity:similarityScore,reason:'These memories share substantial local vocabulary and may represent the same topic.',suggestedText:`${a.text} ${b.text}`});
  }
  return result.sort((a,b)=>b.similarity-a.similarity);
}

export function consolidate(memories:MemoryRecord[],ids:string[],approvedText:string):{memories:MemoryRecord[];events:MemoryEvent[]}{
  const selected=memories.filter(m=>ids.includes(m.id)); if(selected.length<2) return {memories,events:[]};
  const now=new Date().toISOString(); const id=`memory-${Date.now()}`;
  const merged:MemoryRecord={...selected[0],id,text:approvedText.trim(),createdAt:selected.reduce((x,m)=>x<m.createdAt?x:m.createdAt,now),confidence:Math.max(...selected.map(m=>m.confidence??0.7)),provenance:{source:'ai',capturedAt:now,evidence:selected.flatMap(m=>m.provenance?.evidence||[])},tags:[...new Set(selected.flatMap(m=>m.tags||[]))]};
  const events:MemoryEvent[]=[...selected.map(m=>({id:`${id}:supersedes:${m.id}`,memoryId:m.id,kind:'superseded' as const,at:now,summary:`Superseded by consolidated memory ${id}`})),{id:`${id}:created`,memoryId:id,kind:'created' as const,at:now,summary:'Created from an explicitly approved consolidation.'}];
  return {memories:[...memories.filter(m=>!ids.includes(m.id)),merged],events};
}

export function timelineEvents(memory:MemoryRecord,events:MemoryEvent[]=[]):MemoryEvent[]{
  return events.filter(e=>e.memoryId===memory.id).sort((a,b)=>a.at.localeCompare(b.at));
}
