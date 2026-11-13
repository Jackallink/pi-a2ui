import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compile, validateSurface, promptSnippet } from '../src/compiler.ts';
import { restrictedCatalog } from '../src/catalog.ts';
import { UiSession } from '../src/session.ts';
import { LIMITS, UiError, type Snapshot } from '../src/protocol.ts';

const form = `$/form/name = ""
root = Card(Column([Text("Plan"), TextField("Name", $/form/name), Button(Text("Submit"), action=Event("submit", {name: $/form/name, kind: "plan"}))]))`;
function action(session: UiSession, eventId='event-1') {
  const snapshot = session.snapshot();
  return {epoch:snapshot.epoch, revision:snapshot.surfaces[0].revision, eventId, message:{version:'1.0',action:{name:'submit',surfaceId:'form',sourceComponentId:'root_child_children_2',timestamp:'2026-11-13T00:00:00Z',context:{name:'Ada',kind:'plan'}}}};
}
function rejectsStatus(fn:()=>unknown,status:number) { assert.throws(fn, (error:unknown)=>error instanceof UiError && error.status===status); }

test('restricted implementation catalog exposes only six components and no functions',()=>{
 assert.deepEqual([...restrictedCatalog.components.keys()].sort(),['Button','Card','Column','Row','Text','TextField']);
 assert.equal(restrictedCatalog.functions.size,0);
 assert.ok(restrictedCatalog.components.get('Text'));
 assert.match(promptSnippet(),/TextField/);
});
test('SDK compiles literal form with exact reachable event and binding',()=>{
 const message=compile('form',form);
 assert.equal(message.createSurface.surfaceId,'form');
 assert.equal(message.createSurface.components.length,6);
 assert.deepEqual(message.createSurface.components.find(c=>c.component==='Button')?.action,{event:{name:'submit',context:{name:{'@path':'/form/name'},kind:'plan'}}});
 assert.deepEqual(validateSurface(message),message);
});
test('invalid, empty, wrong-target, function, template, checks and overlimit renders are atomic',()=>{
 const session=new UiSession(()=>{}); session.render('form',form); const before=session.snapshot();
 for(const source of ['', 'root = Image("https://example.com/x")','root = Text(formatString("x"))','surface("other")\nroot = Text("x")','root = Column(_template($/items, Text("x")))','root = TextField("Name", checks=[?required])','root = Text("'+ 'x'.repeat(LIMITS.sourceBytes)+'")']) {
  assert.throws(()=>session.render('form',source),UiError); assert.deepEqual(session.snapshot(),before);
 }
 rejectsStatus(()=>session.render('../x','root = Text("x")'),400);
});
test('render replacement increments revision, immutable snapshots and listener failures are isolated',()=>{
 const session=new UiSession(()=>{}); let calls=0;
 session.subscribe(s=>{calls++;s.surfaces.length=0;throw Error('listener failed');});
 const first=session.render('form',form); first.surfaces.length=0;
 assert.equal(session.snapshot().surfaces.length,1);
 session.render('form','root = Text("Replacement")');
 assert.equal(session.snapshot().surfaces[0].revision,2); assert.equal(calls,2);
});
test('cancellation reset disable-reenable and close invalidate earlier operations',()=>{
 const session=new UiSession(()=>{});session.render('form',form);const before=session.snapshot();
 const controller=new AbortController();controller.abort();assert.throws(()=>session.render('form',form,{signal:controller.signal}),UiError);assert.deepEqual(session.snapshot(),before);
 let operation=session.beginOperation();session.reset();assert.notEqual(session.snapshot().epoch,before.epoch);rejectsStatus(()=>session.render('form',form,{operation}),409);
 operation=session.beginOperation();session.setEnabled(false);session.setEnabled(true);rejectsStatus(()=>session.render('form',form,{operation}),409);
 session.render('form',form);operation=session.beginOperation();session.close();rejectsStatus(()=>session.render('form',form,{operation}),503);assert.equal(session.closed,true);
});
test('restore validates complete snapshot atomically and clones persisted state without dispatch',()=>{
 let calls=0;const session=new UiSession(()=>calls++);session.render('form',form);const saved=session.snapshot();session.reset(saved);assert.notEqual(session.snapshot().epoch,saved.epoch);assert.equal(session.snapshot().surfaces[0].revision,1);saved.surfaces[0].message.createSurface.components.length=0;assert.equal(session.snapshot().surfaces[0].message.createSurface.components.length,6);
 const before=session.snapshot();for(const bad of [{}, {...before,version:2},{...before,surfaces:[{...before.surfaces[0],revision:0}]},{...before,surfaces:[...before.surfaces,...before.surfaces]}]){assert.throws(()=>session.reset(bad),UiError);assert.deepEqual(session.snapshot(),before);}assert.equal(calls,0);
});
test('valid browser context dispatches structured data once and duplicate does not dispatch',()=>{
 const sent:string[]=[];const session=new UiSession(text=>sent.push(text));session.render('form',form);const event=action(session);
 assert.deepEqual(session.acceptAction(event),{accepted:true,duplicate:false});assert.deepEqual(session.acceptAction(structuredClone(event)),{accepted:true,duplicate:true});assert.equal(sent.length,1);assert.match(sent[0],/browser.*context.*data/i);assert.match(sent[0],/"name":"Ada"/);
 event.message.action.context.name='changed';rejectsStatus(()=>session.acceptAction(event),409);assert.equal(sent.length,1);
});
test('forged envelopes context keys values types source and event reject without dispatch',()=>{
 let sent=0;const session=new UiSession(()=>sent++);session.render('form',form);
 const cases:Array<[number,(e:ReturnType<typeof action>)=>void]>=[
 [409,e=>{e.epoch='old'}],[409,e=>{e.revision=9}],[403,e=>{e.message.action.name='delete'}],[403,e=>{e.message.action.sourceComponentId='root'}],
 [403,e=>{e.message.action.context.kind='forged'}],[403,e=>{delete (e.message.action.context as any).name}],[403,e=>{(e.message.action.context as any).extra='x'}],[403,e=>{(e.message.action.context as any).name=42}],
 [400,e=>{(e as any).extra='x'}],[400,e=>{e.eventId=''}],[400,e=>{(e.message as any).callAgentFunction={}}],
 ];for(const [status,change]of cases){const e=action(session);change(e);rejectsStatus(()=>session.acceptAction(e),status);}assert.equal(sent,0);
 session.setEnabled(false);rejectsStatus(()=>session.acceptAction(action(session)),503);assert.equal(sent,0);
});
test('sync bridge failure returns unavailable without consuming event id',()=>{
 let fail=true;let sent=0;const session=new UiSession(()=>{if(fail)throw Error('unavailable');sent++;});session.render('form',form);const event=action(session);rejectsStatus(()=>session.acceptAction(event),503);fail=false;assert.equal(session.acceptAction(event).duplicate,false);assert.equal(sent,1);
});
test('event IDs never evict within an epoch and reset clears capacity',()=>{
 let sent=0;const session=new UiSession(()=>sent++);session.render('form',form);const first=action(session,'e0');for(let i=0;i<LIMITS.events;i++)session.acceptAction(action(session,'e'+i));assert.equal(sent,LIMITS.events);rejectsStatus(()=>session.acceptAction(action(session,'overflow')),429);assert.equal(session.acceptAction(first).duplicate,true);session.reset(session.snapshot());assert.equal(session.acceptAction(action(session,'fresh')).duplicate,false);
});
test('surface and total component budgets apply across render and restore',()=>{
 const session=new UiSession(()=>{});const tree='root = Column(['+Array.from({length:15},(_,i)=>`Text("${i}")`).join(',')+'])';for(let i=0;i<4;i++)session.render('s'+i,tree);const before=session.snapshot();rejectsStatus(()=>session.render('fifth','root = Text("x")'),413);rejectsStatus(()=>session.render('s0',tree.replace('])',', Text("extra")])')),413);assert.deepEqual(session.snapshot(),before);assert.throws(()=>session.reset({...before,surfaces:[...before.surfaces,{...before.surfaces[0],surfaceId:'fifth'}]}),UiError);
});
test('restored executable or unbound action data is forbidden',()=>{
 const message=compile('form',form);for(const mutate of [(m:any)=>{m.createSurface.components[0].checks=[]},(m:any)=>{m.createSurface.components[4].action.event.context.name={'@path':'/unknown'}},(m:any)=>{m.createSurface.components[2].text={'@call':'formatString',args:[]}},(m:any)=>{m.createSurface.components[1].children={componentId:'root',path:'/items'}}]){const bad=structuredClone(message);mutate(bad);assert.throws(()=>validateSurface(bad),UiError);}
});
test('restored legacy path aliases cannot bypass binding authority',()=>{
 const message=compile('form',form);const button=message.createSurface.components.find(c=>c.component==='Button')!;(button.action as any).event.context.name={path:'/undeclared'};assert.throws(()=>validateSurface(message),UiError);
});
test('restore preserves current enabled authorization instead of historical presentation policy',()=>{
 const session=new UiSession(()=>{});session.render('form',form);const saved=session.snapshot();session.setEnabled(false);session.reset(saved);assert.equal(session.enabled,false);rejectsStatus(()=>session.render('form',form),503);session.setEnabled(true);session.reset({...saved,enabled:false});assert.equal(session.enabled,true);
});
test('restored tree and JSON depth and byte limits reject atomically',()=>{
 const session=new UiSession(()=>{});session.render('form',form);const before=session.snapshot();
 const message=compile('depth','root = Text("leaf")');message.createSurface.components=Array.from({length:17},(_,i)=>i===16?{id:'c16',component:'Text',text:'leaf'}:{id:i===0?'root':'c'+i,component:'Card',child:'c'+(i+1)});assert.throws(()=>validateSurface(message),UiError);
 let nested:any={};for(let i=0;i<18;i++)nested={nested};const bad=structuredClone(before);bad.surfaces[0].message.createSurface.dataModel=nested;rejectsStatus(()=>session.reset(bad),413);bad.surfaces[0].message.createSurface.dataModel={text:'x'.repeat(LIMITS.snapshotBytes)};rejectsStatus(()=>session.reset(bad),413);assert.deepEqual(session.snapshot(),before);
});
test('repeated child references cannot amplify a bounded component list into an unbounded rendered tree',()=>{
 const message=compile('small','root = Column([Text("one"), Text("two")])');const root=message.createSurface.components[0];root.children=['root_children_0','root_children_1','root_children_0'];assert.throws(()=>validateSurface(message),UiError);
});
test('accepted event ID reuse with changed literal context reports conflict even when the new value is forged',()=>{
 const session=new UiSession(()=>{});session.render('form',form);const event=action(session);session.acceptAction(event);event.message.action.context.kind='forged';rejectsStatus(()=>session.acceptAction(event),409);
});
test('own collection cardinality guards reject restored data before SDK schema validation',()=>{
 const base=compile('form',form);
 const cases=[{many:Array.from({length:257},()=>0)},Object.fromEntries(Array.from({length:257},(_,i)=>['k'+i,0])),{many:Array.from({length:32},()=>Array.from({length:128},()=>0))}];
 for(const dataModel of cases){const message=structuredClone(base);message.createSurface.dataModel=dataModel;assert.throws(()=>validateSurface(message), (error:unknown)=>error instanceof UiError&&error.status===413&&/collection|entries/.test(error.message));}
});
test('source token and delimiter preflight guards run before SDK parsing while quoted delimiters remain literal',()=>{
 assert.throws(()=>compile('x','root = Column(['+Array.from({length:2100},()=> 'null').join(',')+'])'),(error:unknown)=>error instanceof UiError&&error.status===413&&/token/.test(error.message));
 assert.throws(()=>compile('x','root = '+ 'Card('.repeat(65)+'Text("x")'+')'.repeat(65)),(error:unknown)=>error instanceof UiError&&error.status===413&&/delimiter/.test(error.message));
 assert.equal(compile('x','root = Text("'+ '('.repeat(100)+'")').createSurface.components[0].text,'('.repeat(100));
});
test('browser action collection guard rejects oversized context before official schema parsing without dispatch',()=>{
 let sent=0;const session=new UiSession(()=>sent++);session.render('form',form);const event=action(session);(event.message.action.context as any).extra=Array.from({length:257},()=>0);assert.throws(()=>session.acceptAction(event),(error:unknown)=>error instanceof UiError&&error.status===413&&/collection/.test(error.message));assert.equal(sent,0);
});
test('tool prompt removes unsupported SDK template function deletion and sentinel instructions',()=>{
 const prompt=promptSnippet();assert.doesNotMatch(prompt,/MUST always surround|_template\(|deleteSurface\(|Logic and validation:|Nested functions:/);assert.match(prompt,/Text renders literal plain text/);
});
test('asynchronously rejected listeners are isolated from the successful commit',async()=>{
 const session=new UiSession(()=>{});session.subscribe(async()=>{throw Error('async observer failure');});assert.equal(session.render('form',form).surfaces.length,1);await new Promise(resolve=>setImmediate(resolve));assert.equal(session.snapshot().surfaces.length,1);
});
test('uninitialized field values reject compilation and preserve the previous committed surface',()=>{
 const session=new UiSession(()=>{});session.render('form',form);const before=session.snapshot();rejectsStatus(()=>session.render('form','root = TextField("Name", $/form/name)'),400);assert.deepEqual(session.snapshot(),before);
});
test('unsafe reserved pointer segments reject every DynamicString and context binding before commit',()=>{
 const base=compile('form',form);
 for(const property of ['text','label','value','placeholder']) {
  for(const path of ['/constructor','/form/prototype','/__proto__/name']) {
   const bad=structuredClone(base);const component=bad.createSurface.components.find(c=>c.component===(property==='text'?'Text':'TextField'))!;component[property]={'@path':path};assert.throws(()=>validateSurface(bad),UiError,property+' '+path);
  }
 }
});
test('scalar parent missing nonstring and noncanonical pointer bindings reject restored surfaces atomically',()=>{
 const session=new UiSession(()=>{});session.render('form',form);const before=session.snapshot();
 const cases:Array<[string,Record<string,unknown>]>=[['/a/b',{a:'primitive'}],['/form/name',{}],['/form/name',{form:{name:42}}],['/form/name',{form:{name:null}}],['/form//name',{form:{name:''}}],['/form/name/',{form:{name:''}}],['/form/na~2me',{form:{'na~2me':''}}]];
 for(const [path,dataModel]of cases){const bad=structuredClone(before);const message=bad.surfaces[0].message;message.createSurface.dataModel=dataModel;(message.createSurface.components.find(c=>c.component==='TextField')!).value={'@path':path};(message.createSurface.components.find(c=>c.component==='Button')!.action as any).event.context.name={'@path':path};rejectsStatus(()=>session.reset(bad),400);assert.deepEqual(session.snapshot(),before);}
});
test('bound Text text and TextField label placeholder require initialized string values',()=>{
 const base=compile('form',form);
 for(const property of ['text','label','placeholder'])for(const value of [undefined,10,false,{},[]]){const bad=structuredClone(base);bad.createSurface.dataModel={form:{name:''},...(value===undefined?{}:{display:value})};const component=bad.createSurface.components.find(c=>c.component===(property==='text'?'Text':'TextField'))!;component[property]={'@path':'/display'};assert.throws(()=>validateSurface(bad),UiError,property+' '+JSON.stringify(value));}
});
test('initialized untouched field empty string is accepted and safe escaped pointer arrays resolve through SDK',()=>{
 const session=new UiSession(()=>{});session.render('form',form);const event=action(session);event.message.action.context.name='';assert.deepEqual(session.acceptAction(event),{accepted:true,duplicate:false});
 const message=compile('form',form);message.createSurface.dataModel={'a/b':{'~name':['ready']}};const path='/a~1b/~0name/0';message.createSurface.components.find(c=>c.component==='TextField')!.value={'@path':path};(message.createSurface.components.find(c=>c.component==='Button')!.action as any).event.context.name={'@path':path};assert.deepEqual(validateSurface(message),message);
});
test('SDK comments cannot offset source delimiter depth before parsing',()=>{
 for(const comment of ['// '+')'.repeat(1000)+'\n','# '+')'.repeat(1000)+'\n','/* '+')'.repeat(1000)+' */\n']){assert.throws(()=>compile('x',comment+'root = '+'Card('.repeat(65)+'Text("x")'+')'.repeat(65)),(error:unknown)=>error instanceof UiError&&error.status===413&&error.message==='Source delimiter nesting limit exceeded');}
});
test('all supported SDK comments are ignored while quoted comment markers remain literal',()=>{
 for(const comment of ['// ((( ))) \n','# ((( ))) \n','/* ((( ))) */\n'])assert.equal(compile('x',comment+'root = Text("valid")').createSurface.components[0].text,'valid');
 for(const literal of ['"// # /* ) */"','r"// # /* ) */"','R"// # /* ) */"','"""// # /* ) */"""','r"""// # /* ) */"""','R"""// # /* ) */"""'])assert.equal(compile('x','root = Text('+literal+')').createSurface.components[0].text,'// # /* ) */');
});
test('unmatched source closing delimiters reject in preflight instead of reducing nesting credit',()=>{
 assert.throws(()=>compile('x',')\nroot = Text("x")'),(error:unknown)=>error instanceof UiError&&error.status===400&&error.message==='Unmatched source delimiter');
});
test('accessibility DynamicString bindings require initialized strings',()=>{
 for(const property of ['label','description'])for(const value of [undefined,42,false,{},[]]){const message=compile('a11y','root = Text("visible")');message.createSurface.dataModel=value===undefined?{}:{accessible:value};message.createSurface.components[0].accessibility={[property]:{'@path':'/accessible'}};assert.throws(()=>validateSurface(message),UiError,property+' '+JSON.stringify(value));}
});
test('initialized accessibility strings preserve legitimate bound hidden false',()=>{
 const message=compile('a11y','root = Text("visible")');message.createSurface.dataModel={label:'Accessible label',description:'Accessible description',hidden:false};message.createSurface.components[0].accessibility={label:{'@path':'/label'},description:{'@path':'/description'},hidden:{'@path':'/hidden'}};assert.deepEqual(validateSurface(message),message);
});
