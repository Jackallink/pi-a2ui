// Spec026 is permanently offline-only. No grant/execute path is implemented.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {identity,createRun,captureContexts,runWorker} from '../tests/trigger-pilot/control.ts';
import {PilotBudget} from '../tests/trigger-pilot/contracts.ts';
import {ADAPTER,ADAPTER_ID,ADAPTER_SHA} from '../tests/helper-adapter/profile.ts';
import {materializePackages,validateContextPairs} from '../tests/authoring-pilot/authority.ts';
import {digest} from '../tests/trigger-smoke/policy.ts';
export async function main(args=process.argv.slice(2)){
 assert.match(process.version,/^v24\./);const began=Date.now();
 const canaries=['direct','foreign-cwd','extra-and','redirect','substitution','usage','missing-draft','helper-timeout','prepare','tool-cap'];
 if(args.length===1&&args[0]==='--help'){console.log('Node24 helper-adapter [--dry-run | --offline [--canary '+canaries.join('|')+']]\nPermanently offline: synthetic SDK only, no credential/provider access or live grant.');return;}
 const offline=args[0]==='--offline',canary=offline&&args[1]==='--canary'?args[2]:'';
 assert.ok(!args.length||args.length===1&&['--dry-run','--offline'].includes(args[0])||offline&&args.length===3&&args[1]==='--canary'&&canaries.includes(canary),'offline arguments only');
 const stamp=identity();if(!offline){console.log(JSON.stringify({mode:'helper-adapter-dry-run',providerRequests:0,credentialReads:0,liveEnabled:false,profile:ADAPTER,profileSHA256:ADAPTER_SHA,identity:stamp},null,2));return;}
 if(!canary)assert.equal(stamp.dirty,false,'clean fixed source');const run=createRun(ADAPTER_ID);console.log(JSON.stringify({run,mode:'helper-adapter-offline'}));
 const packages=materializePackages(run,ADAPTER_ID),contexts=await captureContexts(run,ADAPTER_ID);validateContextPairs(run,ADAPTER_ID);
 const captureFiles=Object.fromEntries(ADAPTER.order.flatMap(id=>[id+'.context.json',id+'.capture.json']).map(p=>[p,digest(readFileSync(join(run,p)))]));
 writeFileSync(join(run,'offline-preflight.json'),JSON.stringify({experiment:ADAPTER_ID,profileSHA256:ADAPTER_SHA,identity:stamp,packages,contexts,captureFiles},null,2)+'\n',{mode:0o600});
 const results=[];let stopped;
 for(const id of ADAPTER.order){
  if(stopped||ADAPTER.batchHardMs-(Date.now()-began)<ADAPTER.workerHardMs){stopped??='insufficient-full-worker-deadline';results.push({id,notRun:stopped,outcome:'not_run'});continue;}
  const simulation=canary==='direct'?'direct':id===ADAPTER.order[0]?canary||'prefix':'prefix';
  let row;try{row=await runWorker(id,run,'offline',simulation,undefined,ADAPTER_ID);}catch{row={id,outcome:'provider_unknown',requests:null,requestAccounting:'unknown',harnessFailure:true,fatal:true};}
  results.push(row);console.log(JSON.stringify({id,outcome:row.outcome,syntheticRequests:row.requests}));if(row.fatal||row.harnessFailure||row.requestAccounting!=='known')stopped=row.outcome;
 }
 const journal=new PilotBudget(join(run,'synthetic-offline-requests.jsonl'),'offline',ADAPTER_ID).evidence();
 const report={experiment:ADAPTER_ID,profileSHA256:ADAPTER_SHA,identity:stamp,mode:'synthetic-only',providerRequests:0,credentialReads:0,elapsedMs:Date.now()-began,stopped:stopped??null,journal,results,harnessAccepted:journal.complete&&!results.some(r=>r.fatal||r.harnessFailure||r.requestAccounting!=='known'),syntheticUiPassed:results.filter(r=>r.renderCommitted&&r.contentValid===true).length,modelEffect:'not_evaluated'};
 writeFileSync(join(run,'report.json'),JSON.stringify(report,null,2)+'\n',{mode:0o600});console.log(JSON.stringify({report:join(run,'report.json'),harnessAccepted:report.harnessAccepted,providerRequests:0,modelEffect:'not_evaluated'}));if(!report.harnessAccepted)process.exitCode=1;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(()=>{console.error('Offline helper control refused; no live execution is available.');process.exitCode=1;});
