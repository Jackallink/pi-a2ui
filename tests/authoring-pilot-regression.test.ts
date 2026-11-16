import {test} from 'node:test';
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {sourceMatch,pairSummary} from './authoring-pilot/oracle.ts';
import {createRun,receiptEvidence} from './trigger-pilot/control.ts';
import {PilotBudget,PROFILE,NEW} from './trigger-pilot/contracts.ts';
import {PAIR_ID} from './authoring-pilot/profile.ts';
const diagnostic=()=>({request:1,journalIndex:1,bodySHA256:'a'.repeat(64),status:200,doneObserved:true,streamState:'cancelled',sdkStopReason:'toolUse',finishReasons:['tool_calls'],errors:[]});
test('R2F4 single LF compatibility excludes shorter CR or LF suffix',()=>{
 for(const [a,b]of [['a\n','a\n\n'],['a\r','a\r\n'],['a\r\n','a\r\n\n']])assert.equal(sourceMatch(a,b),'mismatch');
 assert.equal(sourceMatch('a','a\n'),'single-terminal-lf');
});
test('R2F2 incomplete batch and unverified workflow cannot claim a direction',()=>{
 const good=['FP01-C','FP01-G','FP02-G','FP02-C'].map((id,i)=>({id,requests:1,requestAccounting:'known',fatal:false,cleanupErrors:[],outcome:'render_committed',firstCandidate:{submitted:true,grade:{correct:id.endsWith('-G')}},renderCommitted:true,contentValid:true,preflightPassed:true,sourceMatch:'exact',workflow:{skillRead:true,exampleRead:true,checkBeforeCandidate:true},requestDiagnostics:[{...diagnostic(),journalIndex:i+1}]}));
 const journal={complete:true,rows:good.map((r,i)=>({episode:r.id,index:i+1,bodySHA256:'a'.repeat(64)}))};
 assert.equal(pairSummary(good,journal,false).conclusion,'small-direction-signal');
 for(const field of ['preflightPassed','sourceMatch']){const rows=structuredClone(good);for(const r of rows.filter(r=>r.id.endsWith('-G')))(r as any)[field]=field==='sourceMatch'?'mismatch':false;assert.notEqual(pairSummary(rows,journal,false).conclusion,'small-direction-signal',field);}
 for(const mutate of [(r:any)=>{r.fatal=true;r.outcome='provider_unknown';},(r:any)=>{r.requestAccounting='unknown';},(r:any)=>{r.cleanupErrors=['browser'];},(r:any)=>{r.requestDiagnostics[0].doneObserved=false;}]){const rows=structuredClone(good);mutate(rows[3]);const report=pairSummary(rows,journal,true);assert.notEqual(report.conclusion,'small-direction-signal');assert.equal(report.completeKnownPairs,0);}
 assert.notEqual(pairSummary(good,{...journal,complete:false},true).conclusion,'small-direction-signal');
});
test('R2F3 parent validates diagnostic closure for the last row too',()=>{
 const run=createRun(PAIR_ID),budget=new PilotBudget(join(run,'synthetic-offline-requests.jsonl'),'offline',PAIR_ID);
 budget.admit('FP02-C',PROFILE.model.baseUrl+'/chat/completions',PROFILE.model,{model:PROFILE.model.id,max_completion_tokens:1536,thinking:{type:'enabled'},reasoning_effort:'low',stream_options:{include_usage:true},parallel_tool_calls:false,tool_choice:'auto',tools:[{function:{name:'a2ui_render',description:NEW+'contract'}}]});
 const row=budget.rows()[0],good={id:'FP02-C',kind:'offline',experiment:PAIR_ID,requests:1,modelCalls:0,node:process.version,started:true,renderRequested:true,renderAttempted:true,renderCommitted:true,cleanupErrors:[],tools:[],toolCount:0,outcome:'render_committed',fatal:false,firstCandidate:{submitted:true,grade:{correct:true}},requestDiagnostics:[{...diagnostic(),bodySHA256:row.bodySHA256}]};
 const write=(v:unknown)=>writeFileSync(join(run,'FP02-C.offline.json'),JSON.stringify(v));write(good);assert.equal(receiptEvidence('FP02-C',run,'offline','',PAIR_ID).requestAccounting,'known');
 for(const delta of [{doneObserved:false},{finishReasons:[]},{streamState:'error'},{errors:[{source:'stream'}]},{status:null},{bodySHA256:'b'.repeat(64)},{sseErrorObserved:true},{finishReasons:['tool_calls','length']}]){write({...good,requestDiagnostics:[{...good.requestDiagnostics[0],...delta}]});const r=receiptEvidence('FP02-C',run,'offline','',PAIR_ID);assert.equal(r.requestAccounting,'unknown',JSON.stringify(delta));assert.equal(r.requests,null);assert.equal(r.knownAdmittedRequests,1);assert.equal(r.firstCandidate.submitted,true);assert.equal(r.observedOutcome,'render_committed');}
});

test('unobserved candidate after lost receipt stays unknown rather than a zero denominator',()=>{const r=pairSummary([{id:'FP01-C',requestAccounting:'unknown',outcome:'provider_unknown',fatal:true},{id:'FP01-G',notRun:'stop'},{id:'FP02-G',notRun:'stop'},{id:'FP02-C',notRun:'stop'}],{complete:true,rows:[]},true);assert.equal(r.arms.C.actuallySubmitted,null);assert.equal(r.arms.C.submittedRateLabel,'unknown');});
