import {readFileSync,existsSync,openSync,writeSync,fsyncSync,closeSync,lstatSync} from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
export const PROFILE=JSON.parse(readFileSync(new URL('./profile.json',import.meta.url),'utf8'));
export const OLD='Use only when an interactive UI helps. ';
export const NEW="Use proactively when an interactive UI helps: collecting structured multi-field input, presenting review/validation/benchmark results, or showing diffs, charts, tables, side-by-side comparisons, or local artifacts that benefit from inspection or interaction. Prefer it when inspection or interaction materially improves the user's next action; skip it for pure prose answers or trivial confirmations. ";
export const SCENARIOS=JSON.parse(readFileSync(new URL('./scenarios.json',import.meta.url),'utf8')) as {id:string;request:string;positive:boolean}[];
export const hash=(value:string|Buffer)=>createHash('sha256').update(value).digest('hex');
export const canonical=(value:any):string=>JSON.stringify(value,(_key,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b))):v);
export function observeAssistant(record:any,message:any):void{
 if(message.role!=='assistant')return;
 if(message.stopReason==='length'){record.outcome='output_truncated';return;}
 if(message.stopReason==='error'||message.stopReason==='aborted'){record.outcome='provider_unknown';return;}
 const calls=(message.content??[]).filter((c:any)=>c.type==='toolCall');
 if(calls.some((c:any)=>c.name==='a2ui_render'))record.renderRequested=true;
 if(!calls.length)record.outcome=record.preparation?'ui_preparation_only':'text_only';
}
export function descriptionForArm(description:string,arm:string):string{
 assert.ok(arm==='A'||arm==='B','arm identity');assert.equal(description.split(NEW).length,2,'exact one new clause');
 return arm==='A'?description.replace(NEW,OLD):description;
}
export function normalizedBody(body:any):any{
 const copy=structuredClone(body);const tools=copy.tools?.filter((t:any)=>t.function?.name==='a2ui_render');assert.equal(tools?.length,1,'one render tool');
 const desc=tools[0].function.description;assert.equal(typeof desc,'string');
 if(desc.includes(NEW))tools[0].function.description=descriptionForArm(desc,'A');else assert.equal(desc.split(OLD).length,2,'one old clause');
 return copy;
}
export class PilotBudget{
 readonly path:string;readonly mode:string;
 constructor(path:string,mode:string){this.path=path;this.mode=mode;assert.ok(['offline','live'].includes(mode));}
 rows():any[]{
  if(!existsSync(this.path))return [];assert.ok(lstatSync(this.path).isFile()&&!lstatSync(this.path).isSymbolicLink(),'ordinary journal');
  const rows=readFileSync(this.path,'utf8').trim().split('\n').filter(Boolean).map(line=>JSON.parse(line));assert.ok(rows.length<=36,'batch budget');
  rows.forEach((r,i)=>{assert.equal(r.index,i+1);assert.ok(PROFILE.order.includes(r.episode));assert.equal(r.mode,this.mode);assert.equal(r.model,PROFILE.model.id);assert.equal(r.endpoint,PROFILE.model.baseUrl+'/chat/completions');});
  for(const id of PROFILE.order)assert.ok(rows.filter(r=>r.episode===id).length<=3,'episode budget');return rows;
 }
 admit(id:string,url:string,model:any,body:any):void{
  assert.ok(PROFILE.order.includes(id),'episode identity');assert.equal(url,PROFILE.model.baseUrl+'/chat/completions','endpoint identity');
  for(const key of ['provider','id','baseUrl'])assert.equal(model[key],PROFILE.model[key],'model identity');
  assert.equal(body.model,PROFILE.model.id,'body model identity');assert.equal(body.max_tokens??body.max_completion_tokens,1536,'output cap');assert.equal(body.parallel_tool_calls,false,'sequential tools');assert.equal(body.tool_choice,'auto','auto choice');assert.ok(Buffer.byteLength(JSON.stringify(body))<=98304,'input body budget');
  const rows=this.rows();assert.ok(rows.length<36&&rows.filter(r=>r.episode===id).length<3,'request budget');
  const entry={index:rows.length+1,episode:id,mode:this.mode,model:PROFILE.model.id,endpoint:url,bodySHA256:hash(canonical(body))};
  const fd=openSync(this.path,'a',0o600);try{writeSync(fd,JSON.stringify(entry)+'\n');fsyncSync(fd);}finally{closeSync(fd);}
 }
}
export function summarize(results:any[]):any{
 const positive:any={A:{requested:0,attempted:0,committed:0},B:{requested:0,attempted:0,committed:0}},falsePositives:any={A:0,B:0};
 for(const r of results){const [id,arm]=r.id.split('-');if(!['A','B'].includes(arm))continue;if(id.startsWith('T')){for(const [field,key]of [['renderRequested','requested'],['renderAttempted','attempted'],['renderCommitted','committed']])positive[arm][key]+=r[field]===true?1:0;}if(id.startsWith('N')&&r.renderRequested===true)falsePositives[arm]++;}
 const closed=(r:any)=>r&&['text_only','render_schema','render_compile','render_committed'].includes(r.outcome)&&!r.harnessFailure;
 let completePairs=0,improvementPairs=0,reversePairs=0;for(const s of SCENARIOS){const a=results.find(r=>r.id===s.id+'-A'),b=results.find(r=>r.id===s.id+'-B');if(closed(a)&&closed(b)){completePairs++;if(s.positive){if(!a.renderRequested&&b.renderRequested)improvementPairs++;if(a.renderRequested&&!b.renderRequested)reversePairs++;}}}
 return{plannedEpisodes:12,positive,falsePositives,completePairs,improvementPairs,reversePairs,conclusion:completePairs<6?'incomplete-pairs':improvementPairs>=2&&reversePairs===0&&falsePositives.B<=falsePositives.A?'direction-only':'no-clear-gain',results};
}
