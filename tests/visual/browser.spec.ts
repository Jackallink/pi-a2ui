import {test as base,expect,type Locator}from'@playwright/test';
import assert from'node:assert/strict';
import{readFileSync}from'node:fs';
import{UiSession}from'../../src/session.ts';
import{startServer}from'../../src/server.ts';
import{cleanupCanvas}from'../golden/cleanup.ts';
import{layoutFaults,type LayoutObservation,type Subject}from'./layout.ts';
const search=readFileSync('tests/visual/fixtures/search.express','utf8');
type Canvas={session:UiSession;origin:string;sent:string[]};
const test=base.extend<{canvas:Canvas}>({canvas:[async({page},use,info)=>{
 const sent:string[]=[];const session=new UiSession(text=>{sent.push(text);});let server:Awaited<ReturnType<typeof startServer>>|undefined;
 try{session.render('workbench',search);server=await startServer(session);const token=new URLSearchParams(new URL(server.openUrl).hash.slice(1)).get('token');
  expect((await page.request.post(server.origin+'/api/connect',{headers:{origin:server.origin},data:{token},timeout:5000})).status()).toBe(200);
  await use({session,origin:server.origin,sent});
 }finally{await cleanupCanvas(page,server,session,{status:info.status});}
},{timeout:5000}]});
test.use({launchOptions:{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH},viewport:{width:1280,height:900},deviceScaleFactor:1,colorScheme:'light',locale:'en-US',timezoneId:'UTC',reducedMotion:'reduce',actionTimeout:5000,navigationTimeout:5000});test.setTimeout(30000);test.describe.configure({retries:0});
async function subject(locator:Locator,control:boolean):Promise<Subject>{
 const rect=await locator.boundingBox();const visible=await locator.isVisible();
 const hit=!control?null:await locator.evaluate(node=>{
  const box=node.getBoundingClientRect(),x=box.x+box.width/2,y=box.y+box.height/2;
  let hit=document.elementFromPoint(x,y);
  while(hit?.shadowRoot){const next=hit.shadowRoot.elementFromPoint(x,y);if(!next||next===hit)break;hit=next;}
  return hit===node||node.contains(hit);
 });return{rect,visible,hit};
}
async function searchObservation(query:Locator,button:Locator):Promise<LayoutObservation>{return{viewport:{width:1280,height:900},subjects:{query:await subject(query,true),search:await subject(button,true)}};}
test('BM3 actual CSS overlap must be detected after independent real fault preconditions',async({page,canvas})=>{
 await page.goto(canvas.origin);const region=page.getByRole('region',{name:'Canvas workbench'});const query=region.getByRole('textbox');const button=page.getByRole('button',{name:'Search',exact:true});
 await expect(query).toBeVisible();await query.click({trial:true});
 const normal=await searchObservation(query,button);assert.equal(normal.subjects.query.hit,true);assert.deepEqual(layoutFaults(normal,[['query','search']]),[]);
 const box=normal.subjects.query.rect!;const original=await button.getAttribute('style');
 try{
  await button.evaluate((node,box)=>Object.assign((node as HTMLElement).style,{position:'fixed',left:box.x+'px',top:box.y+'px',width:box.width+'px',height:box.height+'px',margin:'0',zIndex:'2147483647'}),box);
  const observed=await searchObservation(query,button);const first=observed.subjects.query.rect!,second=observed.subjects.search.rect!;
  assert.ok(Math.min(first.x+first.width,second.x+second.width)-Math.max(first.x,second.x)>10);
  assert.ok(Math.min(first.y+first.height,second.y+second.height)-Math.max(first.y,second.y)>10);
  assert.equal(observed.subjects.query.hit,false,'actual Query center is covered');
  await assert.rejects(query.click({trial:true,timeout:500}),/intercepts pointer events/);
  const faults=layoutFaults(observed,[['query','search']]);assert.ok(faults.includes('overlap:query/search'),'detector must report actual overlap');assert.ok(faults.includes('occluded:query'));
 }finally{await button.evaluate((node,original)=>{if(original===null)node.removeAttribute('style');else node.setAttribute('style',original);},original);}
 assert.deepEqual(layoutFaults(await searchObservation(query,button),[['query','search']]),[]);await query.click({trial:true});expect(canvas.sent).toEqual([]);
});
