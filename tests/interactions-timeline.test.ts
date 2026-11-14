import {test} from 'node:test';
import assert from 'node:assert/strict';
import {compile,validateSurface} from '../src/compiler.ts';
import {UiSession} from '../src/session.ts';
import {LiveTools} from '../src/live-tools.ts';
const source='root = Column(children=[ActivityTimeline(stream="tools"),TaskProgress(stream="tools"),LogView(stream="tools")])';
function timeline(s:UiSession,id='live'){return s.snapshot().surfaces.find(surface=>surface.surfaceId===id)!.message.createSurface.components.find(c=>c.component==='ActivityTimeline')! as any;}
test('R06 authoring admits only an empty server-controlled timeline with bounded fixed shape',()=>{
 const message=compile('live',source);assert.equal(message.createSurface.components.find(c=>c.component==='ActivityTimeline')!.state,'idle');
 for(const props of ['state="completed"','omitted=true','entries=[{id:"tool-1",name:"read",state:"completed",startedAt:1,elapsedMs:1}]'])assert.throws(()=>compile('live',`root = ActivityTimeline(${props})`));
 assert.throws(()=>compile('live','root = Column([ActivityTimeline(),ActivityTimeline()])'));
 assert.throws(()=>compile('live','root = Button(child=Column([ActivityTimeline()]),action=Event("outer"))'));
 const invalid=structuredClone(message);const node=invalid.createSurface.components.find(c=>c.component==='ActivityTimeline')!;node.entries=[{id:'invalid/id',name:'read',state:'completed',startedAt:1,elapsedMs:1}];assert.throws(()=>validateSurface(invalid));
});
test('R06 actual tool events have observed order time outcomes and no duplicate or own-tool entries',t=>{
 t.mock.timers.enable({apis:['Date','setTimeout'],now:1000});const s=new UiSession(()=>{});s.render('live',source);const live=new LiveTools(s);live.beginRun();live.start('own','a2ui_render');live.start('one','read');t.mock.timers.tick(100);live.end('one',{content:[]},false);live.start('two','bash');t.mock.timers.tick(50);live.end('two',{content:[]},true);live.end('two',{content:[]},false);live.start('one','read');live.finishRun();t.mock.timers.tick(100);
 assert.deepEqual(timeline(s).entries,[{id:'tool-1',name:'read',state:'completed',startedAt:1000,elapsedMs:100},{id:'tool-2',name:'bash',state:'error',startedAt:1100,elapsedMs:50}]);assert.equal(timeline(s).state,'error');assert.equal(timeline(s).omitted,false);live.close();s.close();
});
test('R06 state is copied at native commit and cannot be mutated by the collector between ticks',t=>{
 t.mock.timers.enable({apis:['Date','setTimeout'],now:1000});const s=new UiSession(()=>{});s.render('live',source);const live=new LiveTools(s);live.beginRun();live.start('one','read');t.mock.timers.tick(0);assert.equal(timeline(s).entries[0]?.state,'running');live.end('one',{content:[]},false);assert.equal(timeline(s).entries[0]?.state,'running');t.mock.timers.tick(100);assert.equal(timeline(s).entries[0]?.state,'completed');live.close();s.close();
});
test('R06 timeline retains32 rows, marks omissions, bounds names and survives escaped Unicode across4 surfaces',t=>{
 t.mock.timers.enable({apis:['Date','setTimeout'],now:1000});const s=new UiSession(()=>{});for(let i=0;i<4;i++)s.render('s'+i,'root = Column([ActivityTimeline(),LogView()])');const saved=s.snapshot();saved.surfaces[0].message.createSurface.dataModel!.padding='x'.repeat(40000);s.reset(saved);const live=new LiveTools(s);live.beginRun();for(let i=0;i<40;i++){live.start('id'+i,'\0'.repeat(64));live.end('id'+i,{content:[]},false);}live.finishRun();t.mock.timers.tick(100);for(let i=0;i<4;i++){const widget=timeline(s,'s'+i);assert.equal(widget.entries.length,32);assert.equal(widget.entries[0].id,'tool-9');assert.equal(widget.entries.at(-1).id,'tool-40');assert.equal(widget.omitted,true);assert.ok(Buffer.byteLength(JSON.stringify(widget))<=32768);}assert.ok(Buffer.byteLength(JSON.stringify(s.snapshot()))<=262144);live.close();s.close();
});
test('R06 admission reserves timeline bytes before accepting an otherwise small four-surface layout',()=>{
 const s=new UiSession(()=>{});for(let i=0;i<4;i++)s.render('s'+i,'root = Column([ActivityTimeline(),LogView()])');const before=s.snapshot();const bad=structuredClone(before);bad.surfaces[0].message.createSurface.dataModel!.padding='x'.repeat(70000);assert.ok(Buffer.byteLength(JSON.stringify(bad))<262144);assert.throws(()=>s.reset(bad),/reserve|budget|headroom/);assert.deepEqual(s.snapshot(),before);s.close();
});
test('R06 admission also reserves192 JSON items per timeline within global4096, not only bytes',()=>{
 const s=new UiSession(()=>{});s.render('live','root = ActivityTimeline()');const before=s.snapshot();const bad=structuredClone(before);bad.surfaces[0].message.createSurface.dataModel!.padding=Array.from({length:16},()=>Array.from({length:245},()=>0));assert.ok(Buffer.byteLength(JSON.stringify(bad))<32768);assert.throws(()=>s.reset(bad),/entries|reserve/);assert.deepEqual(s.snapshot(),before);assert.equal(timeline(s).entries.length,0);s.close();
});
test('R06 only timeline envelope IDs are bounded512 to keep future complete rows within32KiB',()=>{
 const s=new UiSession(()=>{});s.render('live','root = Column([ActivityTimeline()])');const before=s.snapshot();const bad=structuredClone(before);const node=bad.surfaces[0].message.createSurface.components.find(c=>c.component==='ActivityTimeline')!;const old=node.id;node.id='x'.repeat(513);(bad.surfaces[0].message.createSurface.components.find(c=>c.id==='root')!.children as string[])[0]=node.id;assert.notEqual(old,node.id);assert.throws(()=>s.reset(bad),/512|ID|id/);assert.deepEqual(s.snapshot(),before);s.close();
});
test('R06 late render refresh reset pause and new run do not restart or accept stale native work',t=>{
 t.mock.timers.enable({apis:['Date','setTimeout'],now:1000});const s=new UiSession(()=>{});const live=new LiveTools(s);live.beginRun();live.start('one','read');t.mock.timers.tick(100);s.render('live',source);live.refresh();t.mock.timers.tick(100);assert.equal(timeline(s).entries[0]?.state,'running');s.reset(s.snapshot());assert.equal(timeline(s).state,'interrupted');assert.equal(timeline(s).entries[0]?.state,'interrupted');const before=s.snapshot();live.end('one',{content:[]},false);t.mock.timers.tick(100);assert.deepEqual(s.snapshot(),before);live.close();const fresh=new LiveTools(s);fresh.beginRun();fresh.start('new','read');t.mock.timers.tick(100);s.setEnabled(false);assert.equal(timeline(s).state,'paused');assert.equal(timeline(s).entries[0]?.state,'interrupted');s.setEnabled(true);assert.equal(timeline(s).state,'idle');assert.equal(timeline(s).entries.length,0);fresh.close();s.close();
});

