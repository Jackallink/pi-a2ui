#!/usr/bin/env node
// Default admission is deliberately independent of Pi/config/auth modules.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,lstatSync,existsSync,readdirSync,rmSync} from 'node:fs';
import {resolve,join,dirname,isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync,spawn} from 'node:child_process';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const json=path=>JSON.parse(readFileSync(join(root,path),'utf8'));const profile=json('tests/benchmark-model/profile-v2.json');const scenarios=json('tests/benchmark-model/scenarios.json');
const sha=data=>createHash('sha256').update(data).digest('hex');
export function identity(){
 const tracked=execFileSync('git',['ls-files'],{cwd:root,encoding:'utf8'}).trim().split('\n');
 const paths=tracked.filter(p=>/^(extension.ts|package(-lock)?\.json|skills\/|src\/|dist\/|tests\/benchmark-model\/|scripts\/benchmark-model\.mjs)/.test(p));
 return{source:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),packageVersion:json('package.json').version,dirty:!!execFileSync('git',['status','--porcelain'],{cwd:root,encoding:'utf8'}).trim(),node:process.version,pi:json('node_modules/@earendil-works/pi-coding-agent/package.json').version,files:Object.fromEntries(paths.map(p=>[p,sha(readFileSync(join(root,p)))]))};
}
export async function boundedProcess(entry,args,{cwd=root,env=process.env,timeout=102000}={}){
 const grouped=process.platform!=='win32';const child=spawn(process.execPath,[entry,...args],{cwd,env,detached:grouped,stdio:['ignore','pipe','pipe']});
 let bytes=0,output='',failure,killTimer,closed=false,code,signal;
 const kill=sig=>{try{if(grouped&&child.pid)process.kill(-child.pid,sig);else child.kill(sig);}catch(error){if(error.code!=='ESRCH')throw error;}};
 let finish;const stop=reason=>{if(failure)return;failure=reason;kill('SIGTERM');killTimer=setTimeout(()=>{kill('SIGKILL');if(closed)finish();},2000);};
 const timer=setTimeout(()=>stop('owned worker hard timeout'),timeout);
 const interrupt=()=>stop('owned worker interrupted');process.once('SIGINT',interrupt);process.once('SIGTERM',interrupt);
 for(const pipe of [child.stdout,child.stderr])pipe.on('data',chunk=>{bytes+=chunk.length;if(bytes>1024*1024)stop('owned worker output budget');else output+=chunk;});
 return await new Promise((res,rej)=>{
  finish=()=>{clearTimeout(timer);process.removeListener('SIGINT',interrupt);process.removeListener('SIGTERM',interrupt);res({code,signal,failure,output,pid:child.pid});};
  child.once('error',()=>{clearTimeout(timer);if(killTimer)clearTimeout(killTimer);process.removeListener('SIGINT',interrupt);process.removeListener('SIGTERM',interrupt);rej(new Error('owned worker spawn failed'));});
  child.once('close',(value,reason)=>{closed=true;code=value;signal=reason;if(!failure)finish();else if(reason==='SIGKILL')finish();});
 });
}
export async function ownedChild(id,run,offline,timeout=102000,simulation){
 const value=await boundedProcess('--import',['tsx',join(root,'tests/benchmark-model/worker.ts'),id,run,offline?'offline':'live',...(simulation?[simulation]:[])],{cwd:root,env:{...process.env,PI_OFFLINE:'1'},timeout});
 const ledger=join(run,id+'.resources.json');
 if(existsSync(ledger)){
  const resource=JSON.parse(readFileSync(ledger,'utf8'));assert.equal(resource.workerPid,value.pid,'owned browser ledger worker identity');
  if(Number.isSafeInteger(resource.browserPid)&&resource.browserPid>1){
   let command='';try{command=execFileSync('ps',['-ww','-p',String(resource.browserPid),'-o','command='],{encoding:'utf8',timeout:1000});}catch{/* already exited */}
   if(command){assert.ok(typeof resource.profileArg==='string'&&resource.profileArg.startsWith('--user-data-dir=')&&command.includes(resource.profileArg),'browser process identity before fallback kill');value.fallbackBrowserKill=true;try{process.kill(-resource.browserPid,'SIGKILL');}catch(error){if(error.code!=='ESRCH')throw error;}}
  }
 }
 // Only this worker's mkdtemp prefix in its already owned run is eligible for fallback cleanup.
 for(const name of readdirSync(run).filter(name=>name.startsWith(id+'-workspace-'))){const path=join(run,name);assert.ok(lstatSync(path).isDirectory()&&!lstatSync(path).isSymbolicLink());rmSync(path,{recursive:true});}
 return value;
}
export function requestJournal(id,run,offline){
 const path=join(run,id+'.requests.jsonl');if(!existsSync(path))return [];
 const records=readFileSync(path,'utf8').trim().split('\n').filter(Boolean).map(line=>JSON.parse(line));assert.ok(records.length<=profile.caps.requests);
 records.forEach((row,index)=>{assert.deepEqual(row,{id,index:index+1,mode:offline?'offline':'live',provider:profile.model.provider,model:profile.model.id,endpoint:profile.model.baseUrl+'/chat/completions'});});return records;
}
export function workerReceipt(id,run,offline){
 let journal=[];const unknown=reason=>({id,started:null,stage:'harness',error:reason,requests:null,actualModelRequests:offline?0:null,knownAdmittedRequests:journal.length,requestAccounting:'unknown',harnessFailure:true});
 try{
  journal=requestJournal(id,run,offline);const path=join(run,id+'.json');if(!existsSync(path))return unknown('owned worker final receipt missing; start/request outcome unknown');
  const result=JSON.parse(readFileSync(path,'utf8'));assert.equal(result.id,id);assert.equal(result.profile,profile.profile,'case profile identity');assert.equal(result.requests,journal.length,'receipt/journal request agreement');assert.ok(result.requests<=profile.caps.requests);assert.ok((result.toolCount??0)<=profile.caps.tools);result.knownAdmittedRequests=journal.length;result.requestAccounting='known';return result;
 }catch{return unknown('owned worker receipt/journal invalid; start/request outcome unknown');}
}
export function summarize(results,offline){
 const count=key=>results.filter(r=>r[key]===true).length;const unknown=results.some(r=>r.requests===null);const known=results.reduce((sum,r)=>sum+(r.knownAdmittedRequests??r.requests??0),0);
 return{planned:12,attemptedEpisodes:results.filter(r=>!r.notRun).length,started:count('started'),startedUnknown:results.filter(r=>r.started===null).length,notRun:results.filter(r=>!!r.notRun).length,providerRequests:unknown?null:known,knownAdmittedRequests:known,actualModelRequests:offline?0:unknown?null:known,requestAccounting:unknown?'unknown':'known',providerCompleted:unknown?null:results.reduce((sum,r)=>sum+(r.providerCompleted??0),0),knownProviderCompleted:results.reduce((sum,r)=>sum+(r.providerCompleted??0),0),candidatesChecked:count('candidateChecked'),compileValid:count('compileValid'),rendered:count('rendered'),intentPass:count('intentPass'),interactionApplicable:scenarios.filter(s=>s.action).length,interactionPass:count('interactionPass'),staticApplicable:scenarios.filter(s=>!s.action).length,staticPass:count('staticPass'),handoff:{observed:results.filter(r=>r.handoff).length,byteIdentical:results.filter(r=>r.handoff?.byteIdentical===true).length,attemptedCompileValid:results.filter(r=>r.handoff?.attemptedCompileValid===true).length,compiledSurfaceEqual:results.filter(r=>r.handoff?.compiledSurfaceEqual===true).length,candidateCompileRejected:results.filter(r=>r.handoff?.attemptedCompileValid===false).length,compilerUnknown:results.filter(r=>r.handoff?.reason==='compiler-error').length},firstPassSuccess:results.filter(r=>r.intentPass&&(r.interactionPass||r.staticPass)).length,harnessAccepted:results.length===12&&!results.some(r=>r.harnessFailure),results};
}
async function main(){
 assert.equal(process.versions.node.split('.')[0],'24','Node24.x required');const args=process.argv.slice(2);const execute=args[0]==='--execute',offline=args[0]==='--offline';
 if(args.length===1&&args[0]==='--help'){console.log('Node24: node scripts/benchmark-model.mjs [--dry-run | --offline | --execute --archive ABS_TGZ]\nDefault dry-run: zero inference/config reads. Execute:12GLM first attempts, no retries; manual only.');return;}
 assert.ok(args.length===0||args.length===1&&['--dry-run','--offline'].includes(args[0])||execute&&args.length===3&&args[1]==='--archive'&&isAbsolute(args[2]),'unknown/duplicate/unsafe arguments');
 const stamp=identity();assert.equal(stamp.pi,profile.pi);assert.equal(stamp.packageVersion,profile.packageVersion,'candidate package/profile version');assert.equal(scenarios.length,12);assert.equal(new Set(scenarios.map(s=>s.id)).size,12);
 if(!execute&&!offline){console.log(JSON.stringify({mode:'dry-run',providerRequests:0,credentialReads:0,...profile,identity:stamp,scenarios:scenarios.map(({id,request})=>({id,request}))},null,2));return;}
 assert.ok(['darwin','linux'].includes(process.platform),'manual profile supports macOS/Linux');assert.equal(stamp.dirty,false,'clean frozen source required');assert.ok(!execute||!process.env.CI,'live benchmark never runs in CI');
 if(execute){const archive=args[2];assert.ok(lstatSync(archive).isFile()&&!lstatSync(archive).isSymbolicLink());assert.ok(lstatSync(archive).size<8*1024*1024);assert.equal(sha(readFileSync(archive)),profile.archiveSHA256,'approved payload archive identity');
  const payload=json('tests/benchmark-model/payload.json');const names=execFileSync('tar',['-tzf',archive],{encoding:'utf8',timeout:5000}).trim().split('\n').sort();assert.deepEqual(names,payload.map(p=>'package/'+p).sort());
  for(const path of payload)assert.equal(sha(execFileSync('tar',['-xOzf',archive,'package/'+path],{timeout:5000,maxBuffer:8*1024*1024})),sha(readFileSync(join(root,path))),'archive/current payload '+path);
 }
 const run=join(root,'.local','bm4',`run-${Date.now()}-${process.pid}`);mkdirSync(run,{recursive:true,mode:0o700});
 const started=Date.now(),results=[];let stopped;
 for(const row of scenarios){
  if(stopped||Date.now()-started>=profile.caps.batchMs){stopped??='batch deadline';results.push({id:row.id,started:false,notRun:stopped});continue;}
  let child;try{child=await ownedChild(row.id,run,offline,Math.min(102000,profile.caps.batchMs-(Date.now()-started)));}catch{child={code:null,signal:null,failure:'owned worker cleanup/identity verification failed'};}
  // Workers never write credentials/headers/URLs; do not persist arbitrary crash output.
  const result=workerReceipt(row.id,run,offline);
  if(child.code!==0||child.failure||child.fallbackBrowserKill){result.harnessFailure=true;result.process={code:child.code,signal:child.signal,failure:child.failure,fallbackBrowserKill:child.fallbackBrowserKill};}
  results.push(result);console.log(JSON.stringify({id:row.id,stage:result.stage,requests:result.requests,compile:result.compileValid,intent:result.intentPass,interaction:result.interactionPass,actualModel:!offline}));
  if(result.fatal||result.harnessFailure)stopped=result.error||'harness failure';
 }
 const report={mode:offline?'synthetic-offline':'live-first-attempt',identity:stamp,profile,...summarize(results,offline),stopped:stopped??null};
 writeFileSync(join(run,'report.json'),JSON.stringify(report,null,2)+'\n',{mode:0o600});console.log(JSON.stringify({report:join(run,'report.json'),harnessAccepted:report.harnessAccepted,actualModelRequests:report.actualModelRequests}));if(!report.harnessAccepted)process.exitCode=1;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(()=>{console.error('BM4 admission failed; check Node24, frozen clean source, explicit arguments and approved archive. No automatic retry.');process.exitCode=1;});
