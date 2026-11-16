import {test} from 'node:test';
import assert from 'node:assert/strict';
import {writeFileSync,readFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {createRun,runWorker} from './trigger-pilot/control.ts';
import {materializePackages} from './authoring-pilot/authority.ts';
import {ADAPTER_ID} from './helper-adapter/profile.ts';

async function control(simulation:string,id='HX01-G'){
 const run=createRun(ADAPTER_ID);materializePackages(run,ADAPTER_ID);
 const capture=await runWorker(id,run,'capture','',undefined,ADAPTER_ID);assert.equal(capture.process.code,0);assert.equal(capture.requests,1);
 writeFileSync(join(run,'contexts.json'),JSON.stringify({[id]:capture.firstBodySHA256}));
 return{run,r:await runWorker(id,run,'offline',simulation,undefined,ADAPTER_ID)};
}
test('HAS01 direct actual SDK helper workflow is the positive control',async()=>{
 const {r}=await control('direct');assert.equal(r.outcome,'render_committed');assert.equal(r.requests,5);assert.equal(r.contentValid,true);assert.equal(r.modelCalls,0);assert.equal(r.offlineConfigGuard.denied,0);
});
test('HAS02 a redundant owned cwd prefix reaches actual helper check and DOM',async()=>{
 const {r,run}=await control('prefix');assert.equal(r.outcome,'render_committed');assert.equal(r.requests,5);assert.equal(r.contentValid,true);assert.equal(r.firstCandidate.grade.correct,true);assert.equal(r.sourceMatch,'exact');assert.deepEqual(r.cleanupErrors,[]);assert.equal(existsSync(join(run,'workspace')),false);assert.equal(r.modelCalls,0);assert.equal(r.offlineConfigGuard.denied,0);
});
test('HAS03 actual control archive uses the identical prefix admission',async()=>{
 const {r}=await control('prefix','HX01-C');assert.equal(r.outcome,'render_committed');assert.equal(r.contentValid,true);assert.equal(r.actionPosts,0);
 assert.equal(r.helperAdmissions.length,2);assert.ok(r.helperAdmissions.every((p:any)=>p.variant==='owned-cwd-prefix'&&p.status==='executed'&&p.exitCode===0));
 assert.deepEqual(r.helperAdmissions.map((p:any)=>p.argv.slice(2,3)),[['example'],['check']]);assert.deepEqual(r.helperHistoryHashes,r.helperAdmissions.map((p:any)=>p.rawCommandSHA256),'provider continuation retains original assistant commands rather than canonical execution arguments');
});
for(const simulation of ['foreign-cwd','extra-and','redirect','substitution'])test('HAX02 actual SDK denies whole unsafe command before helper execution '+simulation,async()=>{
 const {r,run}=await control(simulation);assert.equal(r.outcome,'tool_policy');assert.equal(r.fatal,true);assert.equal(r.requests,2);assert.equal(r.tools.filter((t:any)=>t.name==='bash').length,0);assert.equal(r.helperRejections.length,1);assert.equal(r.helperRejections[0].kind,'policy');assert.equal(existsSync(join(run,'forbidden-sentinel')),false);assert.equal(existsSync(join(run,'workspace')),false);assert.equal(r.modelCalls,0);assert.equal(r.offlineConfigGuard.denied,0);
});
for(const simulation of ['usage','missing-draft','helper-timeout'])test('HAE02 actual SDK keeps readonly preparation and timeout separate '+simulation,async()=>{
 const {r}=await control(simulation);assert.equal(r.requests,2);assert.equal(r.modelCalls,0);assert.equal(r.outcome,simulation==='helper-timeout'?'helper_unknown':'preparation_error');assert.equal(r.fatal,simulation==='helper-timeout');assert.equal(r.firstCandidate.submitted,false);
 if(simulation==='missing-draft')assert.equal(r.helperAdmissions[0].status,'blocked');
});
