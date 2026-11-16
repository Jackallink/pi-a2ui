import {test} from 'node:test';
import assert from 'node:assert/strict';
import {observeResponse,safeError} from './trigger-pilot/diagnostics.ts';

const bytes=(value:unknown)=>new TextEncoder().encode('data: '+JSON.stringify(value)+'\r\n\r\n');
const usage={prompt_tokens:10,completion_tokens:2,total_tokens:12};
const entry=():any=>({request:1,status:null,usage:null,streamState:'pending',bytes:0,finishReasons:[],doneObserved:false,errors:[]});

test('TPD03 usage survives consumer cancellation before EOF without draining the source',async()=>{
 let pulls=0,cancelled=false;const d=entry();
 const source=new ReadableStream<Uint8Array>({pull(c){pulls++;c.enqueue(bytes({choices:[{finish_reason:'tool_calls'}],usage}));},cancel(){cancelled=true;}},{highWaterMark:0});
 const reader=observeResponse(new Response(source),d,[]).body!.getReader();await reader.read();await reader.cancel();
 assert.deepEqual(d.usage,{...usage,reasoning_tokens:null});assert.equal(d.streamState,'cancelled');assert.equal(d.status,200);assert.deepEqual(d.finishReasons,['tool_calls']);assert.equal(d.doneObserved,false);assert.equal(cancelled,true);assert.equal(pulls,1);
});

test('TPD04 fragmented UTF8 and CRLF SSE preserves safe usage through EOF without raw payload',async()=>{
 const d=entry(),all=new TextEncoder().encode('data: '+JSON.stringify({choices:[{delta:{reasoning_content:'绝不进入诊断DO-NOT-PERSIST'}}],usage:{...usage,completion_tokens_details:{reasoning_tokens:1}}})+'\r\n\r\ndata: [DONE]\r\n');let offset=0;
 const response=new Response(new ReadableStream<Uint8Array>({pull(c){if(offset===all.length){c.close();return;}c.enqueue(all.slice(offset,++offset));}},{highWaterMark:0}));
 await observeResponse(response,d,[]).arrayBuffer();assert.deepEqual(d.usage,{...usage,reasoning_tokens:1});assert.equal(d.streamState,'eof');assert.equal(d.doneObserved,true);assert.equal(d.bytes,all.length);assert.ok(!JSON.stringify(d).includes('DO-NOT-PERSIST'));
});

test('TPD05 missing invalid and repeated usage is not fabricated or added',async()=>{
 for(const [frames,expected]of [
  [[{choices:[]}],null],
  [[{usage:{prompt_tokens:-1,completion_tokens:'2',total_tokens:NaN}}],{prompt_tokens:null,completion_tokens:null,total_tokens:null,reasoning_tokens:null}],
  [[{usage},{usage:{prompt_tokens:11}}],{prompt_tokens:11,completion_tokens:null,total_tokens:null,reasoning_tokens:null}],
 ]as const){const d=entry();await observeResponse(new Response(new Blob(frames.map(frame=>bytes(frame)))),d,[]).arrayBuffer();assert.deepEqual(d.usage,expected);}
});

test('TPD06 usage and bounded errors survive stream error or timeout; response limit holds',async()=>{
 for(const name of ['Error','TimeoutError']){
  const d=entry();let turn=0;const response=new Response(new ReadableStream<Uint8Array>({pull(c){if(turn++===0)c.enqueue(bytes({usage}));else c.error(Object.assign(new Error('synthetic interruption Bearer private-key https://example.com/private?token=hidden'),{name}));}},{highWaterMark:0}));
  const reader=observeResponse(response,d,['private-key']).body!.getReader();await reader.read();await assert.rejects(reader.read());assert.deepEqual(d.usage,{...usage,reasoning_tokens:null});assert.equal(d.streamState,'error');assert.equal(d.errors[0].name,name);const safe=JSON.stringify(d);assert.ok(!safe.includes('private-key'));assert.ok(!safe.includes('example.com'));assert.ok(!safe.includes('hidden'));
 }
 const d=entry(),source=new Response(new Uint8Array(1024*1024+1));await assert.rejects(observeResponse(source,d,[]).arrayBuffer());assert.equal(d.streamState,'error');assert.ok(d.errors.length>0);
});

test('TPD09 error diagnostics omit embedded payload and bound redacted multibyte messages',()=>{
 const payload='sdk failure headers: {Authorization: "Bearer secret-one"}; body: {messages: [{reasoning_content:"PRIVATE_THOUGHT"}]}; https://example.com/?token=secret-two';
 const omitted=safeError('sdk',new Error(payload),['secret-one','secret-two']);assert.equal(omitted.message,'[embedded payload omitted]');assert.match(omitted.fingerprint,/^[a-f0-9]{64}$/);assert.ok(!JSON.stringify(omitted).includes('PRIVATE_THOUGHT'));
 for(const value of ['{"token":"UNLISTED_SECRET"}','authorization = "UNLISTED_SECRET"','api_key: UNLISTED_SECRET'])assert.ok(!JSON.stringify(safeError('sdk',value,[])).includes('UNLISTED_SECRET'));
 const bounded=safeError('sdk',new Error('超时 '.repeat(1500)+' token=secret-two Bearer secret-one https://example.com/'),['secret-one','secret-two']);assert.ok(Buffer.byteLength(bounded.message)<=1024);assert.ok(!JSON.stringify(bounded).includes('secret-one'));assert.ok(!JSON.stringify(bounded).includes('secret-two'));assert.ok(!JSON.stringify(bounded).includes('example.com'));assert.ok(!bounded.message.includes('\uFFFD'));
});
