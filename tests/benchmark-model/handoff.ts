// Constructed RED checkpoint: existing v1 byte-identity policy, not the v2 implementation.
import {isDeepStrictEqual} from 'node:util';
export function compareHandoff(checked:unknown,attempted:unknown){
 const byteIdentical=isDeepStrictEqual(checked,attempted);
 return{byteIdentical,compiledSurfaceEqual:null,reason:byteIdentical?'accepted':'changed-surface'};
}
export function requireHandoff(observation:ReturnType<typeof compareHandoff>):void{
 if(observation.reason!=='accepted')throw new Error('BM4 handoff rejected: '+observation.reason);
}
