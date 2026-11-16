// Finite Spec025 authority. No SDK imports and no operator configuration access.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,lstatSync,existsSync,realpathSync} from 'node:fs';
import {join,dirname,resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import {ROOT,digest,assertOwned,jsonFile,identityInputs,policyFor} from '../trigger-smoke/policy.ts';
import {PilotBudget} from '../trigger-pilot/contracts.ts';
import {diagnosticsClosed} from './oracle.ts';
import {ADAPTER_ID} from '../helper-adapter/profile.ts';
import {PAIR,PAIR_ID,PAIR_SHA,ARCHIVES,DIFFERENT} from './profile.ts';

function packagePolicy(experiment:string){assert.ok(experiment===PAIR_ID||experiment===ADAPTER_ID,'known package policy');return policyFor(experiment);}
const payload=()=>jsonFile(join(ROOT,'tests/benchmark-model/payload.json')) as string[];
function ordinary(path:string){assert.equal(realpathSync(path),path,'symlink path');assert.ok(lstatSync(path).isFile()&&!lstatSync(path).isSymbolicLink(),'ordinary input');return readFileSync(path);}
export function validatePackages(run:string,experiment=PAIR_ID):any{
 packagePolicy(experiment);assertOwned(run,experiment);const rows=jsonFile(join(run,'packages.json'));assert.deepEqual(Object.keys(rows).sort(),['C','G']);
 const paths=payload();assert.equal(paths.length,76);
 for(const arm of ['C','G'] as const){
  assert.equal(digest(ordinary(join(ROOT,ARCHIVES[arm]))),PAIR.arms[arm].archiveSHA256,'archive identity');
  assert.deepEqual(Object.keys(rows[arm]).sort(),paths.slice().sort());
  for(const p of paths){assert.ok(!p.startsWith('/')&&!p.split('/').includes('..'));assert.equal(digest(ordinary(join(run,'arms',arm,'package',p))),rows[arm][p],'active payload drift');}
 }
 assert.deepEqual(paths.filter(p=>rows.C[p]!==rows.G[p]).sort(),DIFFERENT.slice().sort(),'exact seven treatment paths');return rows;
}
export function validateActivePackage(run:string,id:string,experiment=PAIR_ID):void{
 const policy=packagePolicy(experiment);assertOwned(run,experiment);assert.ok(policy.order.includes(id));const arm=id.split('-')[1],expected=jsonFile(join(run,'packages.json'))[arm];
 for(const p of payload())assert.equal(digest(ordinary(join(run,'workspace/package',p))),expected[p],'active copied payload drift');
 assert.equal(realpathSync(join(run,'workspace/package/node_modules')),realpathSync(join(ROOT,'node_modules')),'locked dependencies only');
}
export function materializePackages(run:string,experiment=PAIR_ID):any{
 packagePolicy(experiment);assertOwned(run,experiment);const paths=payload();assert.equal(paths.length,76);const rows:any={};
 for(const arm of ['C','G'] as const){
  const archive=join(ROOT,ARCHIVES[arm]);assert.equal(digest(ordinary(archive)),PAIR.arms[arm].archiveSHA256);
  const list=execFileSync('tar',['-tzf',archive],{encoding:'utf8',timeout:5000}).trim().split('\n');assert.deepEqual(list.slice().sort(),paths.map(p=>'package/'+p).sort());
  const types=execFileSync('tar',['-tvzf',archive],{encoding:'utf8',timeout:5000}).trim().split('\n');assert.equal(types.length,76);assert.ok(types.every(line=>line.startsWith('-')),'regular archive entries only');
  const dest=join(run,'arms',arm);mkdirSync(dest,{recursive:true,mode:0o700});execFileSync('tar',['-xzf',archive,'-C',dest],{timeout:5000});
  rows[arm]=Object.fromEntries(paths.map(p=>[p,digest(ordinary(join(dest,'package',p)))]));
 }
 writeFileSync(join(run,'packages.json'),JSON.stringify(rows,null,2)+'\n',{mode:0o600});return validatePackages(run,experiment);
}
export function validateContextPairs(run:string,experiment=PAIR_ID):void{
 const scenarios=packagePolicy(experiment).scenarios.map((s:any)=>s.id);assertOwned(run,experiment);
 const metadata:any={};for(const arm of ['C','G'])metadata[arm]=jsonFile(join(run,scenarios[0]+'-'+arm+'.capture.json')).registeredRender;
 assert.ok(metadata.C&&metadata.G);assert.notEqual(metadata.C.description,metadata.G.description);assert.notEqual(metadata.C.promptSnippet,metadata.G.promptSnippet);
 // Replace only the actual arm's registered descriptor/snippet to compare the rest.
 // Captured and dispatched bodies remain untouched and independently hashed.
 for(const scenario of scenarios){
  const bodies=['C','G'].map(arm=>{
   const body=jsonFile(join(run,scenario+'-'+arm+'.context.json')),capture=jsonFile(join(run,scenario+'-'+arm+'.capture.json'));assert.deepEqual(capture.registeredRender,metadata[arm]);
   const render=body.tools.filter((t:any)=>t.function?.name==='a2ui_render');assert.equal(render.length,1);assert.equal(render[0].function.description,metadata[arm].description);render[0].function.description='[actual arm description]';
   let count=0;for(const m of body.messages)if(['system','developer'].includes(m.role)&&typeof m.content==='string'){const needle=metadata[arm].promptSnippet;assert.ok(needle);const parts=m.content.split(needle);count+=parts.length-1;m.content=parts.join('[actual arm snippet]');}assert.equal(count,1,'exact active system snippet');return body;
  });
  assert.deepEqual(bodies[0],bodies[1],'unexpected arm context difference');
 }
}
export function readPairGrant(path:string):any{
 assert.equal(dirname(path),join(ROOT,'.local/authoring-pilot'));const g=jsonFile(path);assertOwned(g.run,PAIR_ID);const pre=jsonFile(join(g.run,'preflight.json'));
 assert.equal(g.schema,'spec025-user-grant-v1');assert.equal(g.spec,'Spec025');assert.equal(g.userMessage,'授权');assert.match(g.id,/^[A-Za-z0-9-]{1,64}$/);assert.equal(g.invocations,1);assert.equal(g.maxRequests,24);assert.equal(g.requestsPerSession,6);assert.deepEqual(g.order,PAIR.order);assert.equal(g.model,'glm-5.3-flash');assert.equal(g.endpoint,PAIR.model.endpoint);assert.equal(g.profileSHA256,PAIR_SHA);
 assert.equal(g.preflightSHA256,digest(JSON.stringify(pre)));assert.equal(pre.experiment,PAIR_ID);assert.equal(pre.profileSHA256,PAIR_SHA);assert.equal(pre.identity.dirty,false);assert.equal(g.source,pre.identity.source);assert.equal(g.tree,pre.identity.tree);
 for(const [key,args]of Object.entries({source:['rev-parse','HEAD'],tree:['rev-parse','HEAD^{tree}']}))assert.equal(execFileSync('git',args,{cwd:ROOT,encoding:'utf8'}).trim(),g[key]);
 assert.equal(execFileSync('git',['status','--porcelain'],{cwd:ROOT,encoding:'utf8'}).trim(),'');assert.equal(process.version,pre.identity.node);assert.match(process.version,/^v24\./);assert.equal(pre.identity.pi,'1.5.0');
 assert.deepEqual(Object.keys(pre.identity.files).sort(),identityInputs().sort());for(const[p,sha]of Object.entries(pre.identity.files)){assert.ok(!p.startsWith('/')&&!p.split('/').includes('..'));assert.equal(digest(ordinary(join(ROOT,p))),sha,'runtime input drift');}
 assert.deepEqual(validatePackages(g.run),pre.packages);assert.deepEqual(jsonFile(join(g.run,'contexts.json')),pre.contexts);assert.deepEqual(Object.keys(pre.contexts).sort(),PAIR.order.slice().sort());
 const captures=PAIR.order.flatMap((id:string)=>[id+'.context.json',id+'.capture.json']);assert.deepEqual(Object.keys(pre.captureFiles).sort(),captures.slice().sort());for(const p of captures)assert.equal(digest(ordinary(join(g.run,p))),pre.captureFiles[p],'capture drift');
 validateContextPairs(g.run);
 assert.equal(g.review.verdict,'GO');assert.equal(g.review.source,g.source);assert.equal(dirname(g.review.path),join(ROOT,'.local/authoring-pilot-implementation'));assert.equal(digest(ordinary(g.review.path)),g.review.sha256);const review=jsonFile(g.review.path);assert.equal(review.verdict,'GO');assert.equal(review.source,g.source);assert.equal(review.tree,g.tree);
 return{...g,preflight:pre,grantFile:path,grantSHA:digest(ordinary(path))};
}
export function claimPairOnce(g:any):string{
 const lock=join(ROOT,'.local/authoring-pilot','grant-'+g.id+'.lock');mkdirSync(lock,{mode:0o700});writeFileSync(join(lock,'owner.json'),JSON.stringify({run:g.run,grantSHA:g.grantSHA})+'\n',{mode:0o600});return lock;
}
function liveAuthority(run:string):any{
 assertOwned(run,PAIR_ID);const ticket=jsonFile(join(run,'admission.json')),g=readPairGrant(ticket.grantFile);assert.equal(g.run,run);assert.equal(ticket.grantSHA,g.grantSHA);assert.equal(ticket.preflightSHA256,g.preflightSHA256);assert.equal(ticket.lock,join(ROOT,'.local/authoring-pilot','grant-'+g.id+'.lock'));assert.deepEqual(jsonFile(join(ticket.lock,'owner.json')),{run,grantSHA:g.grantSHA});assert.ok(!existsSync(join(run,'terminal.json')));assert.ok(Number.isSafeInteger(ticket.batchStartedAt)&&Date.now()>=ticket.batchStartedAt&&Date.now()-ticket.batchStartedAt<780000);return g;
}
function priorCases(run:string,id:string):void{
 const index=PAIR.order.indexOf(id);assert.ok(index>=0);const proof=new PilotBudget(join(run,'live-requests.jsonl'),'live',PAIR_ID).evidence();assert.equal(proof.complete,true);
 for(const prior of PAIR.order.slice(0,index)){
  const parent=jsonFile(join(run,prior+'.completed.json')),raw=jsonFile(join(run,prior+'.live.json'));assert.equal(parent.rawSHA256,digest(ordinary(join(run,prior+'.live.json'))));
  const r=parent.result;assert.equal(r.id,prior);assert.equal(r.kind,'live');assert.equal(r.experiment,PAIR_ID);assert.equal(r.fatal,false);assert.ok(!r.harnessFailure);assert.equal(r.requestAccounting,'known');assert.equal(r.process.code,0);assert.equal(r.process.fallback,false);assert.deepEqual(r.cleanupErrors,[]);assert.equal(r.requests,proof.rows.filter((v:any)=>v.episode===prior).length);assert.equal(raw.requests,r.requests);assert.ok(r.requests>=1&&r.requests<=6);assert.equal(raw.requestDiagnostics.length,r.requests);assert.ok(raw.requestDiagnostics.every((d:any)=>d.status>=200&&d.status<300&&['stop','toolUse'].includes(d.sdkStopReason)&&d.doneObserved&&['eof','cancelled'].includes(d.streamState)&&d.errors.length===0&&d.finishReasons.some((v:string)=>['stop','tool_calls'].includes(v))));assert.equal(raw.fatal,false);assert.equal(diagnosticsClosed(raw,proof.rows),true);
 }
 assert.ok(proof.rows.every((r:any)=>PAIR.order.indexOf(r.episode)<index),'future or current admissions before start');
}
export function verifyPairWorker(run:string,id:string,claim=false):any{
 assert.equal(process.argv[1],join(ROOT,'tests/trigger-pilot/worker.ts'));assert.deepEqual(process.argv.slice(2),[id,run,'live','',PAIR_ID]);const g=liveAuthority(run);priorCases(run,id);
 assert.ok(!existsSync(join(run,id+'.live-started'))&&!existsSync(join(run,id+'.live.json'))&&!existsSync(join(run,id+'.completed.json')),'case replay');
 if(claim){mkdirSync(join(run,id+'.live-started'),{mode:0o700});writeFileSync(join(run,id+'.live-started/owner.json'),JSON.stringify({pid:process.pid}),{mode:0o600});}return g;
}
export function verifyPairRequest(run:string,id:string):void{
 liveAuthority(run);validateActivePackage(run,id);assert.ok(PAIR.order.includes(id));assert.equal(jsonFile(join(run,id+'.live-started/owner.json')).pid,process.pid);assert.ok(!existsSync(join(run,id+'.live.json'))&&!existsSync(join(run,id+'.completed.json')));
 // Only already completed predecessors and this active session may have admissions.
 const rows=new PilotBudget(join(run,'live-requests.jsonl'),'live',PAIR_ID).rows();assert.ok(rows.every((r:any)=>PAIR.order.indexOf(r.episode)<=PAIR.order.indexOf(id)));
}
