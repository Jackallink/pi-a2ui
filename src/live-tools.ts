import {UiSession} from './session.ts';
import {trimLog,type LogState} from './live.ts';
import type {Operation} from './protocol.ts';
interface Window {tail:string;length:number;totalBytes?:number}
// Tool results are cumulative snapshots. Keep bounded tails, never full history.
function snapshot(result:unknown,previous?:Window,final=false){
 const content=(result as {content?:unknown})?.content;
 const parts=Array.isArray(content)?content.slice(0,256).filter((p):p is {type:string;text:string}=>!!p&&p.type==='text'&&typeof p.text==='string').map(p=>p.text):[];
 const length=parts.reduce((n,p)=>n+p.length,0)+Math.max(0,parts.length-1);
 function range(start:number,end:number):string{let offset=0,text='';for(let i=0;i<parts.length;i++){const part=parts[i]+(i<parts.length-1?'\n':'');const from=Math.max(0,start-offset),to=Math.min(part.length,end-offset);if(to>from)text+=part.slice(from,to);offset+=part.length;if(offset>=end)break;}return text;}
 const truncation=(result as {details?:{truncation?:{truncated?:boolean;totalBytes?:number}}})?.details?.truncation;
 const totalBytes=truncation&&Number.isSafeInteger(truncation.totalBytes)&&Number(truncation.totalBytes)>=0?truncation.totalBytes:undefined;
 const rawTail=range(Math.max(0,length-65536),length);const bounded=trimLog(rawTail,65536,65537);
 const tail=bounded.text;let delta:string,changed=false,stale=false;
 if(previous&&((previous.totalBytes!==undefined&&(totalBytes===undefined||totalBytes<previous.totalBytes||!final&&totalBytes===previous.totalBytes))||(totalBytes===undefined&&length<previous.length))){delta='';stale=true;}
 else if(!previous)delta=tail;
 else if(length>=previous.length&&range(previous.length-previous.tail.length,previous.length)===previous.tail)delta=range(Math.max(previous.length,length-65536),length);
 else {delta=tail;changed=true;}
 return {window:stale?previous!:{tail,length,totalBytes},delta,changed,omitted:truncation?.truncated===true||bounded.omitted||rawTail.length<length||length-(previous?.length??0)>65536||Array.isArray(content)&&content.length>256};
}
export class LiveTools{
 private seen=new Set<string>();private started=0;private settled=0;private failedCount=0;private progressState:LogState='idle';private progressOmitted=false;
 private active=new Map<string,Window>();private accepting=false;private closed=false;private text='';private omitted=false;private state:LogState='idle';private failed=false;
 private timer?:ReturnType<typeof setTimeout>;private lastAt=-Infinity;private operation:Operation;
 constructor(private session:UiSession){this.operation=session.beginOperation();}
 beginRun(){if(this.closed)return;this.active.clear();this.seen.clear();this.started=0;this.settled=0;this.failedCount=0;this.progressOmitted=false;this.progressState='running';this.accepting=true;this.failed=false;this.operation=this.session.beginOperation();this.schedule();}
 start(id:string,name:string){
  if(this.closed||!this.accepting||name.startsWith('a2ui_')||id.length>128||this.seen.has(id))return;
  if(this.seen.size>=1024){this.progressOmitted=true;this.omitted=true;this.schedule();return;}this.seen.add(id);
  if(this.active.size>=32){this.progressOmitted=true;this.omitted=true;this.append('[active tool limit; output omitted]\n');return;}
  this.active.set(id,{tail:'',length:0});this.started++;this.state='running';this.append('['+name.slice(0,64)+']\n');
 }
 update(id:string,result:unknown,final=false){if(this.closed||!this.accepting||!this.active.has(id))return;const next=snapshot(result,this.active.get(id),final);this.active.set(id,next.window);this.omitted ||= next.omitted;if(next.changed)this.append('\n[output snapshot replaced]\n');if(next.delta)this.append(next.delta);}
 end(id:string,result:unknown,isError:boolean){if(this.closed||!this.accepting||!this.active.has(id))return;this.update(id,result,true);this.active.delete(id);this.settled++;if(isError)this.failedCount++;this.failed ||= isError;this.state=this.active.size?'running':this.failed?'error':'completed';this.schedule();}
 finishRun(outcome?:'error'|'interrupted'){if(this.closed)return;this.accepting=false;this.progressState=outcome??(this.active.size?'interrupted':this.failed?'error':'completed');if(outcome)this.state=outcome;else if(this.active.size)this.state='interrupted';this.active.clear();this.schedule();}
 refresh(){this.schedule();}
 private append(value:string){const next=trimLog(this.text+value);this.text=next.text;this.omitted ||= next.omitted;this.schedule();}
 private schedule(){if(this.closed||this.timer)return;this.timer=setTimeout(()=>{this.timer=undefined;this.lastAt=Date.now();try{this.session.updateLog(this.text,this.state,this.omitted,this.operation,{stream:'tools',state:this.progressState,started:this.started,settled:this.settled,failed:this.failedCount,omitted:this.progressOmitted});}catch{/* Disabled, replaced or closed ownership cannot publish. */}},Math.max(0,this.lastAt+100-Date.now()));this.timer.unref?.();}
 close(){this.closed=true;this.accepting=false;this.active.clear();this.seen.clear();clearTimeout(this.timer);this.timer=undefined;}
}
