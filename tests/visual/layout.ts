export interface Rect {x:number;y:number;width:number;height:number}
export interface Subject {rect:Rect|null;visible:boolean;hit:boolean|null}
export interface LayoutObservation {viewport:{width:number;height:number};subjects:Record<string,Subject>}
export type Pair=readonly[string,string];
// Constructed initial checker: complete real observations, intentionally no detection yet.
export function layoutFaults(_observed:LayoutObservation,_pairs:readonly Pair[]):string[]{return [];}
