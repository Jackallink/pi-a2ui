import {z} from 'zod';
import type {ComponentApi} from '@a2ui/web_core/v1_0';
import {UiError,type Component,type SurfaceMessage} from './protocol.ts';
const identity=z.string().regex(/^[A-Za-z0-9_-]{1,64}$/);
const text=z.string().min(1).max(512);
export const codeDiffApi = {name:'CodeDiff',schema:z.object({proposalId:identity,filename:text,baseRevision:text,before:z.string(),after:z.string()}).strict()} satisfies ComponentApi;
export const testResultsApi = {name:'TestResults',schema:z.object({resultId:identity,command:text,evidence:text,cases:z.array(z.object({id:identity,name:text,status:z.enum(['pass','fail','skip','error']),details:z.string().max(4096).optional()}).strict()).max(128),summary:z.object({pass:z.number().int().min(0).max(128),fail:z.number().int().min(0).max(128),skip:z.number().int().min(0).max(128),error:z.number().int().min(0).max(128)}).strict()}).strict()} satisfies ComponentApi;
export const codingApis:ComponentApi[]=[codeDiffApi,testResultsApi];
export type DiffLine={kind:'context'|'remove'|'add';text:string;before?:number;after?:number};
function lines(value:string):string[]{
  if(new TextEncoder().encode(value).byteLength>16384)throw new UiError(413,'CodeDiff source exceeds16KiB per side');
  const result=value===''?[]:value.split('\n');
  if(result.length>512)throw new UiError(413,'CodeDiff source exceeds512 lines per side');
  return result;
}
// Exact linear-time contiguous replacement. This does not promise a minimal diff.
export function diffLines(before:string,after:string):DiffLine[]{
  const old=lines(before),next=lines(after);let prefix=0,suffix=0;
  while(prefix<old.length&&prefix<next.length&&old[prefix]===next[prefix])prefix++;
  while(suffix<old.length-prefix&&suffix<next.length-prefix&&old[old.length-1-suffix]===next[next.length-1-suffix])suffix++;
  const result:DiffLine[]=[];
  for(let i=0;i<prefix;i++)result.push({kind:'context',text:old[i],before:i+1,after:i+1});
  for(let i=prefix;i<old.length-suffix;i++)result.push({kind:'remove',text:old[i],before:i+1});
  for(let i=prefix;i<next.length-suffix;i++)result.push({kind:'add',text:next[i],after:i+1});
  for(let i=0;i<suffix;i++)result.push({kind:'context',text:old[old.length-suffix+i],before:old.length-suffix+i+1,after:next.length-suffix+i+1});
  return result;
}
export function codingIdentities(message:SurfaceMessage):Array<[string,Record<string,unknown>]> {
  return message.createSurface.components.flatMap(c=>{
    if(c.component!=='CodeDiff'&&c.component!=='TestResults')return [];
    const {id:_,...data}=c;
    return [[(c.component==='CodeDiff'?'proposal:':'result:')+String(c.proposalId??c.resultId),data] as [string,Record<string,unknown>]];
  });
}
export function validateCoding(message:SurfaceMessage):void{
  let proposal:string|undefined,result:string|undefined;
  for(const component of message.createSurface.components){
    if(component.component==='CodeDiff'){
      if(proposal!==undefined)throw new UiError(400,'Only one CodeDiff per surface');
      proposal=component.proposalId as string;diffLines(component.before as string,component.after as string);
    }
    if(component.component==='TestResults'){
      if(result!==undefined)throw new UiError(400,'Only one TestResults per surface');
      result=component.resultId as string;
      const rows=component.cases as z.infer<typeof testResultsApi.schema>['cases'];
      const counts={pass:0,fail:0,skip:0,error:0};const ids=new Set<string>();
      for(const row of rows){if(ids.has(row.id))throw new UiError(400,'Duplicate test case ID');ids.add(row.id);counts[row.status]++;}
      const summary=component.summary as typeof counts;
      if(Object.keys(counts).some(key=>counts[key as keyof typeof counts]!==summary[key as keyof typeof counts]))throw new UiError(400,'Test summary does not match case records');
    }
  }
  for(const component of message.createSurface.components){
    if(component.component!=='Button')continue;
    const context=(component.action as {event?:{context?:Record<string,unknown>}})?.event?.context;
    if((proposal!==undefined||result!==undefined) && (context?.proposalId!==proposal || context?.resultId!==result))throw new UiError(400,'Coding actions must reference current literal record IDs');
  }
}
