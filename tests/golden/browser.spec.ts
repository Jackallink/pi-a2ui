import { test as base, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { UiSession } from '../../src/session.ts';
import { startServer } from '../../src/server.ts';
import { assertActionReceipt } from './oracles.ts';
import { fixtureBytes, loadCases, caseResult, type CaseResult } from './registry.ts';
import { writeReport } from './reports.ts';
const results:CaseResult[]=[];
let browserVersion='';

type Canvas={session:UiSession;sent:string[];origin:string};
const test=base.extend<{canvas:Canvas}>({canvas:[async({page},use,testInfo)=>{
  const sent:string[]=[];const session=new UiSession(text=>{sent.push(text);});
  const server=await startServer(session);
  try {
    const token=new URLSearchParams(new URL(server.openUrl).hash.slice(1)).get('token');
    const connected=await page.request.post(server.origin+'/api/connect',{headers:{origin:server.origin},data:{token},timeout:5000});expect(connected.status()).toBe(200);
    await use({session,sent,origin:server.origin});
  }finally{
    try{await page.close();await server.close();}
    catch(error){const entry=results.find(result=>testInfo.title.startsWith('BM2 '+result.id+' '));if(entry){entry.pass=false;entry.failedStage='cleanup';entry.detail=String(error);}throw error;}
    finally{session.close();}
  }
},{timeout:5000}]});
test.use({launchOptions:{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH},viewport:{width:1280,height:900},deviceScaleFactor:1,colorScheme:'light',locale:'en-US',timezoneId:'UTC',reducedMotion:'reduce',actionTimeout:5000,navigationTimeout:5000});
test.setTimeout(30000);
test.describe.configure({retries:0});
test.afterAll(async()=>{await writeReport('browser',results,{browserVersion,viewport:{width:1280,height:900},deviceScaleFactor:1,theme:'light',locale:'en-US',timezone:'UTC',reducedMotion:'reduce',browserRevision:JSON.parse((await import('node:fs')).readFileSync('node_modules/playwright-core/browsers.json','utf8')).browsers.find((browser:{name:string})=>browser.name==='chromium-headless-shell').revision});});
const cases=loadCases().filter(row=>row.layer==='browser');
for(const row of cases)test(`BM2 ${row.id} ${row.contractKey}`,async({page,canvas,browser})=>{
  browserVersion=browser.version();
  const bytes=fixtureBytes(row.fixture);
  const entry=caseResult(row,bytes,{pass:false,failedStage:'setup'});results.push(entry);
  try {
  const fixture=JSON.parse(fixtureBytes(row.fixture).toString('utf8'));
  const posts:unknown[]=[],statuses:number[]=[];
  page.on('request',request=>{if(request.url()===canvas.origin+'/api/actions'&&request.method()==='POST')posts.push(request.postDataJSON());});
  page.on('response',response=>{if(response.url()===canvas.origin+'/api/actions'&&response.request().method()==='POST')statuses.push(response.status());});
  // Observation only: real fetch and server responses are unchanged.
  await page.addInitScript(()=>{
    const realFetch=window.fetch.bind(window);(window as any).goldenActionStarts=0;
    window.fetch=(input,options)=>{if(new URL(String(input),location.href).pathname==='/api/actions')(window as any).goldenActionStarts++;return realFetch(input,options);};
  });
  canvas.session.render('golden',fixture.source);const before=canvas.session.snapshot();
  await page.goto(canvas.origin);entry.failedStage='interaction';
  const noPost=async()=>{
    expect(await page.evaluate(()=>(window as any).goldenActionStarts)).toBe(0);
    expect(posts).toHaveLength(0);expect(statuses).toHaveLength(0);expect(canvas.sent).toHaveLength(0);
  };
  const submit=async(label:string)=>{
    const response=page.waitForResponse(response=>response.url()===canvas.origin+'/api/actions'&&response.request().method()==='POST',{timeout:5000});
    await page.getByRole('button',{name:label,exact:true}).click();expect((await response).status()).toBe(202);
    await expect(page.locator('#notice')).toHaveText('Sent to Pi');
    await expect(page.getByRole('button',{name:label,exact:true})).toBeEnabled();
  };
  switch(row.id){
    case 'B01':case 'B07':{
      await page.getByRole('region',{name:'Canvas golden',exact:true}).getByRole('textbox').fill(fixture.input.name);
      await page.getByRole('checkbox',{name:'Accept',exact:true}).check();
      await submit('Save form');if(row.id==='B07')await submit('Save form');
      assertActionReceipt({posts:posts.length,statuses,callbacks:canvas.sent},{posts:fixture.expected.posts,context:fixture.expected.context},before);
      const ids=posts.map(value=>(value as {eventId:string}).eventId);expect(new Set(ids).size).toBe(fixture.expected.posts);
      if(row.id==='B07')expect(canvas.sent[0]).toBe(canvas.sent[1]);
      break;
    }
    case 'B02':
      await page.getByRole('button',{name:'Save form',exact:true}).click();
      await expect(page.getByRole('region',{name:'Canvas golden',exact:true}).getByRole('textbox')).toHaveAttribute('aria-invalid','true');
      await expect(page.getByText('Enter 2 to 5 characters',{exact:true}).first()).toBeVisible();await noPost();break;
    case 'B03':
      await page.getByRole('button',{name:'B · b',exact:true}).click();await submit('Choose');
      assertActionReceipt({posts:posts.length,statuses,callbacks:canvas.sent},{posts:fixture.expected.posts,context:fixture.expected.context},before);break;
    case 'B04':{
      await page.getByRole('button',{name:'Find actions',exact:true}).click();
      const palette=page.getByRole('dialog',{name:'Find actions'});await expect(palette).toBeVisible();
      await palette.getByRole('searchbox',{name:'Search actions'}).fill('Save form');
      await page.locator('[data-surface-id="golden"]').getByRole('button',{name:'Save form',exact:true}).evaluate(node=>{(node as HTMLElement).hidden=true;});
      await palette.getByRole('searchbox',{name:'Search actions'}).press('Enter');
      await expect(palette).not.toBeVisible();await expect(page.locator('#notice')).toContainText('no longer available');await noPost();break;
    }
    case 'B05':{
      const labels=()=>page.locator('pi-a2ui-data-table tbody tr').evaluateAll(rows=>rows.map(row=>row.querySelectorAll('td')[1].textContent));
      await page.getByRole('button',{name:'Score',exact:true}).click();await expect.poll(labels).toEqual(fixture.ascending);
      await page.getByRole('button',{name:'Score',exact:true}).click();await expect.poll(labels).toEqual(fixture.descending);await noPost();break;
    }
    case 'B06':{
      const trigger=page.getByRole('button',{name:'Open',exact:true});await trigger.click();
      const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();await expect(dialog.getByText(fixture.expected.dialogText,{exact:true})).toBeVisible();
      await page.getByRole('button',{name:'Close details',exact:true}).click();await expect(dialog).not.toBeVisible();await expect(trigger).toBeFocused();await noPost();break;
    }
    default:assert.fail('Unknown fixed browser case');
  }
  entry.pass=true;entry.failedStage=null;entry.observation={posts:posts.length,statuses,callbacks:canvas.sent,requests:posts};
  }catch(error){entry.detail=String(error);throw error;}
});

test('BM2 detector canary: real click without server ACK cannot pass B01',async({page,canvas})=>{
 const fixture=JSON.parse(fixtureBytes('tests/golden/fixtures/B01.json').toString('utf8'));
 canvas.session.render('golden',fixture.source);const before=canvas.session.snapshot();
 let posts=0;const statuses:number[]=[];
 page.on('request',request=>{if(request.url()===canvas.origin+'/api/actions')posts++;});
 page.on('response',response=>{if(response.url()===canvas.origin+'/api/actions')statuses.push(response.status());});
 await page.route('**/api/actions',route=>route.abort('failed'));
 await page.goto(canvas.origin);await page.getByRole('region',{name:'Canvas golden',exact:true}).getByRole('textbox').fill('Ada');await page.getByRole('checkbox',{name:'Accept',exact:true}).check();
 await page.getByRole('button',{name:'Save form',exact:true}).click();await expect(page.locator('#notice')).toContainText('Delivery is uncertain');
 expect(posts).toBe(1);expect(statuses).toEqual([]);expect(canvas.sent).toEqual([]);
 assert.throws(()=>assertActionReceipt({posts,statuses,callbacks:canvas.sent},{posts:1,context:{name:'Ada',accept:true}},before),/actual server acknowledgements/);
});
