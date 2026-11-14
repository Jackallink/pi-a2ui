import { A2uiSurface, type LitComponentApi } from "@a2ui/lit";
import {
  MessageProcessor,
  injectBasicCatalogStyles,
  type ActionPayload,
} from "@a2ui/web_core/v1_0";
import { browserCatalogs } from "./browser-catalog.js";
import type { Snapshot, SurfaceRecord, DataBatch, DataSurface } from "./protocol.js";

// Consume the bootstrap credential once, before starting any network work.
const fragment = new URLSearchParams(location.hash.slice(1));
const token = fragment.get("token");
if (location.hash) history.replaceState(null, "", location.pathname + location.search);

const status = document.querySelector<HTMLElement>("#status")!;
const notice = document.querySelector<HTMLElement>("#notice")!;
const surfaces = document.querySelector<HTMLElement>("#surfaces")!;
const connection = document.querySelector<HTMLElement>("#connection")!;
const empty = document.querySelector<HTMLElement>("#empty")!;
const count = document.querySelector<HTMLElement>("#surface-count")!;

interface MountedSurface {
  revision: number;
  sequence:number;
  liveIds:Map<string,string>;
  wrapper: HTMLElement;
  element: A2uiSurface;
  unsubscribe: () => void;
}

interface PendingAction {
  epoch: string;
  surfaceId: string;
  revision: number;
  controller: AbortController;
  deadline: number | undefined;
}

let epoch: string | undefined;
let enabled = true;
let pending: PendingAction | undefined;
let stream: EventSource | undefined;
let recovering=false;
let processor = makeProcessor();
const mounted = new Map<string, MountedSurface>();
injectBasicCatalogStyles();

function makeProcessor() {
  return new MessageProcessor<LitComponentApi>(browserCatalogs, undefined, { version: "1.0" });
}

function showNotice(message: string, error = false) {
  notice.textContent = message;
  notice.dataset.kind = error ? "error" : "info";
  notice.hidden = !message;
}

function setConnection(message: string, state: "live" | "waiting" | "closed") {
  connection.textContent = message;
  connection.dataset.state = state;
}

function updateAvailability() {
  const sending = pending !== undefined;
  surfaces.inert = !enabled || sending;
  surfaces.setAttribute("aria-busy", String(sending));
  status.textContent = !enabled ? "Canvas paused" : sending ? "Sending…" : "Ready for your input";
}

function releasePending(operation: PendingAction) {
  if (pending !== operation) return;
  window.clearTimeout(operation.deadline);
  pending = undefined;
}

function isCurrentAction(operation: PendingAction) {
  return pending === operation && epoch === operation.epoch &&
    mounted.get(operation.surfaceId)?.revision === operation.revision;
}

function removeSurface(surfaceId: string) {
  const entry = mounted.get(surfaceId);
  if (!entry) return;
  entry.unsubscribe();
  entry.element.surface = undefined;
  entry.wrapper.remove();
  processor.processMessages({ version: "1.0", deleteSurface: { surfaceId } });
  mounted.delete(surfaceId);
}

function mountSurface(record: SurfaceRecord) {
  const errors = processor.processMessagesWithErrors(record.message);
  if (errors.length) throw new Error("Pi sent a surface that could not be displayed.");
  const model = processor.getSurface(record.surfaceId);
  if (!model) throw new Error("Pi sent an incomplete surface.");
  const wrapper = document.createElement("section");
  wrapper.className = "surface";
  wrapper.dataset.surfaceId = record.surfaceId;
  wrapper.setAttribute("aria-label", `Canvas ${record.surfaceId}`);
  const element = new A2uiSurface();
  element.surface = model;
  wrapper.append(element);
  const capturedEpoch = epoch!;
  const subscription = model.onAction.subscribe((action) => sendAction(action, capturedEpoch, record.revision));
  mounted.set(record.surfaceId, {
    revision: record.revision,
    sequence:record.dataSequence??0,
    liveIds:new Map(record.message.createSurface.components.filter(c=>c.component==='LogView'||c.component==='Chart'||c.component==='TaskProgress').map(c=>[c.id,c.component])),
    wrapper,
    element,
    unsubscribe: () => subscription.unsubscribe(),
  });
  surfaces.append(wrapper);
}

function applySnapshot(snapshot: Snapshot) {
  if (snapshot.version !== 1 || typeof snapshot.epoch !== "string" || !Array.isArray(snapshot.surfaces)) {
    throw new Error("Pi sent an incompatible canvas snapshot.");
  }
  if (pending && (pending.epoch !== snapshot.epoch ||
      !snapshot.surfaces.some((record) => record.surfaceId === pending!.surfaceId && record.revision === pending!.revision))) {
    const obsolete = pending;
    releasePending(obsolete);
    obsolete.controller.abort();
    showNotice("");
  }
  if (snapshot.epoch !== epoch) {
    for (const entry of mounted.values()) {
      entry.unsubscribe();
      entry.element.surface = undefined;
      entry.wrapper.remove();
    }
    mounted.clear();
    processor.dispose();
    processor = makeProcessor();
    epoch = snapshot.epoch;
    showNotice("");
  }
  enabled = snapshot.enabled;
  const currentIds = new Set(snapshot.surfaces.map((record) => record.surfaceId));
  for (const surfaceId of mounted.keys()) {
    if (!currentIds.has(surfaceId)) removeSurface(surfaceId);
  }
  for (const record of snapshot.surfaces) {
    if (mounted.get(record.surfaceId)?.revision === record.revision) {
      applyData({surfaceId:record.surfaceId,revision:record.revision,sequence:record.dataSequence??0,components:record.message.createSurface.components.filter(c=>c.component==='LogView'||c.component==='Chart'||c.component==='TaskProgress')},true);
      continue;
    }
    removeSurface(record.surfaceId);
    mountSurface(record);
  }
  if(!enabled){pauseMedia();window.dispatchEvent(new Event('a2ui-artifacts-revoked'));}
  empty.hidden = mounted.size > 0;
  count.textContent = `${mounted.size} ${mounted.size === 1 ? "surface" : "surfaces"}`;
  if (!enabled) showNotice("Pi has paused this canvas. Run /a2ui-toggle in Pi to continue.");
  else if (notice.textContent?.startsWith("Pi has paused")) showNotice("");
  updateAvailability();
}

