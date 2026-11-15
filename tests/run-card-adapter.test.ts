import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SessionManager} from '@earendil-works/pi-coding-agent';
import install from '../extension.ts';
import {LiveTools} from '../src/live-tools.ts';
import {UiSession} from '../src/session.ts';
import {UiError,type Snapshot} from '../src/protocol.ts';

async function adapter({create=true,connect=true,failAppend=false,openCommand=false}={}){
 const tools=new Map<string,any>(),commands=new Map<string,any>(),handlers=new Map<string,any>();
 const manager=SessionManager.inMemory(process.cwd());let opened='',openCalls=0,messages=0,appendFailure=failAppend;
 const host={registerTool(t:any){tools.set(t.name,t);},registerCommand(n:string,c:any){commands.set(n,c);},on(n:string,h:any){handlers.set(n,h);},sendUserMessage(){messages++;},appendEntry(type:string,data:unknown){if(appendFailure)throw new Error('injected persistence failure');manager.appendCustomEntry(type,data);},getActiveTools:()=>['a2ui_render'],setActiveTools(){},exec:async(_p:string,args:string[])=>{opened=args.at(-1)!;openCalls++;return{code:0,stdout:'',stderr:''};}};
 install(host as any);const ctx={cwd:process.cwd(),sessionManager:manager,ui:{notify(){}}};await handlers.get('session_start')({},ctx);
 let latest:Snapshot|undefined,pump:Promise<void>|undefined;const abort=new AbortController();
 if(create){if(openCommand)await commands.get('a2ui').handler('',ctx);else await tools.get('a2ui_render').execute('model',{surfaceId:'model',source:'root = Text("Keep model")'},undefined,undefined,ctx);
  if(connect){const url=new URL(opened),origin=url.origin;const response=await fetch(origin+'/api/connect',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify({token:new URLSearchParams(url.hash.slice(1)).get('token')})});assert.equal(response.status,200);
   const stream=await fetch(origin+'/api/events',{headers:{origin,cookie:response.headers.get('set-cookie')!.split(';')[0]},signal:abort.signal});assert.equal(stream.status,200);
   const reader=stream.body!.getReader();let ready!:()=>void;const first=new Promise<void>(resolve=>ready=resolve);
   pump=(async()=>{let text='';const decoder=new TextDecoder();for(;;){const part=await reader.read();if(part.done)break;text+=decoder.decode(part.value,{stream:true});let end;while((end=text.indexOf('\n\n'))>=0){const frame=text.slice(0,end);text=text.slice(end+2);if(frame.startsWith('event: snapshot\n')){latest=JSON.parse(frame.split('\ndata: ')[1]);ready();}}}})().catch(()=>{});await first;
  }
 }
 const run=(stopReason='stop',aborted=false,toolName='bash')=>{handlers.get('agent_start')({});if(toolName){handlers.get('tool_execution_start')({toolCallId:'observed',toolName});handlers.get('tool_execution_end')({toolCallId:'observed',result:{content:[]},isError:false});}handlers.get('agent_end')({messages:[{role:'assistant',stopReason}]});assert.doesNotThrow(()=>handlers.get('agent_settled')({aborted}));};
 const entries=()=>manager.getBranch().filter(e=>e.type==='custom'&&e.customType==='pi-a2ui.run-summary.v1');
 const settle=async()=>{for(let i=0;i<100;i++){await new Promise(resolve=>setTimeout(resolve,2));if(latest?.surfaces.some(s=>s.surfaceId==='run-summary'))return latest;}return latest;};
 return{tools,commands,handlers,manager,ctx,run,entries,settle,get latest(){return latest;},get openCalls(){return openCalls;},get messages(){return messages;},allowAppend(){appendFailure=false;},async close(){abort.abort();await pump;await handlers.get('session_shutdown')({});}};
}

test('RSC user-opened empty canvas receives a summary without any model render tool call',async()=>{
 const h=await adapter({openCommand:true});try{
  assert.equal(h.latest!.surfaces.length,0,'actual /a2ui creates a connected empty canvas');
  h.run();assert.equal(h.entries().length,1);const saved=(h.entries()[0] as any).data.a2uiSnapshot;
  assert.equal(saved.surfaces.length,1);assert.equal(saved.surfaces[0].surfaceId,'run-summary');assert.equal(saved.surfaces[0].message.createSurface.components.length,6);
  assert.equal(saved.surfaces[0].message.createSurface.components.find((c:any)=>c.component==='TaskProgress').started,1);
  assert.equal(h.openCalls,1,'automatic summary did not open a second browser');assert.equal(h.messages,0);assert.equal(h.manager.buildSessionContext().messages.length,0);
 }finally{await h.close();}
});

