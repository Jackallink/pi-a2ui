import {test} from 'node:test';
import assert from 'node:assert/strict';
import {compile,validateSurface} from '../src/compiler.ts';
import {UiSession} from '../src/session.ts';
const cases=[{id:'one',name:'One',status:'pass'},{id:'two',name:'Two',status:'fail',details:'<script>failure</script>'},{id:'three',name:'Three',status:'skip'},{id:'four',name:'Four',status:'error'}];
const summary={pass:1,fail:1,skip:1,error:1};
const code=(before='before\n',after='after\n',proposalId='p1')=>`CodeDiff(proposalId="${proposalId}",filename="src/example.ts",baseRevision="base-1",before=${JSON.stringify(before)},after=${JSON.stringify(after)})`;
const results=(rows=cases,counts=summary)=>`TestResults(resultId="r1",command="node --test",evidence="tool run-1; captured output",cases=${JSON.stringify(rows)},summary=${JSON.stringify(counts)})`;
const source=(diff=code(),report=results())=>`root = Column([${diff},${report},Button(Text("Discuss proposal"),action=Event("discuss",{proposalId:"p1",resultId:"r1"}))])`;
function event(s:UiSession){const snap=s.snapshot();return{epoch:snap.epoch,revision:snap.surfaces[0].revision,eventId:'coding',message:{version:'1.0',action:{surfaceId:'coding',sourceComponentId:'root_children_2',name:'discuss',timestamp:'2026-11-13T00:00:00Z',context:{proposalId:'p1',resultId:'r1'}}}};}
test('C01/C02 compile named readonly source and mixed structured results under versioned Pi catalog',()=>{const m=compile('coding',source());assert.match(m.createSurface.catalogId,/coding-v1/);assert.deepEqual(m.createSurface.components.find(c=>c.component==='TestResults')!.summary,summary);assert.equal(m.createSurface.components.find(c=>c.component==='CodeDiff')!.baseRevision,'base-1');});
test('C02 duplicate cases and inconsistent counts reject atomically',()=>{const s=new UiSession(()=>{});s.render('coding',source());const before=s.snapshot();for(const report of [results([cases[0],cases[0]],{pass:2,fail:0,skip:0,error:0}),results(cases,{...summary,pass:4})]){assert.throws(()=>s.render('coding',source(code(),report)));assert.deepEqual(s.snapshot(),before);}});
test('C03 current immutable IDs dispatch exactly; forged/stale/reused record content cannot dispatch or commit',()=>{let sent=0;const s=new UiSession(()=>sent++);s.render('coding',source());const valid=event(s);const forged=structuredClone(valid);forged.message.action.context.proposalId='forged';assert.throws(()=>s.acceptAction(forged));s.acceptAction(valid);assert.equal(sent,1);const before=s.snapshot();assert.throws(()=>s.render('coding',source(code('changed','after\n'))));assert.deepEqual(s.snapshot(),before);s.render('coding',source());assert.throws(()=>s.acceptAction({...valid,eventId:'stale'}));assert.equal(sent,1);});
test('C03 undeclared record IDs and duplicate coding widgets reject at render',()=>{assert.throws(()=>compile('coding',source().replace('proposalId:"p1",resultId','proposalId:"other",resultId')));assert.throws(()=>compile('coding',`root = Column([${code()},${code()}])`));});
test('C05 legacy Basic snapshots still restore but custom types under Basic or unknown catalogs reject',()=>{const s=new UiSession(()=>{});s.render('old','root = Text("Old")');const legacy=s.snapshot();legacy.surfaces[0].message.createSurface.catalogId='https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json';s.reset(legacy);assert.equal(s.snapshot().surfaces.length,1);const m=compile('coding',source());for(const id of ['https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json','https://invalid.example/catalog']){const bad=structuredClone(m);bad.createSurface.catalogId=id;assert.throws(()=>validateSurface(bad));}});
test('C01 source byte/line budgets and duplicate identities on restore reject atomically',()=>{const s=new UiSession(()=>{});s.render('coding',source());const old=s.snapshot();for(const diff of [code('x'.repeat(16385),''),code(Array.from({length:513},()=> 'x').join('\n'),'')])assert.throws(()=>s.render('coding',source(diff)));assert.deepEqual(s.snapshot(),old);const conflicting=structuredClone(old);const other=structuredClone(conflicting.surfaces[0]);other.surfaceId='other';other.message.createSurface.surfaceId='other';other.message.createSurface.components.find(c=>c.component==='CodeDiff')!.after='different';conflicting.surfaces.push(other);assert.throws(()=>s.reset(conflicting));assert.deepEqual(s.snapshot(),old);});

