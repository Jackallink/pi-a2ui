export const LIMITS = {
  sourceBytes: 32 * 1024,
  snapshotBytes: 256 * 1024,
  bodyBytes: 64 * 1024,
  components: 64,
  surfaces: 4,
  depth: 16,
  clients: 8,
  events: 1024,
  queuedBytes: 256 * 1024,
} as const;

export interface Component extends Record<string, unknown> {
  id: string;
  component: string;
}
export interface SurfaceMessage {
  version: "1.0";
  createSurface: {
    surfaceId: string;
    catalogId: string;
    components: Component[];
    dataModel?: Record<string, unknown>;
  };
}
export interface SurfaceRecord {
  surfaceId: string;
  revision: number;
  dataSequence?: number;
  message: SurfaceMessage;
}
export interface Snapshot {
  version: 1;
  epoch: string;
  enabled: boolean;
  surfaces: SurfaceRecord[];
}
export interface SnapshotUsage {
  components: {used:number;limit:number};
  surfaces: {used:number;limit:number};
}
export function snapshotUsage(snapshot:Snapshot):SnapshotUsage {
  return {
    components:{used:snapshot.surfaces.reduce((count,surface)=>count+surface.message.createSurface.components.length,0),limit:LIMITS.components},
    surfaces:{used:snapshot.surfaces.length,limit:LIMITS.surfaces},
  };
}
export interface Operation { epoch: string; generation: number }
export interface UiDiagnostic {
  surfaceId?: string;
  componentId?: string;
  componentType?: string;
  propertyPath?: string;
  forbiddenKey?: string;
  workspaceRoot?: string;
}
export class UiError extends Error {
  readonly diagnostic?: Readonly<UiDiagnostic>;
  readonly reason: string;
  constructor(public readonly status: number, reason: string, options?: ErrorOptions & {diagnostic?: UiDiagnostic}) {
    const diagnostic = Object.fromEntries(Object.entries(options?.diagnostic ?? {}).filter(([,value])=>value!==undefined)) as UiDiagnostic;
    const context: string[] = [];
    if(diagnostic.surfaceId!==undefined)context.push('surface '+JSON.stringify(diagnostic.surfaceId));
    if(diagnostic.componentId!==undefined)context.push('component '+JSON.stringify(diagnostic.componentId)+(diagnostic.componentType?' ('+diagnostic.componentType+')':''));
    else if(diagnostic.componentType)context.push('component type '+JSON.stringify(diagnostic.componentType));
    if(diagnostic.propertyPath)context.push('property '+JSON.stringify(diagnostic.propertyPath));
    if(diagnostic.workspaceRoot)context.push('relative to workspace '+JSON.stringify(diagnostic.workspaceRoot));
    super(reason+(context.length?' ['+context.join('; ')+']':''),options);
    this.reason=reason;
    if(Object.keys(diagnostic).length)this.diagnostic=Object.freeze(diagnostic);
  }
}
export function locateUiError(error:unknown, context:UiDiagnostic):UiError {
  const known=error instanceof UiError;
  const diagnostic={...context,...(known?error.diagnostic:{})};
  if(known&&Object.entries(diagnostic).every(([key,value])=>value===error.diagnostic?.[key as keyof UiDiagnostic]))return error;
  return new UiError(known?error.status:400,known?error.reason:'Invalid A2UI surface: '+(error instanceof Error?error.message:'validation failed'),{cause:error,diagnostic});
}
export function componentError(error:unknown, component:unknown, surfaceId?:string):UiError {
  const data=component&&typeof component==='object'?component as Record<string,unknown>:{};
  return locateUiError(error,{surfaceId,
    componentId:typeof data.id==='string'&&data.id.length<=512?data.id:undefined,
    componentType:typeof data.component==='string'&&data.component.length<=128?data.component:undefined});
}

export interface DataSurface {surfaceId:string;revision:number;sequence:number;components:Component[]}
export interface DataBatch {epoch:string;surfaces:DataSurface[]}
