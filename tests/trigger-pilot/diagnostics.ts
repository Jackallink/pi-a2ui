// Private diagnostic metadata only. Never retain stream payloads or headers here.
import {createHash} from 'node:crypto';
import {redact} from '../benchmark-model/guards.ts';

export function safeError(source:string,error:unknown,secrets:string[]):any{
 const raw=error instanceof Error?error.message:typeof error==='string'?error:'unknown error';
 const name=error instanceof Error&&['Error','TypeError','AbortError','TimeoutError'].includes(error.name)?error.name:'Error';
 const fingerprint=createHash('sha256').update(raw).digest('hex');
 const embedded=/(?:headers?|body|messages?|reasoning(?:_content)?|thinking|推理内容|(?:access_)?token|authorization|api[_-]?key)["'\s]*[:=]/i.test(raw);
 const scrubbed=embedded?'[embedded payload omitted]':redact(raw,secrets).replace(/\b[a-z][a-z0-9+.-]*:[^\s<>"']+/gi,'[URL omitted]');
 let message='';for(const char of scrubbed){if(Buffer.byteLength(message+char)>1024)break;message+=char;}
 return{source,name,message,fingerprint};
}
export function recordError(entry:any,source:string,error:unknown,secrets:string[]):void{
 if(entry.errors.length<4)entry.errors.push(safeError(source,error,secrets));
}
const count=(value:unknown)=>Number.isSafeInteger(value)&&(value as number)>=0?value:null;
export const completeUsage=(value:any):boolean=>!!value&&['prompt_tokens','completion_tokens','total_tokens'].every(key=>count(value[key])!==null);

export function observeResponse(response:Response,entry:any,secrets:string[],onError:()=>void=()=>{}):Response{
 entry.status=response.status;entry.streamState='streaming';
 if(!response.body){entry.streamState='error';recordError(entry,'stream',new Error('response has no stream'),secrets);onError();throw new Error('pilot missing response stream');}
 const reader=response.body.getReader(),decoder=new TextDecoder();let pending='';
 const line=(text:string)=>{
  if(!text.startsWith('data:'))return;const value=text.slice(5).trim();if(value==='[DONE]'){entry.doneObserved=true;return;}
  let data:any;try{data=JSON.parse(value);}catch{return;}
  if(!data||typeof data!=='object')return;
  if(data.usage&&typeof data.usage==='object')entry.usage={prompt_tokens:count(data.usage.prompt_tokens),completion_tokens:count(data.usage.completion_tokens),total_tokens:count(data.usage.total_tokens),reasoning_tokens:count(data.usage.completion_tokens_details?.reasoning_tokens)};
  if(data.error)entry.sseErrorObserved=true;
  if(Array.isArray(data.choices))for(const choice of data.choices){const reason=choice?.finish_reason;if(typeof reason==='string'&&entry.finishReasons.length<4){const safe=['stop','length','tool_calls','function_call','content_filter'].includes(reason)?reason:'other';if(!entry.finishReasons.includes(safe))entry.finishReasons.push(safe);}}
 };
 const observed=new ReadableStream<Uint8Array>({
  async pull(controller){
   try{
    const next=await reader.read();if(entry.streamState==='cancelled')return;
    if(next.done){pending+=decoder.decode();if(pending)line(pending);entry.streamState='eof';reader.releaseLock();controller.close();return;}
    entry.bytes+=next.value.byteLength;if(entry.bytes>1024*1024)throw new Error('pilot response exceeds 1MiB');
    pending+=decoder.decode(next.value,{stream:true});const lines=pending.split('\n');pending=lines.pop()!;for(const text of lines)line(text);
    // Update metadata before forwarding. Consumer cancellation must not erase it.
    controller.enqueue(next.value);
   }catch(error){entry.streamState='error';recordError(entry,'stream',error,secrets);onError();controller.error(new Error('pilot stream read failed'));try{await reader.cancel();}catch{}reader.releaseLock();}
  },
  async cancel(reason){entry.streamState='cancelled';try{await reader.cancel(reason);}catch(error){recordError(entry,'cancel',error,secrets);}finally{reader.releaseLock();}},
 },{highWaterMark:0});
 return new Response(observed,{status:response.status,statusText:response.statusText,headers:response.headers});
}
