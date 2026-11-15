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
export interface Operation { epoch: string; generation: number }
export class UiError extends Error {
  constructor(public readonly status: number, message: string, options?: ErrorOptions) { super(message,options); }
}

export interface DataSurface {surfaceId:string;revision:number;sequence:number;components:Component[]}
export interface DataBatch {epoch:string;surfaces:DataSurface[]}
