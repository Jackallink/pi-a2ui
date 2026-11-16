import {test} from 'node:test';
import assert from 'node:assert/strict';
import {policyFor,SMOKE_ID,OLD_ID} from './trigger-smoke/policy.ts';
import {PAIR_ID} from './authoring-pilot/profile.ts';
import {mkdtempSync,mkdirSync,writeFileSync,existsSync,appendFileSync,readFileSync,rmSync} from 'node:fs';
import {resolve,join,dirname} from 'node:path';
import {createBashToolDefinition} from '../node_modules/@earendil-works/pi-coding-agent/dist/core/tools/bash.js';
import {planHelperInvocation,HelperInvocationError} from './helper-adapter/invocation.ts';
import {PilotBudget,NEW} from './trigger-pilot/contracts.ts';
import {ADAPTER_ID,ADAPTER_SHA} from './helper-adapter/profile.ts';
import {observeOwnedProcesses} from './helper-adapter/process-witness.ts';

test('HAG00 a new offline policy admits owned helper control without changing legacy modes',()=>{
 const policy=policyFor('helper-invocation-offline-1');
 assert.equal(policy.helperAdapter,'owned-cwd-v1');assert.equal(policy.base,'helper-adapter');assert.equal(policy.profile.liveEnabled,false);
 assert.deepEqual(policy.order,['HX01-C','HX01-G']);assert.equal(policy.limit('HX01-C'),6);assert.equal(policy.batchRequests,12);
 for(const experiment of [PAIR_ID,SMOKE_ID,OLD_ID])assert.equal(policyFor(experiment).helperAdapter,undefined);
});
test('HAI02 synthetic admission keeps the new six/twelve budget and profile identity without borrowing',()=>{
 const run=mkdtempSync(resolve('.local/helper-adapter-implementation/budget-')),path=join(run,'requests.jsonl'),budget=new PilotBudget(path,'offline',ADAPTER_ID);
 const model={provider:'volcengine-ark',id:'glm-5.3-flash',baseUrl:'https://ark.cn-beijing.volces.com/api/plan/v3'};
 const body={model:model.id,max_completion_tokens:1536,thinking:{type:'enabled'},reasoning_effort:'low',stream_options:{include_usage:true},parallel_tool_calls:false,tool_choice:'auto',tools:[{type:'function',function:{name:'a2ui_render',description:NEW}}]};
 for(const id of ['HX01-C','HX01-G']){for(let n=0;n<6;n++)budget.admit(id,model.baseUrl+'/chat/completions',model,body);assert.throws(()=>budget.admit(id,model.baseUrl+'/chat/completions',model,body),/budget/);}
 assert.equal(budget.rows().length,12);assert.ok(budget.rows().every(r=>r.experiment===ADAPTER_ID&&r.profileSHA256===ADAPTER_SHA));
 assert.throws(()=>budget.admit('FP01-G',model.baseUrl+'/chat/completions',model,body));appendFileSync(path,'{');assert.equal(budget.evidence().complete,false);assert.equal(budget.evidence().rows.length,12);assert.throws(()=>budget.admit('HX01-G',model.baseUrl+'/chat/completions',model,body));
});

