// Offline evidence only: transparent observation of the actual Node spawn boundary.
import assert from 'node:assert/strict';
import childProcess from 'node:child_process';
import {syncBuiltinESMExports} from 'node:module';
import {writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

export function observeOwnedProcesses(cwd:string,file:string){
 assert.match(process.version,/^v24\./);
 const state={version:'owned-process-witness-v1',file,cwd,workerPid:process.pid,spawnAttempts:0,childrenWithPid:0,entries:[] as Array<{index:number;pid:number|null;commandSHA256:string;shellCommandSHA256:string|null}>};
 const save=(first=false)=>writeFileSync(file,JSON.stringify(state)+'\n',{mode:0o600,flag:first?'wx':'w'});save(true);
 const original=childProcess.spawn;
 const observed=((...input:any[])=>{
  const options=Array.isArray(input[1])?input[2]:input[1];
  if(options?.cwd!==cwd)return Reflect.apply(original,childProcess,input);
  const shellArgs=Array.isArray(input[1])?input[1]:[],position=shellArgs.indexOf('-c');
  const shellCommand=position>=0&&typeof shellArgs[position+1]==='string'?shellArgs[position+1]:undefined;
  const entry={shellCommandSHA256:shellCommand===undefined?null:createHash('sha256').update(shellCommand).digest('hex'),index:++state.spawnAttempts,pid:null as number|null,commandSHA256:createHash('sha256').update(JSON.stringify([input[0],Array.isArray(input[1])?input[1]:[]])).digest('hex')};
  state.entries.push(entry);save();
  const child=Reflect.apply(original,childProcess,input);
  if(typeof child.pid==='number'){entry.pid=child.pid;state.childrenWithPid++;}save();return child;
 }) as typeof childProcess.spawn;
 childProcess.spawn=observed;syncBuiltinESMExports();let restored=false;
 return{snapshot:()=>structuredClone(state),restore(){if(restored)return;assert.equal(childProcess.spawn,observed,'process witness ownership');childProcess.spawn=original;syncBuiltinESMExports();restored=true;}};
}
