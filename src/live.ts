import {z} from 'zod';
import type {ComponentApi} from '@a2ui/web_core/v1_0';
import {UiError,type SurfaceMessage} from './protocol.ts';
export const logStates=['idle','running','completed','error','paused','interrupted'] as const;
export type LogState=typeof logStates[number];
export const logViewApi={name:'LogView',schema:z.object({stream:z.literal('tools').default('tools'),text:z.string().default(''),omitted:z.boolean().default(false),state:z.enum(logStates).default('idle')}).strict()} satisfies ComponentApi;
export const seriesSchema=z.array(z.object({name:z.string().min(1).max(128),points:z.array(z.object({label:z.string().max(128),value:z.number().finite()}).strict()).max(200)}).strict()).max(4);
export type ChartSeries=z.infer<typeof seriesSchema>;
export const chartApi={name:'Chart',schema:z.object({kind:z.enum(['line','bar']),series:seriesSchema}).strict()} satisfies ComponentApi;
export const liveApis:ComponentApi[]=[logViewApi,chartApi];
export function trimLog(input:string,bytes=65536,maxLines=1000):{text:string;omitted:boolean}{
 let text=input;let omitted=false;
 if(text.length>65536){text=text.slice(-65536);omitted=true;}
 const rows=text.split('\n');if(rows.length>maxLines){text=rows.slice(-maxLines).join('\n');omitted=true;}
 while(new TextEncoder().encode(JSON.stringify(text)).byteLength>bytes){text=text.slice(Math.max(1,Math.ceil(text.length/8)));omitted=true;}
 if(text.length&&/[\uDC00-\uDFFF]/.test(text[0])){text=text.slice(1);omitted=true;}
 // A V8 sliced string can retain an arbitrarily large input backing store.
 // The encoded JSON is already bounded; parse a fresh copy preserving UTF-16.
 return {text:JSON.parse(JSON.stringify(text)) as string,omitted};
}
export function validateSeries(input:unknown):ChartSeries{
 const series=seriesSchema.parse(input);const names=new Set<string>();
 for(const item of series){if(names.has(item.name))throw new UiError(400,'Chart series names must be unique');names.add(item.name);if(item.points.length!==series[0].points.length||item.points.some((point,index)=>point.label!==series[0].points[index].label))throw new UiError(400,'Chart series labels must align');}
 return series;
}
export function validateLive(message:SurfaceMessage,initial=false):void{
 let logs=0;
 for(const component of message.createSurface.components){
  if(component.component==='Chart')validateSeries(component.series);
  if(component.component==='LogView'){
   if(++logs>1)throw new UiError(400,'Only one LogView per surface');
   const {id:_,component:__,...props}=component;const data=logViewApi.schema.parse(props);
   if(initial&&(data.text!==''||data.omitted||data.state!=='idle'))throw new UiError(400,'LogView initial output is server-controlled');
   if(trimLog(data.text).text!==data.text)throw new UiError(413,'Saved LogView exceeds its text/line budget');
   Object.assign(component,data);
  }
 }
}
