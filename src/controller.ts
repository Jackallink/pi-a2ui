import { UiSession } from "./session.ts";
import { UiError, type Snapshot } from "./protocol.ts";
import { startServer, type CanvasServer } from "./server.ts";

export class CanvasController {
  private pending?: Promise<CanvasServer>;
  private stopping = false;
  private active?: CanvasServer;
  constructor(readonly session: UiSession, readonly start = startServer) {}
  get server() { return this.active; }
  ensureServer(): Promise<CanvasServer> {
    if (this.stopping) return Promise.reject(new UiError(503,"Canvas is closed"));
    if (!this.pending) {
      this.pending = this.start(this.session).then(async server => {
        if (this.stopping) { await server.close(); throw new UiError(503,"Canvas closed during startup"); }
        this.active = server;
        return server;
      }).catch(error => {this.pending = undefined; throw error;});
    }
    return this.pending;
  }
  async render(surfaceId: string, source: string, signal?: AbortSignal): Promise<Snapshot> {
    const operation = this.session.beginOperation();
    await this.ensureServer();
    return this.session.render(surfaceId, source, {operation,signal});
  }
  async close() {
    if (this.stopping) { await this.pending?.catch(() => {}); return; }
    this.stopping = true;
    this.session.close();
    const server = await this.pending?.catch(() => undefined);
    await server?.close();
    this.active = undefined;
  }
}

export function restoreBranch(session: UiSession, entries: readonly unknown[],root?:string) {
  // Only successful tool results on the current branch have restoration authority.
  for (let index = entries.length - 1; index >= 0; index--) {
    const entry = entries[index] as {type?: string; message?: {role?: string;toolName?: string;isError?: boolean;details?: {a2uiSnapshot?: unknown}}};
    if (!entry || entry.type !== "message" || entry.message?.role !== "toolResult"
      || !["a2ui_render","a2ui_update_chart"].includes(entry.message.toolName??"") || entry.message.isError !== false) continue;
    const saved = entry.message.details?.a2uiSnapshot;
    if (saved === undefined) continue;
    try { session.reset(saved,root); return; }
    catch { /* Incompatible history does not execute or replace the current canvas. */ }
  }
  session.reset(undefined,root);
}
