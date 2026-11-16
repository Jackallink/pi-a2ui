// Finite command compatibility, not a shell parser or executor. Context is worker-owned.
import {isAbsolute,join} from 'node:path';

export class HelperInvocationError extends Error {
 readonly kind:'usage'|'policy';readonly code:string;
 constructor(kind:'usage'|'policy',code:string){super('helper '+kind+': '+code);this.kind=kind;this.code=code;}
}
type Token={kind:'word'|'and';text:string};
export interface HelperContext{cwd:string;helper:string;draft:string}
export interface HelperPlan{
 readonly version:'owned-cwd-v1';readonly variant:'direct'|'owned-cwd-prefix';
 readonly cwd:string;readonly argv:readonly string[];readonly command:string;
 readonly operation:string;readonly check:boolean;readonly surfaceId?:string;
}
const policy=(code:string):never=>{throw new HelperInvocationError('policy',code);};
const usage=(code:string):never=>{throw new HelperInvocationError('usage',code);};

function tokens(raw:string):Token[]{
 if(typeof raw!=='string'||Buffer.byteLength(raw)>8192)policy('command_size');
 if(/[\\$`\x00-\x08\x0a-\x1f\x7f]/.test(raw))policy('lexical');
 const result:Token[]=[];let index=0;
 while(index<raw.length){
  if(/[ \t]/.test(raw[index])){index++;continue;}
  if(raw[index]==='&'){
   if(raw[index+1]!=='&')policy('shell_operator');
   result.push({kind:'and',text:'&&'});index+=2;continue;
  }
  if(/[;|<>()]/.test(raw[index]))policy('shell_operator');
  let value='';const quote=raw[index]==="'"||raw[index]==='"'?raw[index++]:undefined;
  if(quote){
   while(index<raw.length&&raw[index]!==quote)value+=raw[index++];
   if(raw[index]!==quote)policy('quoting');index++;
   if(index<raw.length&&!/[ \t&;|<>()]/.test(raw[index]))policy('quoting');
  }else{
   while(index<raw.length&&!/[ \t&;|<>()]/.test(raw[index])){
    if(raw[index]==="'"||raw[index]==='"')policy('quoting');value+=raw[index++];
   }
  }
  result.push({kind:'word',text:value});
 }
 return result;
}

export function planHelperInvocation(raw:string,context:HelperContext):HelperPlan{
 if(!/^v24\./.test(process.version)||!context||![context.cwd,context.helper,context.draft].every(p=>typeof p==='string'&&isAbsolute(p))||context.draft!==join(context.cwd,'draft.express'))policy('runtime_context');
 let parts=tokens(raw),variant:HelperPlan['variant']='direct';
 if(parts[0]?.kind==='word'&&parts[0].text==='cd'){
  if(parts[1]?.kind!=='word'||parts[1].text!==context.cwd)policy('cwd_mismatch');
  if(parts[2]?.kind!=='and')policy('shell_operator');
  parts=parts.slice(3);variant='owned-cwd-prefix';
 }
 if(parts.some(p=>p.kind!=='word'))policy('shell_operator');
 const words=parts.map(p=>p.text);
 if(!['node',process.execPath].includes(words[0]))policy('executable');
 if(words[1]!==context.helper)policy('helper_path');
 const operation=words[2];let args:string[],surfaceId:string|undefined;
 if(['catalog','patterns','examples'].includes(operation)){
  if(words.length!==3)usage('argument_shape');args=[operation];
 }else if(['component','pattern','example'].includes(operation)){
  if(words.length!==4||!/^[A-Za-z0-9_-]{1,64}$/.test(words[3]))usage('name');args=[operation,words[3]];
 }else if(operation==='check'){
  if(words[5]!==undefined&&![context.draft,'draft.express','./draft.express'].includes(words[5]))policy('source_path');
  if(words.length!==6||words[3]!=='--surface-id')usage('argument_shape');
  if(!/^[A-Za-z0-9_-]{1,64}$/.test(words[4]))usage('surface_id');surfaceId=words[4];args=[operation,'--surface-id',surfaceId,context.draft];
 }else return policy('operation');
 const argv=Object.freeze([process.execPath,context.helper,...args]);
 const quote=(value:string)=>"'"+value.replaceAll("'","'\\''")+"'";
 return Object.freeze({version:'owned-cwd-v1',variant,cwd:context.cwd,argv,command:argv.map(quote).join(' '),operation,check:operation==='check',surfaceId});
}