async function sendAction(action: ActionPayload, capturedEpoch: string, revision: number) {
  if (pending || !enabled || epoch !== capturedEpoch || mounted.get(action.surfaceId)?.revision !== revision) return;
  const envelope = {
    epoch: capturedEpoch,
    revision,
    eventId: crypto.randomUUID(),
    message: { version: "1.0", action },
  };
  const operation: PendingAction = {
    epoch: capturedEpoch,
    surfaceId: action.surfaceId,
    revision,
    controller: new AbortController(),
    deadline: undefined,
  };
  pending = operation;
  operation.deadline = window.setTimeout(() => {
    if (!isCurrentAction(operation)) return;
    releasePending(operation);
    operation.controller.abort();
    showNotice("Delivery is uncertain. Check Pi before sending again.", true);
    updateAvailability();
  }, 15_000);
  updateAvailability();
  showNotice("Sending…");
  try {
    const response = await fetch("/api/actions", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(envelope),
      signal: operation.controller.signal,
    });
    // A response for an obsolete surface must not annotate a new canvas.
    if (!isCurrentAction(operation)) return;
    if (response.status === 202) {
      showNotice("Sent to Pi");
    } else {
      let message = "Pi could not accept this action.";
      try {
        const body: unknown = await response.json();
        if (body && typeof body === "object" && "error" in body && typeof body.error === "string") {
          message = body.error;
        }
      } catch { /* Preserve the response status if its body is not JSON. */ }
      if (!isCurrentAction(operation)) return;
      if (response.status === 401) message += " Run /a2ui in Pi to reconnect.";
      showNotice(message, true);
    }
  } catch {
    if (isCurrentAction(operation)) {
      showNotice("Delivery is uncertain. Check Pi before sending again.", true);
    }
  } finally {
    if (pending === operation) {
      releasePending(operation);
      updateAvailability();
    }
  }
}

function applyData(record:DataSurface,snapshot=false){
 const entry=mounted.get(record.surfaceId);if(!entry||entry.revision!==record.revision||record.sequence<=entry.sequence)return;
 if(!Number.isSafeInteger(record.sequence)||record.sequence<0||!Array.isArray(record.components))throw new Error('Invalid live update');
 if(!snapshot&&record.sequence!==entry.sequence+1){if(!recovering){recovering=true;stream?.close();connectEvents();}return;}
 if(record.components.some(c=>entry.liveIds.get(c.id)!==c.component))throw new Error('Live updates cannot change layout');
 const errors=processor.processMessagesWithErrors({version:'1.0',updateComponents:{surfaceId:record.surfaceId,components:record.components}});
 if(errors.length)throw new Error('Invalid live component data');entry.sequence=record.sequence;
}
function connectEvents() {
  setConnection("Connecting", "waiting");
  const current=new EventSource("/api/events");
  stream=current;
  current.onopen = () => {
    if(stream!==current)return;
    setConnection("Connected to Pi", "live");
  };
  current.addEventListener("snapshot", (event: MessageEvent<string>) => {
    if(stream!==current)return;
    try {
      applySnapshot(JSON.parse(event.data) as Snapshot);
      recovering=false;
    } catch {
      showNotice("This canvas could not be displayed. Run /a2ui in Pi to reconnect.", true);
    }
  });
  current.addEventListener("data",(event:MessageEvent<string>)=>{
    if(stream!==current||recovering)return;
    try{const batch=JSON.parse(event.data) as DataBatch;if(batch.epoch!==epoch)return;if(!Array.isArray(batch.surfaces))throw new Error();for(const record of batch.surfaces){if(stream!==current)break;applyData(record);}}catch{showNotice("Live data could not be displayed. Reopen /a2ui to reconnect.",true);}
  });
  current.onerror = () => {
    if(stream!==current)return;
    if (stream?.readyState === EventSource.CLOSED) {
      setConnection("Connection closed", "closed");
      showNotice("Open this canvas again with /a2ui in Pi to reconnect.", true);
    } else {
      setConnection("Reconnecting…", "waiting");
    }
  };
}

async function start() {
  if (token !== null) {
    try {
      const response = await fetch("/api/connect", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!response.ok) throw new Error("Connection rejected");
    } catch {
      setConnection("Connection needed", "closed");
      showNotice("Open this canvas again with /a2ui in Pi to reconnect.", true);
      return;
    }
  }
  connectEvents();
}

function pauseMedia(){for(const media of document.querySelectorAll<HTMLMediaElement>('video,audio'))media.pause();}
window.addEventListener("pagehide", () => {
  pauseMedia();
  stream?.close();
});
// Back/forward cache keeps the same models and drafts, but the stream needs reopening.
window.addEventListener("pageshow", (event) => {
  if (event.persisted) connectEvents();
});
void start();
