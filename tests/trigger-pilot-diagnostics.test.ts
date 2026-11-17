import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,mkdtempSync,rmSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {PROFILE,PilotBudget} from './trigger-pilot/contracts.ts';
import {createRun,runWorker,ROOT} from './trigger-pilot/control.ts';

test('TPD01 both live entry points refuse before workspace/config/network access',()=>{
 const run=createRun(),guard=join(run,'deny.mjs'),counter=join(run,'access.json');
 writeFileSync(guard,`import fs from 'node:fs';import promises from 'node:fs/promises';import {syncBuiltinESMExports} from 'node:module';const writes=fs.writeFileSync,state={config:0,network:0,runs:0},save=()=>writes(${JSON.stringify(counter)},JSON.stringify(state));save();const check=p=>{if(String(p).includes('/.pi/agent')){state.config++;save();throw Error('TEST_CONFIG_ACCESS');}};const runCheck=p=>{if(String(p).includes('.local/trigger-pilot')){state.runs++;save();}};for(const name of ['readFileSync','readFile','openSync','open']){const original=fs[name];fs[name]=function(p,...args){check(p);return original.call(fs,p,...args);};}for(const name of ['readFile','open']){const original=promises[name];promises[name]=function(p,...args){check(p);return original.call(promises,p,...args);};}for(const name of ['mkdirSync','mkdtempSync','mkdir','mkdtemp']){const original=fs[name];fs[name]=function(p,...args){runCheck(p);return original.call(fs,p,...args);};}for(const name of ['mkdir','mkdtemp']){const original=promises[name];promises[name]=function(p,...args){runCheck(p);return original.call(promises,p,...args);};}syncBuiltinESMExports();globalThis.fetch=()=>{state.network++;save();throw Error('TEST_NETWORK_ACCESS');};`);
 for(const args of [[join(ROOT,'scripts/trigger-pilot.mjs'),'--execute','--archive','/does-not-exist.tgz'],['--import','tsx',join(ROOT,'tests/trigger-pilot/worker.ts'),'T01-A',run,'live'],['--import','tsx','--input-type=module','--eval',`const {episode}=await import('./tests/trigger-pilot/worker.ts');await episode('T01-A',${JSON.stringify(run)},'live');`]]){
  const r=spawnSync(process.execPath,['--import',guard,...args],{cwd:ROOT,encoding:'utf8',timeout:15000});assert.equal(r.status,1);assert.match(r.stderr,/live execution disabled/);assert.deepEqual(JSON.parse(readFileSync(counter,'utf8')),{config:0,network:0,runs:0});assert.equal(existsSync(join(run,'workspace')),false);assert.equal(existsSync(join(run,'live-requests.jsonl')),false);assert.equal(existsSync(join(run,'T01-A.live.json')),false);
 }
});

test('TPD02 native thinking and strict total-output contract reject drift before journal',()=>{
 const dir=mkdtempSync(resolve('.local/tpd-contract-'));try{
  const budget=new PilotBudget(join(dir,'j'),'offline'),url=PROFILE.model.baseUrl+'/chat/completions';
  const body:any={model:PROFILE.model.id,max_completion_tokens:1536,thinking:{type:'enabled'},reasoning_effort:'low',stream_options:{include_usage:true},parallel_tool_calls:false,tool_choice:'auto'};
  for(const invalid of [{...body,thinking:undefined},{...body,thinking:{type:'disabled'}},{...body,reasoning_effort:'max'},{...body,max_tokens:1536},{...body,max_completion_tokens:undefined,max_tokens:1536},{...body,stream_options:{include_usage:false}}])assert.throws(()=>budget.admit('T01-A',url,PROFILE.model,invalid));
  assert.equal(budget.rows().length,0);budget.admit('T01-A',url,PROFILE.model,body);assert.equal(budget.rows().length,1);
 }finally{rmSync(dir,{recursive:true});}
});

test('TPD07 actual SDK capture has the native GLM wire contract',async()=>{
 const run=createRun(),r=await runWorker('T01-A',run,'capture');assert.equal(r.process.code,0);const body=JSON.parse(readFileSync(join(run,'T01-A.context.json'),'utf8'));
 assert.deepEqual(body.thinking,{type:'enabled'});assert.equal(body.reasoning_effort,'low');assert.equal(body.max_completion_tokens,1536);assert.equal(body.max_tokens,undefined);assert.equal(body.stream_options.include_usage,true);
});

test('TPD08 actual SDK two-request failure retains separately attributed diagnostics',async()=>{
 const run=createRun(),capture=await runWorker('T01-A',run,'capture');writeFileSync(join(run,'contexts.json'),JSON.stringify({T01:capture.firstBodySHA256}));
 const r=await runWorker('T01-A',run,'offline','read-then-stream-error');assert.equal(r.process.code,0);assert.equal(r.requests,2);assert.equal(r.outcome,'provider_unknown');assert.equal(r.fatal,true);assert.equal(r.modelCalls,0);assert.equal(r.preparation,true);assert.equal(r.renderRequested,false);
 assert.equal(r.requestDiagnostics.length,2);const [a,b]=r.requestDiagnostics;assert.equal(a.request,1);assert.equal(b.request,2);assert.notEqual(a.bodySHA256,b.bodySHA256);assert.equal(a.status,200);assert.equal(b.status,200);assert.equal(a.sdkStopReason,'toolUse');assert.equal(b.sdkStopReason,'error');assert.equal(b.streamState,'error');assert.ok(b.errors.some((e:any)=>e.source==='sdk'));assert.ok(b.errors.some((e:any)=>e.source==='stream'));assert.deepEqual(a.usage,{prompt_tokens:10,completion_tokens:2,total_tokens:12,reasoning_tokens:null});assert.equal(b.usage,null);assert.equal(r.usageKnown,false);assert.deepEqual(r.cleanupErrors,[]);assert.equal(r.offlineConfigGuard.denied,0);
});
