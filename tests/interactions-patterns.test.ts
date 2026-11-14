import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {compile} from '../src/compiler.ts';
const helper=resolve('skills/pi-a2ui/scripts/a2ui.mjs');
export function example(name:string){const result=spawnSync(process.execPath,[helper,'example',name],{encoding:'utf8',timeout:10000});assert.equal(result.status,0,result.stderr);return compile('pattern',result.stdout);}
test('R01 helper supplies a bounded navigable hierarchy and immutable leaf/breadcrumb intents',()=>{
 const surface=example('tree-navigation').createSurface;
 assert.ok(surface.components.some(c=>c.component==='Details'));
 const intents=surface.components.filter(c=>c.component==='Button').map(c=>(c.action as any).event);
 assert.ok(intents.some(e=>e.name==='select_node'&&e.context.nodeId==='compiler'));
 assert.ok(intents.some(e=>e.name==='navigate'&&e.context.nodeId==='workspace'));
 assert.ok(surface.components.length<=64);
});

test('R01 hierarchy overflow rejects atomically under existing tree and total-component budgets',async()=>{
 const {UiSession}=await import('../src/session.ts');const session=new UiSession(()=>{});
 session.render('keep','root = Text(text="Keep")');const before=session.snapshot();
 const deep='root = '+Array.from({length:17},()=> 'Details(title="node",child=').join('')+'Text(text="leaf")'+')'.repeat(17);
 assert.throws(()=>session.render('keep',deep),/depth|nesting/i);
 const wide='root = Column(children=['+Array.from({length:65},(_,i)=>`Text(text="${i}")`).join(',')+'])';
 assert.throws(()=>session.render('keep',wide),/Component limit/);
 assert.deepEqual(session.snapshot(),before);session.close();
});

test('R03 summary pattern exposes source, metric units and reported provenance without phantom types',()=>{
 const components=example('summary-metrics').createSurface.components;
 assert.ok(components.some(c=>c.component==='Text'&&c.text==='Build duration: 12 s'));
 assert.ok(components.some(c=>c.component==='Text'&&c.text==='Source: example build output — replace with actual evidence'));
 assert.ok(components.some(c=>c.component==='StatusBadge'&&c.provenance==='reported'));
 assert.ok(components.every(c=>['Card','Row','Column','Text','StatusBadge'].includes(c.component)));
});

test('R05 feedback pattern distinguishes actual-known states from labelled placeholders',()=>{
 const components=example('feedback-states').createSurface.components;
 for(const text of ['Loading — placeholder only','No results','Not run','Reported error'])assert.ok(components.some(c=>c.component==='Text'&&c.text===text));
 assert.ok(components.some(c=>c.component==='Button'&&(c.action as any).event.name==='request_retry'));
 assert.ok(components.every(c=>['Column','Card','Text','Icon','StatusBadge','Button'].includes(c.component)));
});

test('R07 source-location pattern sends only an immutable evidence intent to Pi',async()=>{
 const surface=example('evidence-location');const {UiSession}=await import('../src/session.ts');const sent:string[]=[];const s=new UiSession(t=>sent.push(t));s.reset({version:1,epoch:'old',enabled:true,surfaces:[{surfaceId:'pattern',revision:1,message:surface}]});
 const snapshot=s.snapshot();const button=surface.createSurface.components.find(c=>c.component==='Button')!;const event=(button.action as any).event;
 assert.deepEqual(event.context,{evidenceId:'compiler-entry',file:'src/compiler.ts',line:1});
 const envelope={epoch:snapshot.epoch,revision:1,eventId:'inspect',message:{version:'1.0',action:{surfaceId:'pattern',sourceComponentId:button.id,name:event.name,timestamp:'2026-11-14T00:00:00Z',context:{...event.context,line:2}}}};
 assert.throws(()=>s.acceptAction(envelope),{status:403});envelope.message.action.context={...event.context};s.acceptAction(envelope);assert.equal(sent.length,1);assert.ok(sent[0].includes('"event":"inspect_source"'));s.close();
});
