import {spawnSync} from 'node:child_process';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {LiveTools} from '../src/live-tools.ts';
import {UiSession} from '../src/session.ts';
import {compile,validateSurface} from '../src/compiler.ts';
const series=[{name:'A',points:[{label:'one',value:1}]}];
const source=`$/name = ""
chart = Chart(kind="line",series=${JSON.stringify(series)})
root = Column([TextField("Draft",$/name),LogView(stream="tools"),chart,Button(Text("Continue"),action=Event("continue",{name:$/name}))])`;
test('L01/L04 live catalog admits native log and finite aligned line/bar data',()=>{const m=compile('live',source);assert.match(m.createSurface.catalogId,/workbench-v1/);assert.equal(m.createSurface.components.find(c=>c.component==='Chart')!.id,'chart');assert.ok(compile('bar',source.replace('kind="line"','kind="bar"')));});
test('L04 malformed/nonfinite/unmatched/over-budget chart data reject atomically',()=>{const s=new UiSession(()=>{});s.render('live',source);const before=s.snapshot();for(const data of [[...series,...series],Array.from({length:5},(_,i)=>({...series[0],name:'n'+i})),[{name:'A',points:Array.from({length:201},()=>({label:'x',value:1}))}],[...series,{name:'B',points:[{label:'different',value:2}]}]])assert.throws(()=>s.render('live',source.replace(JSON.stringify(series),JSON.stringify(data))));const bad=structuredClone(before.surfaces[0].message);((bad.createSurface.components.find(c=>c.component==='Chart')!.series as any)[0].points[0]).value=Infinity;assert.throws(()=>validateSurface(bad));assert.deepEqual(s.snapshot(),before);});
test('L02 log text/line budgets preserve newest unicode content and visibly mark omission',()=>{const s=new UiSession(()=>{});s.render('live',source);(s as any).updateLog(Array.from({length:1200},(_,i)=>'🚀'+i).join('\n'),'running',false);const log=s.snapshot().surfaces[0].message.createSurface.components.find(c=>c.component==='LogView')!;assert.equal(log.omitted,true);assert.ok((log.text as string).split('\n').length<=1000);assert.ok(Buffer.byteLength(JSON.stringify(log.text))<=65536);assert.match(log.text as string,/🚀1199$/);assert.doesNotMatch(log.text as string,/^🚀0$/m);s.close();});
test('L03/L06 coalescing publishes latest bounded live data without changing structural authority',t=>{t.mock.timers.enable({apis:['setTimeout','Date'],now:1000});const sent:string[]=[];const s=new UiSession(x=>sent.push(x));s.render('live',source);const batches:any[]=[];(s as any).subscribeData((b:any)=>batches.push(b));for(let i=0;i<20;i++)(s as any).updateLog('line'+i,'running',false);t.mock.timers.tick(0);assert.equal(batches.length,1);for(let i=0;i<20;i++)(s as any).updateLog('new'+i,'running',false);t.mock.timers.tick(99);assert.equal(batches.length,1);t.mock.timers.tick(1);assert.equal(batches.length,2);assert.equal(batches[1].surfaces[0].sequence,2);assert.match(batches[1].surfaces[0].components.find((c:any)=>c.component==='LogView').text,/new19/);const snap=s.snapshot();assert.equal(snap.surfaces[0].revision,1);s.acceptAction({epoch:snap.epoch,revision:1,eventId:'live-action',message:{version:'1.0',action:{surfaceId:'live',sourceComponentId:'root_children_3',name:'continue',timestamp:'2026-11-13T00:00:00Z',context:{name:'Unsent draft'}}}});assert.equal(sent.length,1);s.close();});
test('L05 queued data cannot survive replacement/reset/disable-close or mutate new structure',t=>{t.mock.timers.enable({apis:['setTimeout','Date'],now:1000});const s=new UiSession(()=>{});s.render('live',source);const op=s.beginOperation();(s as any).updateLog('old','running',false);s.reset();s.render('live',source);t.mock.timers.tick(200);assert.doesNotMatch(JSON.stringify(s.snapshot()),/"text":"old"/);assert.throws(()=>(s as any).updateLog('late','running',false,op));const old=s.snapshot();assert.throws(()=>(s as any).updateChart('live',9,'chart',series));assert.deepEqual(s.snapshot(),old);s.setEnabled(false);assert.throws(()=>(s as any).updateChart('live',1,'chart',series));s.setEnabled(true);s.close();assert.throws(()=>(s as any).updateLog('closed','running',false));});
test('L04 chart data updates only current Chart series and persists bounded snapshot',()=>{const s=new UiSession(()=>{});s.render('live',source);const next=[{name:'A',points:[{label:'one',value:-2}]}];(s as any).updateChart('live',1,'chart',next);const now=s.snapshot();assert.equal(now.surfaces[0].revision,1);assert.deepEqual(now.surfaces[0].message.createSurface.components.find(c=>c.component==='Chart')!.series,next);assert.throws(()=>(s as any).updateChart('live',1,'root',next));s.reset(now);assert.deepEqual(s.snapshot().surfaces[0].message.createSurface.components.find(c=>c.component==='Chart')!.series,next);s.close();});

