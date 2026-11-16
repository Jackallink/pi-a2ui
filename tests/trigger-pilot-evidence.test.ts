import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRun,receiptEvidence,ROOT} from './trigger-pilot/control.ts';
import {PilotBudget,PROFILE,summarize} from './trigger-pilot/contracts.ts';
test('TPJ01 absent malformed mismatched receipts preserve journal admissions and report unknown',()=>{
 for(const variant of ['missing','malformed','mismatch']){
  const run=createRun(),budget=new PilotBudget(join(run,'live-requests.jsonl'),'live');budget.admit('T01-A',PROFILE.model.baseUrl+'/chat/completions',PROFILE.model,{model:PROFILE.model.id,max_completion_tokens:1536,thinking:{type:'enabled'},reasoning_effort:'low',stream_options:{include_usage:true},parallel_tool_calls:false,tool_choice:'auto'});
  if(variant!=='missing')writeFileSync(join(run,'T01-A.live.json'),variant==='malformed'?'{':JSON.stringify({id:'T01-A',kind:'live',requests:0,modelCalls:0,outcome:'text_only'}));
  const r=receiptEvidence('T01-A',run,'live');assert.equal(r.requests,null);assert.equal(r.requestAccounting,'unknown');assert.equal(r.knownAdmittedRequests,1);const s=summarize([r],{live:true,journal:budget.evidence()});assert.equal(s.actualModelRequests,null);assert.equal(s.knownAdmittedRequests,1);
 }
});
test('TPJ02 terminal CLI report survives torn journal with twelve rows and unchanged original tail',()=>{
 const r=spawnSync(process.execPath,[join(ROOT,'scripts/trigger-pilot.mjs'),'--offline','--canary','torn-journal'],{cwd:ROOT,encoding:'utf8',timeout:45000,maxBuffer:1024*1024});assert.equal(r.status,1);
 const lines=r.stdout.trim().split('\n').map(line=>JSON.parse(line)),last=lines.at(-1);assert.ok(last.report,'terminal report exists');const report=JSON.parse(readFileSync(last.report,'utf8'));assert.equal(report.results.length,12);assert.equal(report.results[0].requests,null);assert.equal(report.results.slice(1).every((x:any)=>!!x.notRun),true);assert.equal(report.knownAdmittedRequests,1);assert.equal(report.journalState.complete,false);assert.equal(report.harnessAccepted,false);assert.equal(report.actualModelRequests,0);assert.ok(readFileSync(join(lines[0].run,'synthetic-torn-journal-requests.jsonl'),'utf8').endsWith('{"index":2'));
});
