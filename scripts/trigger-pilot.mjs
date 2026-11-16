// Standalone manual pilot; importing this entry has no SDK/auth/provider side effects.
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {PROFILE,SCENARIOS,PilotBudget,summarize} from '../tests/trigger-pilot/contracts.ts';
import {identity,createRun,validateArchive,captureContexts,runWorker} from '../tests/trigger-pilot/control.ts';

export async function main(args=process.argv.slice(2)){
 assert.equal(process.versions.node.split('.')[0],'24','Node24 only');
 if(args.length===1&&args[0]==='--help'){console.log('Node24: node scripts/trigger-pilot.mjs [--dry-run | --offline [--canary torn-journal]]\nDefault zero inference/auth reads. Live execution disabled; historical budget consumed.');return;}
 const live=args[0]==='--execute',canary=args.length===3&&args[0]==='--offline'&&args[1]==='--canary'&&args[2]==='torn-journal'?'torn-journal':'',offline=args.length===1&&args[0]==='--offline'||!!canary;assert.ok(args.length===0||args.length===1&&args[0]==='--dry-run'||offline||live&&args.length===3&&args[1]==='--archive','invalid pilot arguments');
 if(live&&!PROFILE.liveEnabled){console.error('live execution disabled; new explicit authorization required');process.exitCode=1;return;}
 const stamp=identity();assert.equal(stamp.pi,'1.5.0');assert.equal(SCENARIOS.length,6);
 if(!live&&!offline){console.log(JSON.stringify({mode:'dry-run',providerRequests:0,credentialReads:0,profile:PROFILE,scenarios:SCENARIOS,identity:stamp},null,2));return;}
 assert.ok(['darwin','linux'].includes(process.platform));if(!canary)assert.equal(stamp.dirty,false,'clean reviewed source required');assert.ok(!live||!process.env.CI,'no CI inference');if(live)validateArchive(args[2]);
 const run=createRun();console.log(JSON.stringify({run,phase:'zero-inference-context-preflight'}));
 let contexts;if(canary){const r=await runWorker(PROFILE.order[0],run,'capture');assert.ok(!r.harnessFailure&&r.firstBodySHA256);contexts={T01:r.firstBodySHA256};writeFileSync(join(run,'contexts.json'),JSON.stringify(contexts));}else contexts=await captureContexts(run);writeFileSync(join(run,'admission.json'),JSON.stringify({identity:stamp,profile:PROFILE,contexts,canary:canary||null,userAuthorizedRequests:live?36:0},null,2)+'\n',{mode:0o600});
 const results=[];let stopped;const started=Date.now();
 for(const id of PROFILE.order){
  if(stopped||Date.now()-started>=1200000){stopped??='batch deadline';results.push({id,outcome:'not_run',notRun:stopped});continue;}
  let result;try{result=await runWorker(id,run,live?'live':'offline',canary,Math.min(102000,1200000-(Date.now()-started)));}catch{result={id,outcome:'provider_unknown',requests:null,fatal:true,harnessFailure:true};}
  results.push(result);writeFileSync(join(run,'progress.json'),JSON.stringify(results,null,2)+'\n',{mode:0o600});console.log(JSON.stringify({id,outcome:result.outcome,requested:result.renderRequested,attempted:result.renderAttempted,committed:result.renderCommitted,requests:result.requests}));
  if(result.fatal||result.harnessFailure)stopped=result.outcome;
 }
 const journal=new PilotBudget(join(run,live?'live-requests.jsonl':`synthetic-${canary||'offline'}-requests.jsonl`),live?'live':'offline').evidence(),summary=summarize(results,{live,journal});
 const report={mode:live?'live-trigger-pilot':'synthetic-offline',identity:stamp,profile:PROFILE,journalState:journal,harnessAccepted:results.length===12&&summary.requestAccountingKnown&&!results.some(r=>r.harnessFailure),batchCompleted:results.length===12&&!results.some(r=>r.notRun)&&summary.requestOutcomesKnown,stopped:stopped??null,...summary};
 writeFileSync(join(run,'report.json'),JSON.stringify(report,null,2)+'\n',{mode:0o600});console.log(JSON.stringify({report:join(run,'report.json'),harnessAccepted:report.harnessAccepted,actualModelRequests:report.actualModelRequests}));if(!report.harnessAccepted)process.exitCode=1;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(()=>{console.error('Pilot admission/setup failed. No automatic retry; inspect owned receipts.');process.exitCode=1;});