test('C01 diff reconstruction is exact for empty/new/deleted CRLF unicode repeated and unchanged lines',async()=>{
 const {diffLines}=await import('../src/coding.ts');
 for(const [before,after]of [['',''],['','new\n'],['deleted\n',''],['α\r\nβ\n','α\r\nγ\n'],['repeat\nx\nrepeat\n','repeat\ny\nrepeat\n'],['same\n','same\n'],['x\n','x']]){
  const lines=diffLines(before,after);
  assert.equal(lines.filter(l=>l.kind!=='add').map(l=>l.text).join('\n'),before);
  assert.equal(lines.filter(l=>l.kind!=='remove').map(l=>l.text).join('\n'),after);
 }
 assert.deepEqual(diffLines('a\nold\nz','a\nnew\nz').map(l=>[l.kind,l.text]),[['context','a'],['remove','old'],['add','new'],['context','z']]);
});
test('C04 schema-only and browser catalogs have exact names/properties/version parity',async()=>{
 const {catalogs}=await import('../src/catalog.ts');const {browserCatalogs}=await import('../src/browser-catalog.ts');
 for(const [index,catalog]of catalogs.entries()){
  assert.deepEqual(catalog.toJson(),browserCatalogs[index].toJson());
  for(const api of catalog.components.values()){assert.equal('element'in api,false);assert.equal('tagName'in api,false);assert.equal(typeof browserCatalogs[index].components.get(api.name)!.element,'function');}
 }
});
test('C03 bounded ledger rejects a 257th record without reserving partial failed IDs',()=>{
 const s=new UiSession(()=>{});
 for(let i=0;i<255;i++)s.render('coding','root = '+code('same','same','p'+i));
 const before=s.snapshot();assert.throws(()=>s.render('coding',source(code('same','same','p255')).replace('proposalId:"p1",resultId','proposalId:"p255",resultId')),/capacity/);assert.deepEqual(s.snapshot(),before);
 s.render('coding','root = '+code('different','same','p255'));
 assert.throws(()=>s.render('coding','root = '+code('same','same','p256')),/capacity/);
});
test('C03 snapshot byte rejection cannot reserve an immutable identity',()=>{
 const s=new UiSession(()=>{});s.render('base','root = Text("x")');const saved=s.snapshot();const base=saved.surfaces[0];
 saved.surfaces=Array.from({length:3},(_,i)=>{const row=structuredClone(base);row.surfaceId='s'+i;row.message.createSurface.surfaceId='s'+i;row.message.createSurface.components[0].text='x'.repeat(80000);return row;});s.reset(saved);const old=s.snapshot();
 assert.throws(()=>s.render('coding','root = '+code('x'.repeat(15000),'y'.repeat(15000),'byte-failed')),/byte limit/);assert.deepEqual(s.snapshot(),old);
 assert.doesNotThrow(()=>s.render('coding','root = '+code('new','data','byte-failed')));
});

test('C03 coding buttons cannot claim an absent result and source records cannot bind to editable data',()=>{assert.throws(()=>compile('coding',`root = Column([${code()},Button(Text("Choose"),action=Event("choose",{proposalId:"p1",resultId:"absent"}))])`));assert.throws(()=>compile('coding','$/editable = "source"\nroot = CodeDiff(proposalId="p",filename="f",baseRevision="b",before=$/editable,after="new")'));});
