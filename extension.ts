import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
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
  const restore = (_event: unknown, ctx: ExtensionContext) => {
    if (controller.session.closed) controller = makeController();
    restoreBranch(controller.session, ctx.sessionManager.getBranch());
  };
  pi.on("session_start", restore);
  pi.on("session_tree", restore);
  pi.on("session_shutdown", async () => { await controller.close(); });

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
    async execute(_toolCallId, params, signal) {
      if (!controller.session.enabled) throw new UiError(503,"A2UI is disabled; use /a2ui-toggle to enable");
      const snapshot = await controller.render(params.surfaceId, params.source, signal);
      const surface = snapshot.surfaces.find(item => item.surfaceId === params.surfaceId)!;
      return {
        content:[{type:"text",text:`Rendered ${params.surfaceId} (revision ${surface.revision}). Use /a2ui to open the local canvas. Continue your response; form actions arrive as later user messages.`}],
        details:{a2uiSnapshot:snapshot},
      };
    },
  });
  pi.registerCommand("a2ui", {
    description:"Open this session's local A2UI canvas",
    handler:async (_args,ctx) => {
      const server = await controller.ensureServer();
      const program = process.platform === "darwin" ? "open" : process.platform === "win32" ? "rundll32" : "xdg-open";
      const args = process.platform === "win32" ? ["url.dll,FileProtocolHandler",server.openUrl] : [server.openUrl];
      try {
        const result = await pi.exec(program,args,{timeout:10_000});
        if (result.code !== 0) throw new Error("browser open failed");
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
      const active = pi.getActiveTools().filter(name => name !== "a2ui_render");
      pi.setActiveTools(enabled ? [...active,"a2ui_render"] : active);
      ctx.ui.notify(`A2UI ${enabled?"enabled":"paused"}`,"info");
    },
  });
}