test('L05 saturated data sequence cannot partially change pause policy',()=>{const s=new UiSession(()=>{});s.render('live',source);const saved=s.snapshot();saved.surfaces[0].dataSequence=Number.MAX_SAFE_INTEGER;s.reset(saved);const before=s.snapshot();assert.throws(()=>s.setEnabled(false),/sequence/);assert.deepEqual(s.snapshot(),before);s.close();});

test('L01 cumulative snapshots append only new text; duplicate/stale and late updates cannot replay',t=>{
 t.mock.timers.enable({apis:['setTimeout','Date'],now:1000});const s=new UiSession(()=>{});s.render('live',source);const live=new LiveTools(s);live.beginRun();live.start('id','bash');
 for(const text of ['A','AB','A','AB'])live.update('id',{content:[{type:'text',text}]});
 live.end('id',{content:[{type:'text',text:'AB'}]},false);t.mock.timers.tick(100);
 const log=()=>s.snapshot().surfaces[0].message.createSurface.components.find(c=>c.component==='LogView')!;
 assert.equal(log().text,'[bash]\nAB');assert.equal(log().state,'completed');
 live.update('id',{content:[{type:'text',text:'LATE'}]});live.finishRun();live.update('unknown',{content:[{type:'text',text:'UNKNOWN'}]});t.mock.timers.tick(100);assert.doesNotMatch(String(log().text),/LATE|UNKNOWN/);live.close();s.close();
});
test('L01/L02 bounded cumulative windows do not duplicate large repeated snapshots and preserve split unicode',t=>{
 t.mock.timers.enable({apis:['setTimeout','Date'],now:1000});const s=new UiSession(()=>{});s.render('live',source);const live=new LiveTools(s);live.beginRun();live.start('unicode','bash');
 live.update('unicode',{content:[{type:'text',text:'\ud83d'}]});live.update('unicode',{content:[{type:'text',text:'🚀'}]});t.mock.timers.tick(0);
 assert.match(JSON.stringify(s.snapshot()),/🚀/);const huge='🚀'.repeat(20000)+'suffix';live.update('unicode',{content:[{type:'text',text:huge}]});t.mock.timers.tick(100);
 const get=()=>s.snapshot().surfaces[0].message.createSurface.components.find(c=>c.component==='LogView')!;
 const before=get().text;live.update('unicode',{content:[{type:'text',text:huge}]});t.mock.timers.tick(100);assert.equal(get().text,before);
 live.update('unicode',{content:[{type:'text',text:huge+'END'}]});t.mock.timers.tick(100);assert.match(String(get().text),/suffixEND$/);assert.ok(Buffer.byteLength(JSON.stringify(get().text))<=65536);assert.equal(get().omitted,true);live.close();s.close();
});
test('L01/L05 native run ownership bounds active tools and preserves error/interrupted states',t=>{
 t.mock.timers.enable({apis:['setTimeout','Date'],now:1000});const s=new UiSession(()=>{});s.render('live',source);const live=new LiveTools(s);
 live.start('not-authorized','bash');live.beginRun();for(let i=0;i<33;i++)live.start('id'+i,'tool'+i);live.update('id32',{content:[{type:'text',text:'UNADMITTED'}]});live.end('id0',{content:[]},true);live.start('new','bash');live.update('new',{content:[{type:'text',text:'ADMITTED'}]});live.finishRun('error');t.mock.timers.tick(100);
 let log=s.snapshot().surfaces[0].message.createSurface.components.find(c=>c.component==='LogView')!;assert.equal(log.state,'error');assert.match(String(log.text),/ADMITTED/);assert.doesNotMatch(String(log.text),/UNADMITTED|not-authorized/);assert.equal(log.omitted,true);
 live.finishRun('interrupted');t.mock.timers.tick(100);log=s.snapshot().surfaces[0].message.createSurface.components.find(c=>c.component==='LogView')!;assert.equal(log.state,'interrupted');live.close();live.update('new',{content:[{type:'text',text:'LATE'}]});t.mock.timers.tick(200);assert.doesNotMatch(JSON.stringify(s.snapshot()),/LATE/);s.close();
});
test('L02 shared serialized budget bounds controls/unicode across multiple views and reserve rejects oversized structure',()=>{
 const s=new UiSession(()=>{});for(let i=0;i<4;i++)s.render('s'+i,'root = LogView(stream="tools")');s.updateLog('\0'.repeat(20000)+'🚀END','running',false);
 for(const row of s.snapshot().surfaces){const c=row.message.createSurface.components[0];assert.ok(Buffer.byteLength(JSON.stringify(c.text))<=16384);assert.equal(c.omitted,true);assert.match(String(c.text),/🚀END$/);}
 assert.ok(Buffer.byteLength(JSON.stringify(s.snapshot()))<=262144);const before=s.snapshot();const bad=structuredClone(before);bad.surfaces[0].message.createSurface.dataModel={large:'x'.repeat(210000)};assert.throws(()=>s.reset(bad));assert.deepEqual(s.snapshot(),before);s.close();
});
test('L02/L04 chart updates preserve reserved log headroom and fail without poisoning queued state',t=>{
 t.mock.timers.enable({apis:['setTimeout','Date'],now:1000});const s=new UiSession(()=>{});s.render('live',source);const saved=s.snapshot();const m=saved.surfaces[0].message;m.createSurface.components.push({id:'large',component:'Text',text:'x'.repeat(180000)});(m.createSurface.components.find(c=>c.id==='root')!.children as string[]).push('large');s.reset(saved);const before=s.snapshot();
 const huge=Array.from({length:4},(_,i)=>({name:'series'+i,points:Array.from({length:200},(_,j)=>({label:String(j).padStart(40,'x'),value:j}))}));assert.throws(()=>s.updateChart('live',1,'chart',huge),/budget|byte/);assert.deepEqual(s.snapshot(),before);const batches:any[]=[];s.subscribeData(b=>batches.push(b));t.mock.timers.tick(200);assert.equal(batches.length,0);s.close();
});
test('L03 reconnect snapshot while batch is pending has latest state and coherent next sequence',t=>{
 t.mock.timers.enable({apis:['setTimeout','Date'],now:1000});const s=new UiSession(()=>{});s.render('live',source);const batches:any[]=[];s.subscribeData(b=>batches.push(b));s.updateLog('latest','running',false);const reconnect=s.snapshot();assert.equal(reconnect.surfaces[0].dataSequence,0);assert.match(JSON.stringify(reconnect),/latest/);t.mock.timers.tick(0);assert.equal(batches[0].surfaces[0].sequence,1);assert.equal(s.snapshot().surfaces[0].dataSequence,1);s.updateLog('never','running',false);s.close();t.mock.timers.tick(1000);assert.equal(batches.length,1);
});
test('L05 compile refuses fabricated live output and interactive logs nested in buttons',()=>{
 assert.throws(()=>compile('bad','root = LogView(text="fake",state="completed")'),/server-controlled/);assert.throws(()=>compile('bad','root = Button(Card(LogView(stream="tools")),action=Event("go"))'),/must not be nested/);
});

