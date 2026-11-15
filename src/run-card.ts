import {boundedJson,exactKeys,record} from './compiler.ts';
import {LIMITS,snapshotUsage,type Snapshot} from './protocol.ts';

export const RUN_CARD_SURFACE_ID='run-summary';
export const RUN_CARD_ENTRY='pi-a2ui.run-summary.v1';
export type RunOutcome='completed'|'error'|'interrupted';

export function ownedRunCardRevision(snapshot:unknown,marker:unknown):number|undefined {
 if(!Number.isSafeInteger(marker)||Number(marker)<1||!record(snapshot)||!Array.isArray(snapshot.surfaces)||snapshot.surfaces.length>LIMITS.surfaces)return;
 return snapshot.surfaces.some(surface=>record(surface)&&surface.surfaceId===RUN_CARD_SURFACE_ID&&surface.revision===marker)?Number(marker):undefined;
}

export function runCardMetadata(snapshot:Snapshot,marker:unknown):{a2uiRunSummaryRevision?:number} {
 const revision=ownedRunCardRevision(snapshot,marker);
 return revision===undefined?{}:{a2uiRunSummaryRevision:revision};
}

export function shouldRenderRunCard(snapshot:Snapshot,options:{browserClients:number;toolCount:number;ownedRevision?:number}):boolean {
 if(!snapshot.enabled||!Number.isSafeInteger(options.browserClients)||options.browserClients<1||!Number.isSafeInteger(options.toolCount)||options.toolCount<1)return false;
 const previous=snapshot.surfaces.find(surface=>surface.surfaceId===RUN_CARD_SURFACE_ID);
 if(previous&&ownedRunCardRevision(snapshot,options.ownedRevision)===undefined)return false;
 return snapshot.surfaces.length+(previous?0:1)<=LIMITS.surfaces
  &&snapshotUsage(snapshot).components.used-(previous?.message.createSurface.components.length??0)+6<=LIMITS.components;
}

export function runCardSource(outcome:RunOutcome):string {
 const badge={completed:{label:'Run completed',status:'success'},error:{label:'Run failed',status:'error'},interrupted:{label:'Run interrupted',status:'warning'}}[outcome];
 return `root = Card(Column([Text("Run summary"),StatusBadge(label="${badge.label}",status="${badge.status}"),TaskProgress(stream="tools"),ActivityTimeline(stream="tools")]))`;
}

export function readRunCardEntry(entry:unknown):{a2uiSnapshot:unknown;a2uiRunSummaryRevision:number}|undefined {
 if(!record(entry)||entry.type!=='custom'||entry.customType!==RUN_CARD_ENTRY||!record(entry.data))return;
 try{
  exactKeys(entry.data,['a2uiSnapshot','a2uiRunSummaryRevision']);
  // Bound the snapshot itself, as tool-result restoration does, without adding a wrapper depth.
  boundedJson(entry.data.a2uiSnapshot);
  const revision=ownedRunCardRevision(entry.data.a2uiSnapshot,entry.data.a2uiRunSummaryRevision);
  if(revision!==undefined)return{a2uiSnapshot:entry.data.a2uiSnapshot,a2uiRunSummaryRevision:revision};
 }catch{/* Invalid history has no restoration authority. */}
}
