// Isolated harness fault: patch only the CLI spawn, never a product validator or registry operation.
import childProcess from 'node:child_process';
import { syncBuiltinESMExports } from 'node:module';
import assert from 'node:assert/strict';
import { evaluateCompiler } from './compiler.ts';
import { loadCases } from './registry.ts';
const original=childProcess.spawn;
let owned:ReturnType<typeof original>|undefined,forcedByCanary=false,exitSignal:NodeJS.Signals|null=null;
childProcess.spawn=((command:string,args:string[],options:Parameters<typeof original>[2])=>{
 if(args[0]!=='skills/pi-a2ui/scripts/a2ui.mjs')return original(command,args,options);
 owned=original(process.execPath,['-e','process.on("SIGTERM",()=>{});process.stdout.write("x".repeat(1048577));setInterval(()=>{},1000)'],options);
 owned.once('exit',(_code,signal)=>{exitSignal=signal;});return owned;
}) as typeof original;
syncBuiltinESMExports();
const stop=setTimeout(()=>{forcedByCanary=true;owned?.kill('SIGKILL');},6000);
try{
 const result=await evaluateCompiler(loadCases().find(row=>row.id==='C30')!);
 assert.equal(result.pass,false);assert.equal(result.failedStage,'setup');assert.match(result.detail??'',/CLI output budget/);
 assert.equal(forcedByCanary,false,'wrapper must terminate before independent safety cleanup');assert.equal(exitSignal,'SIGKILL','TERM-resistant owned child requires escalation');
 console.log('CLI output fault canary passed: original failure retained, owned child SIGKILL/close before6s');
}finally{clearTimeout(stop);owned?.kill('SIGKILL');childProcess.spawn=original;syncBuiltinESMExports();}