test('R06 active and seen saturation omit explicitly and interrupted rows are truthful',t=>{
 t.mock.timers.enable({apis:['Date','setTimeout'],now:1000});const s=new UiSession(()=>{});s.render('live',source);const live=new LiveTools(s);live.beginRun();for(let i=0;i<33;i++)live.start('active'+i,'read');live.finishRun();t.mock.timers.tick(100);assert.equal(timeline(s).entries.length,32);assert.ok(timeline(s).entries.every((row:any)=>row.state==='interrupted'));assert.equal(timeline(s).omitted,true);
 live.beginRun();for(let i=0;i<1025;i++){live.start('seen'+i,'read');live.end('seen'+i,{content:[]},false);}live.finishRun();t.mock.timers.tick(100);assert.equal(timeline(s).entries.at(-1).id,'tool-1024');assert.equal(timeline(s).omitted,true);const progress=s.snapshot().surfaces[0].message.createSurface.components.find(c=>c.component==='TaskProgress')!;assert.equal(progress.started,1024);assert.equal(progress.omitted,true);live.close();s.close();
});
test('R06 backward wall-clock changes clamp observed elapsed without invented negative duration',t=>{
 t.mock.timers.enable({apis:['Date','setTimeout'],now:1000});const s=new UiSession(()=>{});s.render('live',source);const live=new LiveTools(s);live.beginRun();live.start('one','read');t.mock.timers.setTime(500);live.end('one',{content:[]},false);live.finishRun();t.mock.timers.tick(1000);assert.equal(timeline(s).entries[0].elapsedMs,0);assert.equal(timeline(s).entries[0].startedAt,1000);live.close();s.close();
});
