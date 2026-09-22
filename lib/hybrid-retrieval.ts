import type { ContextMatch, ContextMemory } from './context-engine';
import { matchContext } from './context-engine';
import type { MemoryRecord } from './memory-core';

export type RetrievalProvider = {
  name:string;
  search:(memories:MemoryRecord[],query:string)=>Promise<Array<{id:string;score:number;reason:string}>>;
};

export type HybridRetrievalOptions = {
  lexicalWeight?:number;
  semanticWeight?:number;
  provider?:RetrievalProvider;
};

export async function hybridRetrieve(memories:MemoryRecord[],query:string,options:HybridRetrievalOptions={}):Promise<ContextMatch[]>{
  const lexicalWeight=options.lexicalWeight??0.65;
  const semanticWeight=options.semanticWeight??0.35;
  const lexical=matchContext(memories as ContextMemory[],query);
  const semantic=options.provider?await options.provider.search(memories,query):[];
  const byId=new Map<string,{memory:ContextMemory;score:number;reason:string;matchedTerms:string[]}>();
  for(const item of lexical) byId.set(item.memory.id,{memory:item.memory,score:item.score*lexicalWeight,reason:item.reason,matchedTerms:item.matchedTerms});
  for(const item of semantic){
    const existing=byId.get(item.id); const memory=memories.find(m=>m.id===item.id); if(!memory)continue;
    if(existing){existing.score+=item.score*semanticWeight;existing.reason=`${existing.reason} Semantic retrieval also supports this match.`;}
    else byId.set(item.id,{memory,score:item.score*semanticWeight,reason:item.reason,matchedTerms:[]});
  }
  return [...byId.values()].sort((a,b)=>b.score-a.score).map(x=>({...x,score:Math.min(1,x.score)}));
}
