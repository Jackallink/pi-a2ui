import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { compileInOwnedWorker } from './worker.ts';
import { assertIntent } from './oracles.ts';
import { caseResult, fixtureBytes, type CaseResult, type GoldenCase } from './registry.ts';

async function cliCheck(source:string,signal:AbortSignal):Promise<{code:number|null;stdout:string;stderr:string}> {
  return new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,['skills/pi-a2ui/scripts/a2ui.mjs','check','--surface-id','golden','-'],{stdio:['pipe','pipe','pipe']});
    let stdout='',stderr='',failure:Error|undefined;
    let terminating=false;
    let force:ReturnType<typeof setTimeout>|undefined;
    const cancel=(reason=new Error('Actual CLI deadline/case cancellation'))=>{failure??=reason;if(terminating)return;terminating=true;child.kill('SIGTERM');force=setTimeout(()=>child.kill('SIGKILL'),2000);};
    const aborted=()=>cancel();
    const deadline=setTimeout(cancel,10000);signal.addEventListener('abort',aborted,{once:true});
    child.stdout.setEncoding('utf8');child.stderr.setEncoding('utf8');
    const append=(current:string,chunk:string)=>{if(terminating)return current;if(Buffer.byteLength(current)+Buffer.byteLength(chunk)>1024*1024){cancel(new Error('CLI output budget'));return current;}return current+chunk;};
    child.stdout.on('data',chunk=>{stdout=append(stdout,chunk);});child.stderr.on('data',chunk=>{stderr=append(stderr,chunk);});
    child.once('error',error=>cancel(error));
    child.once('close',code=>{clearTimeout(deadline);clearTimeout(force);signal.removeEventListener('abort',aborted);if(failure)reject(failure);else resolve({code,stdout,stderr});});
    child.stdin.on('error',error=>cancel(error));child.stdin.end(source);if(signal.aborted)cancel();
  });
}
export async function evaluateCompiler(row:GoldenCase,sourceOverride?:string):Promise<CaseResult> {
  const signal=AbortSignal.timeout(30000);
  let source=sourceOverride??'';
  try { source=sourceOverride??fixtureBytes(row.fixture).toString('utf8'); }
  catch(error){return caseResult(row,source,{pass:false,failedStage:'setup',detail:String(error)});}
  try {
    if(row.controlFixture){const control=await compileInOwnedWorker(fixtureBytes(row.controlFixture).toString('utf8'),signal);assert.equal(control.kind,'accepted','complete positive control must compile');}
    const observation=await compileInOwnedWorker(source,signal);
    if(observation.kind==='setup-error'||observation.kind==='timeout')return caseResult(row,source,{pass:false,failedStage:'setup',detail:observation.detail,observation});
    try {
      if(row.polarity==='positive')assert.equal(observation.kind,'accepted','positive must compile');
      else {
        assert.equal(observation.kind,'ui-error','expected product rejection');
        if(observation.kind==='ui-error'){
          assert.equal(observation.status,row.expected.status);assert.ok(observation.reason.includes(row.expected.reasonIncludes!),`wrong rejection family: ${observation.reason}`);
          for(const [key,value]of Object.entries(row.expected.diagnostic??{}))assert.equal((observation.diagnostic as Record<string,string>|undefined)?.[key],value,`diagnostic ${key}`);
        }
      }
    }catch(error){return caseResult(row,source,{pass:false,failedStage:'compile',detail:String(error),observation});}
    const cli=await cliCheck(source,signal);
    try {
      if(row.polarity==='positive'){assert.equal(cli.code,0);assert.equal(cli.stderr,'');assert.deepEqual(JSON.parse(cli.stdout),{surfaceId:'golden',source});}
      else{assert.equal(cli.code,1);assert.equal(cli.stdout,'');const error=JSON.parse(cli.stderr);assert.equal(error.code,'COMPILE');assert.ok(JSON.stringify(error).includes(row.expected.reasonIncludes!));}
    }catch(error){return caseResult(row,source,{pass:false,failedStage:'compile',detail:`CLI parity: ${String(error)}`});}
    if(observation.kind==='accepted')try{assertIntent(row,observation.message);}catch(error){return caseResult(row,source,{pass:false,failedStage:'semantic',detail:String(error),observation});}
    return caseResult(row,source,{pass:true,failedStage:null,observation});
  }catch(error){return caseResult(row,source,{pass:false,failedStage:'setup',detail:String(error)});}
}
