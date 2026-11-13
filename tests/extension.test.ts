import { test } from "node:test";
import assert from "node:assert/strict";
import { UiSession } from "../src/session.ts";
import { CanvasController, restoreBranch } from "../src/controller.ts";
import type { CanvasServer } from "../src/server.ts";
import install from "../extension.ts";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

function deferred<T>() { let resolve!: (value:T)=>void;const promise=new Promise<T>(r=>resolve=r);return {promise,resolve}; }
function fakeServer() { let closed=0;return {origin:"http://127.0.0.1:1",openUrl:"http://127.0.0.1:1/#token=private",clients:0,async close(){closed++;},get closed(){return closed;}}; }

test("a render waiting for startup cannot publish into another epoch", async () => {
  const gate=deferred<CanvasServer>();const state=new UiSession(()=>{});
  const controller=new CanvasController(state,()=>gate.promise);
  const pending=controller.render("old",'root = Text("Old session")');
  state.reset();gate.resolve(fakeServer());
  await assert.rejects(pending,/changed|stale|epoch|operation/i);
  assert.equal(state.snapshot().surfaces.length,0);
  await controller.close();
});

test("shutdown while startup is pending closes late server and cannot resurrect controller", async () => {
  const gate=deferred<CanvasServer>();const state=new UiSession(()=>{});const server=fakeServer();
  const controller=new CanvasController(state,()=>gate.promise);
  const pending=controller.render("old",'root = Text("Old session")');
  const closing=controller.close();gate.resolve(server);await closing;
  await assert.rejects(pending,/closed|shutdown|stale/i);
  assert.equal(server.closed,1);assert.equal(state.snapshot().surfaces.length,0);
});

test("concurrent startup shares a listener, failed startup is retryable", async () => {
  let attempts=0;const server=fakeServer();
  const controller=new CanvasController(new UiSession(()=>{}),async()=>{if(++attempts===1)throw new Error("bind failed");return server;});
  await assert.rejects(controller.ensureServer(),/bind failed/);
  const [a,b]=await Promise.all([controller.ensureServer(),controller.ensureServer()]);
  assert.equal(a,b);assert.equal(attempts,2);await controller.close();assert.equal(server.closed,1);
});

test("restore scans successful current-branch tool snapshots and ignores malformed history", () => {
  const state=new UiSession(()=>{});state.render("plan",'root = Text("Saved branch")');const saved=state.snapshot();
  state.render("plan",'root = Text("Other branch")');
  restoreBranch(state,[{type:"message",message:{role:"toolResult",toolName:"a2ui_render",details:{a2uiSnapshot:saved},isError:false}},{type:"message",message:{role:"toolResult",toolName:"a2ui_render",details:{a2uiSnapshot:{invalid:true}},isError:false}},{type:"message",message:{role:"toolResult",toolName:"a2ui_render",details:{a2uiSnapshot:state.snapshot()},isError:true}}]);
  assert.match(JSON.stringify(state.snapshot()),/Saved branch/);assert.doesNotMatch(JSON.stringify(state.snapshot()),/Other branch/);
  assert.notEqual(state.snapshot().epoch,saved.epoch);
  restoreBranch(state,[]);assert.equal(state.snapshot().surfaces.length,0);
});

test("Pi adapter exposes render and commands, saves bounded history and releases service", async () => {
  const tools=new Map<string,any>();const commands=new Map<string,any>();const handlers=new Map<string,any>();const sent:unknown[]=[];
  const host={registerTool(tool:any){tools.set(tool.name,tool);},registerCommand(name:string,command:any){commands.set(name,command);},on(name:string,handler:any){handlers.set(name,handler);},sendUserMessage(...args:unknown[]){sent.push(args);},exec:async()=>({code:0,stdout:"",stderr:""}),getActiveTools:()=>["read","a2ui_render"],setActiveTools:()=>{}} as unknown as ExtensionAPI;
  install(host);
  assert.ok(tools.has("a2ui_render"));assert.ok(commands.has("a2ui"));assert.ok(commands.has("a2ui-status"));assert.ok(commands.has("a2ui-toggle"));
  const context={sessionManager:{getBranch:()=>[]},ui:{notify:()=>{}}};
  await handlers.get("session_start")({reason:"startup"},context);
  try{
    const result=await tools.get("a2ui_render").execute("tool-1",{surfaceId:"plan",source:'root = Text("Adapter ready")'},undefined,undefined,context);
    assert.match(JSON.stringify(result.details),/Adapter ready/);assert.doesNotMatch(JSON.stringify(result),/token=|pi_a2ui_/);
    const messages:unknown[]=[];await commands.get("a2ui-status").handler("",{...context,ui:{notify:(value:unknown)=>messages.push(value)}});
    assert.match(JSON.stringify(messages),/listening/i);
    await commands.get("a2ui-toggle").handler("",context);
    await assert.rejects(tools.get("a2ui_render").execute("tool-2",{surfaceId:"plan",source:'root = Text("Disabled")'},undefined,undefined,context),/disabled|paused/i);
    assert.equal(sent.length,0);
  }finally{await handlers.get("session_shutdown")({reason:"quit"},context);}
});
