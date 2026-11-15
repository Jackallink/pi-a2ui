import {test,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,mkdtemp,readFile,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import scenarios from './scenarios.json' with {type:'json'};
const entry='../../scripts/benchmark-model.mjs';
const {ownedChild,boundedProcess}=await import(entry);
test.describe.configure({retries:0,mode:'default'});test.setTimeout(120000);
async function runCase(id:string,simulation?:string){
 const parent=resolve('.local/bm4-offline');await mkdir(parent,{recursive:true,mode:0o700});const run=await mkdtemp(join(parent,`run-${id}-${simulation??'positive'}-`));
 const outcome=simulation?await boundedProcess('--import',['tsx',resolve('tests/benchmark-model/worker.ts'),id,run,'offline',simulation],{cwd:process.cwd(),env:{...process.env,PI_OFFLINE:'1'},timeout:102000}):await ownedChild(id,run,true);
 assert.equal(outcome.code,0,'owned synthetic worker exit');assert.equal(outcome.failure,undefined,'owned synthetic worker deadline');assert.notEqual(outcome.fallbackBrowserKill,true,'normal synthetic worker must close its browser itself');const report=JSON.parse(await readFile(join(run,id+'.json'),'utf8'));assert.equal(report.actualModelRequests,0);return{report,run};
}
for(const row of scenarios)test('BM4 synthetic actual SDK/skill/helper/browser control '+row.id,async()=>{
 const {report}=await runCase(row.id);expect(report.harnessFailure).toBeUndefined();expect(report.cleanupFailures).toEqual([]);expect(report.stage).toBe('success');expect(report.compileValid).toBe(true);expect(report.rendered).toBe(true);expect(report.intentPass).toBe(true);expect(report.skillLoadedInProviderContext).toBe(true);expect(report.activeTools.sort()).toEqual(['read','bash','write','edit','a2ui_render','a2ui_register_artifact'].sort());expect(report.requests).toBe(row.id==='M12'?4:3);expect(report.blockedRequests).toBe(0);expect(report.serverClosed).toBe(true);
 if(row.action){expect(report.interactionPass).toBe(true);expect(report.statuses).toEqual([202]);expect(report.queue.context).toEqual(row.action.context);}else{expect(report.staticPass).toBe(true);expect(report.statuses).toEqual([]);expect(report.queue).toBeUndefined();}
});
for(const [simulation,stage,requests]of [['failed-check','preflight',2],['changed-render','toolpolicy',3],['unsafe-bash','toolpolicy',1],['rate-limit','provider',1],['no-render','no-render',1],['wrong-intent','intent',3],['cleanup-fault','intent',3],['request-budget','provider',5],['tool-budget','toolpolicy',1]]as const)test('BM4 synthetic negative '+simulation,async()=>{
 const {report}=await runCase('M01',simulation);expect(report.stage).toBe(stage);expect(report.requests).toBe(requests);expect(report.interactionPass).toBe(false);expect(report.actualModelRequests).toBe(0);expect(report.error).toBeTruthy();
 if(simulation==='request-budget'){expect(report.blockedRequests).toBe(1);expect(report.rendered).toBe(false);}
 if(simulation==='tool-budget'){expect(report.toolCount).toBe(8);expect(report.toolAttempts).toBe(9);}
 if(simulation==='rate-limit')expect(report.fatal).toBe(true);
 if(simulation==='failed-check'){expect(report.compileValid).toBe(false);expect(report.rendered).toBe(false);expect(report.tools.filter((t:any)=>t.name==='bash')).toHaveLength(1);}
 if(simulation==='cleanup-fault'){expect(report.harnessFailure).toBe(true);expect(report.error).toContain('literal context line');expect(report.cleanupFailures.join()).toContain('injected cleanup fault');expect(report.serverClosed).toBe(true);}else expect(report.cleanupFailures).toEqual([]);
});

test('BM4 actual hung worker kills owned detached browser and removes only owned workspace',async()=>{
 const parent=resolve('.local/bm4-offline');await mkdir(parent,{recursive:true});const run=await mkdtemp(join(parent,'run-hang-'));
 const outcome=await ownedChild('M01',run,true,8000,'browser-hang');expect(outcome.failure).toBe('owned worker hard timeout');expect(outcome.signal).toBe('SIGKILL');expect(outcome.fallbackBrowserKill).toBe(true);
 const resource=JSON.parse(await readFile(join(run,'M01.resources.json'),'utf8'));expect(resource.workerPid).toBe(outcome.pid);
 await expect.poll(async()=>{try{process.kill(resource.browserPid,0);return false;}catch(error){return(error as NodeJS.ErrnoException).code==='ESRCH';}},{timeout:3000}).toBe(true);
 await assert.rejects(fetch(resource.origin,{signal:AbortSignal.timeout(1000)}));const {readdir}=await import('node:fs/promises');expect((await readdir(run)).filter(name=>name.startsWith('M01-workspace-'))).toEqual([]);
});

for(const id of ['M01','M02'])test('BM4 legal binding/nestedlayout actual browser '+id,async()=>{const {report}=await runCase(id,'binding-layout');expect(report.stage).toBe('success');expect(report.intentPass).toBe(true);expect(report.interactionPass).toBe(true);expect(report.statuses).toEqual([202]);expect(report.cleanupFailures).toEqual([]);});
test('BM4 wrong request identity stops admission before any transport and marks batch fatal',async()=>{const {report}=await runCase('M01','identity');expect(report.stage).toBe('admission');expect(report.requests).toBe(0);expect(report.actualModelRequests).toBe(0);expect(report.fatal).toBe(true);expect(report.harnessFailure).toBe(true);expect(report.toolCount).toBe(0);});
