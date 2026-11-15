import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {SessionManager} from '@earendil-works/pi-coding-agent';
import {compile} from '../src/compiler.ts';
import {UiSession} from '../src/session.ts';
import {LiveTools} from '../src/live-tools.ts';
import {restoreBranch} from '../src/controller.ts';
import {runCardSource,shouldRenderRunCard,ownedRunCardRevision,runCardMetadata,readRunCardEntry} from '../src/run-card.ts';

const options={browserClients:1,toolCount:1};
const card=(s:UiSession)=>s.snapshot().surfaces.find(surface=>surface.surfaceId==='run-summary')!;
const tool=(snapshot:unknown,marker?:unknown)=>({type:'message',message:{role:'toolResult',toolName:'a2ui_render',isError:false,details:{a2uiSnapshot:snapshot,a2uiRunSummaryRevision:marker}}});
const receipt=(s:UiSession)=>({type:'custom',customType:'pi-a2ui.run-summary.v1',data:{a2uiSnapshot:s.snapshot(),a2uiRunSummaryRevision:card(s).revision}});
function fill(s:UiSession,count:number){s.render('model',`root = Column([${Array.from({length:count-1},()=> 'Text("x")').join(',')}])`);assert.equal(s.snapshot().surfaces[0].message.createSurface.components.length,count);}

test('RSC gate preserves disabled, empty, no-browser and unowned collision states',()=>{
 const s=new UiSession(()=>{});assert.equal(shouldRenderRunCard(s.snapshot(),options),true);
 for(const browserClients of [0,-1,NaN])assert.equal(shouldRenderRunCard(s.snapshot(),{...options,browserClients}),false);
 assert.equal(shouldRenderRunCard(s.snapshot(),{...options,toolCount:0}),false);
 s.setEnabled(false);assert.equal(shouldRenderRunCard(s.snapshot(),options),false);s.setEnabled(true);
 s.render('run-summary','root = Text("User owned")');const before=s.snapshot();
 assert.equal(shouldRenderRunCard(before,options),false);assert.deepEqual(s.snapshot(),before);s.close();
});

test('RSC six-node budget accepts58+6 and rejects59+6 atomically',()=>{
 for(const [count,allowed]of [[58,true],[59,false]]as const){
  const s=new UiSession(()=>{});fill(s,count);const before=s.snapshot();
  assert.equal(shouldRenderRunCard(before,options),allowed);
  if(allowed){s.render('run-summary',runCardSource('completed'));assert.equal(s.snapshot().surfaces.flatMap(s=>s.message.createSurface.components).length,64);}
  else{assert.throws(()=>s.render('run-summary',runCardSource('completed')),error=>(error as {status:number}).status===413);assert.deepEqual(s.snapshot(),before);}
  s.close();
 }
});

test('RSC own replacement reclaims its six nodes while full unowned slots stay intact',()=>{
 const s=new UiSession(()=>{});fill(s,58);s.render('run-summary',runCardSource('completed'));const model=structuredClone(s.snapshot().surfaces[0]);
 assert.equal(shouldRenderRunCard(s.snapshot(),{...options,ownedRevision:1}),true);
 s.render('run-summary',runCardSource('error'));assert.deepEqual(s.snapshot().surfaces[0],model);assert.equal(card(s).revision,2);
 assert.equal(shouldRenderRunCard(s.snapshot(),{...options,ownedRevision:1}),false);s.close();
 const full=new UiSession(()=>{});for(let i=0;i<4;i++)full.render('model'+i,'root = Text("x")');const before=full.snapshot();assert.equal(shouldRenderRunCard(before,options),false);assert.deepEqual(full.snapshot(),before);full.close();
});

test('RSC existing native byte headroom remains authoritative despite available component slots',()=>{
 const s=new UiSession(()=>{});
 for(let i=0;i<3;i++)s.render('model'+i,`root = Column([Text(${JSON.stringify('x'.repeat(30000))}),ActivityTimeline(stream="tools")${i===0?',LogView(stream="tools")':''}])`);
 const before=s.snapshot();assert.equal(shouldRenderRunCard(before,options),true);
 assert.throws(()=>s.render('run-summary',runCardSource('completed')),error=>(error as {status:number}).status===413);
 assert.deepEqual(s.snapshot(),before);s.close();
});