test('RSC adapter never creates a listener or summary for no-server/no-browser/prose/A2UI-only/paused paths',async()=>{
 for(const setup of [{create:false,connect:false},{create:true,connect:false},{create:true,connect:true}]){
  const h=await adapter(setup);try{
   if(!setup.connect){h.run();assert.equal(h.entries().length,0);assert.equal(h.openCalls,setup.create?1:0);}
   else{
    h.run('stop',false,'');h.run('stop',false,'a2ui_render');assert.equal(h.entries().length,0);
    await h.commands.get('a2ui-toggle').handler('',h.ctx);h.run();assert.equal(h.entries().length,0);
   }
   if(!setup.create){const notices:string[]=[];await h.commands.get('a2ui-status').handler('',{...h.ctx,ui:{notify:(s:string)=>notices.push(s)}});assert.match(notices[0],/not listening/);}
   assert.equal(h.messages,0);
  }finally{await h.close();}
 }
});

test('RSC adapter append failure preserves the committed owned card and next run replaces it',async()=>{
 const h=await adapter({failAppend:true});try{
  h.run();await h.settle();assert.equal(h.entries().length,0);assert.equal(h.latest!.surfaces.find(s=>s.surfaceId==='run-summary')!.revision,1);
  h.allowAppend();h.run('error');assert.equal(h.entries().length,1);
  const saved=(h.entries()[0] as any).data;assert.equal(saved.a2uiRunSummaryRevision,2);assert.equal(saved.a2uiSnapshot.surfaces.find((s:any)=>s.surfaceId==='run-summary').message.createSurface.components.find((c:any)=>c.component==='StatusBadge').label,'Run failed');
  h.handlers.get('agent_settled')({aborted:true});assert.equal(h.entries().length,1);assert.equal(h.messages,0);assert.equal(h.openCalls,1);
 }finally{await h.close();}
});

test('RSC adapter flush failure never appends fabricated data or loses its already-created ownership',async t=>{
 const h=await adapter();try{
  t.mock.method(LiveTools.prototype,'flush',()=>{throw new Error('injected native publication failure');});h.run();await h.settle();assert.equal(h.entries().length,0);assert.equal(h.latest!.surfaces.find(s=>s.surfaceId==='run-summary')!.revision,1);
  t.mock.restoreAll();h.run();assert.equal((h.entries()[0] as any).data.a2uiRunSummaryRevision,2);assert.equal(h.messages,0);
 }finally{t.mock.restoreAll();await h.close();}
});

test('RSC adapter render failure preserves user surfaces and does not append a receipt',async t=>{
 const h=await adapter();try{
  const real=UiSession.prototype.render;
  t.mock.method(UiSession.prototype,'render',function(this:UiSession,id:string,source:string,options?:any){if(id==='run-summary')throw new UiError(413,'injected actual render boundary failure');return real.call(this,id,source,options);});
  const before=structuredClone(h.latest);h.run();assert.equal(h.entries().length,0);assert.deepEqual(h.latest,before);assert.equal(h.messages,0);
  t.mock.restoreAll();h.run();assert.equal((h.entries()[0] as any).data.a2uiRunSummaryRevision,1);
 }finally{t.mock.restoreAll();await h.close();}
});

test('RSC adapter full slots and component overflow leave all model faces unchanged',async()=>{
 for(const mode of ['slots','components']){
  const h=await adapter();try{
   let last:any;
   if(mode==='slots'){for(let i=1;i<4;i++)last=await h.tools.get('a2ui_render').execute('fill',{surfaceId:'model'+i,source:'root = Text("Keep")'},undefined,undefined,h.ctx);}
   else last=await h.tools.get('a2ui_render').execute('fill',{surfaceId:'model',source:'root = Column(['+Array.from({length:58},()=> 'Text("Keep")').join(',')+'])'},undefined,undefined,h.ctx);
   for(let i=0;i<100&&JSON.stringify(h.latest)!==JSON.stringify(last.details.a2uiSnapshot);i++)await new Promise(resolve=>setTimeout(resolve,2));
   assert.deepEqual(h.latest,last.details.a2uiSnapshot,'real served snapshot precondition');
   const before=structuredClone(h.latest);h.run();await new Promise(resolve=>setTimeout(resolve,10));assert.equal(h.entries().length,0);assert.deepEqual(h.latest,before);assert.equal(h.messages,0);
  }finally{await h.close();}
 }
});