test('L02/L03 chart-only snapshots reserve publication counter headroom before admission',()=>{
 const s=new UiSession(()=>{});s.render('chart','root = Chart(kind="line",series=[])');const before=s.snapshot();const saved=structuredClone(before);saved.surfaces[0].dataSequence=9;saved.surfaces[0].message.createSurface.dataModel={padding:''};const bytes=Buffer.byteLength(JSON.stringify(saved));saved.surfaces[0].message.createSurface.dataModel.padding='x'.repeat(262144-bytes);assert.equal(Buffer.byteLength(JSON.stringify(saved)),262144);assert.throws(()=>s.reset(saved),/budget|headroom/);assert.deepEqual(s.snapshot(),before);s.close();
});
test('L02 restore rejects aggregate log text beyond global/per-view share atomically',()=>{
 const s=new UiSession(()=>{});s.render('s0','root = LogView(stream="tools")');const before=s.snapshot();const saved=structuredClone(before);const second=structuredClone(saved.surfaces[0]);second.surfaceId='s1';second.message.createSurface.surfaceId='s1';saved.surfaces.push(second);for(const row of saved.surfaces)row.message.createSurface.components[0].text='x'.repeat(40000);assert.throws(()=>s.reset(saved),/budget/);assert.deepEqual(s.snapshot(),before);s.close();
});

