import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRun,runWorker,ROOT} from './trigger-pilot/control.ts';
import {PAIR_ID,PAIR} from './authoring-pilot/profile.ts';
import {materializePackages} from './authoring-pilot/authority.ts';

async function run(simulation:string,id='FP01-G',deadline?:number){
 const dir=createRun(PAIR_ID);materializePackages(dir);
 const capture=await runWorker(id,dir,'capture','',undefined,PAIR_ID);assert.equal(capture.process.code,0);assert.equal(capture.requests,1);
 writeFileSync(join(dir,'contexts.json'),JSON.stringify({[id]:capture.firstBodySHA256}));
 return{dir,r:await runWorker(id,dir,'offline',simulation,deadline,PAIR_ID)};
}
for(const [simulation,outcome,requests,correct]of [
 ['workflow','render_committed',5,true],['repeat-check','check_limited',5,true],['missing-draft','preparation_error',1,undefined],['tool-cap','tool_limited',1,undefined],['failed-check','preflight_error',4,false],['semantic-check','preflight_semantic',4,false],['rewrite','candidate_rewrite_attempt',5,true],['prepare','preparation_limited',6,undefined],['schema-missing','render_schema',1,undefined],['numeric','ui_invalid',1,false],['password','ui_invalid',1,false],['dom-number','ui_invalid',1,true],['hidden-selected','ui_invalid',1,true]
] as const)test('APF/APS actual SDK '+simulation,async()=>{
 const {r,dir}=await run(simulation);assert.equal(r.process.code,0);assert.equal(r.outcome,outcome);assert.equal(r.requests,requests);assert.equal(r.modelCalls,0);assert.equal(r.fatal,false);assert.equal(r.firstCandidate.grade?.correct,correct);assert.deepEqual(r.cleanupErrors,[]);assert.equal(r.offlineConfigGuard.denied,0);assert.equal(existsSync(join(dir,'workspace')),false);
 assert.ok(r.requestDiagnostics.every((d:any)=>d.sdkStopReason==='toolUse'&&d.doneObserved&&['eof','cancelled'].includes(d.streamState)&&d.errors.length===0&&d.finishReasons.includes('tool_calls')),'closed local abort must preserve known prior diagnostics');
 if(simulation==='workflow'){assert.equal(r.contentValid,true);assert.equal(r.sourceMatch,'exact');assert.deepEqual(r.workflow,{skillRead:true,exampleRead:true,checkBeforeCandidate:true});assert.equal(r.preSubmissionWrites,1);assert.equal(r.firstCandidate.preSubmissionWrites,1);}
 if(simulation==='dom-number'||simulation==='hidden-selected'){assert.equal(r.contentValid,false);assert.equal(r.renderCommitted,true);}
 if(r.renderCommitted){assert.equal(r.actionPosts,0);assert.equal(r.serverClosed,true);}
});
test('APS01 fatal provider failure and truncation remain fatal; privacy excludes native reasoning',async()=>{
 for(const sim of ['rate-limit','truncated','reasoning','unknown-tool','inflight-abort']){
  const {r,dir}=await run(sim);assert.equal(r.requests,1);assert.equal(r.fatal,sim!=='reasoning');
  const raw=readFileSync(join(dir,'FP01-G.offline-'+sim+'.json'),'utf8');assert.ok(!raw.includes('PRIVATE_SMOKE_THOUGHT_DO_NOT_PERSIST'));assert.ok(!raw.includes('thinkingSignature'));
  if(sim==='reasoning')assert.equal(r.contentValid,true);
 }
});
test('APO03 second task actual DOM and Unicode length oracle use its own archive',async()=>{
 const {r}=await run('workflow','FP02-C');assert.equal(r.outcome,'render_committed');assert.equal(r.firstCandidate.grade.correct,true);assert.equal(r.contentValid,true);assert.equal(r.sourceMatch,'exact');
});
test('APS02 actual browser TERM/fallback is within total worker bound and unknown never refunds',async()=>{
 const {r,dir}=await run('hang','FP01-G',15000);assert.equal(r.requests,null);assert.equal(r.knownAdmittedRequests,1);assert.equal(r.fatal,true);assert.equal(r.process.fallback,true);assert.ok(r.elapsedMs<=15000);assert.equal(existsSync(join(dir,'FP01-G.hang-ready')),true);assert.equal(existsSync(join(dir,'workspace')),false);
 const resource=JSON.parse(readFileSync(join(dir,'FP01-G.resources.json'),'utf8'));assert.throws(()=>process.kill(resource.browserPid,0),(e:any)=>e.code==='ESRCH');
});
for(const canary of ['ordinary','semantic','preparation','fatal','reasoning'])test('APS03 actual public paired CLI '+canary,()=>{
 const r=spawnSync(process.execPath,[join(ROOT,'scripts/authoring-pilot.mjs'),'--offline','--canary',canary],{cwd:ROOT,encoding:'utf8',timeout:90000,maxBuffer:1024*1024});
 assert.equal(r.status,canary==='fatal'?1:0,r.stderr);const lines=r.stdout.trim().split('\n').map(s=>JSON.parse(s)),report=JSON.parse(readFileSync(lines.at(-1).report,'utf8'));
 assert.deepEqual(report.results.map((v:any)=>v.id),['FP01-C','FP01-G','FP02-G','FP02-C']);assert.equal(report.actualModelRequests,0);
 if(canary==='fatal'){assert.equal(report.results[0].outcome,'provider_error');assert.ok(report.results.slice(1).every((v:any)=>v.notRun));assert.equal(report.knownAdmittedRequests,1);}
 else{assert.ok(report.results.every((v:any)=>!v.notRun));assert.ok(report.results.slice(1).every((v:any)=>v.outcome==='render_committed'));assert.equal(report.requestAccountingKnown,true);}
 if(canary==='preparation'){assert.equal(report.results[0].requests,6);assert.equal(report.results[0].firstCandidate.submitted,false);assert.equal(report.conclusion,'incomplete-candidates');}
 for(const id of PAIR.order)assert.ok(existsSync(join(lines[0].run,id+'.capture.json')));
});

test('R2F1 the sixth response can finish its legal write check render bundle without a seventh request',async()=>{
 const {r}=await run('last-bundle');assert.equal(r.requests,6);assert.equal(r.toolIntents,8);assert.equal(r.outcome,'render_committed');assert.equal(r.contentValid,true);assert.equal(r.firstCandidate.grade.correct,true);assert.equal(r.fatal,false);
});
test('R2F3 actual SDK missing DONE cannot become known success on the last row',async()=>{
 const {r,dir}=await run('missing-done','FP02-C');const raw=JSON.parse(readFileSync(join(dir,'FP02-C.offline-missing-done.json'),'utf8'));
 assert.equal(raw.requestDiagnostics[0].doneObserved,false);assert.equal(r.requestAccounting,'unknown');assert.equal(r.requests,null);assert.equal(r.knownAdmittedRequests,1);assert.equal(r.fatal,true);
});
