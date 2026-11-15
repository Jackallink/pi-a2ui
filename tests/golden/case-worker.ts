import { compile } from '../../src/compiler.ts';
import { UiError } from '../../src/protocol.ts';
import { runSessionCase } from './session.ts';
import type { WorkerObservation } from './worker.ts';

const controller=new AbortController();
process.on('message',input=>{if(input&&typeof input==='object'&&'kind'in input&&input.kind==='cancel')controller.abort();});
process.once('message', async(input:unknown)=>{
  let result:WorkerObservation;
  try {
    if(process.versions.node.split('.')[0]!=='24')throw new Error('Node24 worker required');
    if(!input||typeof input!=='object'||!('kind'in input))throw new Error('Invalid fixed worker request');
    if(input.kind==='compile'&&'source'in input&&typeof input.source==='string'&&Buffer.byteLength(input.source)<=32768)result={kind:'accepted',message:compile('golden',input.source)};
    else if(input.kind==='session'&&'caseId'in input&&typeof input.caseId==='string'&&/^S(0[1-9]|1[0-5])$/.test(input.caseId)&&'ownedRoot'in input&&typeof input.ownedRoot==='string'&&'fixture'in input&&typeof input.fixture==='string'&&Buffer.byteLength(input.fixture)<=256*1024)result=await runSessionCase(input.caseId,input.ownedRoot,controller.signal,input.fixture);
    else throw new Error('Invalid fixed worker operation');
  }catch(error){result=error instanceof UiError?{kind:'ui-error',status:error.status,reason:error.reason,diagnostic:error.diagnostic}:{kind:'setup-error',detail:error instanceof Error?error.message:String(error)};}
  process.send!(result,()=>process.disconnect());
});
