import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs,{mkdtempSync,readFileSync,rmSync,appendFileSync} from 'node:fs';
import {syncBuiltinESMExports} from 'node:module';
import {resolve,join} from 'node:path';
import {PilotBudget,observeAssistant,descriptionForArm,normalizedBody,PROFILE,OLD,NEW,summarize} from './trigger-pilot/contracts.ts';

const body=()=>({model:PROFILE.model.id,max_completion_tokens:1536,thinking:{type:'enabled'},reasoning_effort:'low',stream_options:{include_usage:true},parallel_tool_calls:false,tool_choice:'auto',messages:[{role:'user',content:'hello'}]});
const endpoint=PROFILE.model.baseUrl+'/chat/completions';
const call=(args:unknown)=>({role:'assistant',stopReason:'toolUse',content:[{type:'toolCall',id:'x',name:'a2ui_render',arguments:args}]});
test('TP01 a complete model render choice survives missing arguments before schema',()=>{
 const r:any={};observeAssistant(r,call({surfaceId:'x'}));assert.equal(r.renderRequested,true);assert.notEqual(r.renderAttempted,true);assert.notEqual(r.renderCommitted,true);
 const truncated:any={};observeAssistant(truncated,{...call({}),stopReason:'length'});assert.equal(truncated.outcome,'output_truncated');assert.notEqual(truncated.renderRequested,true);
});
test('TP02 actual descriptor control changes exactly one clause and keeps everything else',()=>{
 const desc='prefix '+NEW+' suffix';assert.equal(descriptionForArm(desc,'B'),desc);assert.equal(descriptionForArm(desc,'A'),'prefix '+OLD+' suffix');assert.throws(()=>descriptionForArm(NEW+NEW,'A'));
 const a={...body(),tools:[{type:'function',function:{name:'a2ui_render',description:descriptionForArm(desc,'A')}}]},b={...body(),tools:[{type:'function',function:{name:'a2ui_render',description:desc}}]};assert.deepEqual(normalizedBody(a),normalizedBody(b));assert.notDeepEqual(normalizedBody({...b,messages:[{role:'user',content:'different'}]}),normalizedBody(b));
});
test('TP03 request admissions are durable, per episode3 and batch36, with no quota refund',()=>{
 const dir=mkdtempSync(resolve('.local/tp-budget-'));try{const path=join(dir,'journal.jsonl'),budget=new PilotBudget(path,'offline');for(let i=0;i<3;i++)budget.admit(PROFILE.order[0],endpoint,PROFILE.model,body());assert.throws(()=>budget.admit(PROFILE.order[0],endpoint,PROFILE.model,body()),/budget/);assert.equal(budget.rows().length,3);for(const id of PROFILE.order.slice(1))for(let i=0;i<3;i++)budget.admit(id,endpoint,PROFILE.model,body());assert.equal(readFileSync(path,'utf8').trim().split('\n').length,36);assert.throws(()=>budget.admit(PROFILE.order[0],endpoint,PROFILE.model,body()),/budget/);const resumed=new PilotBudget(path,'offline');assert.throws(()=>resumed.admit(PROFILE.order[1],endpoint,PROFILE.model,body()),/budget/);}finally{rmSync(dir,{recursive:true});}
});
test('TP04 endpoint/model/options and oversized body are rejected before journal dispatch',()=>{
 const dir=mkdtempSync(resolve('.local/tp-identity-'));try{const budget=new PilotBudget(join(dir,'j'),'offline');for(const [url,model,b] of [[endpoint+'?redirect=1',PROFILE.model,body()],[endpoint,{...PROFILE.model,id:'forbidden'},body()],[endpoint,PROFILE.model,{...body(),max_tokens:1537}],[endpoint,PROFILE.model,{...body(),tool_choice:'required'}],[endpoint,PROFILE.model,{...body(),messages:[{role:'user',content:'x'.repeat(98304)}]}]]as any[])assert.throws(()=>budget.admit('T01-A',url,model,b));assert.equal(budget.rows().length,0);}finally{rmSync(dir,{recursive:true});}
});
test('TP05 paired reporting excludes unknown/truncated/limited evidence and never calls intent usable UI',()=>{
 const rows:any[]=[{id:'T01-A',outcome:'text_only',renderRequested:false},{id:'T01-B',outcome:'render_schema',renderRequested:true,renderCommitted:false},{id:'T02-A',outcome:'provider_unknown'},{id:'T02-B',outcome:'text_only'},{id:'N01-A',outcome:'text_only'},{id:'N01-B',outcome:'render_schema',renderRequested:true}];const s=summarize(rows);assert.equal(s.completePairs,2);assert.equal(s.falsePositives.B,1);assert.equal(s.positive.B.requested,1);assert.equal(s.positive.B.committed,0);assert.equal(s.improvementPairs,1);
});
test('TP06 numeric admissions with unknown provider outcome are not confirmed actual model calls',()=>{
 const r=summarize([{id:'T01-A',requests:1,outcome:'provider_unknown'}],{live:true,journal:{rows:[{episode:'T01-A'}],complete:true}});assert.equal(r.actualModelRequests,null);assert.equal(r.knownAdmittedRequests,1);assert.equal(r.requestOutcomesKnown,false);
});
test('TP07 torn journal retains validated complete prefix but further admission stays closed',()=>{
 const dir=mkdtempSync(resolve('.local/tp-torn-'));try{const path=join(dir,'j'),b=new PilotBudget(path,'live');b.admit('T01-A',endpoint,PROFILE.model,body());appendFileSync(path,'{"index":2');const proof=b.evidence();assert.equal(proof.complete,false);assert.equal(proof.rows.length,1);assert.throws(()=>b.admit('T01-A',endpoint,PROFILE.model,body()));const report=summarize([{id:'T01-A',requests:null,outcome:'provider_unknown'}],{live:true,journal:proof});assert.equal(report.actualModelRequests,null);assert.equal(report.knownAdmittedRequests,1);}finally{rmSync(dir,{recursive:true});}
});
test('TP08 partial journal write or failed fsync cannot authorize dispatch',()=>{
 const dir=mkdtempSync(resolve('.local/tp-write-')),actualWrite=fs.writeSync,actualSync=fs.fsyncSync;try{
  (fs as any).writeSync=(fd:number,data:any)=>{const b=Buffer.from(data);return actualWrite(fd,b.subarray(0,b.length-1));};syncBuiltinESMExports();const b=new PilotBudget(join(dir,'short'),'live');assert.throws(()=>b.admit('T01-A',endpoint,PROFILE.model,body()),/journal/);
  fs.writeSync=actualWrite;fs.fsyncSync=()=>{throw new Error('injected fsync');};syncBuiltinESMExports();let dispatched=false;try{new PilotBudget(join(dir,'sync'),'live').admit('T01-A',endpoint,PROFILE.model,body());dispatched=true;}catch{}assert.equal(dispatched,false);
 }finally{fs.writeSync=actualWrite;fs.fsyncSync=actualSync;syncBuiltinESMExports();rmSync(dir,{recursive:true});}
});
