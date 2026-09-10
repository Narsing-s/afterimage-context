import type { ContextMemory } from './context-engine';

export type GraphRelation = 'shared-context' | 'shared-condition' | 'same-pattern';
export type GraphEdge = { from: string; to: string; strength: number; relation: GraphRelation };

const STOP = new Set(['the','and','that','this','with','from','have','your','you','for','are','was','were','when','what','why','how','into','just','again','about','then','than','still','next','last','today','tomorrow','because','already','another','keep','keeps','i','a','an','to','of','in','on','is','it','my','me','we','our','should','show','remind','remember']);
function words(value: string) { return new Set((value.toLowerCase().match(/[a-z0-9₹]+/g) ?? []).filter(x => x.length > 2 && !STOP.has(x))); }

/** Builds a small, deterministic personal context graph without sending memory text anywhere. */
export function buildContextGraph(memories: ContextMemory[]): GraphEdge[] {
  const active = memories.filter(m => m.state !== 'outdated' && m.state !== 'archived');
  const edges: GraphEdge[] = [];
  for (let i = 0; i < active.length; i++) for (let j = i + 1; j < active.length; j++) {
    const a = active[i], b = active[j];
    const aw = words(a.text), bw = words(b.text), at = words(a.trigger ?? ''), bt = words(b.trigger ?? '');
    const context = [...aw].filter(x => bw.has(x));
    const condition = [...at].filter(x => bt.has(x));
    const pattern = a.mode === 'pattern' && b.mode === 'pattern' ? context : [];
    const relation: GraphRelation | null = condition.length ? 'shared-condition' : pattern.length >= 1 ? 'same-pattern' : context.length >= 2 ? 'shared-context' : null;
    if (!relation) continue;
    const base = relation === 'shared-condition' ? condition.length / Math.max(1, Math.min(at.size, bt.size)) : context.length / Math.max(1, Math.min(aw.size, bw.size));
    if (base >= 0.25) edges.push({ from: a.id, to: b.id, strength: Math.min(1, base), relation });
  }
  return edges.sort((a, b) => b.strength - a.strength);
}

export function graphClusters(memories: ContextMemory[], edges: GraphEdge[]) {
  const parent = new Map<string,string>();
  const find = (id:string):string => { const p=parent.get(id); if (!p || p===id) { parent.set(id,id); return id; } const r=find(p); parent.set(id,r); return r; };
  const union=(a:string,b:string)=>{const ra=find(a),rb=find(b);if(ra!==rb)parent.set(rb,ra)};
  memories.forEach(m=>parent.set(m.id,m.id)); edges.forEach(e=>union(e.from,e.to));
  const groups=new Map<string,ContextMemory[]>(); memories.forEach(m=>{const key=find(m.id);const list=groups.get(key)||[];list.push(m);groups.set(key,list)});
  return [...groups.values()].filter(g=>g.length>1).sort((a,b)=>b.length-a.length);
}
