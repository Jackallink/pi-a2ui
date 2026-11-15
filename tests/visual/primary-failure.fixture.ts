import{test as base}from'@playwright/test';
import assert from'node:assert/strict';
import{UiSession}from'../../src/session.ts';
import{startServer}from'../../src/server.ts';
import{cleanupCanvas}from'../golden/cleanup.ts';
import{primaryFailure}from'./evidence.ts';
const test=base.extend<{owned:void}>({owned:[async({},use,info)=>{
 const session=new UiSession(()=>{});const server=await startServer(session);
 try{await use();}
 finally{
  const primary=primaryFailure(info,undefined);
  try{await cleanupCanvas({close:async()=>{throw new Error('owned teardown fault');}},server,session,primary);}
  catch(error){
   let serverClosed=false;try{await fetch(server.origin,{signal:AbortSignal.timeout(1000)});}catch(failure){serverClosed=(failure as Error).cause!==undefined&&((failure as Error).cause as{code?:string}).code==='ECONNREFUSED';}
   console.log('BM3_PRIMARY_CANARY '+JSON.stringify({status:info.status,actualError:info.errors[0]?.message,primary,serverClosed,sessionClosed:session.closed,cleanup:String(error)}));throw error;
  }finally{await server.close();session.close();}
 }
},{auto:true,timeout:5000}]});
test('intentional owned primary assertion plus teardown fault',()=>{assert.fail('owned original assertion');});