test('L01 a stale cumulative prefix after1500 lines cannot roll the newest output backwards',t=>{
 t.mock.timers.enable({apis:['setTimeout','Date'],now:1000});const s=new UiSession(()=>{});s.render('live',source);const live=new LiveTools(s);live.beginRun();live.start('rows','bash');const rows=Array.from({length:1500},(_,i)=>'row'+i);live.update('rows',{content:[{type:'text',text:rows.join('\n')}]});t.mock.timers.tick(0);live.update('rows',{content:[{type:'text',text:rows.slice(0,100).join('\n')}]});t.mock.timers.tick(100);const log=s.snapshot().surfaces[0].message.createSurface.components.find(c=>c.component==='LogView')!;assert.match(String(log.text),/row1499$/);assert.doesNotMatch(String(log.text),/snapshot replaced/);live.close();s.close();
});
test('L01 native truncation counters distinguish fresh rolling windows from old snapshots',t=>{
 t.mock.timers.enable({apis:['setTimeout','Date'],now:1000});const s=new UiSession(()=>{});s.render('live',source);const live=new LiveTools(s);live.beginRun();live.start('rolling','bash');const frame=(text:string,totalBytes:number)=>({content:[{type:'text',text}],details:{truncation:{truncated:true,totalBytes}}});
 live.update('rolling',frame('TAIL_A',100000));live.update('rolling',frame('TAIL_B',100010));t.mock.timers.tick(0);const get=()=>s.snapshot().surfaces[0].message.createSurface.components.find(c=>c.component==='LogView')!;const before=get().text;
 live.update('rolling',frame('TAIL_OLD',99990));live.update('rolling',frame('TAIL_B',100010));t.mock.timers.tick(100);assert.equal(get().text,before);assert.equal(get().omitted,true);assert.match(String(get().text),/TAIL_B$/);live.close();s.close();
});

test('L02 bounded windows release huge source backing strings after GC',()=>{
 const script=`import {LiveTools} from ${JSON.stringify(new URL('../src/live-tools.ts',import.meta.url).href)};const live=new LiveTools({beginOperation:()=>({epoch:'e',generation:0}),updateLog:()=>{}});live.beginRun();live.start('id','bash');global.gc();const base=process.memoryUsage().heapUsed;function probe(){const text='x'.repeat(32*1024*1024)+'END';live.update('id',{content:[{type:'text',text}]});}probe();global.gc();console.log(JSON.stringify({retained:process.memoryUsage().heapUsed-base}));live.close();`;
 const child=spawnSync(process.execPath,['--expose-gc','--import','tsx','--input-type=module','--eval',script],{encoding:'utf8',timeout:20000});assert.equal(child.status,0,child.stderr);const result=JSON.parse(child.stdout.trim());assert.ok(result.retained<4*1024*1024,'A bounded window retained '+result.retained+' source bytes');
});
