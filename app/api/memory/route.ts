import { NextResponse } from 'next/server';
import { findConsolidationCandidates, memoryPriority, recordFeedback, type MemoryRecord, type MemoryFeedback } from '../../../lib/memory-core';
import { hybridRetrieve } from '../../../lib/hybrid-retrieval';
import { buildLocalIndex, searchVectorIndex } from '../../../lib/local-embeddings';
import { detectSensitiveContent, scrubSensitiveContent, shouldResurface } from '../../../lib/memory-governance';

export const runtime='nodejs';

export async function POST(request:Request){
  try{
    const body=await request.json() as {action?:string;memories?:MemoryRecord[];query?:string;memoryId?:string;feedback?:MemoryFeedback;text?:string};
    const memories=Array.isArray(body.memories)?body.memories:[];
    if(body.action==='search'){
      const eligible=memories.filter(m=>shouldResurface(m));
      const index=buildLocalIndex(eligible);
      const vector=searchVectorIndex(eligible,index,String(body.query||''));
      const matches=await hybridRetrieve(eligible,String(body.query||''),{provider:{name:'local-vector',search:async()=>vector}});
      return NextResponse.json({matches});
    }
    if(body.action==='feedback'){
      const updated=memories.map(m=>m.id===body.memoryId&&body.feedback?recordFeedback(m,body.feedback):m);
      return NextResponse.json({memories:updated});
    }
    if(body.action==='consolidation') return NextResponse.json({candidates:findConsolidationCandidates(memories)});
    if(body.action==='priorities') return NextResponse.json({memories:[...memories].map(m=>({...m,priority:memoryPriority(m)})).sort((a,b)=>b.priority-a.priority)});
    if(body.action==='privacy-check'){
      const text=String(body.text||'');
      const findings=detectSensitiveContent(text);
      return NextResponse.json({safe:findings.length===0,findings,scrubbed:findings.length?scrubSensitiveContent(text):text});
    }
    return NextResponse.json({error:'Unsupported action. Use search, feedback, consolidation, priorities, or privacy-check.'},{status:400});
  }catch{return NextResponse.json({error:'Invalid request.'},{status:400});}
}
