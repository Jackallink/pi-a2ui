import {logStates} from './live.js';
import {z} from 'zod';
import {basicCatalog,type ComponentApi} from '@a2ui/web_core/v1_0';
import {UiError,type SurfaceMessage} from './protocol.ts';
const identity=z.string().regex(/^[A-Za-z0-9_-]{1,64}$/);
export const dataTableApi={name:'DataTable',schema:z.object({caption:z.string().min(1).max(256),columns:z.array(z.object({id:identity,label:z.string().min(1).max(128)}).strict()).min(1).max(12),rows:z.array(z.object({id:identity,cells:z.array(z.union([z.string().max(256),z.number().finite(),z.boolean(),z.null()])).max(12)}).strict()).max(200),state:z.enum(['ready','loading','error']).default('ready'),message:z.string().max(512).default('')}).strict()} satisfies ComponentApi;
export const codeBlockApi={name:'CodeBlock',schema:z.object({code:z.string(),language:z.string().max(32).default('text'),copyable:z.boolean().default(true)}).strict()} satisfies ComponentApi;
export const markdownApi={name:'MarkdownView',schema:z.object({text:z.string()}).strict()} satisfies ComponentApi;
export const detailsApi={name:'Details',schema:z.object({title:z.string().min(1).max(256),child:(basicCatalog.components.get('Card')!.schema as z.ZodObject<any>).shape.child,open:z.boolean().default(false)}).strict()} satisfies ComponentApi;
export const statusBadgeApi={name:'StatusBadge',schema:z.object({label:z.string().min(1).max(256),status:z.enum(['info','success','warning','error','running']),provenance:z.literal('reported').default('reported')}).strict()} satisfies ComponentApi;
export const taskProgressApi={name:'TaskProgress',schema:z.object({stream:z.literal('tools').default('tools'),state:z.enum(logStates).default('idle'),started:z.number().int().min(0).max(1024).default(0),settled:z.number().int().min(0).max(1024).default(0),failed:z.number().int().min(0).max(1024).default(0),omitted:z.boolean().default(false)}).strict()} satisfies ComponentApi;
export type ToolProgress=z.infer<typeof taskProgressApi.schema>;
const artifactUrl=z.string().regex(/^\/api\/artifacts\/[a-f0-9]{32}$/);
export const artifactPreviewApi={name:'ArtifactPreview',schema:z.object({src:artifactUrl,kind:z.enum(['image','video','audio']),label:z.string().min(1).max(256)}).strict()} satisfies ComponentApi;
export const workbenchApis:ComponentApi[]=[dataTableApi,codeBlockApi,markdownApi,detailsApi,statusBadgeApi,taskProgressApi,artifactPreviewApi];
export const APPROVED_ICON_NAMES:readonly string[]=Object.freeze(['check','close','error','info','warning','folder','help','refresh','play','pause','search','settings']);
export function validateWorkbench(message:SurfaceMessage,initial=false):void{
 let progressCount=0,modalCount=0;
 for(const c of message.createSurface.components){
  if(['Image','Video','AudioPlayer'].includes(c.component)){artifactUrl.parse(c.url);if(c.posterUrl!==undefined)artifactUrl.parse(c.posterUrl);for(const prop of ['description','fit','variant'])if(c[prop]!==undefined&&typeof c[prop]!=='string')throw new UiError(400,'Artifact media props must be static');}
  if(c.component==='Icon'&&!APPROVED_ICON_NAMES.includes(c.name as string))throw new UiError(400,'Icon name must be a static approved local icon');
  if(c.component==='Modal'){
   if(++modalCount>1)throw new UiError(400,'Only one Modal per surface');const trigger=message.createSurface.components.find(node=>node.id===c.trigger);
   if(!trigger||!['Text','Icon'].includes(trigger.component))throw new UiError(400,'Modal trigger must be Text or Icon');
  }
  if(c.component==='StatusBadge'){const {id:_,component:__,...props}=c;Object.assign(c,statusBadgeApi.schema.parse(props));}
  if(c.component==='TaskProgress'){
   const {id:_,component:__,...props}=c;const p=taskProgressApi.schema.parse(props);
   if(++progressCount>1||p.failed>p.settled||p.settled>p.started)throw new UiError(400,'Invalid native tool progress counters');
   if(initial&&(p.state!=='idle'||p.started!==0||p.settled!==0||p.failed!==0||p.omitted))throw new UiError(400,'TaskProgress initial values are server-controlled');Object.assign(c,p);
  }
  if(c.component==='CodeBlock'||c.component==='MarkdownView'){
   const {id:_,component:__,...props}=c;const p=(c.component==='CodeBlock'?codeBlockApi:markdownApi).schema.parse(props);const value='code' in p?p.code:p.text;
   if(new TextEncoder().encode(value).byteLength>16384||value.split(/\r\n|\r|\n/).length>512)throw new UiError(413,'Text block exceeds16KiB/512 lines');Object.assign(c,p);
  }
  if(c.component==='DataTable'){
   const {id:_,component:__,...props}=c;const p=dataTableApi.schema.parse(props);
   if(new Set(p.columns.map(x=>x.id)).size!==p.columns.length||new Set(p.rows.map(x=>x.id)).size!==p.rows.length||p.rows.some(x=>x.cells.length!==p.columns.length))throw new UiError(400,'Table requires unique IDs and one cell per column');Object.assign(c,p);
  }
 }
}
