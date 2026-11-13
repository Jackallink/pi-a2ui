import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { readFile } from "node:fs/promises";
import type { Socket } from "node:net";
import { LIMITS, UiError, type Snapshot } from "./protocol.ts";

export interface SessionPort {
  snapshot(): Snapshot;
  subscribe(listener: (snapshot: Snapshot) => void): () => void;
  acceptAction(input: unknown): { accepted: true; duplicate: boolean };
}
export interface CanvasServer {
  readonly origin: string;
  readonly openUrl: string;
  readonly clients: number;
  close(): Promise<void>;
}

const CSP = "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";
// A maximum-size snapshot needs its fixed SSE envelope as well as its JSON bytes.
const SSE_FRAME_ALLOWANCE = 64;
function json(res: ServerResponse, status: number, value: unknown) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(value));
}
function equalSecret(actual: unknown, expected: string) {
  return typeof actual === "string" && Buffer.byteLength(actual) === Buffer.byteLength(expected)
    && timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}
function readJson(req: IncomingMessage): Promise<unknown> {
  if (req.headers["content-type"]?.split(";")[0].trim() !== "application/json") {
    throw new UiError(400, "Expected application/json");
  }
  if (Number(req.headers["content-length"]) > LIMITS.bodyBytes) {
    req.resume(); throw new UiError(413, "Request body is too large");
  }
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []; let bytes = 0; let failed = false;
    req.on("data", (chunk: Buffer) => {
      if (failed) return;
      bytes += chunk.length;
      if (bytes > LIMITS.bodyBytes) {
        failed = true; chunks.length = 0;
        reject(new UiError(413, "Request body is too large")); return;
      }
      chunks.push(chunk);
    });
    req.once("end", () => {
      if (failed) return;
      try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8"))); }
      catch { reject(new UiError(400, "Malformed JSON")); }
    });
    req.once("error", () => reject(new UiError(400, "Request interrupted")));
    req.once("aborted", () => reject(new UiError(400, "Request interrupted")));
  });
}

export async function startServer(session: SessionPort, options: {port?: number} = {}): Promise<CanvasServer> {
  const assets = new Map<string, {type: string; bytes: Buffer}>();
  for (const [path, file, type] of [["/", "index.html", "text/html"], ["/client.js", "client.js", "text/javascript"], ["/client.css", "client.css", "text/css"]]) {
    assets.set(path, {type, bytes: await readFile(new URL(`../dist/${file}`, import.meta.url))});
  }
  const bootstrap = randomBytes(32).toString("hex");
  const credential = randomBytes(32).toString("hex");
  const streams = new Set<ServerResponse>();
  const sockets = new Set<Socket>();
  let origin = ""; let host = ""; let cookieName = ""; let closing: Promise<void> | undefined;
  const server = createServer((req, res) => {
    res.setHeader("cache-control", "no-store");
    res.setHeader("content-security-policy", CSP);
    res.setHeader("x-content-type-options", "nosniff");
    res.setHeader("referrer-policy", "no-referrer");
    void handle(req, res).catch(error => {
      if (!res.headersSent) json(res, error instanceof UiError ? error.status : 500,
        {error: error instanceof UiError ? error.message : "Local canvas request failed"});
      else res.destroy();
    });
  });
  server.headersTimeout = 10_000;
  server.requestTimeout = 15_000;
  server.maxRequestsPerSocket = 100;
  server.on("connection", socket => { sockets.add(socket); socket.on("close", () => sockets.delete(socket)); });

  async function handle(req: IncomingMessage, res: ServerResponse) {
    if (req.headers.host !== host) throw new UiError(403, "Foreign Host rejected");
    const url = new URL(req.url ?? "/", origin);
    const path = url.pathname;
    if (req.method === "GET" && assets.has(path)) {
      const asset = assets.get(path)!;
      res.writeHead(200, {"content-type": `${asset.type}; charset=utf-8`}); res.end(asset.bytes); return;
    }
    if (path.startsWith("/api/")) {
      if ((req.method === "POST" && req.headers.origin !== origin)
        || (req.headers.origin !== undefined && req.headers.origin !== origin)) {
        throw new UiError(403, "Foreign Origin rejected");
      }
      if (req.method === "POST" && path === "/api/connect") {
        const value = await readJson(req);
        if (!value || typeof value !== "object" || !equalSecret((value as {token?: unknown}).token, bootstrap)) {
          throw new UiError(401, "Open /a2ui in Pi to connect this browser");
        }
        res.setHeader("set-cookie", `${cookieName}=${credential}; HttpOnly; SameSite=Strict; Path=/`);
        json(res, 200, {connected: true}); return;
      }
      const cookies = (req.headers.cookie ?? "").split(";").map(value => value.trim());
      const value = cookies.find(value => value.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
      if (!equalSecret(value, credential)) throw new UiError(401, "Open /a2ui in Pi to connect this browser");
      if (req.method === "GET" && path === "/api/events") {
        if (streams.size >= LIMITS.clients) throw new UiError(429, "Too many canvas connections");
        res.writeHead(200, {"content-type":"text/event-stream; charset=utf-8",connection:"keep-alive","x-accel-buffering":"no"});
        streams.add(res);
        res.on("close", () => streams.delete(res));
        sendSnapshot(res, session.snapshot()); return;
      }
      if (req.method === "POST" && path === "/api/actions") {
        const input = await readJson(req);
        json(res, 202, session.acceptAction(input)); return;
      }
    }
    throw new UiError(404, "Not found");
  }
  function sendSnapshot(res: ServerResponse, snapshot: Snapshot) {
    const frame = `event: snapshot\ndata: ${JSON.stringify(snapshot)}\n\n`;
    if (res.writableLength + Buffer.byteLength(frame) > LIMITS.queuedBytes + SSE_FRAME_ALLOWANCE) { streams.delete(res); res.destroy(); return; }
    res.write(frame);
  }
  const unsubscribe = session.subscribe(snapshot => {
    for (const res of streams) {
      try { sendSnapshot(res, snapshot); }
      catch { streams.delete(res); res.destroy(); }
    }
  });
  const heartbeat = setInterval(() => {
    for (const res of streams) {
      if (res.writableLength > LIMITS.queuedBytes) { streams.delete(res); res.destroy(); }
      else res.write(": heartbeat\n\n");
    }
  }, 15_000);
  heartbeat.unref();
  try {
    await new Promise<void>((resolve, reject) => {
      const failed = (error: Error) => reject(error);
      server.once("error", failed);
      server.listen(options.port ?? 0, "127.0.0.1", () => {server.off("error", failed); resolve();});
    });
  } catch (error) { clearInterval(heartbeat); unsubscribe(); server.close(); throw error; }
  const address = server.address() as {port: number};
  host = `127.0.0.1:${address.port}`; origin = `http://${host}`;
  cookieName = `pi_a2ui_${address.port}_${randomBytes(8).toString("hex")}`;
  return {
    origin, openUrl: `${origin}/#token=${bootstrap}`,
    get clients() { return streams.size; },
    close() {
      if (closing) return closing;
      clearInterval(heartbeat); unsubscribe();
      for (const res of streams) res.end(); streams.clear();
      closing = new Promise<void>(resolve => {
        server.close(() => resolve());
        server.closeAllConnections();
        for (const socket of sockets) socket.destroy();
      });
      return closing;
    },
  };
}
