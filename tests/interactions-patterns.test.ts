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
