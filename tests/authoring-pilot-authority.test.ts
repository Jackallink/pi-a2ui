// Source-bound fake authority against real entry points. No config/provider allowed.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {join,dirname} from 'node:path';
import {execFileSync,spawnSync,spawn} from 'node:child_process';
import {ROOT,identity,createRun,captureContexts} from './trigger-pilot/control.ts';
import {PAIR_ID,PAIR,PAIR_SHA,ARCHIVES} from './authoring-pilot/profile.ts';
import {materializePackages,validateContextPairs} from './authoring-pilot/authority.ts';
import {digest} from './trigger-smoke/policy.ts';

test('APG02 imported live API refuses before SDK module evaluation',()=>{
 const code=`import{registerHooks}from'node:module';registerHooks({load(url,ctx,next){const r=next(url,ctx);if(url.endsWith('/@earendil-works/pi-coding-agent/dist/index.js'))return{...r,source:'globalThis.__pairedSdkEvaluations=(globalThis.__pairedSdkEvaluations??0)+1;\\n'+r.source};return r;}});let refused=false;try{const{episode}=await import('./tests/trigger-pilot/worker.ts');await episode('FP01-C',${JSON.stringify(join(ROOT,'.local/authoring-pilot/run-missing'))},'live','',${JSON.stringify(PAIR_ID)});}catch{refused=true;}console.log(JSON.stringify({refused,sdkEvaluations:globalThis.__pairedSdkEvaluations??0}));`;
 const r=spawnSync(process.execPath,['--import','tsx','--input-type=module','--eval',code],{cwd:ROOT,encoding:'utf8',timeout:20000});assert.equal(r.status,0,r.stderr);assert.deepEqual(JSON.parse(r.stdout.trim()),{refused:true,sdkEvaluations:0});
});

