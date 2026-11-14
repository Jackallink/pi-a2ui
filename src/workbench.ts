import {z} from 'zod';
import {type ComponentApi} from '@a2ui/web_core/v1_0';
import {UiError,type SurfaceMessage} from './protocol.ts';
const identity=z.string().regex(/^[A-Za-z0-9_-]{1,64}$/);
export const dataTableApi={name:'DataTable',schema:z.object({caption:z.string().min(1).max(256),columns:z.array(z.object({id:identity,label:z.string().min(1).max(128)}).strict()).min(1).max(12),rows:z.array(z.object({id:identity,cells:z.array(z.union([z.string().max(256),z.number().finite(),z.boolean(),z.null()])).max(12)}).strict()).max(200),state:z.enum(['ready','loading','error']).default('ready'),message:z.string().max(512).default('')}).strict()} satisfies ComponentApi;
export const workbenchApis:ComponentApi[]=[dataTableApi];
export function validateWorkbench(message:SurfaceMessage,initial=false):void{
 for(const c of message.createSurface.components){
  if(c.component==='DataTable'){
   const {id:_,component:__,...props}=c;const p=dataTableApi.schema.parse(props);
   if(new Set(p.columns.map(x=>x.id)).size!==p.columns.length||new Set(p.rows.map(x=>x.id)).size!==p.rows.length||p.rows.some(x=>x.cells.length!==p.columns.length))throw new UiError(400,'Table requires unique IDs and one cell per column');Object.assign(c,p);
  }
 }
}
