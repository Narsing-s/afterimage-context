import { NextResponse } from 'next/server';
import { findConsolidationCandidates, memoryPriority, recordFeedback, type MemoryRecord, type MemoryFeedback } from '../../../lib/memory-core';
import { hybridRetrieve } from '../../../lib/hybrid-retrieval';

export const runtime='nodejs';

export async function POST(request:Request){
  try{
    const body=await request.json() as {action?:string;memories?:MemoryRecord[];query?:string;memoryId?:string;feedback?:MemoryFeedback};
    const memories=Array.isArray(body.memories)?body.memories:[];
    if(body.action==='search') return NextResponse.json({matches:await hybridRetrieve(memories,String(body.query||''))});
    if(body.action==='feedback'){
      const updated=memories.map(m=>m.id===body.memoryId&&body.feedback?recordFeedback(m,body.feedback):m);
      return NextResponse.json({memories:updated});
    }
    if(body.action==='consolidation') return NextResponse.json({candidates:findConsolidationCandidates(memories)});
    if(body.action==='priorities') return NextResponse.json({memories:[...memories].map(m=>({...m,priority:memoryPriority(m)})).sort((a,b)=>b.priority-a.priority)});
    return NextResponse.json({error:'Unsupported action. Use search, feedback, consolidation, or priorities.'},{status:400});
  }catch{return NextResponse.json({error:'Invalid request.'},{status:400});}
}