test('APG01 actual pure CLI and early worker reject drift replay bad predecessor and racing grants',async()=>{
 const originalRun=createRun(PAIR_ID),packages=materializePackages(originalRun),contexts=await captureContexts(originalRun,PAIR_ID);validateContextPairs(originalRun);
 const fixture=fs.mkdtempSync(join(ROOT,'.local/authoring-pilot-implementation/authority-')),run=join(fixture,'.local/authoring-pilot/run-fixture'),base=dirname(run),grantFile=join(base,'grant.json'),lock=join(base,'grant-fixture.lock'),counter=join(fixture,'.local/access.json'),guard=join(fixture,'.local/witness.mjs');
 const original=identity();for(const p of Object.keys(original.files)){fs.mkdirSync(dirname(join(fixture,p)),{recursive:true});fs.copyFileSync(join(ROOT,p),join(fixture,p));}
 for(const archive of Object.values(ARCHIVES)){fs.mkdirSync(dirname(join(fixture,archive)),{recursive:true});fs.copyFileSync(join(ROOT,archive),join(fixture,archive));}
 fs.symlinkSync(join(ROOT,'node_modules'),join(fixture,'node_modules'),'dir');fs.writeFileSync(join(fixture,'.gitignore'),'node_modules\n.local\n');
 const git=(args:string[])=>execFileSync('git',['-c','commit.gpgSign=false','-c','core.hooksPath=/dev/null','-c','user.name=Paired fixture','-c','user.email=fixture@example.invalid',...args],{cwd:fixture,encoding:'utf8',timeout:15000,stdio:['ignore','pipe','pipe']}).trim();
 git(['init','-q']);git(['add','.']);git(['commit','-qm','synthetic authority fixture']);
 fs.mkdirSync(run,{recursive:true});fs.writeFileSync(join(run,'.owned'),PAIR_ID+'\n');fs.cpSync(join(originalRun,'arms'),join(run,'arms'),{recursive:true});fs.copyFileSync(join(originalRun,'packages.json'),join(run,'packages.json'));
 const captureFiles:any={};for(const id of PAIR.order)for(const kind of ['capture','context']){const p=id+'.'+kind+'.json';fs.copyFileSync(join(originalRun,p),join(run,p));captureFiles[p]=digest(fs.readFileSync(join(run,p)));}
 const pre:any={experiment:PAIR_ID,profileSHA256:PAIR_SHA,identity:{...original,source:git(['rev-parse','HEAD']),tree:git(['rev-parse','HEAD^{tree}']),dirty:false,files:Object.fromEntries(Object.keys(original.files).map(p=>[p,digest(fs.readFileSync(join(fixture,p)))]))},packages,contexts,captureFiles};
 const write=(path:string,v:unknown)=>fs.writeFileSync(path,JSON.stringify(v));write(join(run,'preflight.json'),pre);write(join(run,'contexts.json'),contexts);
 const review=join(fixture,'.local/authoring-pilot-implementation/code-go.json');fs.mkdirSync(dirname(review),{recursive:true});write(review,{verdict:'GO',source:pre.identity.source,tree:pre.identity.tree,synthetic:true});
 const grant:any={schema:'spec025-user-grant-v1',spec:'Spec025',userMessage:'授权',id:'fixture',invocations:1,maxRequests:24,requestsPerSession:6,order:PAIR.order,model:'glm-5.3-flash',endpoint:PAIR.model.endpoint,profileSHA256:PAIR_SHA,preflightSHA256:digest(JSON.stringify(pre)),source:pre.identity.source,tree:pre.identity.tree,run,review:{path:review,sha256:digest(fs.readFileSync(review)),source:pre.identity.source,verdict:'GO'}};
 const prior:any={id:'FP01-C',kind:'live',experiment:PAIR_ID,outcome:'preflight_error',requests:1,modelCalls:1,renderRequested:false,renderAttempted:false,renderCommitted:false,toolCount:0,tools:[],cleanupErrors:[],fatal:false,requestAccounting:'known',process:{code:0,fallback:false},requestDiagnostics:[{request:1,journalIndex:1,bodySHA256:contexts['FP01-C'],status:200,sdkStopReason:'toolUse',doneObserved:true,streamState:'cancelled',finishReasons:['tool_calls'],errors:[]}]};
 const row={index:1,episode:'FP01-C',mode:'live',experiment:PAIR_ID,profileSHA256:PAIR_SHA,model:'glm-5.3-flash',endpoint:PAIR.model.endpoint,bodySHA256:contexts['FP01-C']};
 function reset(withPrior=false){
  for(const id of PAIR.order)for(const suffix of ['.live-started','.live.json','.completed.json'])fs.rmSync(join(run,id+suffix),{recursive:true,force:true});fs.rmSync(join(run,'terminal.json'),{force:true});
  write(grantFile,grant);fs.mkdirSync(lock,{recursive:true});const grantSHA=digest(fs.readFileSync(grantFile));write(join(lock,'owner.json'),{run,grantSHA});write(join(run,'admission.json'),{grantFile,grantSHA,preflightSHA256:grant.preflightSHA256,lock,batchStartedAt:Date.now()});write(join(run,'contexts.json'),contexts);fs.writeFileSync(join(run,'live-requests.jsonl'),withPrior?JSON.stringify(row)+'\n':'');
  if(withPrior){write(join(run,'FP01-C.live.json'),prior);write(join(run,'FP01-C.completed.json'),{rawSHA256:digest(fs.readFileSync(join(run,'FP01-C.live.json'))),result:prior});}
 }
 fs.writeFileSync(guard,`import fs from'node:fs';import promises from'node:fs/promises';import cp from'node:child_process';import{syncBuiltinESMExports}from'node:module';const put=fs.writeFileSync,s={config:0,network:0,workspace:0,spawn:0,claim:0},save=()=>{put(${JSON.stringify(counter)},JSON.stringify(s));put(${JSON.stringify(counter)}+'.'+process.pid,JSON.stringify(s));};save();const read=p=>{if(String(p).includes('/.pi/agent')){s.config++;save();throw Error('config denied');}};const workspace=p=>{if(String(p).includes('/workspace')){s.workspace++;save();throw Error('valid workspace witness');}};for(const k of ['readFileSync','readFile','openSync','open']){const f=fs[k];fs[k]=function(p,...a){read(p);return f.call(fs,p,...a);};}for(const k of ['readFile','open']){const f=promises[k];promises[k]=function(p,...a){read(p);return f.call(promises,p,...a);};}for(const k of ['rm','mkdir']){const f=promises[k];promises[k]=function(p,...a){workspace(p);return f.call(promises,p,...a);};}const mkdir=fs.mkdirSync;fs.mkdirSync=function(p,...a){if(String(p).endsWith('grant-fixture.lock')){s.claim++;save();}workspace(p);return mkdir.call(fs,p,...a);};cp.spawn=()=>{s.spawn++;save();throw Error('valid spawn witness');};syncBuiltinESMExports();globalThis.fetch=()=>{s.network++;save();throw Error('network denied');};`);
 const invoke=(id='FP01-C',cli=false,extra:string[]=[])=>{const args=cli?[join(fixture,'scripts/authoring-pilot.mjs'),'--execute','--grant',grantFile]:['--import','tsx',join(fixture,'tests/trigger-pilot/worker.ts'),id,run,'live','',PAIR_ID,...extra];const result=spawnSync(process.execPath,['--import',guard,...args],{cwd:fixture,encoding:'utf8',timeout:20000,maxBuffer:65536});return{result,access:JSON.parse(fs.readFileSync(counter,'utf8'))};};
 reset();let witness=invoke();assert.equal(witness.access.workspace,1,witness.result.stderr);assert.equal(witness.access.config,0);assert.equal(witness.access.network,0);
 reset(true);witness=invoke('FP01-G');assert.equal(witness.access.workspace,1,witness.result.stderr);
 const rejected:any[]=[];
 for(const [name,mutate,id='FP01-C']of [
  ['missing-ticket',()=>fs.rmSync(join(run,'admission.json'))],['forged-ticket',()=>write(join(run,'admission.json'),{grantSHA:'bad'})],['budget25',()=>write(grantFile,{...grant,maxRequests:25})],['perSession7',()=>write(grantFile,{...grant,requestsPerSession:7})],['source-drift',()=>write(grantFile,{...grant,source:'bad'})],['case-replay',()=>fs.mkdirSync(join(run,'FP01-C.live-started'))],['missing-prior',()=>fs.rmSync(join(run,'FP01-C.completed.json')),'FP01-G'],['fatal-prior',()=>write(join(run,'FP01-C.completed.json'),{result:{...prior,fatal:true}}),'FP01-G'],['torn-journal',()=>fs.appendFileSync(join(run,'live-requests.jsonl'),'{'),'FP01-G'],['out-of-order',()=>{},'FP02-G'],['terminal',()=>write(join(run,'terminal.json'),{})]
 ] as Array<[string,()=>void,string?]>){reset(id!=='FP01-C');mutate();const r=invoke(id);assert.equal(r.result.status,1,name);assert.deepEqual(r.access,{config:0,network:0,workspace:0,spawn:0,claim:0},name);rejected.push({name,access:r.access});}
 for(const relative of ['tests/authoring-pilot/profile.json','tests/trigger-pilot/worker.ts','.local/authoring-pilot/run-fixture/arms/C/package/extension.ts','.local/authoring-pilot/run-fixture/FP01-G.context.json',ARCHIVES.G]){
  reset();const path=join(fixture,relative),bytes=fs.readFileSync(path);fs.appendFileSync(path,'\n');try{const r=invoke();assert.equal(r.result.status,1,relative);assert.equal(r.access.config,0);assert.equal(r.access.workspace,0);assert.equal(r.access.network,0);}finally{fs.writeFileSync(path,bytes);}
 }
 reset();const wrongArgv=invoke('FP01-C',false,['unexpected']);assert.equal(wrongArgv.result.status,1);assert.equal(wrongArgv.access.workspace,0);
 reset();write(grantFile,{...grant,maxRequests:25});assert.equal(invoke('FP01-C',true).access.claim,0);
 reset();fs.rmSync(lock,{recursive:true});
 const race=()=>new Promise<any>(resolve=>{const c=spawn(process.execPath,['--import',guard,join(fixture,'scripts/authoring-pilot.mjs'),'--execute','--grant',grantFile],{cwd:fixture,stdio:['ignore','pipe','pipe']});c.stdout.resume();c.stderr.resume();c.once('close',code=>resolve({code,access:JSON.parse(fs.readFileSync(counter+'.'+c.pid,'utf8'))}));});
 const raced=await Promise.all([race(),race()]);assert.equal(raced.filter(r=>r.access.spawn===1).length,1);assert.ok(raced.every(r=>r.access.config===0&&r.access.network===0));const replay=invoke('FP01-C',true);assert.equal(replay.access.spawn,0);
 write(join(fixture,'.local/result.json'),{syntheticOnly:true,rejected,concurrentExecute:raced,configReads:0,providerRequests:0});
});
