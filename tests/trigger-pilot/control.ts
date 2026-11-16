import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,existsSync,lstatSync,readdirSync,rmSync} from 'node:fs';
import {resolve,join,dirname,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync,spawn} from 'node:child_process';
import {PROFILE,PilotBudget,hash,normalizedBody,canonical} from './contracts.ts';
export const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
export function identity(){
 const paths=['scripts/trigger-pilot.mjs',...readdirSync(join(ROOT,'tests/trigger-pilot')).filter(p=>/\.(ts|json)$/.test(p)).map(p=>'tests/trigger-pilot/'+p),'package-lock.json'];
 return{source:execFileSync('git',['rev-parse','HEAD'],{cwd:ROOT,encoding:'utf8'}).trim(),dirty:!!execFileSync('git',['status','--porcelain'],{cwd:ROOT,encoding:'utf8'}).trim(),node:process.version,pi:JSON.parse(readFileSync(join(ROOT,'node_modules/@earendil-works/pi-coding-agent/package.json'),'utf8')).version,files:Object.fromEntries(paths.map(p=>[p,hash(readFileSync(join(ROOT,p)))]))};
}
export function validateArchive(archive:string){
 assert.ok(archive.startsWith('/'),'absolute archive required');assert.ok(lstatSync(archive).isFile()&&!lstatSync(archive).isSymbolicLink());assert.equal(hash(readFileSync(archive)),PROFILE.archiveSHA256,'published archive hash');
 const payload=JSON.parse(readFileSync(join(ROOT,'tests/benchmark-model/payload.json'),'utf8')) as string[];assert.equal(payload.length,76);
 const names=execFileSync('tar',['-tzf',archive],{encoding:'utf8',timeout:5000}).trim().split('\n').sort();assert.deepEqual(names,payload.map(p=>'package/'+p).sort());
 for(const p of payload)assert.equal(hash(execFileSync('tar',['-xOzf',archive,'package/'+p],{timeout:5000,maxBuffer:8*1024*1024})),hash(readFileSync(join(ROOT,p))),'current published payload '+p);
}
export function createRun(){
 const base=join(ROOT,'.local/trigger-pilot');mkdirSync(base,{recursive:true,mode:0o700});assert.ok(lstatSync(base).isDirectory()&&!lstatSync(base).isSymbolicLink());
 const run=mkdtempSync(join(base,'run-'));writeFileSync(join(run,'.owned'),'trigger-pilot-owned\n',{mode:0o600});return run;
}
export async function runWorker(id:string,run:string,kind:string,simulation='',deadline=102000):Promise<any>{
 assert.ok(run.startsWith(join(ROOT,'.local/trigger-pilot/')));assert.equal(readFileSync(join(run,'.owned'),'utf8'),'trigger-pilot-owned\n');
 const args=['--import','tsx',join(ROOT,'tests/trigger-pilot/worker.ts'),id,run,kind,...(simulation?[simulation]:[])];
 const env:NodeJS.ProcessEnv={...process.env,PI_OFFLINE:'1'};for(const key of ['NODE_OPTIONS','BASH_ENV','ENV','LD_PRELOAD','DYLD_INSERT_LIBRARIES'])delete env[key];
 const child=spawn(process.execPath,args,{cwd:ROOT,env,detached:true,stdio:['ignore','pipe','pipe']});let bytes=0,reason:string|undefined,killTimer:ReturnType<typeof setTimeout>|undefined;
 const kill=(signal:NodeJS.Signals)=>{try{if(child.pid)process.kill(-child.pid,signal);}catch(e){if((e as NodeJS.ErrnoException).code!=='ESRCH')throw e;}};
 const stop=(why:string)=>{if(reason)return;reason=why;kill('SIGTERM');killTimer=setTimeout(()=>kill('SIGKILL'),2000);};
 const timer=setTimeout(()=>stop('worker deadline'),deadline),interrupt=()=>stop('worker interrupted');process.once('SIGINT',interrupt);process.once('SIGTERM',interrupt);
 for(const pipe of [child.stdout,child.stderr])pipe.on('data',b=>{bytes+=b.length;if(bytes>1024*1024)stop('worker output bound');});
 const exited=await new Promise<{code:number|null;signal:NodeJS.Signals|null}>(resolve=>{child.once('error',()=>resolve({code:null,signal:null}));child.once('close',(code,signal)=>resolve({code,signal}));});clearTimeout(timer);if(killTimer)clearTimeout(killTimer);process.removeListener('SIGINT',interrupt);process.removeListener('SIGTERM',interrupt);
 let fallback=false;const resource=join(run,id+'.resources.json');
 if(existsSync(resource)){
  const r=JSON.parse(readFileSync(resource,'utf8'));assert.equal(r.workerPid,child.pid,'owned browser ledger');
  let command='';try{command=execFileSync('ps',['-ww','-p',String(r.browserPid),'-o','command='],{encoding:'utf8',timeout:1000});}catch{}
  if(command){assert.ok(Number.isSafeInteger(r.browserPid)&&r.browserPid>1&&typeof r.profileArg==='string'&&r.profileArg.startsWith('--user-data-dir=')&&command.includes(r.profileArg),'owned browser identity');try{process.kill(-r.browserPid,'SIGKILL');}catch(e){if((e as NodeJS.ErrnoException).code!=='ESRCH')throw e;}fallback=true;}
 }
 const workspace=join(run,'workspace');if(existsSync(workspace)){assert.ok(lstatSync(workspace).isDirectory()&&!lstatSync(workspace).isSymbolicLink());rmSync(workspace,{recursive:true});}
 const path=join(run,id+'.'+kind+(simulation?'-'+simulation:'')+'.json');let result:any;
 if(existsSync(path)){result=JSON.parse(readFileSync(path,'utf8'));assert.equal(result.id,id);const journal=new PilotBudget(join(run,kind==='live'?'live-requests.jsonl':`synthetic-${simulation||kind}-requests.jsonl`),kind==='live'?'live':'offline');assert.equal(result.requests,journal.rows().filter(r=>r.episode===id).length,'request accounting');}
 else{const journal=new PilotBudget(join(run,kind==='live'?'live-requests.jsonl':`synthetic-${simulation||kind}-requests.jsonl`),kind==='live'?'live':'offline');result={id,outcome:'provider_unknown',requests:null,knownAdmittedRequests:journal.rows().filter(r=>r.episode===id).length,harnessFailure:true,fatal:true};}
 if(exited.code!==0||reason||fallback){result.harnessFailure=true;result.fatal=true;}result.process={...exited,reason,fallback};return result;
}
export async function captureContexts(run:string){
 const expected:Record<string,string>={};for(const id of PROFILE.order){const r=await runWorker(id,run,'capture');assert.equal(r.process.code,0);assert.ok(r.started&&!r.harnessFailure&&r.requests===1,'capture actual SDK failed');const body=JSON.parse(readFileSync(join(run,id+'.context.json'),'utf8'));const normalized=canonical(normalizedBody(body));const key=id.split('-')[0];if(expected[key])assert.equal(hash(normalized),expected[key],'A/B actual first context differs beyond clause');else expected[key]=hash(normalized);}
 writeFileSync(join(run,'contexts.json'),JSON.stringify(expected,null,2)+'\n',{mode:0o600});return expected;
}
