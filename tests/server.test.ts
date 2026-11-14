import { test } from "node:test";
import assert from "node:assert/strict";
import { request } from "node:http";
import { startServer, type SessionPort } from "../src/server.ts";
import { LIMITS, type Snapshot } from "../src/protocol.ts";

function session(): SessionPort & { delivered: unknown[]; publish(): void } {
  const snapshot: Snapshot = {version:1,epoch:"epoch-a",enabled:true,surfaces:[]};
  const listeners = new Set<(value: Snapshot) => void>();
  const delivered: unknown[] = [];
  return { snapshot: () => snapshot, subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }, acceptAction(input) { delivered.push(input); return {accepted:true,duplicate:false}; }, delivered, publish() { for (const fn of listeners) fn(snapshot); } };
}

async function connect(server: Awaited<ReturnType<typeof startServer>>) {
  const response = await fetch(`${server.origin}/api/connect`, {method:"POST",headers:{origin:server.origin,"content-type":"application/json"},body:JSON.stringify({token:new URLSearchParams(new URL(server.openUrl).hash.slice(1)).get("token")})});
  assert.equal(response.status, 200);
  return response.headers.get("set-cookie")!.split(";")[0];
}

test("valid bootstrap authenticates SSE and action without leaking token in public assets", async t => {
  const state = session(); const server = await startServer(state); t.after(() => server.close());
  const shell = await fetch(server.origin); assert.equal(shell.status,200);
  const html = await shell.text(); assert.match(html,/client\.js/); assert.doesNotMatch(html,/token=/);
  const cookie = await connect(server);
  const abort = new AbortController(); t.after(() => abort.abort());
  const stream = await fetch(`${server.origin}/api/events`, {headers:{cookie},signal:abort.signal});
  assert.equal(stream.status,200); assert.match(stream.headers.get("content-type")!,/text\/event-stream/);
  const first = new TextDecoder().decode((await stream.body!.getReader().read()).value);
  assert.match(first,/event: snapshot/); assert.match(first,/epoch-a/);
  const action = await fetch(`${server.origin}/api/actions`,{method:"POST",headers:{cookie,origin:server.origin,"content-type":"application/json"},body:'{"example":true}'});
  assert.equal(action.status,202); assert.equal(state.delivered.length,1);
  abort.abort();
});

test("unauthenticated, foreign-origin and oversized requests never dispatch", async t => {
  const state=session(); const server=await startServer(state);t.after(()=>server.close());
  assert.equal((await fetch(`${server.origin}/api/events`)).status,401);
  const cookie=await connect(server);
  for (const headers of [{"content-type":"application/json"},{cookie,origin:"https://foreign.invalid","content-type":"application/json"}] as Record<string,string>[]) {
    const response=await fetch(`${server.origin}/api/actions`,{method:"POST",headers,body:"{}"});
    assert.ok([401,403].includes(response.status));
  }
  const large=await fetch(`${server.origin}/api/actions`,{method:"POST",headers:{cookie,origin:server.origin,"content-type":"application/json"},body:JSON.stringify({value:"a".repeat(LIMITS.bodyBytes)})});
  assert.equal(large.status,413);assert.equal(state.delivered.length,0);
});

test("SSE rejects foreign Host/Origin, cross-instance credentials, and client capacity", async t => {
  const state=session();const a=await startServer(state);const b=await startServer(session());t.after(()=>a.close());t.after(()=>b.close());
  const cookie=await connect(a);
  assert.equal((await fetch(`${b.origin}/api/events`,{headers:{cookie}})).status,401);
  assert.equal((await fetch(`${a.origin}/api/events`,{headers:{cookie,origin:"https://foreign.invalid"}})).status,403);
  const foreignStatus=await new Promise<number>((resolve,reject)=>{
    const req=request(`${a.origin}/api/events`,{headers:{cookie,host:"evil.invalid"}},res=>{res.resume();resolve(res.statusCode!);});req.on("error",reject);req.end();
  });assert.equal(foreignStatus,403);
  const aborts: AbortController[]=[];const responses: Response[]=[];t.after(()=>aborts.forEach(a=>a.abort()));
  for(let i=0;i<LIMITS.clients;i++){
    const controller=new AbortController();aborts.push(controller);
    const res=await fetch(`${a.origin}/api/events`,{headers:{cookie},signal:controller.signal});responses.push(res);assert.equal(res.status,200);
  }
  globalThis.gc?.();await new Promise<void>(resolve=>setImmediate(resolve));
  assert.equal(a.clients,LIMITS.clients);
  assert.equal((await fetch(`${a.origin}/api/events`,{headers:{cookie}})).status,429);
  assert.equal(responses.length,LIMITS.clients);
  aborts.forEach(a=>a.abort());
});

test("shutdown ends connected streams and releases the listener", async t => {
  const server=await startServer(session());t.after(()=>server.close());const cookie=await connect(server);
  const stream=await fetch(`${server.origin}/api/events`,{headers:{cookie}});
  const reader=stream.body!.getReader();await reader.read();
  await server.close();assert.equal((await reader.read()).done,true);
  await assert.rejects(fetch(server.origin));
});

test("a maximum-size valid snapshot reaches an empty SSE connection with framing overhead", async t => {
  const state=session();
  const snapshot=state.snapshot();
  snapshot.surfaces=[{surfaceId:"large",revision:1,message:{version:"1.0",createSurface:{surfaceId:"large",catalogId:"https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json",components:[{id:"root",component:"Text",text:""}]}}}];
  snapshot.surfaces[0].message.createSurface.components[0].text="x".repeat(LIMITS.snapshotBytes-Buffer.byteLength(JSON.stringify(snapshot)));
  assert.equal(Buffer.byteLength(JSON.stringify(snapshot)),LIMITS.snapshotBytes);
  const server=await startServer(state);t.after(()=>server.close());const cookie=await connect(server);
  const abort=new AbortController();t.after(()=>abort.abort());
  const stream=await fetch(`${server.origin}/api/events`,{headers:{cookie},signal:abort.signal});
  assert.equal(stream.status,200);const reader=stream.body!.getReader();let frame="";
  while(!frame.endsWith("\n\n")){const chunk=await reader.read();assert.equal(chunk.done,false);frame+=new TextDecoder().decode(chunk.value);}
  assert.match(frame,/event: snapshot/);assert.equal(JSON.parse(frame.split("data: ")[1]).surfaces[0].surfaceId,"large");abort.abort();
});

test("a stalled SSE client is disconnected at the queue bound and a fresh client can recover", async t => {
  const state=session();const server=await startServer(state);t.after(()=>server.close());const cookie=await connect(server);
  const stalled=await new Promise<import("node:http").IncomingMessage>((resolve,reject)=>{
    const req=request(`${server.origin}/api/events`,{headers:{cookie}},res=>{res.once("data",()=>{res.pause();resolve(res);});res.on("error",()=>{});});req.on("error",reject);req.end();
  });t.after(()=>stalled.destroy());
  state.snapshot().surfaces=[{surfaceId:"large",revision:1,message:{version:"1.0",createSurface:{surfaceId:"large",catalogId:"https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json",components:[{id:"root",component:"Text",text:"x".repeat(200_000)}]}}}];
  for(let i=0;i<40;i++)state.publish();
  assert.equal(server.clients,0,"the stalled connection must be removed instead of retaining a growing queue");
  const abort=new AbortController();t.after(()=>abort.abort());
  const recovered=await fetch(`${server.origin}/api/events`,{headers:{cookie},signal:abort.signal});assert.equal(recovered.status,200);
  const first=await recovered.body!.getReader().read();assert.ok(first.value!.length>0);abort.abort();
});
