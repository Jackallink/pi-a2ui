import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRun,runWorker,captureContexts,ROOT} from './trigger-pilot/control.ts';
import {PROFILE,hash,canonical,normalizedBody} from './trigger-pilot/contracts.ts';

test('TPS01 actual SDK initial A/B contexts differ only by clause for all six tasks',async()=>{
 const run=createRun(),contexts=await captureContexts(run);assert.equal(Object.keys(contexts).length,6);
 for(const id of PROFILE.order){const body=JSON.parse(readFileSync(join(run,id+'.context.json'),'utf8'));assert.equal(hash(canonical(normalizedBody(body))),contexts[id.split('-')[0]]);assert.equal(body.tool_choice,'auto');assert.deepEqual(body.thinking,{type:'enabled'});assert.equal(body.reasoning_effort,'low');assert.equal(body.max_completion_tokens,1536);assert.equal(body.max_tokens,undefined);assert.ok(JSON.stringify(body).includes('pi-a2ui'));assert.ok(!JSON.stringify(body).includes('# Pi A2UI'));assert.ok(!JSON.stringify(body).includes('Guarded benchmark profile'));}
 writeFileSync('.local/trigger-pilot-implementation/latest-context-run',run+'\n');
});
for(const [simulation,outcome,requested,attempted,committed,requests]of [
 ['schema-missing','render_schema',true,false,false,1],['schema-type','render_schema',true,false,false,1],['text','text_only',false,false,false,1],['compile','render_compile',true,true,false,1],['failed-check','preflight_error',false,false,false,2],['unsafe-shell','tool_policy',false,false,false,1],['wrong-model','admission_error',false,false,false,0],['truncated','output_truncated',false,false,false,1],['budget','ui_preparation_only',false,false,false,3],['usage-missing','render_committed',true,true,true,1],
]as const)test('TPS02 actual SDK control '+simulation,async()=>{
 const run=createRun();const capture=await runWorker('T01-A',run,'capture');assert.equal(capture.process.code,0);writeFileSync(join(run,'contexts.json'),JSON.stringify({T01:capture.firstBodySHA256}));
 const r=await runWorker('T01-A',run,'offline',simulation);assert.equal(r.process.code,0);assert.equal(r.outcome,outcome);assert.equal(r.renderRequested,requested);assert.equal(r.renderAttempted,attempted);assert.equal(r.renderCommitted,committed);assert.equal(r.requests,requests);assert.equal(r.modelCalls,0);assert.deepEqual(r.cleanupErrors,[]);
 if(committed){assert.equal(r.domObserved,true);assert.equal(r.actionPosts,0);assert.equal(r.serverClosed,true);assert.equal(r.usageKnown,false);}
 if(simulation==='budget'){assert.equal(r.requestDiagnostics.length,3);assert.equal(r.requestDiagnostics.at(-1).sdkStopReason,'toolUse');assert.deepEqual(r.requestDiagnostics.at(-1).errors,[]);}
});
test('TPS03 actual hung browser worker is killed, lower-bound journal retained, owned workspace closed',async()=>{
 const run=createRun(),capture=await runWorker('T01-A',run,'capture');writeFileSync(join(run,'contexts.json'),JSON.stringify({T01:capture.firstBodySHA256}));
 const r=await runWorker('T01-A',run,'offline','hang',12000);assert.equal(r.harnessFailure,true);assert.equal(r.requests,null);assert.equal(r.knownAdmittedRequests,1);assert.equal(r.process.fallback,true);assert.equal(existsSync(join(run,'T01-A.hang-ready')),true);assert.equal(existsSync(join(run,'workspace')),false);
 const resource=JSON.parse(readFileSync(join(run,'T01-A.resources.json'),'utf8'));await assert.rejects(fetch(resource.origin,{signal:AbortSignal.timeout(1000)}));
 assert.throws(()=>process.kill(resource.browserPid,0),(e:any)=>e.code==='ESRCH');
});
test('TPS04 default and invalid CLI do not import credentials or start fetch',()=>{
 const run=createRun(),guard=join(run,'guard.mjs');writeFileSync(guard,`import fs from 'node:fs';import {syncBuiltinESMExports} from 'node:module';const original=fs.readFileSync;fs.readFileSync=function(path,...args){if(String(path).includes('/.pi/agent/'))throw Error('real credential read denied');return original.call(this,path,...args);};syncBuiltinESMExports();globalThis.fetch=()=>{throw Error('fetch denied');};`);
 for(const args of [[],['--help'],['--bad-flag']]){const r=spawnSync(process.execPath,['--import',guard,join(ROOT,'scripts/trigger-pilot.mjs'),...args],{encoding:'utf8',timeout:15000});assert.equal(r.status,args.length&&args[0]==='--bad-flag'?1:0);if(!args.length){const value=JSON.parse(r.stdout);assert.equal(value.providerRequests,0);assert.equal(value.credentialReads,0);}}
});
test('TPS05 synthetic worker blocks actual operator auth read before SDK setup',async()=>{
 const run=createRun(),r=await runWorker('T01-A',run,'offline','offline-config-read');assert.equal(r.requests,0);assert.equal(r.modelCalls,0);assert.equal(r.outcome,'setup_error');assert.equal(r.offlineConfigGuard.active,true);assert.equal(r.offlineConfigGuard.denied,1);
});
