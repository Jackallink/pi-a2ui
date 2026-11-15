import test from 'node:test';
import assert from 'node:assert/strict';
import {MODEL,RequestBudget} from './benchmark-model/guards.ts';
test('BM4 cost canary: second real transport invocation must not escape one-request fixture budget',async()=>{
 const budget=new RequestBudget(1);let transports=0;
 const request=async()=>{budget.admit(MODEL.baseUrl+'/chat/completions',MODEL);transports++;return new Response('synthetic actual transport response');};
 assert.equal((await request()).status,200);assert.equal(transports,1);
 await assert.rejects(request,/request budget/);
 assert.equal(transports,1,'second actual synthetic transport was never invoked');
});
import {mkdtemp,mkdir,writeFile,readFile,rm,symlink,realpath} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {configValue,selectedConfig,literalCredentials,ordinaryPath,helperCommand,redact,CAPS} from './benchmark-model/guards.ts';
import {compile} from '../src/compiler.ts';
import {SOURCES} from './benchmark-model/fixtures.ts';
import {intent,type Scenario} from './benchmark-model/oracles.ts';
import rows from './benchmark-model/scenarios.json' with {type:'json'};
const scenarios=rows as Scenario[];
const modelConfig={providers:{[MODEL.provider]:{baseUrl:MODEL.baseUrl,api:'openai-completions',apiKey:'fixture-key',models:[{id:MODEL.id}]}}};
for(const [label,mutate,reason]of [
 ['model',(m:any)=>({...m,id:'other-model'}),/model identity/],
 ['provider',(m:any)=>({...m,provider:'codeplan'}),/model identity/],
 ['endpoint',(m:any)=>({...m,baseUrl:'https://other.example/'}),/model identity/],
]as const)test('BM4 denies wrong '+label,()=>{const b=new RequestBudget();assert.throws(()=>b.admit(MODEL.baseUrl+'/chat/completions',mutate(MODEL)),reason);assert.equal(b.attempts,0);});
test('BM4 denies redirects/alternate endpoint and postrender continuation before transport',()=>{const b=new RequestBudget();assert.throws(()=>b.admit(MODEL.baseUrl+'/responses',MODEL),/endpoint identity/);b.stopped=true;assert.throws(()=>b.admit(MODEL.baseUrl+'/chat/completions',MODEL),/post-stop/);assert.equal(b.attempts,0);});
test('BM4 exact5total requests, no 5plus1 render turn',()=>{const b=new RequestBudget();for(let i=0;i<5;i++)b.admit(MODEL.baseUrl+'/chat/completions',MODEL);assert.throws(()=>b.admit(MODEL.baseUrl+'/chat/completions',MODEL),/request budget/);assert.equal(b.attempts,5);assert.equal(CAPS.maxTokens,3072);});
test('BM4 command config sentinel never executes shell or writes marker',async()=>{const dir=await mkdtemp(join(tmpdir(),'bm4-config-sentinel-'));try{const marker=join(dir,'MUST-NOT-EXIST');for(const key of ['apiKey','header','auth']){const config=structuredClone(modelConfig)as any;let auth:any={};if(key==='apiKey')config.providers[MODEL.provider].apiKey='!touch '+marker;if(key==='header')config.providers[MODEL.provider].headers={'X-Test':'!touch '+marker};if(key==='auth')auth={[MODEL.provider]:{type:'api_key',key:'!touch '+marker}};assert.throws(()=>selectedConfig(config,auth,{}),/command config/);assert.equal(existsSync(marker),false);} }finally{await rm(dir,{recursive:true});}});
test('BM4 opaque resolved key and header preserve dollar/bang bytes without second interpolation',async()=>{const config=structuredClone(modelConfig)as any;config.providers[MODEL.provider].apiKey='$KEY';config.providers[MODEL.provider].headers={'X-Test':'${HEADER}'};const selected=selectedConfig(config,{}, {KEY:'opaque$OTHER!key',HEADER:'opaque$OTHER!header',OTHER:'WRONG'});assert.equal(selected.key,'opaque$OTHER!key');assert.equal(selected.headers['X-Test'],'opaque$OTHER!header');assert.deepEqual(await literalCredentials(selected.key).read(MODEL.provider),{type:'api_key',key:'opaque$OTHER!key'});await assert.rejects(literalCredentials(selected.key).modify(),/readonly/);});
for(const [name,value]of [['newline','bad\nkey'],['empty',''],['command','  !echo key']]as const)test('BM4 config rejects '+name,()=>assert.throws(()=>configValue(value,{})));
test('BM4 config rejects unsupported credential, header override and missingenv',()=>{assert.throws(()=>selectedConfig(modelConfig,{[MODEL.provider]:{type:'oauth'}},{}));const config=structuredClone(modelConfig)as any;config.providers[MODEL.provider].headers={Authorization:'bad'};assert.throws(()=>selectedConfig(config,{},{}));assert.throws(()=>configValue('$MISSING',{}));});
test('BM4 path roots and symlinks cannot expose repo oracle/auth/dependency files',async()=>{const dir=await realpath(await mkdtemp(join(tmpdir(),'bm4-path-')));try{const project=join(dir,'project');await mkdir(project);await writeFile(join(project,'draft.express'),'root = Text("x")');await symlink(dir,join(project,'escape'));assert.equal(ordinaryPath('draft.express',[project],project),join(project,'draft.express'));assert.throws(()=>ordinaryPath('../oracle.ts',[project],project),/outside/);assert.throws(()=>ordinaryPath('escape/project/draft.express',[project],project),/symlink/);await writeFile(join(project,'sample.png'),'x');assert.throws(()=>ordinaryPath('sample.png',[project],project),/image read/);}finally{await rm(dir,{recursive:true});}});
const helper='/owned/package/skills/pi-a2ui/scripts/a2ui.mjs',draft='/owned/project/draft.express',names={components:['Text'],examples:['user-form'],patterns:['form']};
test('BM4 helper exact canonical Node24 check leaves source untouched',()=>{const result=helperCommand(`node "${helper}" check --surface-id bm4 "${draft}"`,helper,draft,'/owned/project',names);assert.equal(result.check,true);assert.ok(result.command.startsWith("'"+process.execPath+"'"));});
for(const command of [`node "${helper}" catalog; echo secret`,`node "${helper}" check --surface-id bm4 /etc/passwd`,`node "${helper}" example missing`,`node "${helper}" catalog\nwhoami`,`node "${helper}" catalog > output`,`env KEY=x node "${helper}" catalog`,`node "${helper}" component Text extra`,`node "${helper}" example $(pwd)`])test('BM4 unsafe/unlisted shell rejected '+command.slice(-25),()=>assert.throws(()=>helperCommand(command,helper,draft,'/owned/project',names)));
test('BM4 report redacts credential/header strings, bearer and bootstrap token',()=>{const result=redact('opaque$secret HeaderValue Bearer xyz http://127.0.0.1/#token=abc',['opaque$secret','HeaderValue']);assert.ok(!result.includes('opaque$secret')&&!result.includes('HeaderValue')&&!result.includes('xyz')&&!result.includes('abc'));});
for(const row of scenarios)test('BM4 independent semantic positive '+row.id,()=>{const source=SOURCES[row.id].replaceAll('ARTIFACT_SRC','/api/artifacts/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');const message=compile('bm4',source);intent(row,{version:1,epoch:'fixture',enabled:true,surfaces:[{surfaceId:'bm4',revision:1,message}]},row.id==='M12'?'/api/artifacts/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa':undefined);});
for(const [id,change]of [
 ['M01',(source:string)=>source.replace('line:42','line:"42"')],
 ['M02',(source:string)=>source.replace('accept:$/accept','ok:$/accept')],
 ['M04',(source:string)=>source.replace('["A",10]','["A","10"]')],
 ['M05',(source:string)=>source.replace('42;','43;')],
 ['M07',(source:string)=>source.replace('trigger=Text("Open details"),content=Text("Review carefully")','trigger=Text("Review carefully"),content=Text("Open details")')],
 ['M09',(source:string)=>source.replace('value:-2','value:2')],
 ['M10',(source:string)=>source.replace('before="old"','before="incorrect"')],
 ['M12',(source:string)=>source.replaceAll('ARTIFACT_SRC','/api/artifacts/bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb')],
]as const)test('BM4 legal wrong intent rejected '+id,()=>{const message=compile('bm4',change(SOURCES[id]));assert.throws(()=>intent(scenarios.find(row=>row.id===id)!,{version:1,epoch:'fixture',enabled:true,surfaces:[{surfaceId:'bm4',revision:1,message}]},'/api/artifacts/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'));});
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const exec=promisify(execFile);
test('BM4 actual default dry-run has12cases/0providerrequests/0credentialreads and rejects unknown flags',async()=>{
 const {stdout}=await exec(process.execPath,['scripts/benchmark-model.mjs'],{env:{...process.env,PI_CODING_AGENT_DIR:'/nonexistent/BM4_AUTH_CANARY'},timeout:10000});const report=JSON.parse(stdout);assert.equal(report.mode,'dry-run');assert.equal(report.providerRequests,0);assert.equal(report.credentialReads,0);assert.equal(report.scenarios.length,12);assert.equal(new Set(report.scenarios.map((r:any)=>r.id)).size,12);
 await assert.rejects(exec(process.execPath,['scripts/benchmark-model.mjs','--execute'],{timeout:10000}));await assert.rejects(exec(process.execPath,['scripts/benchmark-model.mjs','--dry-run','--execute'],{timeout:10000}));
});
test('BM4 actual resistant owned process is killed and observed closed within bound',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'bm4-process-'));try{const path=join(dir,'resist.mjs');await writeFile(path,'process.on("SIGTERM",()=>{});console.log("ready");setInterval(()=>{},100);');
 const modulePath='../scripts/benchmark-model.mjs';const {boundedProcess}=await import(modulePath);const start=Date.now();const result=await boundedProcess(path,[],{timeout:300});assert.equal(result.failure,'owned worker hard timeout');assert.equal(result.signal,'SIGKILL');assert.match(result.output,/ready/);assert.ok(Date.now()-start<6000);
 }finally{await rm(dir,{recursive:true});}
});
test('BM4 helper rejects unmatched quotes rather than silently rewriting broken syntax',()=>assert.throws(()=>helperCommand(`node "${helper}" catalog'`,helper,draft,'/owned/project',names),/unbalanced/));
test('BM4 literal environment value may begin with bang without becoming a shell command',async()=>{const selected=selectedConfig({...modelConfig,providers:{[MODEL.provider]:{...modelConfig.providers[MODEL.provider],apiKey:'$KEY'}}},{},{KEY:'!opaque$ALSO'});assert.equal((await literalCredentials(selected.key).read(MODEL.provider)).key,'!opaque$ALSO');});
test('BM4 valid layout variation in Modal content is not a semantic failure',()=>{const message=compile('bm4',SOURCES.M07.replace('content=Text("Review carefully")','content=Column([Text("Review carefully")])'));intent(scenarios.find(r=>r.id==='M07')!,{version:1,epoch:'fixture',enabled:true,surfaces:[{surfaceId:'bm4',revision:1,message}]});});
test('BM4 structured redaction retains valid JSON and numeric metrics with short or quoted secret',()=>{const value={count:12,text:'a"quoted$secret and1',source:'literal 1'};const clean=JSON.parse(redact(value,['a"quoted$secret','1']));assert.equal(clean.count,12);assert.ok(!clean.text.includes('quoted'));assert.equal(clean.source,'literal [REDACTED]');});
import childProcess from 'node:child_process';
import {syncBuiltinESMExports} from 'node:module';
test('BM4 pre-SDK !command admission has actual zero child-spawn/fetch even with executable sentinel',()=>{
 const methods=['spawn','spawnSync','exec','execSync','execFile','execFileSync','fork'] as const;const originals=Object.fromEntries(methods.map(name=>[name,childProcess[name]]));let spawns=0,fetches=0;const originalFetch=globalThis.fetch;
 try{for(const name of methods)(childProcess as any)[name]=()=>{spawns++;throw new Error('spawn trap');};syncBuiltinESMExports();globalThis.fetch=async()=>{fetches++;throw new Error('fetch trap');};
 const config=structuredClone(modelConfig);config.providers[MODEL.provider].apiKey='!node -e "throw new Error(\'MUST_NOT_EXECUTE\')"';assert.throws(()=>selectedConfig(config,{},{}),/command config/);assert.equal(spawns,0);assert.equal(fetches,0);
 }finally{for(const name of methods)(childProcess as any)[name]=originals[name];syncBuiltinESMExports();globalThis.fetch=originalFetch;}
});
for(const [name,id,source]of [
 ['legal pointer escape','M02',SOURCES.M02.replace('$/name = ""','$/form = {"name/value":""}').replaceAll('$/name','{"@path":"/form/name~1value"}')],
 ['legal bound label and text','M02','$/label = "Name"\n$/button = "Save form"\n'+SOURCES.M02.replace('label="Name"','label=$/label').replace('Text("Save form")','Text(text=$/button)')],
 ['nested Button label layout','M01',SOURCES.M01.replace('Button(Text("Inspect file")','Button(Column([Text("Inspect file")])')],
]as const)test('BM4 '+name+' is semantic positive',()=>{const message=compile('bm4',source);intent(scenarios.find(r=>r.id===id)!,{version:1,epoch:'fixture',enabled:true,surfaces:[{surfaceId:'bm4',revision:1,message}]});});
import {configAdmission} from './benchmark-model/guards.ts';
test('BM4 real-config parse/admission errors cannot serialize raw config before secrets are known',()=>{
 for(const text of ['{"apiKey":"SENSITIVE"',JSON.stringify({providers:{[MODEL.provider]:{...modelConfig.providers[MODEL.provider],baseUrl:'SENSITIVE'}}})]){try{configAdmission(text,'{}',{});assert.fail('mustreject');}catch(error){assert.match((error as Error).message,/readonly Ark configuration admission failed/);assert.ok(!(error as Error).message.includes('SENSITIVE'));}}
});
test('BM4 killed worker after durable request admission is unknown, never zero or not-run',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'bm4-journal-'));try{const modulePath='../scripts/benchmark-model.mjs';const {workerReceipt,summarize}=await import(modulePath);await writeFile(join(dir,'M01.requests.jsonl'),JSON.stringify({id:'M01',index:1,mode:'live',provider:MODEL.provider,model:MODEL.id,endpoint:MODEL.baseUrl+'/chat/completions'})+'\n');const receipt=workerReceipt('M01',dir,false);assert.equal(receipt.requests,null);assert.equal(receipt.actualModelRequests,null);assert.equal(receipt.started,null);assert.equal(receipt.knownAdmittedRequests,1);const report=summarize([receipt,...Array.from({length:11},(_,i)=>({id:'M'+(i+2),started:false,notRun:'harness stopped'}))],false);assert.equal(report.startedUnknown,1);assert.equal(report.notRun,11);assert.equal(report.providerRequests,null);assert.equal(report.actualModelRequests,null);assert.equal(report.knownAdmittedRequests,1);assert.equal(report.harnessAccepted,false);
 }finally{await rm(dir,{recursive:true});}
});
test('BM4 malformed worker journal is unknown and blocks acceptance without losing report',async()=>{const dir=await mkdtemp(join(tmpdir(),'bm4-bad-journal-'));try{await writeFile(join(dir,'M01.requests.jsonl'),'{partial');const modulePath='../scripts/benchmark-model.mjs';const {workerReceipt}=await import(modulePath);const result=workerReceipt('M01',dir,false);assert.equal(result.requests,null);assert.equal(result.actualModelRequests,null);assert.equal(result.harnessFailure,true);assert.match(result.error,/invalid/);}finally{await rm(dir,{recursive:true});}});