test('RSC presets compile to six existing components and flush returns actual failed-tool observations',()=>{
 for(const [outcome,status,label]of [['completed','success','Run completed'],['error','error','Run failed'],['interrupted','warning','Run interrupted']]as const){
  const message=compile('run-summary',runCardSource(outcome));assert.equal(message.createSurface.components.length,6);
  const badge=message.createSurface.components.find(c=>c.component==='StatusBadge')!;assert.equal(badge.status,status);assert.equal(badge.label,label);
 }
 const s=new UiSession(()=>{}),live=new LiveTools(s);live.beginRun();live.start('one','bash');live.end('one',{content:[]},true);live.finishRun();s.render('run-summary',runCardSource('completed'));
 assert.equal(card(s).message.createSurface.components.find(c=>c.component==='TaskProgress')!.failed,0);
 const flushed=live.flush(),components=flushed.surfaces[0].message.createSurface.components;
 assert.deepEqual(Object.fromEntries(['started','settled','failed','state'].map(k=>[k,components.find(c=>c.component==='TaskProgress')![k]])),{started:1,settled:1,failed:1,state:'error'});
 const timeline=components.find(c=>c.component==='ActivityTimeline')!;assert.equal((timeline.entries as {name:string;state:string}[])[0].name,'bash');assert.equal((timeline.entries as {state:string}[])[0].state,'error');assert.equal(live.toolCount,1);assert.deepEqual(flushed,s.snapshot());live.close();s.close();
});

test('RSC latest valid tool/custom snapshot alone grants matching receipt ownership',()=>{
 const source=new UiSession(()=>{});source.render('run-summary',runCardSource('completed'));const first=receipt(source);source.render('other','root = Text("Newer")');const latest=source.snapshot();
 const restored=new UiSession(()=>{});assert.equal(restoreBranch(restored,[first,tool(latest,1)]),1);assert.equal(restored.snapshot().surfaces.length,2);assert.notEqual(restored.snapshot().epoch,latest.epoch);
 assert.equal(restoreBranch(restored,[first,tool(latest)]),undefined);assert.equal(shouldRenderRunCard(restored.snapshot(),options),false,'old tool history must not guess ownership');
 source.render('run-summary','root = Text("Model takeover")');assert.equal(restoreBranch(restored,[first,tool(source.snapshot())]),undefined);assert.match(JSON.stringify(restored.snapshot()),/Model takeover/);
 assert.equal(restoreBranch(restored,[first]),1);assert.equal(restored.snapshot().surfaces.length,1,'selected older branch has its own authority');source.close();restored.close();
});

test('RSC malformed custom metadata/snapshot cannot displace an older valid receipt',()=>{
 const source=new UiSession(()=>{});source.render('run-summary',runCardSource('completed'));const first=receipt(source),restored=new UiSession(()=>{});
 const bad=[{...first,customType:'unknown'}, {...first,data:{...first.data,extra:true}}, {...first,data:{...first.data,a2uiRunSummaryRevision:2}}, {...first,data:{...first.data,a2uiSnapshot:{...first.data.a2uiSnapshot,unexpected:true}}}, {...first,data:{a2uiSnapshot:first.data.a2uiSnapshot,a2uiRunSummaryRevision:'1'}}];
 for(const entry of bad){assert.equal(restoreBranch(restored,[first,entry]),1);assert.equal(restored.snapshot().surfaces.length,1);}
 assert.equal(readRunCardEntry({...first,data:{...first.data,extra:true}}),undefined);
 for(const marker of [undefined,0,-1,NaN,'1',2]){assert.equal(ownedRunCardRevision(source.snapshot(),marker),undefined);assert.deepEqual(runCardMetadata(source.snapshot(),marker),{});}
 assert.deepEqual(runCardMetadata(source.snapshot(),1),{a2uiRunSummaryRevision:1});source.close();restored.close();
});

test('RSC official Pi custom entry survives disk resume while staying outside model context',()=>{
 const dir=mkdtempSync(join(tmpdir(),'pi-a2ui-run-card-'));
 try{
  const source=new UiSession(()=>{});source.render('run-summary',runCardSource('completed'));
  const manager=SessionManager.create(dir,join(dir,'sessions'));manager.appendMessage({role:'user',content:'Fixture only; no provider',timestamp:1});
  manager.appendCustomEntry('pi-a2ui.run-summary.v1',receipt(source).data);
  const reopened=SessionManager.open(manager.getSessionFile()!);assert.equal(reopened.getBranch().filter(e=>e.type==='custom').length,1);
  assert.equal(reopened.buildSessionContext().messages.length,1);assert.doesNotMatch(JSON.stringify(reopened.buildSessionContext().messages),/Run summary|a2uiSnapshot/);
  const restored=new UiSession(()=>{});assert.equal(restoreBranch(restored,reopened.getBranch()),1);assert.equal(restored.snapshot().surfaces.length,1);source.close();restored.close();
 }finally{rmSync(dir,{recursive:true,force:true});}
});
