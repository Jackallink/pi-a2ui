import assert from 'node:assert/strict';
import { mock } from 'node:test';
import { chmod, copyFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { UiSession } from '../../src/session.ts';
import { UiError, type DataBatch, type Snapshot } from '../../src/protocol.ts';
import { startServer, type CanvasServer } from '../../src/server.ts';
import { assertForwarded, assertUsage, assertCapacityReason, assertChartTransition, assertChartBatch } from './oracles.ts';
import { caseResult, fixtureBytes, loadCases, sha256, GoldenFailure, type CaseResult, type GoldenCase } from './registry.ts';
import { runOwnedWorker, type SessionObservation, type WorkerObservation } from './worker.ts';

function rejectsStatus(run:()=>unknown,status:number):UiError {let caught:UiError|undefined;assert.throws(run,error=>{if(error instanceof UiError&&error.status===status){caught=error;return true;}return false;});return caught!;}
function envelope(session:UiSession,eventId:string,name='Ada') {
  const snapshot=session.snapshot();
  return {epoch:snapshot.epoch,revision:snapshot.surfaces[0].revision,eventId,message:{version:'1.0',action:{name:'submit',surfaceId:'golden',sourceComponentId:'submit',timestamp:'2026-11-15T00:00:00Z',context:{name,accept:true}}}};
}
// Only called by the owned fixed worker; never evaluates steps or imports from fixture data.
export async function runSessionCase(id:string,ownedRoot:string,signal:AbortSignal,fixtureSource:string):Promise<SessionObservation> {
  const row=loadCases().find(row=>row.id===id&&row.layer==='session');
  if(!row)return {kind:'session-error',stage:'setup',detail:'Unknown fixed session case'};
  const actualInputHash=sha256(fixtureSource);
  if(actualInputHash!==sha256(fixtureBytes(row.fixture)))return {kind:'session-error',stage:'setup',detail:'Worker actual fixture bytes differ from manifest',actualInputHash};
  const fixture=JSON.parse(fixtureSource);
  const expected=fixture.expected, input=fixture.input;
  const sent:string[]=[];
  const session=new UiSession(text=>{sent.push(text);if(id==='S11')session.render('golden','root = Text("Replacement")');});
  let server:CanvasServer|undefined,clock=false;
  let result:SessionObservation={kind:'session-error',stage:'setup',detail:'Case did not execute'};
  let observation:unknown;
  let stage:'setup'|'session'='setup';
  const pending=new Set<AbortController>();
  async function request(url:string,init:RequestInit={},binary=false) {
    const controller=new AbortController();pending.add(controller);
    const timeout=setTimeout(()=>controller.abort(),5000);
    try {
      const response=await fetch(url,{...init,signal:AbortSignal.any([controller.signal,signal])});
      const body=Buffer.from(await response.arrayBuffer());
      return {status:response.status,headers:response.headers,body:binary?body:body.toString('utf8')};
    } catch(error){throw new GoldenFailure('setup',`HTTP transport: ${String(error)}`);} finally {clearTimeout(timeout);pending.delete(controller);}
  }
  try {
    if(['S07','S08'].includes(id)){mock.timers.enable({apis:['setTimeout','Date'],now:1000});clock=true;}
    if(input?.renders)for(const render of input.renders)session.render(render.surfaceId,render.source);
    else if(fixture.source)session.render('golden',fixture.source);
    const before=session.snapshot();stage='session';
    switch(id){
      case 'S01':case 'S03':
        observation={usage:assertUsage(before,{components:expected.components,surfaces:expected.surfaceCount}),snapshot:before};break;
      case 'S02':case 'S04':case 'S06':
        if(expected.componentsBefore)assertUsage(before,{components:expected.componentsBefore,surfaces:1});
        {const error=rejectsStatus(()=>session.render(input.attempt.surfaceId,input.attempt.source),expected.status);if(id==='S04')assertCapacityReason(error.reason,expected);}
        assert.deepEqual(session.snapshot(),before,'failed admission is atomic');observation={before,after:session.snapshot(),status:expected.status};break;
      case 'S05':
        session.render(input.replacement.surfaceId,input.replacement.source);
        assert.equal(session.snapshot().surfaces[0].revision,expected.revision);
        session.render(input.addition.surfaceId,input.addition.source);
        observation={usage:assertUsage(session.snapshot(),{components:expected.components,surfaces:2})};break;
      case 'S07':case 'S08':{
        const batches:DataBatch[]=[];session.subscribeData(batch=>batches.push(batch));
        if(id==='S07') {
          const committed=session.updateChart('golden',1,'root',fixture.series);
          assert.equal(committed.surfaces[0].revision,expected.revision);
          assertChartTransition(before,committed,expected.series,0);
          assert.equal(batches.length,0,'data emission is deferred');
          mock.timers.tick(200);
          assert.equal(batches.length,1);
          assertChartBatch(before,batches[0],expected.series,expected.dataSequence);
          assert.equal(batches[0].surfaces[0].sequence,expected.dataSequence);
          assert.deepEqual(batches[0].surfaces[0].components.find(c=>c.id==='root')?.series,expected.series);
          assert.equal(session.snapshot().surfaces[0].revision,1);
          assertChartTransition(before,session.snapshot(),expected.series,expected.dataSequence);
        }else {
          // Separate valid control proves the requested update itself is legal.
          const control=new UiSession(()=>{});try {control.render('golden',fixture.source);control.updateChart('golden',1,'root',fixture.series);}finally{control.close();}
          rejectsStatus(()=>session.updateChart('golden',input.submittedRevision,'root',fixture.series),expected.status);
          assert.deepEqual(session.snapshot(),before);mock.timers.tick(200);assert.equal(batches.length,expected.dataFrames);
        }
        observation={before,snapshot:session.snapshot(),batches};break;
      }
      case 'S09':case 'S10':{
        const workspace=join(ownedRoot,'workspace');await mkdir(workspace);
        await copyFile('tests/golden/fixtures/pixel.png',join(workspace,'pixel.png'));
        await copyFile('tests/golden/fixtures/pixel.png',join(ownedRoot,'outside.png'));
        if(id==='S09'){assert.equal(input.filename,'pixel.png');assert.equal(input.kind,'image');}
        const meta=await session.registerArtifact(id==='S09'?input.filename:'pixel.png',id==='S09'?input.kind:'image',workspace,{signal});
        try{server=await startServer(session);}catch(error){throw new GoldenFailure('setup',`HTTP server: ${String(error)}`);}
        const token=new URLSearchParams(new URL(server.openUrl).hash.slice(1)).get('token');
        const connected=await request(server.origin+'/api/connect',{method:'POST',headers:{origin:server.origin,'content-type':'application/json'},body:JSON.stringify({token})});
        assert.equal(connected.status,200,'real HTTP bootstrap');
        const cookie=connected.headers.get('set-cookie')!.split(';')[0];
        const get=()=>request(server!.origin+meta.src,{headers:{cookie}},true);
        const initial=await get();assert.equal(initial.status,200);assert.equal(initial.headers.get('content-type'),'image/png');assert.deepEqual(initial.body,fixtureBytes('tests/golden/fixtures/pixel.png'));
        if(id==='S09'){session.reset();const reset=await get();assert.equal(reset.status,expected.afterResetGet);observation={initial:initial.status,afterReset:reset.status,mime:meta.mime};}
        else {await assert.rejects(session.registerArtifact(input.filename,'image',workspace,{signal}),error=>error instanceof UiError&&error.status===expected.status);const retained=await get();assert.equal(retained.status,200);assert.deepEqual(retained.body,initial.body);observation={rejection:expected.status,retained:retained.status};}
        break;
      }
      case 'S11': {
        session.acceptAction(envelope(session,'accepted'));
        assert.equal(sent.length,expected.dispatches);assertForwarded(before,sent[0],expected.context);
        assert.equal(session.snapshot().surfaces[0].revision,expected.replacementRevision);
        observation={before,forwarded:sent[0],context:expected.context};break;
      }
      case 'S12':{
        const action=envelope(session,'stale');action.revision=input.submittedRevision;session.render('golden','root = Text("Replacement")');
        assert.equal(session.snapshot().surfaces[0].revision,expected.currentRevision);
        rejectsStatus(()=>session.acceptAction(action),expected.status);assert.equal(sent.length,expected.dispatches);observation={status:expected.status,dispatches:sent.length};break;
      }
      case 'S13': {
        const action=envelope(session,input.eventIds[0]);
        const first=session.acceptAction(action);
        const base={...structuredClone(action),eventId:input.eventIds[1]};
        const reverse=(value:unknown):unknown=>Array.isArray(value)?value.map(reverse):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).reverse().map(([key,item])=>[key,reverse(item)])):value;
        const retry=input.reorderKeys?reverse(base):base;
        if(input.reorderKeys)assert.notEqual(JSON.stringify(retry),JSON.stringify(base),'retry really changes object key order');
        const second=session.acceptAction(retry);assert.deepEqual([first.duplicate,second.duplicate],expected.duplicate);assert.equal(sent.length,expected.dispatches);observation={duplicates:[first.duplicate,second.duplicate],dispatches:sent.length};break;
      }
      case 'S14':
        session.acceptAction(envelope(session,input.eventIds[0],input.names[0]));rejectsStatus(()=>session.acceptAction(envelope(session,input.eventIds[1],input.names[1])),expected.status);assert.equal(sent.length,expected.dispatches);observation={status:expected.status,dispatches:sent.length};break;
      case 'S15':{
        const duplicates=input.eventIds.map((eventId:string)=>session.acceptAction(envelope(session,eventId)).duplicate);
        assert.deepEqual(duplicates,expected.duplicate);assert.equal(sent.length,expected.dispatches);assert.equal(sent[0],sent[1]);observation={duplicates,dispatches:sent.length,identicalForwardedMessages:sent[0]===sent[1]};break;
      }
      default:throw new Error('No fixed session executor');
    }
    result={kind:'session-ok',observation,actualInputHash};
  } catch(error) {result={kind:'session-error',stage:error instanceof GoldenFailure&&error.stage==='setup'?'setup':stage,detail:String(error),actualInputHash};}
  finally {
    if(clock)mock.timers.reset();
    for(const request of pending)request.abort();
    let timer:ReturnType<typeof setTimeout>|undefined;
    try {
      await Promise.race([
        (async()=>{try{if(server)await server.close();}finally{session.close();}})(),
        new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('Session cleanup deadline5s')),5000);}),
      ]);
    }
    catch(error){result={kind:'session-error',stage:'cleanup',detail:JSON.stringify({primary:result,cleanup:String(error)})};}
    finally{clearTimeout(timer);session.close();}
  }
  return result;
}
export async function evaluateSession(row:GoldenCase):Promise<CaseResult> {
  const source=fixtureBytes(row.fixture);
  const ownedRoot=await mkdtemp(join(tmpdir(),'pi-a2ui-golden-'));await chmod(ownedRoot,0o700);
  let result:CaseResult;
  try {
    const observed=await runOwnedWorker({kind:'session',caseId:row.id,ownedRoot,fixture:source.toString('utf8')});
    result=sessionResult(row,source,observed);
  }catch(error){result=caseResult(row,source,{pass:false,failedStage:'setup',detail:String(error)});}
  let timer:ReturnType<typeof setTimeout>|undefined;
  try{await Promise.race([rm(ownedRoot,{recursive:true,force:true}),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('Owned fixture cleanup deadline5s')),5000);})]);}
  catch(error){result=caseResult(row,source,{pass:false,failedStage:'cleanup',detail:JSON.stringify({primary:result,cleanup:String(error)})});}
  finally{clearTimeout(timer);}
  return result;
}
export function sessionResult(row:GoldenCase,source:Buffer,observed:WorkerObservation):CaseResult {
  if(observed.kind==='session-ok'){
    if(observed.actualInputHash!==sha256(source))return caseResult(row,source,{pass:false,failedStage:'setup',detail:JSON.stringify({error:'Missing/wrong child actual-input attestation',observed:observed.actualInputHash,expected:sha256(source)})});
    return {...caseResult(row,source,{pass:true,failedStage:null,observation:observed.observation}),actualInputHash:observed.actualInputHash};
  }
  return caseResult(row,source,{pass:false,failedStage:observed.kind==='session-error'?observed.stage:'setup',detail:JSON.stringify(observed)});
}
