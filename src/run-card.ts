import {LIMITS,UiError,type Snapshot} from './protocol.ts';
import type {LogState} from './live.ts';

// Dedicated extension-owned surface for the automatic end-of-run status card (issue #57, lever A).
export const RUN_CARD_SURFACE_ID = 'run-summary';
export type RunOutcome = 'completed'|'error'|'interrupted';

// Ownership protocol: the reserved id makes the replace-own-surface branch sound; model-authored
// surfaces can never collide with or be evicted by the status card.
export function assertUnreservedSurfaceId(surfaceId:string):void {
  if (surfaceId === RUN_CARD_SURFACE_ID) throw new UiError(409,`Surface id "${RUN_CARD_SURFACE_ID}" is reserved for the extension run summary card; choose a different surfaceId.`);
}

// Pure gate: only decorate runs that already have an open canvas, ran at least one non-a2ui tool,
// and either own the run-summary surface or have free surface budget. Never evicts model surfaces,
// never starts a server, never renders for tool-free prose turns.
export function shouldRenderRunCard(snapshot:Snapshot,options:{browserClients:number;toolCount:number}):boolean {
  if (!snapshot.enabled) return false;
  if (!(options.browserClients > 0)) return false;
  if (!(options.toolCount > 0)) return false;
  if (snapshot.surfaces.some(surface => surface.surfaceId === RUN_CARD_SURFACE_ID)) return true;
  return snapshot.surfaces.length < LIMITS.surfaces;
}

const OUTCOME_BADGES:Record<RunOutcome,{label:string;status:string}> = {
  completed:{label:'Run completed',status:'success'},
  error:{label:'Run failed',status:'error'},
  interrupted:{label:'Run interrupted',status:'warning'},
};

// Preset data-driven DSL. The tool timeline is session-native (stream="tools") observed runtime
// data; the only authored literal is the outcome badge. No model content is involved.
export function runCardSource(outcome:RunOutcome):string {
  const badge = OUTCOME_BADGES[outcome];
  return `badge = StatusBadge(label="${badge.label}", status="${badge.status}")\nroot = Card(Column([Text("Run summary"), badge, ActivityTimeline(stream="tools")]))`;
}

export interface RunCardDeps {
  finished:{runOutcome:LogState;toolCount:number};
  aborted:boolean;
  snapshot:Snapshot;
  browserClients:number;
  episodeId:number;
  currentEpisode:()=>number;
  render:(surfaceId:string,source:string)=>Promise<unknown>;
  refresh:()=>void;
}

// Orchestrator for the end-of-run status card. Injected deps keep the render→refresh contract
// (fresh surfaces receive live data only after a republish) directly testable without a bound server.
export function maybeRenderRunCard(deps:RunCardDeps):void {
  const state = deps.finished.runOutcome;
  const outcome:RunOutcome|undefined = deps.aborted ? 'interrupted' : state==='completed'||state==='error'||state==='interrupted' ? state : undefined;
  if (!outcome) return;
  if (!shouldRenderRunCard(deps.snapshot,{browserClients:deps.browserClients,toolCount:deps.finished.toolCount})) return;
  const episodeId = deps.episodeId;
  void deps.render(RUN_CARD_SURFACE_ID,runCardSource(outcome)).then(() => {
    // Fresh surfaces receive live data only after a republish; skip stale episodes.
    if (episodeId === deps.currentEpisode()) deps.refresh();
  }).catch(() => { /* Best-effort status card: disabled, replaced or closed ownership cannot publish. */ });
}
