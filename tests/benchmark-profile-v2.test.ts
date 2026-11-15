import test from 'node:test';
import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const exec=promisify(execFile);
test('v2 public dry-run identifies the new handoff policy without credential/model access',async()=>{
 const {stdout}=await exec(process.execPath,['scripts/benchmark-model.mjs'],{env:{...process.env,PI_CODING_AGENT_DIR:'/nonexistent/AUTH_CANARY'},timeout:10000});const report=JSON.parse(stdout);
 assert.equal(report.providerRequests,0);assert.equal(report.credentialReads,0);assert.equal(report.profile,'v0.1.9-glm-first-v2');assert.equal(report.handoffPolicy,'compiled-surface-identity');
});
test('v2 summary separates byte fidelity, attempted legality and full compiled identity',async()=>{
 const path='../scripts/benchmark-model.mjs';const {summarize}=await import(path);const result=summarize([{id:'M01',started:true,requests:3,knownAdmittedRequests:3,compileValid:true,rendered:true,intentPass:true,interactionPass:true,handoff:{byteIdentical:false,checkedCompileValid:true,attemptedCompileValid:true,compiledSurfaceEqual:true,reason:'accepted'}}],true);
 assert.equal(result.actualModelRequests,0);assert.deepEqual(result.handoff,{observed:1,byteIdentical:0,attemptedCompileValid:1,compiledSurfaceEqual:1,candidateCompileRejected:0,compilerUnknown:0});
});
