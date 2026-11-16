// Spec025 finite paired pilot. Default/prepare/offline never read real model config.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {identity,createRun,captureContexts,runWorker} from '../tests/trigger-pilot/control.ts';
import {PilotBudget} from '../tests/trigger-pilot/contracts.ts';
import {PAIR,PAIR_ID,PAIR_SHA} from '../tests/authoring-pilot/profile.ts';
import {ROOT,digest} from '../tests/trigger-smoke/policy.ts';
import {materializePackages,validateContextPairs,readPairGrant,claimPairOnce} from '../tests/authoring-pilot/authority.ts';
import {pairSummary} from '../tests/authoring-pilot/oracle.ts';

export async function main(args=process.argv.slice(2)){
 assert.match(process.version,/^v24\./);const began=Date.now();
 const canaries=['ordinary','semantic','preparation','schema','rewrite','fatal','reasoning','dom-number','helper-usage'];
 if(args.length===1&&args[0]==='--help'){console.log('Node24 authoring-pilot [--dry-run | --prepare | --offline [--canary '+canaries.join('|')+'] | --execute --grant ABS_GRANT]\nOnly Ark AgentPlan glm-5.3-flash, fixed4 sessions <=6 each/24 total; no retries. Default zero inference/config.');return;}
 const live=args[0]==='--execute',prepare=args[0]==='--prepare',offline=args[0]==='--offline',canary=offline&&args[1]==='--canary'?args[2]:'';
 assert.ok(!args.length||args.length===1&&['--dry-run','--prepare','--offline'].includes(args[0])||offline&&args.length===3&&args[1]==='--canary'&&canaries.includes(canary)||live&&args.length===3&&args[1]==='--grant','invalid arguments');
 const stamp=identity();assert.equal(stamp.pi,'1.5.0');
 if(!live&&!prepare&&!offline){console.log(JSON.stringify({mode:'paired-dry-run',providerRequests:0,credentialReads:0,requiresExternalGrant:true,profile:PAIR,profileSHA256:PAIR_SHA,identity:stamp},null,2));return;}
 if(!canary)assert.equal(stamp.dirty,false,'clean fixed source');assert.ok(!live||!process.env.CI);
 let run,grant,lock;
 if(live){assert.ok(args[2].startsWith('/'));grant=readPairGrant(args[2]);run=grant.run;lock=claimPairOnce(grant);}
 else run=createRun(PAIR_ID);
 console.log(JSON.stringify({run,mode:live?'live':prepare?'prepare':'offline'}));
 if(!live){
  const packages=materializePackages(run),contexts=await captureContexts(run,PAIR_ID);validateContextPairs(run);
  const captureFiles=Object.fromEntries(PAIR.order.flatMap(id=>[id+'.context.json',id+'.capture.json']).map(p=>[p,digest(readFileSync(join(run,p)))]));
  writeFileSync(join(run,'preflight.json'),JSON.stringify({experiment:PAIR_ID,profileSHA256:PAIR_SHA,identity:stamp,packages,contexts,captureFiles},null,2)+'\n',{mode:0o600});
  if(prepare){console.log(JSON.stringify({prepared:run,providerRequests:0,credentialReads:0}));return;}
 }
 const results=[];let stopped;
 try{
  if(live)writeFileSync(join(run,'admission.json'),JSON.stringify({grantFile:args[2],grantSHA:grant.grantSHA,preflightSHA256:grant.preflightSHA256,lock,batchStartedAt:began})+'\n',{mode:0o600});
  for(const id of PAIR.order){
   if(stopped||780000-(Date.now()-began)<180000){stopped??='insufficient-full-worker-deadline';results.push({id,outcome:'not_run',notRun:stopped});continue;}
   const first=id===PAIR.order[0],simulation=canary==='reasoning'?'reasoning':first?({ordinary:'failed-check',semantic:'semantic-check',preparation:'prepare',schema:'schema-missing',rewrite:'rewrite',fatal:'rate-limit','dom-number':'dom-number','helper-usage':'safe-usage'}[canary]??'workflow'):'workflow';
   let row;try{row=await runWorker(id,run,live?'live':'offline',live?'':simulation,undefined,PAIR_ID);}catch{row={id,outcome:'provider_unknown',requests:null,requestAccounting:'unknown',harnessFailure:true,fatal:true};}
   results.push(row);console.log(JSON.stringify({id,outcome:row.outcome,requests:row.requests}));
   if(live&&row.requestAccounting==='known')writeFileSync(join(run,id+'.completed.json'),JSON.stringify({rawSHA256:digest(readFileSync(join(run,id+'.live.json'))),result:row},null,2)+'\n',{mode:0o600});
   writeFileSync(join(run,'progress.json'),JSON.stringify(results,null,2)+'\n',{mode:0o600});if(row.fatal||row.harnessFailure||row.requestAccounting!=='known')stopped=row.outcome;
  }
 }catch{stopped='harness_error';}
 while(results.length<4)results.push({id:PAIR.order[results.length],outcome:'not_run',notRun:stopped??'harness_error'});
 const journal=new PilotBudget(join(run,live?'live-requests.jsonl':'synthetic-offline-requests.jsonl'),live?'live':'offline',PAIR_ID).evidence();
 const report={experiment:PAIR_ID,profileSHA256:PAIR_SHA,mode:live?'live-paired':'synthetic-paired',identity:stamp,elapsedMs:Date.now()-began,stopped:stopped??null,journalState:journal,...pairSummary(results,journal,live),harnessAccepted:journal.complete&&stopped!=='harness_error'&&!results.some(r=>r.harnessFailure||r.fatal),results};
 writeFileSync(join(run,'report.json'),JSON.stringify(report,null,2)+'\n',{mode:0o600});if(live)writeFileSync(join(run,'terminal.json'),JSON.stringify({grantSHA:grant.grantSHA,stopped:report.stopped})+'\n',{mode:0o600});
 console.log(JSON.stringify({report:join(run,'report.json'),harnessAccepted:report.harnessAccepted,actualModelRequests:report.actualModelRequests,conclusion:report.conclusion}));if(!report.harnessAccepted)process.exitCode=1;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(()=>{console.error('Paired admission/setup refused; no automatic retry or replacement grant.');process.exitCode=1;});
