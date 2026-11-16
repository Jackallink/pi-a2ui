import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {ROOT} from './trigger-pilot/control.ts';
import {ADAPTER_ID} from './helper-adapter/profile.ts';

test('HAG01 all live entrances refuse before SDK config provider workspace or worker spawn',()=>{
 const base=fs.mkdtempSync(join(ROOT,'.local/helper-adapter-implementation/guards-')),counter=join(base,'access.json'),guard=join(base,'guard.mjs');
 fs.writeFileSync(guard,`import fs from'node:fs';import promises from'node:fs/promises';import cp from'node:child_process';import{registerHooks,syncBuiltinESMExports}from'node:module';const put=fs.writeFileSync,s={sdk:0,config:0,network:0,workspace:0,spawn:0},save=()=>{put(${JSON.stringify(counter)},JSON.stringify(s));};save();globalThis.__helperSdk=()=>{s.sdk++;save();};registerHooks({load(url,ctx,next){const r=next(url,ctx);if(url.endsWith('/@earendil-works/pi-coding-agent/dist/index.js'))return{...r,source:'globalThis.__helperSdk();\\n'+r.source};return r;}});const read=p=>{if(String(p).includes('/.pi/agent')){s.config++;save();throw Error('operator config denied');}};for(const k of ['readFileSync','readFile','openSync','open']){const f=fs[k];fs[k]=function(p,...a){read(p);return f.call(fs,p,...a);};}for(const k of ['readFile','open']){const f=promises[k];promises[k]=function(p,...a){read(p);return f.call(promises,p,...a);};}const owned=${JSON.stringify(join(ROOT,'.local/helper-adapter'))},setup=p=>{if(String(p)===owned||String(p).startsWith(owned+'/')){s.workspace++;save();throw Error('owned setup denied');}};for(const k of ['mkdir','rm']){const f=promises[k];promises[k]=function(p,...a){setup(p);return f.call(promises,p,...a);};}const mkdir=fs.mkdirSync;fs.mkdirSync=function(p,...a){setup(p);return mkdir.call(fs,p,...a);};cp.spawn=()=>{s.spawn++;save();throw Error('worker spawn denied');};syncBuiltinESMExports();globalThis.fetch=()=>{s.network++;save();throw Error('external fetch denied');};`);
 const run=join(ROOT,'.local/helper-adapter/run-never'),script=join(ROOT,'scripts/helper-adapter.mjs'),worker=join(ROOT,'tests/trigger-pilot/worker.ts');
 const commands:Array<[string[],number]>=[
  [[script],0],[[script,'--help'],0],[[script,'--execute','--grant','/synthetic/consumed-grant.json'],1],[[script,'--offline','--grant','/synthetic/consumed-grant.json'],1],
  [['--import','tsx',worker,'HX01-C',run,'live','',ADAPTER_ID],1],
  [['--import','tsx','--input-type=module','--eval',`const{episode}=await import('./tests/trigger-pilot/worker.ts');await episode('HX01-C',${JSON.stringify(run)},'live','',${JSON.stringify(ADAPTER_ID)});`],1],
  [['--input-type=module','--eval',`const{main}=await import('./scripts/helper-adapter.mjs');await main(['--execute','--grant','/synthetic/consumed-grant.json']);`],1]
 ];
 for(const[args,status]of commands){const r=spawnSync(process.execPath,['--import',guard,...args],{cwd:ROOT,encoding:'utf8',timeout:15000,maxBuffer:256*1024});assert.equal(r.status,status,r.stderr);assert.deepEqual(JSON.parse(fs.readFileSync(counter,'utf8')),{sdk:0,config:0,network:0,workspace:0,spawn:0});}
 // Positive witness: the same hook observes a real SDK module evaluation.
 const positive=spawnSync(process.execPath,['--import',guard,'--input-type=module','--eval',"await import('@earendil-works/pi-coding-agent');"],{cwd:ROOT,encoding:'utf8',timeout:15000,maxBuffer:65536});
 assert.equal(positive.status,0,positive.stderr);const observed=JSON.parse(fs.readFileSync(counter,'utf8'));assert.equal(observed.sdk,1);assert.equal(observed.config,0);assert.equal(observed.network,0);assert.equal(observed.workspace,0);
});
for(const canary of ['direct','usage','redirect'])test('HAI01 public offline CLI completes or stops the exact fixed order '+canary,()=>{
 const r=spawnSync(process.execPath,[join(ROOT,'scripts/helper-adapter.mjs'),'--offline','--canary',canary],{cwd:ROOT,encoding:'utf8',timeout:60000,maxBuffer:1024*1024});assert.equal(r.status,canary==='redirect'?1:0,r.stderr);
 const lines=r.stdout.trim().split('\n').map(s=>JSON.parse(s)),report=JSON.parse(fs.readFileSync(lines.at(-1).report,'utf8'));assert.deepEqual(report.results.map((v:any)=>v.id),['HX01-C','HX01-G']);assert.equal(report.providerRequests,0);assert.equal(report.credentialReads,0);assert.equal(report.modelEffect,'not_evaluated');
 if(canary==='redirect'){assert.equal(report.results[0].outcome,'tool_policy');assert.equal(report.results[1].outcome,'not_run');assert.equal(report.journal.rows.length,2);assert.equal(fs.existsSync(join(lines[0].run,'forbidden-sentinel')),false);}
 if(canary==='usage'){assert.equal(report.results[0].outcome,'preparation_error');assert.equal(report.results[1].outcome,'render_committed');assert.equal(report.results[1].contentValid,true);}
 if(canary==='direct'){assert.equal(report.syntheticUiPassed,2);assert.ok(report.results.every((v:any)=>v.helperAdmissions.every((p:any)=>p.variant==='direct'&&p.status==='executed')));}
});
