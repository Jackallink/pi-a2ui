import{test as base,expect,type Locator,type Page}from'@playwright/test';
import assert from'node:assert/strict';
import{readFileSync}from'node:fs';
import{UiSession}from'../../src/session.ts';
import{startServer}from'../../src/server.ts';
import{cleanupCanvas}from'../golden/cleanup.ts';
import{forwardedPayload}from'../golden/oracles.ts';
import{layoutFaults,type LayoutObservation,type Subject,type Pair}from'./layout.ts';
import{capture,writeEvidence,primaryFailure,waitFontsReady,type StateEvidence}from'./evidence.ts';
const source=(name:string)=>readFileSync('tests/visual/fixtures/'+name+'.express','utf8');
const states:StateEvidence[]=[],actions:unknown[]=[],cleanupFailures:unknown[]=[],testFailures:unknown[]=[];
const checks={flow:false,faultCanary:false,modalControl:false,missingSubject:false};
type Canvas={session:UiSession;origin:string;sent:string[];enableFlow():void};
const test=base.extend<{canvas:Canvas}>({canvas:[async({page},use,info)=>{
 const sent:string[]=[];let flow=false;
 const session=new UiSession(text=>{
  sent.push(text);if(!flow)return;const payload=forwardedPayload(text);
  if(payload.event==='search'){assert.deepEqual(payload.context,{query:'example'});session.render('workbench',source('audit'));}
  else if(payload.event==='back'){assert.deepEqual(payload.context,{});session.render('workbench',source('search'));}
  else assert.fail('Unknown fixed application action');
 });let server:Awaited<ReturnType<typeof startServer>>|undefined,primary:unknown;
 try{session.render('workbench',source('search'));server=await startServer(session);const token=new URLSearchParams(new URL(server.openUrl).hash.slice(1)).get('token');
  expect((await page.request.post(server.origin+'/api/connect',{headers:{origin:server.origin},data:{token},timeout:5000})).status()).toBe(200);
  await use({session,origin:server.origin,sent,enableFlow:()=>{flow=true;}});
 }catch(error){primary=String(error).split('\n').slice(0,2).join('\n');throw error;}
 finally{const original=primaryFailure(info,primary);if(info.status!=='passed'||original.errors.length||original.setup)testFailures.push(original);try{await cleanupCanvas(page,server,session,original);}catch(error){cleanupFailures.push({primary:original,cleanup:String(error)});throw error;}}
},{timeout:5000}]});
test.use({launchOptions:{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH},viewport:{width:1280,height:900},deviceScaleFactor:1,colorScheme:'light',locale:'en-US',timezoneId:'UTC',reducedMotion:'reduce',actionTimeout:5000,navigationTimeout:5000});test.setTimeout(30000);test.describe.configure({retries:0});
test.afterAll(async()=>{await writeEvidence(states,checks,cleanupFailures,actions,testFailures);});
async function subject(locator:Locator,control:boolean):Promise<Subject>{
 const count=await locator.count();if(count===0)return{rect:null,visible:false,hit:control?false:null};assert.equal(count,1,'BM3 setup: subject must be unique');
 const rect=await locator.boundingBox(),visible=await locator.isVisible();
 const hit=!control||!rect?control?false:null:await locator.evaluate(node=>{
  const box=node.getBoundingClientRect(),x=box.x+box.width/2,y=box.y+box.height/2;let hit=document.elementFromPoint(x,y);
  while(hit?.shadowRoot){const next=hit.shadowRoot.elementFromPoint(x,y);if(!next||next===hit)break;hit=next;}
  return hit===node||node.contains(hit);
 });return{rect,visible,hit};
}
async function observe(page:Page,items:Record<string,[Locator,boolean]>):Promise<LayoutObservation>{
 await waitFontsReady(page);const subjects:Record<string,Subject>={};for(const[name,[locator,control]]of Object.entries(items))subjects[name]=await subject(locator,control);
 return{viewport:page.viewportSize()!,subjects};
}
const searchTargets=(page:Page)=>{const region=page.getByRole('region',{name:'Canvas workbench'});return{title:page.getByText('Search workspace',{exact:true}),query:region.getByRole('textbox'),search:page.getByRole('button',{name:'Search',exact:true})};};
const SEARCH_PAIRS:Pair[]=[['title','query'],['query','search'],['title','search']];
async function searchObservation(page:Page):Promise<LayoutObservation>{const target=searchTargets(page);return observe(page,{title:[target.title,false],query:[target.query,true],search:[target.search,true]});}
function contains(outer:Subject,inner:Subject):boolean{const a=outer.rect!,b=inner.rect!;return a.x<=b.x&&a.y<=b.y&&a.x+a.width>=b.x+b.width&&a.y+a.height>=b.y+b.height;}
function envelope(input:unknown,epoch:string,revision:number,event:string,component:string,context:unknown):void{
 const value=input as{epoch:string;revision:number;eventId:string;message:{version:string;action:{name:string;surfaceId:string;sourceComponentId:string;timestamp:string;context:unknown}}};
 assert.equal(value.epoch,epoch);assert.equal(value.revision,revision);assert.match(value.eventId,/^[A-Za-z0-9_-]{1,128}$/);assert.equal(value.message.version,'1.0');assert.ok(Number.isFinite(Date.parse(value.message.action.timestamp)));
 assert.deepEqual(value.message.action,{name:event,surfaceId:'workbench',sourceComponentId:component,timestamp:value.message.action.timestamp,context});
}
test('BM3 actual search audit return flow stays readable and locally operable',async({page,canvas,browser})=>{
 const posts:unknown[]=[],statuses:number[]=[];
 page.on('request',request=>{if(request.url()===canvas.origin+'/api/actions'&&request.method()==='POST')posts.push(request.postDataJSON());});
 page.on('response',response=>{if(response.url()===canvas.origin+'/api/actions'&&response.request().method()==='POST')statuses.push(response.status());});
 canvas.enableFlow();await page.goto(canvas.origin);await waitFontsReady(page);const initial=canvas.session.snapshot();const epoch=initial.epoch;
 await expect(searchTargets(page).title).toBeVisible();await expect(page.getByText('Query',{exact:true})).toBeVisible();await searchTargets(page).query.fill('example');
 await searchTargets(page).query.click({trial:true});await searchTargets(page).search.click({trial:true});let layout=await searchObservation(page);assert.deepEqual(layoutFaults(layout,SEARCH_PAIRS),[]);assert.ok(contains(await subject(page.getByRole('region',{name:'Canvas workbench'}),false),layout.subjects.query),'real canvas/Card ancestry contains Query');
 states.push(await capture(page,browser,'search',1,epoch,layout));
 let response=page.waitForResponse(response=>response.url()===canvas.origin+'/api/actions'&&response.request().method()==='POST',{timeout:5000});await searchTargets(page).search.click();expect((await response).status()).toBe(202);
 await expect(page.getByText('Audit results',{exact:true})).toBeVisible();await waitFontsReady(page);assert.equal(canvas.session.snapshot().surfaces[0].revision,2);assert.equal(canvas.session.snapshot().epoch,epoch);
 assert.equal(posts.length,1);assert.equal(canvas.sent.length,1);envelope(posts[0],epoch,1,'search','search',{query:'example'});assert.deepEqual(forwardedPayload(canvas.sent[0]),{epoch,revision:1,surfaceId:'workbench',event:'search',sourceComponentId:'search',context:{query:'example'}});
 const table=page.locator('pi-a2ui-data-table'),filter=page.getByRole('searchbox',{name:'Filter Reported findings'}),file=page.getByRole('button',{name:'File',exact:true}),status=page.getByRole('button',{name:'Status',exact:true}),back=page.getByRole('button',{name:'Back to search',exact:true});
 const files=()=>table.locator('tbody tr td:first-child').allTextContents(),ascending=['src/example.ts','src/other.ts'],descending=['src/other.ts','src/example.ts'];
 await filter.fill('src/example.ts');await expect.poll(files).toEqual(['src/example.ts']);await filter.fill('');await expect.poll(files).toEqual(ascending);
 for(const button of[file,status]){await button.click();await expect(button.locator('..')).toHaveAttribute('aria-sort','ascending');await expect.poll(files).toEqual(ascending);await button.click();await expect(button.locator('..')).toHaveAttribute('aria-sort','descending');await expect.poll(files).toEqual(descending);}
 await file.click();await expect(file.locator('..')).toHaveAttribute('aria-sort','ascending');await expect.poll(files).toEqual(ascending);assert.equal(posts.length,1);assert.equal(canvas.sent.length,1);
 await waitFontsReady(page);for(const control of[filter,file,status,back])await control.click({trial:true});layout=await observe(page,{title:[page.getByText('Audit results',{exact:true}),false],table:[table,false],filter:[filter,true],file:[file,true],status:[status,true],back:[back,true]});
 assert.deepEqual(layoutFaults(layout,[['title','table'],['table','back'],['title','back'],['file','status']]),[]);assert.ok(contains(layout.subjects.table,layout.subjects.file),'real header/table containment is legitimate');
 states.push(await capture(page,browser,'audit',2,epoch,layout));
 response=page.waitForResponse(response=>response.url()===canvas.origin+'/api/actions'&&response.request().method()==='POST',{timeout:5000});await back.click();expect((await response).status()).toBe(202);
 await expect(searchTargets(page).title).toBeVisible();await expect(searchTargets(page).query).toHaveValue('');assert.equal(canvas.session.snapshot().surfaces[0].revision,3);assert.equal(canvas.session.snapshot().epoch,epoch);
 assert.equal(posts.length,2);assert.deepEqual(statuses,[202,202]);assert.equal(canvas.sent.length,2);envelope(posts[1],epoch,2,'back','back',{});assert.notEqual((posts[0]as{eventId:string}).eventId,(posts[1]as{eventId:string}).eventId);
 assert.deepEqual(forwardedPayload(canvas.sent[1]),{epoch,revision:2,surfaceId:'workbench',event:'back',sourceComponentId:'back',context:{}});
 await waitFontsReady(page);await searchTargets(page).query.click({trial:true});await searchTargets(page).search.click({trial:true});layout=await searchObservation(page);assert.deepEqual(layoutFaults(layout,SEARCH_PAIRS),[]);states.push(await capture(page,browser,'return',3,epoch,layout));actions.push(...posts.map((request,index)=>({request,status:statuses[index],accepted:forwardedPayload(canvas.sent[index]),rawAccepted:canvas.sent[index]})));checks.flow=true;
});
test('BM3 actual CSS overlap must be detected after independent real fault preconditions',async({page,canvas})=>{
 await page.goto(canvas.origin);await waitFontsReady(page);const{query,search:button}=searchTargets(page);await expect(query).toBeVisible();await query.click({trial:true});
 const normal=await searchObservation(page);assert.equal(normal.subjects.query.hit,true);assert.deepEqual(layoutFaults(normal,SEARCH_PAIRS),[]);
 const box=normal.subjects.query.rect!,original=await button.getAttribute('style');
 try{await button.evaluate((node,box)=>Object.assign((node as HTMLElement).style,{position:'fixed',left:box.x+'px',top:box.y+'px',width:box.width+'px',height:box.height+'px',margin:'0',zIndex:'2147483647'}),box);
  const observed=await searchObservation(page),first=observed.subjects.query.rect!,second=observed.subjects.search.rect!;
  assert.ok(Math.min(first.x+first.width,second.x+second.width)-Math.max(first.x,second.x)>10);assert.ok(Math.min(first.y+first.height,second.y+second.height)-Math.max(first.y,second.y)>10);assert.equal(observed.subjects.query.hit,false);
  await assert.rejects(query.click({trial:true,timeout:500}),/intercepts pointer events/);const faults=layoutFaults(observed,SEARCH_PAIRS);assert.ok(faults.includes('overlap:query/search'));assert.ok(faults.includes('occluded:query'));
 }finally{await button.evaluate((node,original)=>{if(original===null)node.removeAttribute('style');else node.setAttribute('style',original);},original);}
 assert.deepEqual(layoutFaults(await searchObservation(page),SEARCH_PAIRS),[]);await query.click({trial:true});expect(canvas.sent).toEqual([]);checks.faultCanary=true;
});
test('BM3 actual missing subject is setup failure and restored control passes',async({page,canvas})=>{
 await page.goto(canvas.origin);await waitFontsReady(page);await expect(searchTargets(page).search).toBeVisible();assert.deepEqual(layoutFaults(await searchObservation(page),SEARCH_PAIRS),[]);
 await searchTargets(page).search.evaluate(node=>node.remove());await expect(searchTargets(page).search).toHaveCount(0);
 const missing=await searchObservation(page);assert.equal(missing.subjects.search.rect,null);assert.throws(()=>layoutFaults(missing,SEARCH_PAIRS),/BM3 setup: missing\/invalid geometry search/);
 canvas.session.render('workbench',source('search'));await expect(searchTargets(page).search).toBeVisible();assert.deepEqual(layoutFaults(await searchObservation(page),SEARCH_PAIRS),[]);expect(canvas.sent).toEqual([]);checks.missingSubject=true;
});
test('BM3 legitimate nested native Modal keeps only active controls operable locally',async({page,canvas})=>{
 let starts=0;page.on('request',request=>{if(request.url()===canvas.origin+'/api/actions')starts++;});canvas.session.render('workbench',source('modal'));await page.goto(canvas.origin);await waitFontsReady(page);
 const trigger=page.getByRole('button',{name:'Open details',exact:true});await trigger.click();const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();
 const close=dialog.getByRole('button',{name:'Close details',exact:true});const layout=await observe(page,{title:[dialog.getByText('Local details',{exact:true}),false],body:[dialog.getByText('Nested body',{exact:true}),false],close:[close,true]});
 assert.deepEqual(layoutFaults(layout,[['title','body'],['title','close'],['body','close']]),[]);await close.click({trial:true});await close.click();await expect(dialog).not.toBeVisible();await expect(trigger).toBeFocused();assert.equal(starts,0);expect(canvas.sent).toEqual([]);checks.modalControl=true;
});
