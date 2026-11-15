import test from 'node:test';
import assert from 'node:assert/strict';
import {MODEL,RequestBudget} from './benchmark-model/guards.ts';
test('BM4 cost canary: second real transport invocation must not escape one-request fixture budget',async()=>{
 const budget=new RequestBudget(1);let transports=0;
 const request=async()=>{budget.admit(MODEL.baseUrl+'/chat/completions',MODEL);transports++;return new Response('synthetic actual transport response');};
 assert.equal((await request()).status,200);assert.equal(transports,1);
 await assert.rejects(request,/request budget/);
 assert.equal(transports,1,'second actual synthetic transport was never invoked');
});
