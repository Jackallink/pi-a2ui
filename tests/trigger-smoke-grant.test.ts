import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {join,basename} from 'node:path';
import {spawn,spawnSync} from 'node:child_process';
import {syncBuiltinESMExports} from 'node:module';
import {createRun,ROOT} from './trigger-pilot/control.ts';
import {SMOKE_ID,PROFILE_SHA,digest,validateGrantData,claimOnce,claimEpisode,negativeReceiptPassed,smokeSummary} from './trigger-smoke/policy.ts';

test('SMG01 default/help and LIVE three entrypoints have zero config/network access without grant',()=>{
 const run=createRun(SMOKE_ID),counter=join(run,'access.json'),guard=join(run,'guard.mjs');
 fs.writeFileSync(guard,`import fs from'node:fs';import promises from'node:fs/promises';import{syncBuiltinESMExports}from'node:module';const put=fs.writeFileSync,s={config:0,network:0},save=()=>put(${JSON.stringify(counter)},JSON.stringify(s));save();const check=p=>{if(String(p).includes('/.pi/agent')){s.config++;save();throw Error('config denied');}};for(const k of ['readFileSync','readFile','openSync','open']){const f=fs[k];fs[k]=function(p,...a){check(p);return f.call(fs,p,...a);};}for(const k of ['readFile','open']){const f=promises[k];promises[k]=function(p,...a){check(p);return f.call(promises,p,...a);};}syncBuiltinESMExports();globalThis.fetch=()=>{s.network++;save();throw Error('network denied');};`);
 const commands=[{args:[join(ROOT,'scripts/trigger-smoke.mjs')],code:0},{args:[join(ROOT,'scripts/trigger-smoke.mjs'),'--help'],code:0},{args:[join(ROOT,'scripts/trigger-smoke.mjs'),'--execute','--archive','/missing','--grant',join(run,'missing')],code:1},{args:['--import','tsx',join(ROOT,'tests/trigger-pilot/worker.ts'),'SM02-B',run,'live','',SMOKE_ID],code:1},{args:['--import','tsx','--input-type=module','--eval',`const{episode}=await import('./tests/trigger-pilot/worker.ts');await episode('SM02-B',${JSON.stringify(run)},'live','',${JSON.stringify(SMOKE_ID)});`],code:1}];
 for(const row of commands){const r=spawnSync(process.execPath,['--import',guard,...row.args],{cwd:ROOT,encoding:'utf8',timeout:15000});assert.equal(r.status,row.code);assert.deepEqual(JSON.parse(fs.readFileSync(counter,'utf8')),{config:0,network:0});assert.equal(fs.existsSync(join(run,'workspace')),false);assert.equal(fs.existsSync(join(run,'live-requests.jsonl')),false);}
});
test('SMG03 an atomic granted execution has one winner under concurrency and cannot replay',async()=>{
 const run=createRun(SMOKE_ID),id='unit-'+basename(run),sha='a'.repeat(64),lock=join(ROOT,'.local/trigger-smoke','grant-'+id+'.lock');
 try{const jobs=[0,1,2].map(()=>new Promise<number|null>(resolve=>{const c=spawn(process.execPath,['--import','tsx','--input-type=module','--eval',`import{claimOnce}from'./tests/trigger-smoke/policy.ts';claimOnce(${JSON.stringify(run)},${JSON.stringify(id)},${JSON.stringify(sha)});`],{cwd:ROOT,stdio:'ignore'});c.on('close',resolve);}));const results=await Promise.all(jobs);assert.equal(results.filter(c=>c===0).length,1);assert.throws(()=>claimOnce(run,id,sha));}finally{fs.rmSync(lock,{recursive:true,force:true});}
});
test('SMG03 failure after grantlock before POST still consumes the one-use execution',()=>{
 const run=createRun(SMOKE_ID),id='unit-fault-'+basename(run),lock=join(ROOT,'.local/trigger-smoke','grant-'+id+'.lock'),write=fs.writeFileSync;
 try{fs.writeFileSync=()=>{throw Error('synthetic owner write fault');};syncBuiltinESMExports();assert.throws(()=>claimOnce(run,id,'a'.repeat(64)));fs.writeFileSync=write;syncBuiltinESMExports();assert.equal(fs.existsSync(lock),true);assert.throws(()=>claimOnce(run,id,'a'.repeat(64)));}finally{fs.writeFileSync=write;syncBuiltinESMExports();fs.rmSync(lock,{recursive:true,force:true});}
});
test('SMG03 a started episode is consumed even before any config or POST',()=>{const run=createRun(SMOKE_ID);claimEpisode(run,'SM02-B');assert.throws(()=>claimEpisode(run,'SM02-B'));assert.equal(fs.existsSync(join(run,'workspace')),false);assert.equal(fs.existsSync(join(run,'live-requests.jsonl')),false);});
test('SMG04 grant binds source profile captures model caps and explicit user approval',()=>{
 const pre:any={identity:{source:'source',tree:'tree',dirty:false},experiment:SMOKE_ID,profileSHA256:PROFILE_SHA,archiveSHA256:JSON.parse(fs.readFileSync('tests/trigger-smoke/profile.json','utf8')).release.archiveSHA256,contexts:{'SM02-B':'a'.repeat(64),'SM01-B':'b'.repeat(64)}};
 const grant:any={schema:'smoke-user-grant-v1',spec:'Spec023',userMessage:'授权',id:'unit',maxRequests:4,perEpisode:{'SM02-B':1,'SM01-B':3},model:'glm-5.3-flash',invocations:1,profileSHA256:PROFILE_SHA,preflightSHA256:digest(JSON.stringify(pre)),source:'source',tree:'tree'};validateGrantData(grant,pre);
 for(const patch of [{maxRequests:5},{model:'forbidden'},{perEpisode:{'SM02-B':2,'SM01-B':3}},{profileSHA256:'bad'},{preflightSHA256:'bad'},{source:'bad'},{userMessage:'CLI self approval'},{invocations:2}])assert.throws(()=>validateGrantData({...grant,...patch},pre));
});
test('SMG05 positive requires a complete real negative receipt bound to its journal and context',()=>{
 const h='a'.repeat(64),rows:any[]=[{episode:'SM02-B',mode:'live',experiment:SMOKE_ID,profileSHA256:PROFILE_SHA,bodySHA256:h}];const r:any={id:'SM02-B',kind:'live',experiment:SMOKE_ID,outcome:'negative_pass',requests:1,modelCalls:1,renderRequested:false,renderAttempted:false,renderCommitted:false,toolCount:0,tools:[],cleanupErrors:[],fatal:false,firstBodySHA256:h,requestDiagnostics:[{sdkStopReason:'stop',bodySHA256:h,status:200}],transcript:[{role:'assistant',stopReason:'stop',content:[{type:'text',text:'收到'}]}]};assert.equal(negativeReceiptPassed(r,rows,h),true);
 for(const invalid of [null,{}, {...r,outcome:'negative_text'},{...r,cleanupErrors:['browser']},{...r,transcript:[]},{...r,requestDiagnostics:[{sdkStopReason:'error',bodySHA256:h,status:200}]}])assert.equal(negativeReceiptPassed(invalid,rows,h),false);assert.equal(negativeReceiptPassed(r,[],h),false);assert.equal(negativeReceiptPassed(r,rows,'b'.repeat(64)),false);
});
test('SMG06 two-row smoke summary never converts unknown or not-run into comparisons or zero live calls',()=>{
 const s=smokeSummary([{id:'SM02-B',outcome:'provider_unknown',requests:null,knownAdmittedRequests:1},{id:'SM01-B',outcome:'not_run',notRun:'unknown'}],{complete:true,rows:[{}]},true);assert.equal(s.actualModelRequests,null);assert.equal(s.knownAdmittedRequests,1);assert.equal(s.plannedEpisodes,2);assert.equal(s.positiveChoice,'not_run');assert.equal(s.negative,'unknown');assert.equal('improvementPairs'in s,false);
});
