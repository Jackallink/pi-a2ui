import {z} from 'zod';
import {type ComponentApi} from '@a2ui/web_core/v1_0';
import {UiError,type SurfaceMessage} from './protocol.ts';
const identity=z.string().regex(/^[A-Za-z0-9_-]{1,64}$/);
export const dataTableApi={name:'DataTable',schema:z.object({caption:z.string().min(1).max(256),columns:z.array(z.object({id:identity,label:z.string().min(1).max(128)}).strict()).min(1).max(12),rows:z.array(z.object({id:identity,cells:z.array(z.union([z.string().max(256),z.number().finite(),z.boolean(),z.null()])).max(12)}).strict()).max(200),state:z.enum(['ready','loading','error']).default('ready'),message:z.string().max(512).default('')}).strict()} satisfies ComponentApi;
export const codeBlockApi={name:'CodeBlock',schema:z.object({code:z.string(),language:z.string().max(32).default('text'),copyable:z.boolean().default(true)}).strict()} satisfies ComponentApi;
export const markdownApi={name:'MarkdownView',schema:z.object({text:z.string()}).strict()} satisfies ComponentApi;
export const workbenchApis:ComponentApi[]=[dataTableApi,codeBlockApi,markdownApi];
export function validateWorkbench(message:SurfaceMessage,initial=false):void{
 for(const c of message.createSurface.components){
  if(c.component==='CodeBlock'||c.component==='MarkdownView'){
   const {id:_,component:__,...props}=c;const p=(c.component==='CodeBlock'?codeBlockApi:markdownApi).schema.parse(props);const value='code' in p?p.code:p.text;
   if(new TextEncoder().encode(value).byteLength>16384||value.split('\n').length>512)throw new UiError(413,'Text block exceeds16KiB/512 lines');Object.assign(c,p);
  }
  if(c.component==='DataTable'){
   const {id:_,component:__,...props}=c;const p=dataTableApi.schema.parse(props);
   if(new Set(p.columns.map(x=>x.id)).size!==p.columns.length||new Set(p.rows.map(x=>x.id)).size!==p.rows.length||p.rows.some(x=>x.cells.length!==p.columns.length))throw new UiError(400,'Table requires unique IDs and one cell per column');Object.assign(c,p);
  }
 }
}
