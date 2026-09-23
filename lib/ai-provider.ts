export type AIProvider={name:string;generate:(input:string,options?:{system?:string;signal?:AbortSignal})=>Promise<string>};
export type AIExtraction={text:string;trigger?:string;why?:string;tags?:string[];confidence:number;source:'ai'};
export type AIExtractionProvider=AIProvider&{extractMemory:(input:string,options?:{signal?:AbortSignal})=>Promise<AIExtraction[]>};
export function createRuleBasedProvider():AIExtractionProvider{return{name:'local-rule-based',async generate(input){return input.trim()},async extractMemory(input){const text=input.trim();if(!text)return[];const m=text.match(/(?:when|if|before|next time|once)\\s+(.+)/i);return[{text:m?text.replace(m[0],'').trim()||text:text,trigger:m?.[0],confidence:.55,source:'ai'}]}}}
