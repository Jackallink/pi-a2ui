import assert from 'node:assert/strict';
import {readFileSync,lstatSync,existsSync,mkdirSync,writeFileSync,readdirSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

export const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
export const digest=(value:string|Buffer)=>createHash('sha256').update(value).digest('hex');
const old=JSON.parse(readFileSync(join(ROOT,'tests/trigger-pilot/profile.json'),'utf8'));
export const SMOKE=JSON.parse(readFileSync(join(ROOT,'tests/trigger-smoke/profile.json'),'utf8'));
export const SMOKE_ID='v0.1.10-trigger-smoke-1';
export const OLD_ID=old.id;
export const PROFILE_SHA=digest(readFileSync(join(ROOT,'tests/trigger-smoke/profile.json')));
export function identityInputs():string[]{
 const payload=JSON.parse(readFileSync(join(ROOT,'tests/benchmark-model/payload.json'),'utf8'));
 return [...new Set<string>(['scripts/trigger-pilot.mjs','scripts/trigger-smoke.mjs',...['trigger-pilot','trigger-smoke'].flatMap(dir=>readdirSync(join(ROOT,'tests',dir)).filter(p=>/\.(ts|json)$/.test(p)).map(p=>'tests/'+dir+'/'+p)),'package-lock.json','tests/benchmark-model/guards.ts','tests/benchmark-model/profile-v2.json','tests/benchmark-model/payload.json',...payload])];
}
export function policyFor(experiment=OLD_ID):any{
 assert.ok(experiment===OLD_ID||experiment===SMOKE_ID,'known experiment only');
 if(experiment===OLD_ID)return{experiment,smoke:false,profile:old,order:old.order,batchRequests:36,limit:()=>3,active:()=>90000,deadline:()=>102000,scenarios:JSON.parse(readFileSync(join(ROOT,'tests/trigger-pilot/scenarios.json'),'utf8')),base:'trigger-pilot',marker:'trigger-pilot-owned\n'};
 assert.equal(SMOKE.id,SMOKE_ID);assert.equal(SMOKE.batchRequests,4);assert.deepEqual(SMOKE.order,['SM02-B','SM01-B']);assert.deepEqual(SMOKE.episodes.map((e:any)=>e.maxRequests),[1,3]);
 const episode=(id:string)=>{const row=SMOKE.episodes.find((e:any)=>e.id===id);assert.ok(row,'smoke episode identity');return row;};
 return{experiment,smoke:true,profile:{...old,id:SMOKE_ID,order:SMOKE.order,caps:{...old.caps,batchRequests:4,batchMs:180000}},order:SMOKE.order,batchRequests:4,limit:(id:string)=>episode(id).maxRequests,active:(id:string)=>episode(id).activeTimeoutMs,deadline:(id:string)=>episode(id).workerTimeoutMs,scenarios:SMOKE.episodes,base:'trigger-smoke',marker:SMOKE_ID+'\n'};
}
export function assertOwned(run:string,experiment=OLD_ID):void{
 const p=policyFor(experiment),base=join(ROOT,'.local',p.base);assert.equal(resolve(run),run);assert.equal(dirname(run),base);assert.match(run.slice(base.length+1),/^run-[A-Za-z0-9]+$/);
 assert.ok(lstatSync(base).isDirectory()&&!lstatSync(base).isSymbolicLink());assert.ok(lstatSync(run).isDirectory()&&!lstatSync(run).isSymbolicLink());assert.equal(readFileSync(join(run,'.owned'),'utf8'),p.marker);
}
export function jsonFile(path:string):any{
 const stat=lstatSync(path);assert.ok(stat.isFile()&&!stat.isSymbolicLink()&&stat.size<=256*1024,'ordinary bounded receipt');return JSON.parse(readFileSync(path,'utf8'));
}
export function validateGrantData(grant:any,pre:any):void{
 assert.equal(grant.schema,'smoke-user-grant-v1');assert.equal(grant.spec,'Spec023');assert.equal(grant.userMessage,'授权');assert.match(grant.id,/^[A-Za-z0-9-]{1,64}$/);assert.equal(grant.maxRequests,4);assert.deepEqual(grant.perEpisode,{'SM02-B':1,'SM01-B':3});assert.equal(grant.model,'glm-5.3-flash');assert.equal(grant.invocations,1);assert.equal(grant.profileSHA256,PROFILE_SHA);assert.equal(grant.preflightSHA256,digest(JSON.stringify(pre)));assert.equal(grant.source,pre.identity.source);assert.equal(grant.tree,pre.identity.tree);assert.equal(pre.identity.dirty,false);assert.equal(pre.experiment,SMOKE_ID);assert.equal(pre.profileSHA256,PROFILE_SHA);assert.equal(pre.archiveSHA256,SMOKE.release.archiveSHA256);assert.deepEqual(Object.keys(pre.contexts).sort(),['SM01-B','SM02-B']);
}
export function readGrant(path:string):any{
 const base=join(ROOT,'.local/trigger-smoke');assert.equal(dirname(path),base);const grant=jsonFile(path);assertOwned(grant.run,SMOKE_ID);const pre=jsonFile(join(grant.run,'preflight.json'));validateGrantData(grant,pre);
 assert.equal(execFileSync('git',['rev-parse','HEAD'],{cwd:ROOT,encoding:'utf8'}).trim(),grant.source,'grant source drift');assert.equal(execFileSync('git',['rev-parse','HEAD^{tree}'],{cwd:ROOT,encoding:'utf8'}).trim(),grant.tree);assert.equal(execFileSync('git',['status','--porcelain'],{cwd:ROOT,encoding:'utf8'}).trim(),'','clean source required');assert.equal(process.version,pre.identity.node);assert.match(process.version,/^v24\./);assert.equal(pre.identity.pi,'1.5.0');
 for(const[p,sha]of Object.entries(pre.identity.files)){assert.ok(!p.startsWith('/')&&!p.split('/').includes('..'));assert.equal(digest(readFileSync(join(ROOT,p))),sha,'grant input drift');}
 assert.deepEqual(Object.keys(pre.identity.files).sort(),identityInputs().sort(),'complete input set');assert.deepEqual(jsonFile(join(grant.run,'contexts.json')),pre.contexts);assert.deepEqual(Object.keys(pre.captureFiles).sort(),SMOKE.order.flatMap((id:string)=>[id+'.context.json',id+'.capture.json']).sort());for(const[p,sha]of Object.entries(pre.captureFiles)){assert.ok(/^(SM01|SM02)-B\.(context|capture)\.json$/.test(p));assert.equal(digest(readFileSync(join(grant.run,p))),sha,'capture drift');}
 return{...grant,preflight:pre,grantFile:path,grantSHA:digest(readFileSync(path))};
}
export function claimOnce(run:string,grantId:string,grantSHA:string):string{
 assertOwned(run,SMOKE_ID);assert.match(grantId,/^[A-Za-z0-9-]{1,64}$/);assert.match(grantSHA,/^[a-f0-9]{64}$/);const lock=join(ROOT,'.local/trigger-smoke','grant-'+grantId+'.lock');mkdirSync(lock,{mode:0o700});writeFileSync(join(lock,'owner.json'),JSON.stringify({run,grantSHA})+'\n',{mode:0o600});return lock;
}
export function negativeReceiptPassed(negative:any,rows:any[],contextSHA:string):boolean{
 try{assert.equal(negative.id,'SM02-B');assert.equal(negative.kind,'live');assert.equal(negative.experiment,SMOKE_ID);assert.equal(negative.outcome,'negative_pass');assert.equal(negative.requests,1);assert.equal(negative.modelCalls,1);assert.equal(negative.renderRequested,false);assert.equal(negative.renderAttempted,false);assert.equal(negative.renderCommitted,false);assert.equal(negative.toolCount,0);assert.deepEqual(negative.tools,[]);assert.deepEqual(negative.cleanupErrors,[]);assert.equal(negative.fatal,false);assert.equal(negative.firstBodySHA256,contextSHA);assert.equal(rows.length,1);assert.equal(rows[0].episode,'SM02-B');assert.equal(rows[0].mode,'live');assert.equal(rows[0].experiment,SMOKE_ID);assert.equal(rows[0].profileSHA256,PROFILE_SHA);assert.equal(rows[0].bodySHA256,contextSHA);assert.equal(negative.requestDiagnostics.length,1);const d=negative.requestDiagnostics[0];assert.equal(d.sdkStopReason,'stop');assert.equal(d.bodySHA256,contextSHA);assert.ok(d.status>=200&&d.status<300);const assistants=negative.transcript.filter((m:any)=>m.role==='assistant');assert.equal(assistants.length,1);assert.equal(assistants[0].stopReason,'stop');assert.equal(assistants[0].content.some((c:any)=>c.type==='toolCall'),false);assert.equal(assistants[0].content.filter((c:any)=>c.type==='text').map((c:any)=>c.text).join('').trim(),'收到');return true;}catch{return false;}
}
function liveAuthority(run:string):any{
 assertOwned(run,SMOKE_ID);const ticket=jsonFile(join(run,'admission.json')),g=readGrant(ticket.grantFile);assert.equal(g.run,run);assert.equal(ticket.grantSHA,g.grantSHA);assert.equal(ticket.preflightSHA256,g.preflightSHA256);assert.equal(ticket.lock,join(ROOT,'.local/trigger-smoke','grant-'+g.id+'.lock'));assert.deepEqual(jsonFile(join(ticket.lock,'owner.json')),{run,grantSHA:g.grantSHA});assert.ok(!existsSync(join(run,'terminal.json')),'batch already closed');assert.ok(Number.isSafeInteger(ticket.batchStartedAt)&&Date.now()-ticket.batchStartedAt>=0&&Date.now()-ticket.batchStartedAt<180000,'live batch deadline');return g;
}
export function claimEpisode(run:string,id:string):void{assertOwned(run,SMOKE_ID);assert.ok(SMOKE.order.includes(id));mkdirSync(join(run,id+'.live-started'),{mode:0o700});}
export function verifyLiveRequest(run:string,id:string):void{liveAuthority(run);assert.ok(SMOKE.order.includes(id));assert.ok(existsSync(join(run,id+'.live-started')));assert.ok(!existsSync(join(run,id+'.live.json')),'episode already closed');}
export function verifyLiveWorker(run:string,id:string,experiment=OLD_ID,claim=false):any{
 assert.equal(experiment,SMOKE_ID,'live execution disabled for old pilot');
 assert.equal(process.argv[1],join(ROOT,'tests/trigger-pilot/worker.ts'),'live execution disabled outside reviewed worker');assert.equal(process.argv[2],id);assert.equal(process.argv[3],run);assert.equal(process.argv[4],'live');assert.equal(process.argv[5],'');assert.equal(process.argv[6],SMOKE_ID);
 assert.ok(SMOKE.order.includes(id));const g=liveAuthority(run);
 const started=join(run,id+'.live-started');assert.ok(!existsSync(started)&&!existsSync(join(run,id+'.live.json')),'episode replay');
 if(id==='SM01-B'){const bytes=readFileSync(join(run,'live-requests.jsonl'),'utf8');assert.ok(bytes.endsWith('\n'));const rows=bytes.trim().split('\n').map(line=>JSON.parse(line));assert.ok(negativeReceiptPassed(jsonFile(join(run,'SM02-B.live.json')),rows,g.preflight.contexts['SM02-B']),'verified negative pass required');}
 if(claim)claimEpisode(run,id);return g;
}
export function smokeSummary(results:any[],journal:any,live:boolean):any{
 assert.deepEqual(results.map(r=>r.id),SMOKE.order);const accountingKnown=journal.complete&&results.every(r=>r.notRun||Number.isSafeInteger(r.requests)&&r.requestAccounting==='known'),outcomesKnown=results.every(r=>r.notRun||r.outcome!=='provider_unknown'&&r.requestAccounting==='known');
 const knownAdmittedRequests=Math.max(journal.rows.length,results.reduce((n,r)=>n+(r.requests??r.knownAdmittedRequests??0),0));const positive=results[1],negative=results[0];
 return{plannedEpisodes:2,knownAdmittedRequests,requestAccountingKnown:accountingKnown,requestOutcomesKnown:outcomesKnown,actualModelRequests:live?(accountingKnown&&outcomesKnown?knownAdmittedRequests:null):0,negative:negative.outcome==='negative_pass'?'pass':negative.notRun?'not_run':['negative_text','negative_tool'].includes(negative.outcome)?'fail':['provider_unknown','output_truncated'].includes(negative.outcome)?'unknown':'protocol_error',positiveChoice:positive.notRun?'not_run':positive.renderRequested===true?'observed':positive.outcome==='provider_unknown'||positive.outcome==='output_truncated'?'unknown':'not_observed',uiVerdict:negative.outcome==='negative_pass'&&positive.outcome==='render_committed'&&positive.contentValid===true&&!positive.harnessFailure?'ui_smoke_pass':positive.notRun?'not_run':positive.outcome==='preparation_limited'||positive.outcome==='text_only'?'ui_not_observed':'incomplete_or_invalid',results};
}