const cwd='/owned/project',helper='/owned/package/skills/pi-a2ui/scripts/a2ui.mjs',draft='/owned/project/draft.express';
const context={cwd,helper,draft};
test('HAP01 direct and exactly owned prefix produce the same pinned argv for every readonly opcode',()=>{
 for(const [tail,args]of [
  ['catalog',['catalog']],['patterns',['patterns']],['examples',['examples']],['component Text',['component','Text']],['pattern guarded-form',['pattern','guarded-form']],['example validated-form',['example','validated-form']],['check --surface-id form draft.express',['check','--surface-id','form',draft]]
 ] as Array<[string,string[]]>){
  const direct=planHelperInvocation(`node "${helper}" ${tail}`,context),prefixed=planHelperInvocation(` \tcd '${cwd}'&&"${process.execPath}" '${helper}' ${tail} `,context);
  assert.deepEqual(direct.argv,[process.execPath,helper,...args]);assert.deepEqual(prefixed.argv,[process.execPath,helper,...args]);assert.equal(prefixed.command,direct.command);assert.equal(prefixed.cwd,cwd);assert.equal(prefixed.variant,'owned-cwd-prefix');assert.equal(direct.variant,'direct');
 }
 for(const path of [draft,'draft.express','./draft.express'])assert.deepEqual(planHelperInvocation(`node "${helper}" check --surface-id f "${path}"`,context).argv,[process.execPath,helper,'check','--surface-id','f',draft]);
});
const reject=(raw:string,kind:'usage'|'policy')=>assert.throws(()=>planHelperInvocation(raw,context),(error:unknown)=>error instanceof HelperInvocationError&&error.kind===kind,raw);
test('HAP02 full-string validation rejects operators extensions foreign identities and stdin',()=>{
 const query=`node "${helper}" example validated-form`;
 for(const raw of ['',query+'; touch sentinel',query+'&&node bad.mjs',query+' | cat',query+' > out',query+' < in',query+' &',query+' (touch sentinel)',query+' )',`cd /foreign && ${query}`,`cd ${cwd}/../project && ${query}`,`cd ${cwd} && ${query} && ${query}`,`cd ${cwd} "&&" ${query}`,`cd -- ${cwd} && ${query}`,`cd ${cwd};${query}`,'env '+query,'npx '+query,'npm '+query,'node --eval 1',`node /foreign/a2ui.mjs catalog`,`node "${helper}" unknown`,`node "${helper}" check --surface-id f /outside`,`node "${helper}" check --surface-id f -`,query+' $(touch sentinel)',query+' `touch sentinel`',query+' $VALUE',query+' \\x',query+'\n',query+'\r',query+'\x00',query+'\x7f',`no"de" "${helper}" catalog`,`node "${helper} catalog`,'界'.repeat(2731)])reject(raw,'policy');
});
test('HAE01 proven readonly helper usage errors remain ordinary without accepting different files',()=>{
 for(const tail of ['catalog extra','example','component Bad/Name','check','check --surface-id','check --surface-id "bad id" draft.express','check --surface-id f'])reject(`node "${helper}" ${tail}`,'usage');
 reject(`node "${helper}" check --surface-id "bad id" /outside`,'policy');
});
test('HAX01 actual Node process receives exact cwd and argv with hostile characters in trusted quoted paths',async()=>{
 const run=mkdtempSync(resolve('.local/helper-adapter-implementation/probe-'));
 const project=join(run,"owned && ; <> ' 中文"),actualHelper=join(run,"package && ; ' 中文",'skills/pi-a2ui/scripts/a2ui.mjs');
 mkdirSync(project,{recursive:true});mkdirSync(dirname(actualHelper),{recursive:true});
 writeFileSync(actualHelper,'console.log(JSON.stringify({node:process.execPath,version:process.version,cwd:process.cwd(),args:process.argv.slice(2)}));\n');
 const ctx={cwd:project,helper:actualHelper,draft:join(project,'draft.express')},observed=[];const tool=createBashToolDefinition(run,{exposeSessionEnvironment:false});
 for(const raw of [`node "${actualHelper}" example validated-form`,`cd "${project}"&&node "${actualHelper}" example validated-form`]){
  const plan=planHelperInvocation(raw,ctx),executed=await tool.execute('owned-probe',{command:plan.command,timeout:5},undefined,undefined,{cwd:project} as any),result=JSON.parse((executed.structuredContent as any).output);assert.equal((executed.structuredContent as any).exit_code,0);
  assert.deepEqual(result,{node:process.execPath,version:process.version,cwd:project,args:['example','validated-form']});assert.match(result.version,/^v24\./);observed.push(result);
 }
 writeFileSync(join(run,'observations.json'),JSON.stringify(observed)+'\n',{mode:0o600});assert.equal(existsSync(join(run,'sentinel')),false);
});
test('HAX03 process detector positive canary survives workspace cleanup and counts a real child',async()=>{
 const run=mkdtempSync(resolve('.local/helper-adapter-implementation/detector-')),project=join(run,'workspace/project'),helper=join(run,'package/a2ui.mjs'),sentinel=join(run,'persistent-sentinel'),file=join(run,'process-witness.json');
 mkdirSync(project,{recursive:true});mkdirSync(dirname(helper),{recursive:true});
 // Controlled test helper writes only this owned sentinel; no model supplied code.
 writeFileSync(helper,`import{writeFileSync}from'node:fs';writeFileSync(${JSON.stringify(sentinel)},'detector-positive');console.log('ok');\n`);
 const witness=observeOwnedProcesses(project,file);
 try{
  const plan=planHelperInvocation(`cd "${project}" && node "${helper}" catalog`,{cwd:project,helper,draft:join(project,'draft.express')});
  const tool=createBashToolDefinition(run,{exposeSessionEnvironment:false});const result=await tool.execute('detector',{command:plan.command,timeout:5},undefined,undefined,{cwd:project} as any);assert.equal((result.structuredContent as any).exit_code,0);
  rmSync(join(run,'workspace'),{recursive:true});assert.equal(readFileSync(sentinel,'utf8'),'detector-positive');
  const proof=JSON.parse(readFileSync(file,'utf8'));assert.equal(proof.spawnAttempts,1);assert.equal(proof.childrenWithPid,1);assert.ok(proof.entries[0].pid>1);assert.deepEqual(witness.snapshot(),proof);
 }finally{witness.restore();}
});
