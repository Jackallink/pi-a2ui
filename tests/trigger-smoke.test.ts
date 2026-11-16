import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,rmSync,appendFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {PilotBudget,PROFILE,NEW,OLD} from './trigger-pilot/contracts.ts';

const EXP='v0.1.10-trigger-smoke-1',endpoint=PROFILE.model.baseUrl+'/chat/completions';
const body=()=>({model:PROFILE.model.id,thinking:{type:'enabled'},reasoning_effort:'low',max_completion_tokens:1536,stream_options:{include_usage:true},parallel_tool_calls:false,tool_choice:'auto',tools:[{type:'function',function:{name:'a2ui_render',description:NEW+'contract'}}]});
test('SMG02 valid smoke IDs use1/3/4 durable limits with no borrowing or refunds',()=>{
 const dir=mkdtempSync(resolve('.local/smoke-budget-'));try{const path=join(dir,'j'),budget=new (PilotBudget as any)(path,'offline',EXP);
  assert.doesNotThrow(()=>budget.admit('SM02-B',endpoint,PROFILE.model,body()));assert.throws(()=>budget.admit('SM02-B',endpoint,PROFILE.model,body()),/budget/);
  for(let i=0;i<3;i++)budget.admit('SM01-B',endpoint,PROFILE.model,body());assert.throws(()=>budget.admit('SM01-B',endpoint,PROFILE.model,body()),/budget/);assert.equal(budget.rows().length,4);for(const r of budget.rows()){assert.equal(r.experiment,EXP);assert.match(r.profileSHA256,/^[a-f0-9]{64}$/);}
  const second=new (PilotBudget as any)(join(dir,'isolated'),'offline',EXP);for(let i=0;i<3;i++)second.admit('SM01-B',endpoint,PROFILE.model,body());assert.throws(()=>second.admit('SM01-B',endpoint,PROFILE.model,body()),/budget/);
  appendFileSync(path,'{"index":5');assert.equal(budget.evidence().rows.length,4);assert.equal(budget.evidence().complete,false);assert.throws(()=>budget.admit('SM02-B',endpoint,PROFILE.model,body()));
 }finally{rmSync(dir,{recursive:true});}
});
test('SMG02 smoke cannot accept old episodes or an old36-request journal',()=>{
 const dir=mkdtempSync(resolve('.local/smoke-legacy-'));try{const path=join(dir,'j'),old=new PilotBudget(path,'offline');old.admit('T01-B',endpoint,PROFILE.model,body());const smoke=new (PilotBudget as any)(path,'offline',EXP);assert.equal(smoke.evidence().complete,false);assert.throws(()=>smoke.admit('T01-B',endpoint,PROFILE.model,body()));}finally{rmSync(dir,{recursive:true});}
});
test('SMS01 smoke requires the released new clause without A/B normalization',()=>{
 const dir=mkdtempSync(resolve('.local/smoke-clause-'));try{const b=new (PilotBudget as any)(join(dir,'j'),'offline',EXP),wrong=body();wrong.tools[0].function.description=OLD+'contract';assert.throws(()=>b.admit('SM02-B',endpoint,PROFILE.model,wrong));assert.equal(b.rows().length,0);}finally{rmSync(dir,{recursive:true});}
});
