import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,existsSync,lstatSync,rmSync} from 'node:fs';
import {resolve,join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync,spawn} from 'node:child_process';
import {PROFILE,PilotBudget,hash,contextBody,canonical} from './contracts.ts';
import {policyFor,assertOwned,identityInputs} from '../trigger-smoke/policy.ts';
export const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
export function identity(){
 const paths=identityInputs();
 return{source:execFileSync('git',['rev-parse','HEAD'],{cwd:ROOT,encoding:'utf8'}).trim(),tree:execFileSync('git',['rev-parse','HEAD^{tree}'],{cwd:ROOT,encoding:'utf8'}).trim(),dirty:!!execFileSync('git',['status','--porcelain'],{cwd:ROOT,encoding:'utf8'}).trim(),node:process.version,pi:JSON.parse(readFileSync(join(ROOT,'node_modules/@earendil-works/pi-coding-agent/package.json'),'utf8')).version,files:Object.fromEntries(paths.map(p=>[p,hash(readFileSync(join(ROOT,p)))]))};
}
export function validateArchive(archive:string){
 assert.ok(archive.startsWith('/'),'absolute archive required');assert.ok(lstatSync(archive).isFile()&&!lstatSync(archive).isSymbolicLink());assert.equal(hash(readFileSync(archive)),PROFILE.archiveSHA256,'published archive hash');
 const payload=JSON.parse(readFileSync(join(ROOT,'tests/benchmark-model/payload.json'),'utf8')) as string[];assert.equal(payload.length,76);
 const names=execFileSync('tar',['-tzf',archive],{encoding:'utf8',timeout:5000}).trim().split('\n').sort();assert.deepEqual(names,payload.map(p=>'package/'+p).sort());
 for(const p of payload)assert.equal(hash(execFileSync('tar',['-xOzf',archive,'package/'+p],{timeout:5000,maxBuffer:8*1024*1024})),hash(readFileSync(join(ROOT,p))),'current published payload '+p);
}
export function createRun(experiment=PROFILE.id){
 const policy=policyFor(experiment),base=join(ROOT,'.local',policy.base);mkdirSync(base,{recursive:true,mode:0o700});assert.ok(lstatSync(base).isDirectory()&&!lstatSync(base).isSymbolicLink());
 const run=mkdtempSync(join(base,'run-'));writeFileSync(join(run,'.owned'),policy.marker,{mode:0o600});return run;
}
export function receiptEvidence(id:string,run:string,kind:string,simulation='',experiment=PROFILE.id):any{
 const policy=policyFor(experiment),journal=new PilotBudget(join(run,kind==='live'?'live-requests.jsonl':`synthetic-${policy.smoke&&kind==='offline'?'offline':simulation||kind}-requests.jsonl`),kind==='live'?'live':'offline',experiment),proof=journal.evidence(),count=proof.rows.filter((r:any)=>r.episode===id).length;
 const unknown=()=>({id,kind,outcome:'provider_unknown',requests:null,knownAdmittedRequests:count,requestAccounting:'unknown',journalComplete:proof.complete,harnessFailure:true,fatal:true});
 try{
  assert.equal(proof.complete,true);const path=join(run,id+'.'+kind+(simulation?'-'+simulation:'')+'.json'),r=JSON.parse(readFileSync(path,'utf8'));assert.equal(r.id,id);assert.equal(r.kind,kind);assert.ok(Number.isSafeInteger(r.requests)&&r.requests>=0&&r.requests<=policy.limit(id));assert.equal(r.requests,count);if(policy.smoke)assert.equal(r.experiment,experiment);assert.equal(typeof r.outcome,'string');assert.equal(r.modelCalls,kind==='live'?r.requests:0);assert.match(r.node,/^v24\./);assert.equal(typeof r.started,'boolean');for(const k of ['renderRequested','renderAttempted','renderCommitted'])assert.equal(typeof r[k],'boolean');assert.ok(Array.isArray(r.cleanupErrors));assert.ok(Array.isArray(r.tools)&&r.tools.length<=6);assert.equal(r.toolCount,r.tools.length);return{...r,knownAdmittedRequests:count,requestAccounting:'known',journalComplete:true};
 }catch{return unknown();}
}
export async function runWorker(id:string,run:string,kind:string,simulation='',deadline?:number,experiment=PROFILE.id):Promise<any>{
 const policy=policyFor(experiment);assertOwned(run,experiment);const totalDeadline:number=deadline??policy.deadline(id),began=Date.now();if(policy.smoke)assert.ok(totalDeadline>7000&&totalDeadline<=policy.deadline(id));
 const args=['--import','tsx',join(ROOT,'tests/trigger-pilot/worker.ts'),id,run,kind,simulation,experiment];
 const env:NodeJS.ProcessEnv={...process.env,PI_OFFLINE:'1'};for(const key of ['NODE_OPTIONS','BASH_ENV','ENV','LD_PRELOAD','DYLD_INSERT_LIBRARIES'])delete env[key];
 const child=spawn(process.execPath,args,{cwd:ROOT,env,detached:true,stdio:['ignore','pipe','pipe']});let bytes=0,reason:string|undefined,killTimer:ReturnType<typeof setTimeout>|undefined;
 const kill=(signal:NodeJS.Signals)=>{try{if(child.pid)process.kill(-child.pid,signal);}catch(e){if((e as NodeJS.ErrnoException).code!=='ESRCH')throw e;}};
 const stop=(why:string)=>{if(reason)return;reason=why;kill('SIGTERM');killTimer=setTimeout(()=>kill('SIGKILL'),2000);};
 const timer=setTimeout(()=>stop('worker deadline'),policy.smoke?totalDeadline-7000:totalDeadline),interrupt=()=>stop('worker interrupted');process.once('SIGINT',interrupt);process.once('SIGTERM',interrupt);
 for(const pipe of [child.stdout,child.stderr])pipe.on('data',b=>{bytes+=b.length;if(bytes>1024*1024)stop('worker output bound');});
 const exited=await new Promise<{code:number|null;signal:NodeJS.Signals|null}>(resolve=>{child.once('error',()=>resolve({code:null,signal:null}));child.once('close',(code,signal)=>resolve({code,signal}));});clearTimeout(timer);if(killTimer)clearTimeout(killTimer);process.removeListener('SIGINT',interrupt);process.removeListener('SIGTERM',interrupt);
 let fallback=false;const resource=join(run,id+'.resources.json');
 if(existsSync(resource)){
  const r=JSON.parse(readFileSync(resource,'utf8'));assert.equal(r.workerPid,child.pid,'owned browser ledger');
  let command='';try{command=execFileSync('ps',['-ww','-p',String(r.browserPid),'-o','command='],{encoding:'utf8',timeout:1000});}catch{}
  if(command){assert.ok(Number.isSafeInteger(r.browserPid)&&r.browserPid>1&&typeof r.profileArg==='string'&&r.profileArg.startsWith('--user-data-dir=')&&command.includes(r.profileArg),'owned browser identity');try{process.kill(-r.browserPid,'SIGKILL');}catch(e){if((e as NodeJS.ErrnoException).code!=='ESRCH')throw e;}fallback=true;
   const until=Date.now()+3000;let alive=true;while(alive&&Date.now()<until){try{process.kill(r.browserPid,0);}catch(e){if((e as NodeJS.ErrnoException).code==='ESRCH')alive=false;else throw e;}if(alive)await new Promise(r=>setTimeout(r,20));}assert.equal(alive,false,'owned browser did not exit');
  }
 }
 const workspace=join(run,'workspace');if(existsSync(workspace)){assert.ok(lstatSync(workspace).isDirectory()&&!lstatSync(workspace).isSymbolicLink());rmSync(workspace,{recursive:true});}
 const result=receiptEvidence(id,run,kind,simulation,experiment);
 if(exited.code!==0||reason||fallback){result.harnessFailure=true;result.fatal=true;result.requestAccounting='unknown';if(policy.smoke){result.requests=null;result.outcome='provider_unknown';}}result.elapsedMs=Date.now()-began;result.process={...exited,reason,fallback};return result;
}
export async function captureContexts(run:string,experiment=PROFILE.id){
 const policy=policyFor(experiment),expected:Record<string,string>={};for(const id of policy.order){const r=await runWorker(id,run,'capture','',undefined,experiment);assert.equal(r.process.code,0);assert.ok(r.started&&!r.harnessFailure&&r.requests===1,'capture actual SDK failed');const body=JSON.parse(readFileSync(join(run,id+'.context.json'),'utf8'));const normalized=canonical(contextBody(body,experiment));const key=policy.smoke?id:id.split('-')[0];if(expected[key])assert.equal(hash(normalized),expected[key],'A/B actual first context differs beyond clause');else expected[key]=hash(normalized);}
 writeFileSync(join(run,'contexts.json'),JSON.stringify(expected,null,2)+'\n',{mode:0o600});return expected;
}
