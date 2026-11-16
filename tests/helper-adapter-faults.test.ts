import {test} from 'node:test';import assert from 'node:assert/strict';import{spawnSync}from'node:child_process';import fs from'node:fs';import{join,resolve}from'node:path';import{syncBuiltinESMExports}from'node:module';
import{createBashToolDefinition}from'../node_modules/@earendil-works/pi-coding-agent/dist/core/tools/bash.js';import{observeOwnedProcesses}from'./helper-adapter/process-witness.ts';import{planHelperInvocation}from'./helper-adapter/invocation.ts';
import {ROOT,createRun,runWorker,receiptEvidence} from './trigger-pilot/control.ts';
import {materializePackages} from './authoring-pilot/authority.ts';
import {ADAPTER_ID} from './helper-adapter/profile.ts';
for(const phase of ['pre','post'])test('observer '+phase+'-spawn persist failure preserves backend ownership',()=>{
 const code=`import fs from'node:fs';import cp from'node:child_process';import{syncBuiltinESMExports}from'node:module';let writes=0,backend=0;const child={pid:424242};fs.writeFileSync=()=>{if(++writes===${phase==='pre'?2:3})throw Error('synthetic persistence failure');};cp.spawn=()=>{backend++;return child;};syncBuiltinESMExports();const{observeOwnedProcesses}=await import('./tests/helper-adapter/process-witness.ts');const witness=observeOwnedProcesses('/synthetic/project','/synthetic/witness.json');let returned,threw=false;try{returned=cp.spawn('/bin/sh',['-c','synthetic'],{cwd:'/synthetic/project'});}catch{threw=true;}const proof=witness.snapshot();witness.restore();console.log(JSON.stringify({backend,threw,returnedChild:returned===child,auditErrors:proof.auditErrors??[]}));`;
 const r=spawnSync(process.execPath,['--input-type=module','--eval',code],{encoding:'utf8',timeout:10000});assert.equal(r.status,0,r.stderr);const out=JSON.parse(r.stdout.trim());
 if(phase==='post'){assert.equal(out.backend,1);assert.equal(out.returnedChild,true);assert.equal(out.threw,false);assert.deepEqual(out.auditErrors,['post_spawn_persist']);}
 else{assert.equal(out.backend,0);assert.equal(out.threw,true);assert.deepEqual(out.auditErrors,['pre_spawn_persist']);}
});
test('real owned helper timeout retains SDK cleanup after a postspawn audit write fault',async()=>{
 const run=fs.mkdtempSync(resolve('.local/helper-adapter-implementation/cleanup-fault-')),project=join(run,'workspace/project'),helper=join(run,'a2ui.mjs'),file=join(run,'witness.json');fs.mkdirSync(project,{recursive:true});fs.writeFileSync(helper,'setTimeout(()=>{},30000);\n');
 const original=fs.writeFileSync;let writes=0;(fs as any).writeFileSync=function(path:any,...args:any[]){if(path===file&&++writes===3)throw Error('synthetic post-spawn persist failure');return Reflect.apply(original,fs,[path,...args]);};syncBuiltinESMExports();const witness=observeOwnedProcesses(project,file);
 try{const plan=planHelperInvocation(`node "${helper}" catalog`,{cwd:project,helper,draft:join(project,'draft.express')}),tool=createBashToolDefinition(run,{exposeSessionEnvironment:false});await assert.rejects(tool.execute('fault',{command:plan.command,timeout:0.05},undefined,undefined,{cwd:project}as any),/timed out/);const proof:any=witness.snapshot();assert.deepEqual(proof.auditErrors,['post_spawn_persist']);assert.equal(proof.childrenWithPid,1);assert.throws(()=>process.kill(-proof.entries[0].pid!,0),(e:any)=>e.code==='ESRCH');}
 finally{for(const e of witness.snapshot().entries)if(e.pid)try{process.kill(-e.pid,'SIGKILL');}catch(error){if((error as any).code!=='ESRCH')throw error;}witness.restore();fs.writeFileSync=original;syncBuiltinESMExports();}
});
test('actual offline worker marks a postspawn audit fault fatal instead of claiming a successful control',async()=>{
 const run=createRun(ADAPTER_ID);materializePackages(run,ADAPTER_ID);const id='HX01-G';
 const capture=await runWorker(id,run,'capture','',undefined,ADAPTER_ID);assert.equal(capture.process.code,0);fs.writeFileSync(join(run,'contexts.json'),JSON.stringify({[id]:capture.firstBodySHA256}));
 const witnessFile=join(run,id+'.offline.process-witness.json'),hook=join(run,'audit-fault.mjs');
 fs.writeFileSync(hook,`import fs from'node:fs';import{syncBuiltinESMExports}from'node:module';const original=fs.writeFileSync;let writes=0;fs.writeFileSync=function(path,...args){if(path===${JSON.stringify(witnessFile)}&&++writes===3)throw Error('synthetic post-spawn persist failure');return Reflect.apply(original,fs,[path,...args]);};syncBuiltinESMExports();\n`,{mode:0o600});
 const env={...process.env,PI_OFFLINE:'1'};for(const key of ['NODE_OPTIONS','BASH_ENV','ENV','LD_PRELOAD','DYLD_INSERT_LIBRARIES'])delete env[key];
 const worker=spawnSync(process.execPath,['--import',hook,'--import','tsx',join(ROOT,'tests/trigger-pilot/worker.ts'),id,run,'offline','prefix',ADAPTER_ID],{cwd:ROOT,env,encoding:'utf8',timeout:20000,maxBuffer:1024*1024});assert.equal(worker.status,0,worker.stderr);
 const result=receiptEvidence(id,run,'offline','prefix',ADAPTER_ID);assert.equal(result.requests,2);assert.equal(result.modelCalls,0);assert.equal(result.outcome,'process_witness_error');assert.equal(result.harnessFailure,true);assert.equal(result.fatal,true);assert.equal(result.firstCandidate.submitted,false);assert.deepEqual(result.processWitness.auditErrors,['post_spawn_persist']);assert.equal(result.processWitness.childrenWithPid,1);assert.equal(result.offlineConfigGuard.denied,0);assert.deepEqual(result.cleanupErrors,[]);
 for(const entry of result.processWitness.entries)if(entry.pid)assert.throws(()=>process.kill(-entry.pid,0),(error:any)=>error.code==='ESRCH');
 assert.equal(fs.existsSync(join(run,'workspace')),false);
});
