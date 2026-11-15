import {test} from 'node:test';
import assert from 'node:assert/strict';
import {compile} from '../src/compiler.ts';
import {UiSession} from '../src/session.ts';
import {LiveTools} from '../src/live-tools.ts';
import {UiError,LIMITS,type Snapshot} from '../src/protocol.ts';
import {RUN_CARD_SURFACE_ID,assertUnreservedSurfaceId,maybeRenderRunCard,runCardSource,shouldRenderRunCard} from '../src/run-card.ts';

function snapshotWith(surfaceIds:string[],enabled=true):Snapshot {
  return {version:1,epoch:'e',enabled,surfaces:surfaceIds.map(surfaceId=>({surfaceId,revision:1,message:compile(surfaceId,'root = Text("x")')}))};
}
const options=(over:Partial<{browserClients:number;toolCount:number}>={}):{browserClients:number;toolCount:number}=>({browserClients:1,toolCount:2,...over});

test('R1 run card gate requires enabled canvas browser and at least one tool',()=>{
  assert.equal(shouldRenderRunCard(snapshotWith([]),options()),true);
  assert.equal(shouldRenderRunCard(snapshotWith([],false),options()),false);
  assert.equal(shouldRenderRunCard(snapshotWith([]),options({browserClients:0})),false);
  assert.equal(shouldRenderRunCard(snapshotWith([]),options({toolCount:0})),false);
});

test('R2 run card never evicts model surfaces but always replaces its own',()=>{
  const full=Array.from({length:LIMITS.surfaces},(_,index)=>`model-${index}`);
  assert.equal(shouldRenderRunCard(snapshotWith(full),options()),false);
  assert.equal(shouldRenderRunCard(snapshotWith([...full.slice(1),RUN_CARD_SURFACE_ID]),options()),true);
  assert.equal(shouldRenderRunCard(snapshotWith([RUN_CARD_SURFACE_ID]),options({toolCount:1})),true);
});

test('R3 preset card compiles for every outcome with native tool stream and outcome badge',()=>{
  for (const [outcome,status] of [['completed','success'],['error','error'],['interrupted','warning']] as const) {
    const message=compile(RUN_CARD_SURFACE_ID,runCardSource(outcome));
    assert.match(message.createSurface.catalogId,/interactions-v1/);
    const timeline=message.createSurface.components.find(component=>component.component==='ActivityTimeline');
    assert.equal(timeline!.stream,'tools');
    assert.deepEqual(timeline!.entries,[]);
    const badge=message.createSurface.components.find(component=>component.component==='StatusBadge');
    assert.equal(badge!.status,status);
    assert.equal(message.createSurface.components.filter(component=>component.component==='ActivityTimeline').length,1);
  }
  assert.match(runCardSource('error'),/label="Run failed"/);
  assert.match(runCardSource('interrupted'),/label="Run interrupted"/);
});

test('R4 run-summary surface id is reserved against model renders',()=>{
  assert.throws(()=>assertUnreservedSurfaceId(RUN_CARD_SURFACE_ID),/reserved/);
  assert.doesNotThrow(()=>assertUnreservedSurfaceId('model-1'));
});

test('R5 rendered run card receives live timeline data only after the post-render refresh',t=>{
  t.mock.timers.enable({apis:['setTimeout','Date'],now:1000});
  const s=new UiSession(()=>{});
  const live=new LiveTools(s);
  live.beginRun();live.start('one','bash');live.end('one',{content:[]},false);live.finishRun();
  t.mock.timers.tick(100); // drain the finishRun publish; no card surface exists yet
  s.render(RUN_CARD_SURFACE_ID,runCardSource('completed'));
  const before=s.snapshot().surfaces[0].message.createSurface.components.find(component=>component.component==='ActivityTimeline')!;
  assert.deepEqual(before.entries,[]);assert.equal(before.state,'idle'); // fresh surfaces have no retroactive data
  live.refresh();t.mock.timers.tick(100); // the post-render republish is what attaches the observed run
  const after=s.snapshot().surfaces[0].message.createSurface.components.find(component=>component.component==='ActivityTimeline')!;
  assert.equal(after.state,'completed');assert.equal((after.entries as {id:string;state:string}[]).length,1);
  assert.equal((after.entries as {state:string}[])[0].state,'completed');
  live.close();s.close();
});

test('R6 orchestrator republishes after render, skips stale episodes and swallows render failures',async()=>{
  const finished={runOutcome:'completed' as const,toolCount:2};
  const deps=(over:Partial<Parameters<typeof maybeRenderRunCard>[0]>={})=>({finished,aborted:false,snapshot:snapshotWith([]),browserClients:1,episodeId:1,currentEpisode:()=>current,render:async(surfaceId:string,source:string)=>{order.push(`render:${surfaceId}`);compile(surfaceId,source);},refresh:()=>{refreshes++;order.push('refresh');},...over} as Parameters<typeof maybeRenderRunCard>[0]);
  let current=1,refreshes=0;const order:string[]=[];
  maybeRenderRunCard(deps());await new Promise(resolve=>setTimeout(resolve,0));
  assert.deepEqual(order,['render:run-summary','refresh']);
  order.length=0;current=2; // episode advanced while the render was in flight
  maybeRenderRunCard(deps());await new Promise(resolve=>setTimeout(resolve,0));
  assert.deepEqual(order,['render:run-summary']);assert.equal(refreshes,1);
  order.length=0;
  maybeRenderRunCard(deps({render:async()=>{throw new UiError(503,'disabled');}}));await new Promise(resolve=>setTimeout(resolve,0));
  assert.deepEqual(order,[]);assert.equal(refreshes,1); // swallowed failure never triggers a republish
});
