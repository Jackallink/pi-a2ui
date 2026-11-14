import {z} from 'zod';
import {basicCatalog,type ComponentApi} from '@a2ui/web_core/v1_0';
import { componentError, UiError,type Component,type SurfaceMessage} from './protocol.ts';
import {validateInput} from './inputs.ts';
import {logStates} from './live.ts';
const choice=basicCatalog.components.get('ChoicePicker')!.schema as z.ZodObject<any>;
export const searchablePickerApi={name:'SearchablePicker',schema:z.object({label:z.string().min(1).max(128),options:z.array(z.object({label:z.string().min(1).max(128),value:z.string().min(1).max(128)}).strict()).max(200),value:choice.shape.value,variant:z.enum(['mutuallyExclusive','multipleSelection']).default('mutuallyExclusive')}).strict()} satisfies ComponentApi;
const ruleSchema=z.object({fieldId:z.string().min(1).max(128),message:z.string().min(1).max(256),required:z.boolean().optional(),minLength:z.number().int().min(0).max(4096).optional(),maxLength:z.number().int().min(0).max(4096).optional()}).strict();
export const formValidationApi={name:'FormValidation',schema:z.object({title:z.string().min(1).max(128).default('Check these fields'),buttons:z.array(z.string().min(1).max(128)).min(1).max(16),rules:z.array(ruleSchema).min(1).max(16)}).strict()} satisfies ComponentApi;
const timelineEntry=z.object({id:z.string().regex(/^[A-Za-z0-9_-]{1,32}$/),name:z.string().min(1).max(64),state:z.enum(['running','completed','error','interrupted']),startedAt:z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),elapsedMs:z.number().int().min(0).max(Number.MAX_SAFE_INTEGER)}).strict();
export const activityTimelineApi={name:'ActivityTimeline',schema:z.object({stream:z.literal('tools').default('tools'),entries:z.array(timelineEntry).max(32).default([]),state:z.enum(logStates).default('idle'),omitted:z.boolean().default(false)}).strict()} satisfies ComponentApi;
export type TimelineEntry=z.infer<typeof timelineEntry>;
export type ToolTimeline=z.infer<typeof activityTimelineApi.schema>;
export const interactionApis:ComponentApi[]=[searchablePickerApi,formValidationApi,activityTimelineApi];
type Rules=z.infer<typeof formValidationApi.schema>;
export interface ValidationIssue{fieldId:string;message:string}
function bindingPath(value:unknown):string|undefined{return value&&typeof value==='object'&&!Array.isArray(value)&&'@path' in value&&typeof value['@path']==='string'?value['@path']:undefined;}
function declaration(component:Component|undefined):Record<string,unknown>{return (component?.action as {event?:{context?:Record<string,unknown>}})?.event?.context??{};}
export function validateInteractions(message:SurfaceMessage,initial=false):void{
 const components=message.createSurface.components;let validations=0,timelines=0;
 for(const c of components){
    try {
  if(c.component==='SearchablePicker'){
   const {id:_,component:__,...props}=c;const parsed=searchablePickerApi.schema.parse(props);
   if(!bindingPath(parsed.value))throw new UiError(400,'SearchablePicker requires an initialized absolute value binding');Object.assign(c,parsed);
  }
  if(c.component==='ActivityTimeline'){
   if(c.id.length>512)throw new UiError(413,'Timeline component ID exceeds512 UTF-16 units');
   if(++timelines>1)throw new UiError(400,'Only one ActivityTimeline per surface');
   const {id:_,component:__,...props}=c;const data=activityTimelineApi.schema.parse(props);
   if(new Set(data.entries.map(row=>row.id)).size!==data.entries.length)throw new UiError(400,'Duplicate timeline row IDs');
   if(initial&&(data.entries.length||data.state!=='idle'||data.omitted))throw new UiError(400,'ActivityTimeline initial values are server-controlled');
   if(data.state!=='running'&&data.entries.some(row=>row.state==='running')||data.state==='idle'&&data.entries.length)throw new UiError(400,'Inconsistent timeline state');
   Object.assign(c,data);if(new TextEncoder().encode(JSON.stringify(c)).byteLength>32768)throw new UiError(413,'Timeline complete component exceeds32KiB');
  }
  if(c.component==='FormValidation'){
   if(++validations>1)throw new UiError(400,'Only one FormValidation per surface');
   const {id:_,component:__,...props}=c;const data=formValidationApi.schema.parse(props);
   if(new Set(data.buttons).size!==data.buttons.length)throw new UiError(400,'FormValidation buttons must be distinct');
   const fields=new Set<string>();const paths=new Set<string>();
   for(const rule of data.rules){
    const field=components.find(n=>n.id===rule.fieldId);const path=bindingPath(field?.value);
    if(!field||!['TextField','CheckBox','ChoicePicker','SearchablePicker','Slider','DateTimeInput'].includes(field.component)||!path)throw new UiError(400,'Validation field must be a reachable bound input');
    if(fields.has(rule.fieldId)||paths.has(path))throw new UiError(400,'Validation rules must not share fields or paths');fields.add(rule.fieldId);paths.add(path);
    if(rule.required!==true&&!(rule.minLength!==undefined&&rule.minLength>0)&&rule.maxLength===undefined)throw new UiError(400,'Validation rule needs a meaningful constraint');
    if(rule.minLength!==undefined||rule.maxLength!==undefined){if(!['TextField','ChoicePicker','SearchablePicker'].includes(field.component))throw new UiError(400,'Length rules require text or choices');if((rule.minLength??0)>(rule.maxLength??4096))throw new UiError(400,'Reversed validation lengths');}
   }
   for(const id of data.buttons){const button=components.find(n=>n.id===id);if(button?.component!=='Button')throw new UiError(400,'Validation guard must name a reachable Button');const values=Object.values(declaration(button));for(const path of paths)if(!values.some(value=>bindingPath(value)===path))throw new UiError(400,'Guarded Button must bind every ruled input path');}
   Object.assign(c,data);
  }

    } catch(error) { throw componentError(error,c, message.createSurface.surfaceId); }
  }
}
export function validateSubmission(components:Component[],sourceId:string,context:Record<string,unknown>):ValidationIssue[]{
 const component=components.find(c=>c.component==='FormValidation'&&(c.buttons as string[]).includes(sourceId));if(!component)return[];
 const rules=component as unknown as Rules;const declared=declaration(components.find(c=>c.id===sourceId));const errors:ValidationIssue[]=[];
 for(const rule of rules.rules){const field=components.find(c=>c.id===rule.fieldId)!;const path=bindingPath(field.value);const aliases=Object.keys(declared).filter(key=>bindingPath(declared[key])===path);const values=aliases.map(key=>context[key]);let invalid=!values.length;
  try{for(const value of values)validateInput(field,value);}catch{invalid=true;}
  const value=values[0];if(values.some(v=>JSON.stringify(v)!==JSON.stringify(value)))invalid=true;
  if(rule.required){if(typeof value==='string'?value.trim()==='':typeof value==='boolean'?!value:Array.isArray(value)?value.length===0:typeof value!=='number'||!Number.isFinite(value))invalid=true;}
  const length=typeof value==='string'?Array.from(value).length:Array.isArray(value)?value.length:undefined;
  if(rule.minLength!==undefined&&(length===undefined||length<rule.minLength)||rule.maxLength!==undefined&&(length===undefined||length>rule.maxLength))invalid=true;
  if(invalid)errors.push({fieldId:rule.fieldId,message:rule.message});
 }
 return errors;
}
