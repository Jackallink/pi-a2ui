// Spec023: zero-inference default; live requires an operator-created, reviewed grant.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {identity,createRun,validateArchive,captureContexts,runWorker} from '../tests/trigger-pilot/control.ts';
import {PilotBudget} from '../tests/trigger-pilot/contracts.ts';
import {SMOKE,SMOKE_ID,PROFILE_SHA,digest,readGrant,claimOnce,smokeSummary,policyFor} from '../tests/trigger-smoke/policy.ts';

export async function main(args=process.argv.slice(2)){
 assert.match(process.version,/^v24\./,'Node24 only');const began=Date.now();
 if(args.length===1&&args[0]==='--help'){console.log('Node24: trigger-smoke [--dry-run | --offline [--canary negative-text|preparation|torn-journal] | --prepare --archive ABS_TGZ | --execute --archive ABS_TGZ --grant ABS_GRANT]\nDefault and synthetic modes: zero inference/auth. Live requires a fresh reviewed external grant; one batch1+3<=4, no retries.');return;}
 const live=args[0]==='--execute',prepare=args[0]==='--prepare',canary=args[0]==='--offline'&&args[1]==='--canary'?args[2]:'',offline=args[0]==='--offline';
 assert.ok(!args.length||args.length===1&&['--dry-run','--offline'].includes(args[0])||offline&&args.length===3&&['negative-text','preparation','torn-journal'].includes(canary)||prepare&&args.length===3&&args[1]==='--archive'||live&&args.length===5&&args[1]==='--archive'&&args[3]==='--grant','invalid smoke arguments');
 const stamp=identity();assert.equal(stamp.pi,'1.5.0');
 if(!live&&!prepare&&!offline){console.log(JSON.stringify({mode:'smoke-dry-run',providerRequests:0,credentialReads:0,requiresExternalGrant:true,profile:SMOKE,identity:stamp},null,2));return;}
 if(!canary)assert.equal(stamp.dirty,false,'clean fixed source required');assert.ok(!live||!process.env.CI,'no CI inference');
 let run,grant,lock;
 if(live){assert.ok(args[4].startsWith('/'));grant=readGrant(args[4]);run=grant.run;lock=claimOnce(run,grant.id,grant.grantSHA);}
 else{if(prepare)validateArchive(args[2]);run=createRun(SMOKE_ID);}
 console.log(JSON.stringify({run,mode:live?'live':prepare?'prepare':'offline'}));
 if(!live){const contexts=await captureContexts(run,SMOKE_ID);const captureFiles=Object.fromEntries(SMOKE.order.flatMap(id=>[id+'.context.json',id+'.capture.json']).map(p=>[p,digest(readFileSync(join(run,p)))]));writeFileSync(join(run,'preflight.json'),JSON.stringify({experiment:SMOKE_ID,profileSHA256:PROFILE_SHA,identity:stamp,contexts,captureFiles,archiveSHA256:SMOKE.release.archiveSHA256},null,2)+'\n',{mode:0o600});if(prepare){console.log(JSON.stringify({prepared:run,providerRequests:0,credentialReads:0}));return;}}
 const results=[];let stopped;
 try{
  if(live){validateArchive(args[2]);writeFileSync(join(run,'admission.json'),JSON.stringify({grantFile:args[4],grantSHA:grant.grantSHA,preflightSHA256:grant.preflightSHA256,lock,batchStartedAt:began})+'\n',{mode:0o600});}
  for(const id of SMOKE.order){
   const remaining=180000-(Date.now()-began)-1000;
   if(stopped||remaining<=7000){stopped??='batch deadline';results.push({id,outcome:'not_run',notRun:stopped});continue;}
   const simulation=canary==='negative-text'&&id==='SM02-B'?'text':canary==='preparation'&&id==='SM01-B'?'prepare':canary==='torn-journal'&&id==='SM02-B'?'torn-journal':'';
   let row;try{row=await runWorker(id,run,live?'live':'offline',simulation,Math.min(policyFor(SMOKE_ID).deadline(id),remaining),SMOKE_ID);}catch{row={id,outcome:'provider_unknown',requests:null,harnessFailure:true,fatal:true};}
   results.push(row);console.log(JSON.stringify({id,outcome:row.outcome,requests:row.requests}));writeFileSync(join(run,'progress.json'),JSON.stringify(results,null,2)+'\n',{mode:0o600});
   if(row.fatal||row.harnessFailure||id==='SM02-B'&&row.outcome!=='negative_pass')stopped=row.outcome;
  }
 }catch{stopped='harness_error';}
 while(results.length<2){const id=SMOKE.order[results.length];results.push({id,outcome:'not_run',notRun:stopped??'harness_error'});}
 const journal=new PilotBudget(join(run,live?'live-requests.jsonl':'synthetic-offline-requests.jsonl'),live?'live':'offline',SMOKE_ID).evidence();const summary=smokeSummary(results,journal,live);
 const report={mode:live?'live-smoke':'synthetic-smoke',identity:stamp,experiment:SMOKE_ID,profileSHA256:PROFILE_SHA,journalState:journal,stopped:stopped??null,batchCompleted:results.every(r=>!r.notRun),harnessAccepted:summary.requestAccountingKnown&&stopped!=='harness_error'&&!results.some(r=>r.harnessFailure),elapsedMs:Date.now()-began,...summary};
 writeFileSync(join(run,'report.json'),JSON.stringify(report,null,2)+'\n',{mode:0o600});if(live)writeFileSync(join(run,'terminal.json'),JSON.stringify({grantSHA:grant.grantSHA,stopped:report.stopped})+'\n',{mode:0o600});console.log(JSON.stringify({report:join(run,'report.json'),harnessAccepted:report.harnessAccepted,actualModelRequests:report.actualModelRequests,uiVerdict:report.uiVerdict}));if(!report.harnessAccepted)process.exitCode=1;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(()=>{console.error('Smoke admission/setup refused; no automatic retry or replacement grant.');process.exitCode=1;});
