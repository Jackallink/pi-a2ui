import {constants} from 'node:fs';
import {lstat,open,realpath,type FileHandle} from 'node:fs/promises';
import {resolve,relative,basename,isAbsolute,sep} from 'node:path';
import {randomBytes} from 'node:crypto';
import type {IncomingMessage,ServerResponse} from 'node:http';
import {UiError} from './protocol.ts';
export type ArtifactKind='image'|'video'|'audio';
export interface ArtifactMeta{artifactId:string;src:string;kind:ArtifactKind;mime:string;size:number;name:string}
interface Artifact{meta:ArtifactMeta;bytes:Buffer}
interface Pending{bytes:number;generation:number}
const caps={image:10*1024*1024,video:64*1024*1024,audio:64*1024*1024};
function classify(bytes:Buffer):{kind:ArtifactKind;mime:string}|undefined{
 if(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return{kind:'image',mime:'image/png'};
 if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return{kind:'image',mime:'image/jpeg'};
 if(bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP')return{kind:'image',mime:'image/webp'};
 if(bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WAVE')return{kind:'audio',mime:'audio/wav'};
 if(bytes.subarray(0,4).equals(Buffer.from([26,69,223,163])))return{kind:'video',mime:'video/webm'};
 if(bytes.toString('ascii',4,8)==='ftyp')return{kind:'video',mime:'video/mp4'};
}
export class ArtifactStore{
 private entries=new Map<string,Artifact>();private pending=new Set<Pending>();private responses=new Map<ServerResponse,string>();private generation=0;private stopped=false;
 constructor(private root=process.cwd()){}
 private alive(pending:Pending,signal?:AbortSignal){if(this.stopped||pending.generation!==this.generation||signal?.aborted)throw new UiError(409,'Artifact registration cancelled');}
 async register(path:string,kind:ArtifactKind,signal?:AbortSignal,root=this.root):Promise<ArtifactMeta>{
  if(this.stopped)throw new UiError(503,'Artifact store closed');
  if(!Object.hasOwn(caps,kind)||typeof path!=='string'||path.length>4096||isAbsolute(path)||/[\\\x00-\x1f\x7f:]/.test(path)||path.split('/').some(part=>!part||part==='.'||part==='..'))throw new UiError(400,'Expected a relative workspace artifact path');
  if(this.entries.size+this.pending.size>=16)throw new UiError(413,'Artifact count capacity reached');
  const reservation:Pending={bytes:0,generation:this.generation};this.pending.add(reservation);let handle:FileHandle|undefined;
  try{
   this.alive(reservation,signal);const base=await realpath(root);this.alive(reservation,signal);const full=resolve(base,path);const rel=relative(base,full);if(rel==='..'||rel.startsWith('..'+sep)||isAbsolute(rel))throw new UiError(400,'Artifact outside workspace');
   const segments=path.split('/');const observed=[];let current=base;
   for(let i=0;i<segments.length;i++){this.alive(reservation,signal);current=resolve(current,segments[i]);const stat=await lstat(current,{bigint:true});if(stat.isSymbolicLink()||(i===segments.length-1?!stat.isFile():!stat.isDirectory()))throw new UiError(400,'Artifact must be an ordinary file without symlinks');observed.push({path:current,stat});}
   this.alive(reservation,signal);handle=await open(full,constants.O_RDONLY|constants.O_NOFOLLOW|constants.O_NONBLOCK);this.alive(reservation,signal);const stat=await handle.stat({bigint:true});const source=observed.at(-1)!.stat;
   const same=(a:typeof stat,b:typeof stat)=>a.dev===b.dev&&a.ino===b.ino&&a.size===b.size&&a.mtimeNs===b.mtimeNs&&a.ctimeNs===b.ctimeNs;
   if(!stat.isFile()||!same(stat,source))throw new UiError(409,'Artifact changed during registration');
   if(stat.size<=0||stat.size>BigInt(caps[kind]))throw new UiError(413,'Artifact size capacity exceeded');const size=Number(stat.size);
   if([...this.entries.values()].reduce((n,a)=>n+a.meta.size,0)+[...this.pending].reduce((n,p)=>n+p.bytes,0)+size>128*1024*1024)throw new UiError(413,'Artifact byte capacity reached');reservation.bytes=size;
   this.alive(reservation,signal);const bytes=Buffer.allocUnsafe(size);let offset=0;
   while(offset<size){this.alive(reservation,signal);const read=await handle.read(bytes,offset,Math.min(65536,size-offset),offset);this.alive(reservation,signal);if(!read.bytesRead)throw new UiError(409,'Artifact changed during registration');offset+=read.bytesRead;}
   if(!same(stat,await handle.stat({bigint:true})))throw new UiError(409,'Artifact changed during registration');
   for(const item of observed){this.alive(reservation,signal);const after=await lstat(item.path,{bigint:true});if(after.isSymbolicLink()||after.dev!==item.stat.dev||after.ino!==item.stat.ino||(item===observed.at(-1)&&!same(after,stat)))throw new UiError(409,'Artifact path changed during registration');}
   if(await realpath(root)!==base)throw new UiError(409,'Workspace root changed during registration');this.alive(reservation,signal);
   const format=classify(bytes);if(!format||format.kind!==kind)throw new UiError(400,'Artifact signature does not match supported kind');
   // Close owned IO before committing so cleanup failure cannot leave a hidden capability.
   await handle.close();handle=undefined;this.alive(reservation,signal);const id=randomBytes(16).toString('hex');const meta:ArtifactMeta={artifactId:id,src:'/api/artifacts/'+id,kind,mime:format.mime,size,name:basename(full)};this.entries.set(id,{meta,bytes});return{...meta};
  }catch(error){if(error instanceof UiError)throw error;throw new UiError(400,'Artifact could not be registered');}
  finally{try{await handle?.close().catch(()=>{});}finally{this.pending.delete(reservation);}}
 }
 revoke(id:string){this.entries.delete(id);for(const [res,current]of this.responses)if(current===id)res.destroy();}
 reset(root=this.root){this.generation++;this.root=root;this.entries.clear();for(const res of this.responses.keys())res.destroy();}
 close(){this.stopped=true;this.reset();}
 async serve(id:string,req:IncomingMessage,res:ServerResponse):Promise<void>{
  const item=this.entries.get(id);if(!item||this.stopped)throw new UiError(404,'Artifact unavailable');
  if(req.method!=='HEAD'&&this.responses.size>=2)throw new UiError(429,'Artifact responses busy');
  res.setHeader('content-type',item.meta.mime);res.setHeader('content-length',item.meta.size);res.setHeader('content-disposition','inline; filename="artifact"');res.setHeader('x-a2ui-artifact-name',encodeURIComponent(item.meta.name));res.setHeader('x-content-type-options','nosniff');res.setHeader('cache-control','no-store');
  if(req.method==='HEAD'){res.end();return;}
  this.responses.set(res,id);let timer:ReturnType<typeof setTimeout>|undefined;const arm=()=>{clearTimeout(timer);timer=setTimeout(()=>res.destroy(),15000);timer.unref();};const closed=()=>{clearTimeout(timer);this.responses.delete(res);};res.once('close',closed);arm();
  try{for(let offset=0;offset<item.bytes.length&&!res.destroyed;offset+=65536){const chunk=item.bytes.subarray(offset,Math.min(offset+65536,item.bytes.length));if(!res.write(chunk))await new Promise<void>(resolve=>{const done=()=>{res.off('drain',done);res.off('close',done);res.off('error',done);resolve();};res.once('drain',done);res.once('close',done);res.once('error',done);});if(!res.destroyed)arm();}if(!res.destroyed)res.end();}catch{res.destroy();}
  // Slots and old response references remain charged until actual response close.
 }
}
