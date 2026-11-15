import {createHash} from 'node:crypto';
import {compile,record} from '../../src/compiler.ts';
import {UiError,type SurfaceMessage} from '../../src/protocol.ts';
import {canonical} from '../golden/registry.ts';
export type HandoffReason='accepted'|'arguments'|'checked-compile'|'attempted-compile'|'changed-surface'|'compiler-error';
export interface HandoffObservation {
 byteIdentical:boolean|null;checkedCompileValid:boolean|null;attemptedCompileValid:boolean|null;compiledSurfaceEqual:boolean|null;
 checkedSourceSHA256:string|null;attemptedSourceSHA256:string|null;checkedCompiledSHA256:string|null;attemptedCompiledSHA256:string|null;
 reason:HandoffReason;
}
const sha=(value:string)=>createHash('sha256').update(value).digest('hex');
function ownString(input:unknown,key:string):string|undefined {
 if(input===null||typeof input!=='object')return;
 const descriptor=Object.getOwnPropertyDescriptor(input,key);
 return descriptor&&'value' in descriptor&&typeof descriptor.value==='string'?descriptor.value:undefined;
}
function sourceRecord(input:unknown):input is {surfaceId:string;source:string}{
 return record(input)&&Object.keys(input).length===2&&Object.hasOwn(input,'surfaceId')&&Object.hasOwn(input,'source')&&ownString(input,'surfaceId')!==undefined&&ownString(input,'source')!==undefined;
}
// The optional compiler exists for failure-classification canaries; the worker uses the actual default.
export function compareHandoff(checked:unknown,attempted:unknown,compiler:(surfaceId:string,source:string)=>SurfaceMessage=compile):HandoffObservation {
 const observed:HandoffObservation={byteIdentical:null,checkedCompileValid:null,attemptedCompileValid:null,compiledSurfaceEqual:null,checkedSourceSHA256:null,attemptedSourceSHA256:null,checkedCompiledSHA256:null,attemptedCompiledSHA256:null,reason:'arguments'};
 const checkedSource=ownString(checked,'source'),attemptedSource=ownString(attempted,'source');
 if(checkedSource!==undefined)observed.checkedSourceSHA256=sha(checkedSource);if(attemptedSource!==undefined)observed.attemptedSourceSHA256=sha(attemptedSource);if(checkedSource!==undefined&&attemptedSource!==undefined)observed.byteIdentical=checkedSource===attemptedSource;
 if(!sourceRecord(checked)||!sourceRecord(attempted))return observed;
 if(checked.surfaceId!==attempted.surfaceId)return observed;
 let checkedCanonical:string;
 try{const surface=compiler(checked.surfaceId,checked.source);checkedCanonical=canonical(surface);observed.checkedCompileValid=true;observed.checkedCompiledSHA256=sha(checkedCanonical);}
 catch(error){observed.checkedCompileValid=error instanceof UiError?false:null;observed.reason=error instanceof UiError?'checked-compile':'compiler-error';return observed;}
 try{
  const surface=compiler(attempted.surfaceId,attempted.source);const attemptedCanonical=canonical(surface);observed.attemptedCompileValid=true;observed.attemptedCompiledSHA256=sha(attemptedCanonical);
  observed.compiledSurfaceEqual=checkedCanonical===attemptedCanonical;observed.reason=observed.compiledSurfaceEqual?'accepted':'changed-surface';return observed;
 }catch(error){observed.attemptedCompileValid=error instanceof UiError?false:null;observed.reason=error instanceof UiError?'attempted-compile':'compiler-error';return observed;}
}
export function requireHandoff(observation:HandoffObservation):void {
 if(observation.reason!=='accepted'||observation.compiledSurfaceEqual!==true)throw new Error('BM4 handoff rejected: '+observation.reason);
}
