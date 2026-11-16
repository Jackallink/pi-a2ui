import {readFileSync,existsSync,openSync,writeSync,fsyncSync,closeSync,lstatSync} from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {policyFor,PROFILE_SHA} from '../trigger-smoke/policy.ts';
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
export function contextBody(body:any,experiment=PROFILE.id):any{
 if(!policyFor(experiment).smoke&&!policyFor(experiment).paired)return normalizedBody(body);
 const tools=body.tools?.filter((t:any)=>t.function?.name==='a2ui_render');assert.equal(tools?.length,1);assert.equal(tools[0].function.description.split(NEW).length,2,'released new clause');assert.ok(!tools[0].function.description.includes(OLD),'old clause forbidden');return structuredClone(body);
}
export class PilotBudget{
 readonly path:string;readonly mode:string;readonly policy:any;
 constructor(path:string,mode:string,experiment=PROFILE.id){this.path=path;this.mode=mode;this.policy=policyFor(experiment);assert.ok(['offline','live'].includes(mode));}
 evidence():any{
  const rows:any[]=[];if(!existsSync(this.path))return{rows,complete:true,exists:false};
  try{
   assert.ok(lstatSync(this.path).isFile()&&!lstatSync(this.path).isSymbolicLink(),'ordinary journal');const bytes=readFileSync(this.path);assert.ok(bytes.length<=65536);const text=bytes.toString('utf8'),lines=text.split('\n');
   for(let i=0;i<lines.length-1;i++){
    const r=JSON.parse(lines[i]);assert.equal(r.index,rows.length+1);assert.ok(this.policy.order.includes(r.episode));if(this.policy.smoke||this.policy.paired){assert.equal(r.experiment,this.policy.experiment);assert.equal(r.profileSHA256,this.policy.profileSHA??PROFILE_SHA);}assert.equal(r.mode,this.mode);assert.equal(r.model,PROFILE.model.id);assert.equal(r.endpoint,PROFILE.model.baseUrl+'/chat/completions');assert.match(r.bodySHA256,/^[a-f0-9]{64}$/);assert.ok(rows.length<this.policy.batchRequests&&rows.filter(x=>x.episode===r.episode).length<this.policy.limit(r.episode));rows.push(r);
   }
   assert.equal(lines.at(-1),'','torn journal tail');return{rows,complete:true,exists:true};
  }catch{return{rows,complete:false,exists:true,error:'journal unreadable, invalid or torn; original bytes retained'};}
 }
 rows():any[]{const proof=this.evidence();assert.equal(proof.complete,true,'journal invalid; admission stopped');return proof.rows;}
 admit(id:string,url:string,model:any,body:any):void{
  assert.ok(this.policy.order.includes(id),'episode identity');assert.equal(url,PROFILE.model.baseUrl+'/chat/completions','endpoint identity');if(this.policy.smoke||this.policy.paired)contextBody(body,this.policy.experiment);
  for(const key of ['provider','id','baseUrl'])assert.equal(model[key],PROFILE.model[key],'model identity');
  assert.equal(body.model,PROFILE.model.id,'body model identity');assert.equal(body.max_completion_tokens,1536,'total output cap');assert.equal(body.max_tokens,undefined,'max_tokens is not the total output contract');assert.deepEqual(body.thinking,{type:'enabled'},'native thinking');assert.equal(body.reasoning_effort,'low','native effort');assert.equal(body.stream_options?.include_usage,true,'request usage');assert.equal(body.parallel_tool_calls,false,'sequential tools');assert.equal(body.tool_choice,'auto','auto choice');assert.ok(Buffer.byteLength(JSON.stringify(body))<=98304,'input body budget');
  const rows=this.rows();assert.ok(rows.length<this.policy.batchRequests&&rows.filter(r=>r.episode===id).length<this.policy.limit(id),'request budget');
  const entry={index:rows.length+1,episode:id,mode:this.mode,model:PROFILE.model.id,endpoint:url,bodySHA256:hash(canonical(body)),...((this.policy.smoke||this.policy.paired)?{experiment:this.policy.experiment,profileSHA256:this.policy.profileSHA??PROFILE_SHA}:{})};
  const bytes=Buffer.from(JSON.stringify(entry)+'\n'),fd=openSync(this.path,'a',0o600);try{assert.equal(writeSync(fd,bytes),bytes.length,'journal write incomplete; no dispatch');fsyncSync(fd);}finally{closeSync(fd);}
 }
}
export function summarize(results:any[],accounting?:{live:boolean;journal:any}):any{
 const positive:any={A:{requested:0,attempted:0,committed:0},B:{requested:0,attempted:0,committed:0}},falsePositives:any={A:0,B:0};
 for(const r of results){const [id,arm]=r.id.split('-');if(!['A','B'].includes(arm))continue;if(id.startsWith('T')){for(const [field,key]of [['renderRequested','requested'],['renderAttempted','attempted'],['renderCommitted','committed']])positive[arm][key]+=r[field]===true?1:0;}if(id.startsWith('N')&&r.renderRequested===true)falsePositives[arm]++;}
 const closed=(r:any)=>r&&['text_only','render_schema','render_compile','render_committed'].includes(r.outcome)&&!r.harnessFailure;
 let completePairs=0,improvementPairs=0,reversePairs=0;for(const s of SCENARIOS){const a=results.find(r=>r.id===s.id+'-A'),b=results.find(r=>r.id===s.id+'-B');if(closed(a)&&closed(b)){completePairs++;if(s.positive){if(!a.renderRequested&&b.renderRequested)improvementPairs++;if(a.renderRequested&&!b.renderRequested)reversePairs++;}}}
 const journal=accounting?.journal,requestAccountingKnown=!!journal?.complete&&results.every(r=>r.notRun||Number.isSafeInteger(r.requests)&&r.requestAccounting!=='unknown'),requestOutcomesKnown=results.every(r=>r.notRun||r.outcome!=='provider_unknown'&&r.requestAccounting!=='unknown');
 const receiptAdmissions=results.reduce((n,r)=>n+(Number.isSafeInteger(r.requests)?r.requests:(r.knownAdmittedRequests??0)),0),knownAdmittedRequests=Math.max(journal?.rows?.length??0,receiptAdmissions);
 const confirmedProviderRequests=accounting?.live?results.reduce((n,r)=>n+(Number.isSafeInteger(r.requests)&&r.requestAccounting!=='unknown'&&r.outcome!=='provider_unknown'?r.requests:0),0):0;
 return{plannedEpisodes:12,positive,falsePositives,completePairs,improvementPairs,reversePairs,conclusion:completePairs<6?'incomplete-pairs':improvementPairs>=2&&reversePairs===0&&falsePositives.B<=falsePositives.A?'direction-only':'no-clear-gain',knownAdmittedRequests,requestAccountingKnown,requestOutcomesKnown,confirmedProviderRequests,actualModelRequests:accounting?.live?(requestAccountingKnown&&requestOutcomesKnown?knownAdmittedRequests:null):0,results};
}
