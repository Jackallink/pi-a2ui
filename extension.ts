import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { LiveTools } from "./src/live-tools.ts";
import { Type } from "typebox";
import { promptSnippet } from "./src/compiler.ts";
import { CanvasController, restoreBranch } from "./src/controller.ts";
import { UiSession } from "./src/session.ts";
import { LIMITS, UiError } from "./src/protocol.ts";

export default function a2ui(pi: ExtensionAPI) {
  const makeController = () => new CanvasController(new UiSession(text => {
    pi.sendUserMessage(text, {deliverAs:"followUp", expandPromptTemplates:false});
  }));
  let controller = makeController();
  let live=new LiveTools(controller.session);
  let endedRun:LiveTools|undefined;
  let autoOpenAttempted = false;
  let episodeSequence = 0;
  const openInBrowser = async (url:string) => {
    const program = process.platform === "darwin" ? "open" : process.platform === "win32" ? "rundll32" : "xdg-open";
    const args = process.platform === "win32" ? ["url.dll,FileProtocolHandler",url] : [url];
    const result = await pi.exec(program,args,{timeout:10_000});
    if (result.code !== 0) throw new Error("browser open failed");
  };
  const restore = (_event: unknown, ctx: ExtensionContext) => {
    episodeSequence++;
    live.close();endedRun=undefined;autoOpenAttempted=false;
    if (controller.session.closed) controller = makeController();
    restoreBranch(controller.session, ctx.sessionManager.getBranch());
    live=new LiveTools(controller.session);
  };
  pi.on("session_start", restore);
  pi.on("session_tree", restore);
  pi.on("session_shutdown", async () => {live.close();endedRun=undefined;await controller.close();});
  pi.on("agent_start",()=>{endedRun=undefined;live.beginRun();});
  pi.on("tool_execution_start",event=>live.start(event.toolCallId,event.toolName));
  pi.on("tool_execution_update",event=>live.update(event.toolCallId,event.partialResult));
  pi.on("tool_execution_end",event=>live.end(event.toolCallId,event.result,event.isError));
  pi.on("agent_end",event=>{
    const last=[...event.messages].reverse().find(message=>message.role==='assistant') as {stopReason?:string}|undefined;
    endedRun=live;live.finishRun(last?.stopReason==='error'?'error':last?.stopReason==='aborted'?'interrupted':undefined);
  });
  pi.on("agent_settled",event=>{if(event.aborted)endedRun?.finishRun('interrupted');endedRun=undefined;});

  pi.registerTool({
    name:"a2ui_render",
    label:"A2UI canvas",
    description: "Display an interactive local form or card for the user alongside this Pi conversation. Returns immediately after publishing; never wait for a button. A later browser action arrives as a user message. Use only when an interactive UI helps. "
      + promptSnippet()
      + "\nTOOL CONTRACT: source is raw complete Express DSL WITHOUT <a2ui> tags or markdown fences. Exactly one surface matching surfaceId, root required. Only the components/signatures declared above. No functions, checks, templates, HTML, markdown or RPC. Initialize every input value binding with its declared type. Event context may contain literal JSON or direct input value bindings. DateTimeInput requires explicit enableDate/enableTime flags and static matching local bounds. A full render replaces that surface; preserve other surfaces by using different IDs. Example: $/form/name = \"\"\nroot = Card(Column([Text(\"Your plan\"), TextField(\"Name\", $/form/name), Button(Text(\"Submit\"), action=Event(\"submit\", {name: $/form/name}))]))",
    promptSnippet:"Render interactive forms/cards with a2ui_render when user input benefits from a browser canvas.",
    parameters: Type.Object({
      surfaceId:Type.String({pattern:"^[A-Za-z0-9_-]{1,64}$",description:"Stable name of the surface to create or fully replace."}),
      source:Type.String({minLength:1,maxLength:LIMITS.sourceBytes,description:"Complete raw A2UI Express DSL, no wrapper tags. Match the signatures in the tool description."}),
    },{additionalProperties:false}),
    async execute(_toolCallId, params, signal, _onUpdate, ctx) {
      if (!controller.session.enabled) throw new UiError(503,"A2UI is disabled; use /a2ui-toggle to enable");
      const snapshot = await controller.render(params.surfaceId, params.source, signal);
      const surface = snapshot.surfaces.find(item => item.surfaceId === params.surfaceId)!;
      const server = controller.server;
      let note = "";
      if (server && !autoOpenAttempted && server.clients === 0) {
        autoOpenAttempted = true;
        const episode = controller;
        const episodeId = episodeSequence;
        note = " Attempted to open the canvas automatically; if nothing opened, run /a2ui.";
        void openInBrowser(server.openUrl).catch(() => {
          if (episodeId !== episodeSequence || episode.session.closed) return; // episode ended via reload/branch switch or shutdown; stale ctx is unsafe
          try { ctx?.ui?.notify("Could not open a browser automatically. Run /a2ui to open the canvas.","info"); } catch { /* stale context invalidated by reload; notify is best-effort */ }
        });
      }
      return {
        content:[{type:"text",text:`Rendered ${params.surfaceId} (revision ${surface.revision}).${note||" Use /a2ui to open the local canvas."} Continue your response; form actions arrive as later user messages.`}],
        details:{a2uiSnapshot:snapshot},
      };
    },
  });
  pi.registerTool({
    name:"a2ui_update_chart",label:"Update A2UI chart",
    description:"Update only series of an existing Chart without replacing layout or unsent inputs. Use the current structural revision from a2ui_render and the component ID (name the Chart variable in Express). Same aligned finite series contract as Chart. Does not run a command.",
    parameters:Type.Object({surfaceId:Type.String({pattern:"^[A-Za-z0-9_-]{1,64}$"}),revision:Type.Integer({minimum:1,maximum:Number.MAX_SAFE_INTEGER}),componentId:Type.String({minLength:1,maxLength:512}),series:Type.Array(Type.Object({name:Type.String({minLength:1,maxLength:128}),points:Type.Array(Type.Object({label:Type.String({maxLength:128}),value:Type.Number()},{additionalProperties:false}),{maxItems:200})},{additionalProperties:false}),{maxItems:4})},{additionalProperties:false}),
    async execute(_id,params,signal){if(!controller.session.enabled)throw new UiError(503,"A2UI is disabled");if(signal?.aborted)throw new UiError(409,"Chart update cancelled");const active=controller,operation=active.session.beginOperation();await active.ensureServer();const snapshot=active.session.updateChart(params.surfaceId,params.revision,params.componentId,params.series,{operation,signal});return {content:[{type:"text",text:"Chart data updated; structural revision and user drafts retained."}],details:{a2uiSnapshot:snapshot}};},
  });
  pi.registerCommand("a2ui", {
    description:"Open this session's local A2UI canvas",
    handler:async (_args,ctx) => {
      const server = await controller.ensureServer();
      try {
        await openInBrowser(server.openUrl);
        ctx.ui.notify(`A2UI canvas opened at ${server.origin}`,"info");
      } catch { ctx.ui.notify("Could not open a local browser. Run /a2ui again in a desktop session.","error"); }
    },
  });
  pi.registerCommand("a2ui-status", {
    description:"Show A2UI status without exposing access credentials",
    handler:async (_args,ctx) => {
      const snapshot = controller.session.snapshot();
      ctx.ui.notify(`A2UI ${snapshot.enabled?"enabled":"paused"}; ${controller.server?"listening":"not listening"}; ${snapshot.surfaces.length} surface(s); ${controller.server?.clients??0} browser(s)`,"info");
    },
  });
  pi.registerCommand("a2ui-toggle", {
    description:"Pause or enable A2UI rendering and browser actions",
    handler:async (_args,ctx) => {
      const enabled = !controller.session.enabled;
      controller.session.setEnabled(enabled);
      live.close();endedRun=undefined;
      live=new LiveTools(controller.session);
      const active = pi.getActiveTools().filter(name => !["a2ui_render","a2ui_update_chart"].includes(name));
      pi.setActiveTools(enabled ? [...active,"a2ui_render","a2ui_update_chart"] : active);
      ctx.ui.notify(`A2UI ${enabled?"enabled":"paused"}`,"info");
    },
  });
}
