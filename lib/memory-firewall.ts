import type { MemoryFeedback, MemoryRecord } from './memory-core';

export type MemoryPermission = 'read'|'propose'|'write'|'update'|'consolidate'|'delete';
export type MemoryAgent = { id:string; name?:string; permissions:MemoryPermission[]; namespace?:string };
export type MemoryAuditEvent = { id:string; agentId:string; action:MemoryPermission; memoryId?:string; at:string; allowed:boolean; reason:string };
export type MemoryProposal =
  | { kind:'create'; text:string; trigger?:string; reason:string }
  | { kind:'update'; memoryId:string; patch:Partial<MemoryRecord>; reason:string }
  | { kind:'feedback'; memoryId:string; feedback:MemoryFeedback; reason:string };

export function can(agent:MemoryAgent, permission:MemoryPermission):boolean {
  return agent.permissions.includes(permission);
}
export function authorize(agent:MemoryAgent, action:MemoryPermission, memoryId?:string) {
  const allowed=can(agent,action);
  const audit:MemoryAuditEvent={
    id:'audit-'+Date.now()+'-'+Math.random().toString(36).slice(2,8),
    agentId:agent.id, action, memoryId, at:new Date().toISOString(), allowed,
    reason:allowed?'Permission granted by the agent memory policy.':'Agent lacks "'+action+'" permission.'
  };
  return {allowed,audit};
}
/** Proposals never mutate durable memory. A separate explicit operation must authorize the mutation. */
export function propose(agent:MemoryAgent, proposal:MemoryProposal) {
  const check=authorize(agent,'propose');
  return {proposal:check.allowed?proposal:undefined,audit:check.audit};
}
