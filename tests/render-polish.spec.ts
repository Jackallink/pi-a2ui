// #67 render polish Gate2 (Spec028 / Plan028 T1+T2 intent): real browser RED.
// Every changed-behavior assertion reads computed values or interacts with the
// real DOM over the real UiSession/startServer pipeline; source-string checks,
// screenshots and design samples are not used as evidence. Regression
// assertions that already hold today (sort semantics, draft, valid-POST, log
// pause, chart value table) guard contracts through the restyle and must stay
// GREEN; setup/compiler failures are reported as setup errors, never RED.
import{test,expect,type Page}from'@playwright/test';
import assert from'node:assert/strict';
import{readFileSync}from'node:fs';
import{UiSession}from'../src/session.ts';
import{startServer}from'../src/server.ts';
import{forwardedPayload}from'./golden/oracles.ts';

const fixture=(name:string)=>readFileSync('docs/designs/028-render-polish/fixtures/'+name+'.express','utf8');
type CorpusCase={id:string;kind:string;series:Array<{name:string;points:Array<{label:string;value:number}>}>;expectedTickLabels:string[]};
const corpus=(JSON.parse(readFileSync('docs/designs/028-render-polish/chart-corpus.json','utf8')) as{cases:CorpusCase[]}).cases;
const corpusCase=(id:string)=>{const entry=corpus.find(candidate=>candidate.id===id);assert.ok(entry,'corpus case '+id+' exists');return entry;};
const chartSource=(entry:CorpusCase)=>'root = Card(child=Column(children=[Chart(kind='+JSON.stringify(entry.kind)+',series='+
 JSON.stringify(entry.series).replace(/"([A-Za-z][A-Za-z0-9_]*)":/g,'$1:')+')]))';
const mixedSource='root = Card(child=Column(children=[DataTable(caption="混合类型列",columns=[{id:"name",label:"名称"},{id:"value",label:"数值"},{id:"note",label:"说明"}],rows=['+
 '{id:"a",cells:["数字77",77,"number单元格"]},{id:"b",cells:["字符串77","77","string单元格不改判"]},'+
 '{id:"c",cells:["布尔true",true,"boolean单元格"]},{id:"d",cells:["空值",null,"null单元格"]},{id:"e",cells:["长数值",12040,"不换行"]}])]))';
const tieSource='root = Card(child=Column(children=[DataTable(caption="同值稳定",columns=[{id:"name",label:"名称"},{id:"n",label:"数值"}],rows=['+
 '{id:"r1",cells:["first",77]},{id:"r2",cells:["second",77]},{id:"r3",cells:["third",8]}])]))';

type Env={session:UiSession;origin:string;posts:string[];sent:string[];pageErrors:string[];externalBlocked:number;snapshotJson:string;close():Promise<void>};
async function open(page:Page,surfaceId:string,source:string):Promise<Env>{
 const sent:string[]=[],posts:string[]=[],pageErrors:string[]=[];let externalBlocked=0;
 const session=new UiSession(text=>{sent.push(text);});
 session.render(surfaceId,source);
 const snapshotJson=JSON.stringify(session.snapshot());
 const server=await startServer(session);
 try{
  page.on('pageerror',error=>pageErrors.push(String(error).slice(0,250)));
  await page.route('**/*',route=>{
   const url=new URL(route.request().url());
   if(url.origin!==server.origin){externalBlocked+=1;void route.abort();return;}
   if(url.pathname==='/api/actions'&&route.request().method()==='POST'){posts.push(route.request().postData()??'');void route.abort();return;}
   void route.continue();
  });
  const token=new URLSearchParams(new URL(server.openUrl).hash.slice(1)).get('token');
  expect((await page.request.post(server.origin+'/api/connect',{headers:{origin:server.origin},data:{token},timeout:5000})).status()).toBe(200);
  await page.goto(server.origin,{waitUntil:'load',timeout:10000});
  await page.locator('a2ui-surface').first().waitFor();
  await page.evaluate(()=>document.fonts.ready.then(()=>true));
  return{session,origin:server.origin,posts,sent,pageErrors,externalBlocked,snapshotJson,close:async()=>{
   await page.unrouteAll({behavior:'ignoreErrors'});await page.close();await server.close();session.close();
  }};
 }catch(error){
  await page.unrouteAll({behavior:'ignoreErrors'}).catch(()=>{});
  if(!page.isClosed())await page.close().catch(()=>{});
  await server.close().catch(()=>{});session.close();
  throw error;
 }
}
const styleOf=(locator:ReturnType<Page['locator']>,name:string)=>locator.evaluate((node,property)=>getComputedStyle(node).getPropertyValue(property as string),name);

test.use({launchOptions:{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH},viewport:{width:1280,height:900},deviceScaleFactor:1,colorScheme:'light',locale:'en-US',timezoneId:'UTC',reducedMotion:'reduce',actionTimeout:5000,navigationTimeout:5000});
test.setTimeout(30000);
test.describe.configure({retries:0});

test.describe('T1 unified typography and theme consumption',()=>{
 test('body, table filter input and header button share one system font at 14px',async({page})=>{
  const env=await open(page,'rp02',fixture('RP02-long-table'));
  try{
   const bodyFont=await styleOf(page.locator('body'),'font-family');
   const input=page.getByRole('searchbox',{name:'Filter 待评审变更（示例）'});
   await expect(input).toBeVisible();
   assert.equal(await styleOf(input,'font-size'),'14px','filter input inherits the 14px control size');
   assert.equal(await styleOf(input,'font-family'),bodyFont,'filter input inherits the canvas font family');
   const headerButton=page.getByRole('button',{name:'变更行数'});
   assert.equal(await styleOf(headerButton,'font-size'),'14px','table header button inherits the 14px control size');
   assert.equal(await styleOf(page.locator('body'),'font-size'),'14px','canvas body is 14px');
  }finally{await env.close();}
 });
 test('captions, canvas background, surface text and accent consume the approved tokens',async({page})=>{
  const env=await open(page,'rp01',fixture('RP01-dashboard'));
  try{
   assert.equal(await styleOf(page.locator('body'),'background-color'),'rgb(245, 247, 251)','canvas background token');
   assert.equal(await styleOf(page.locator('body'),'color'),'rgb(23, 32, 51)','canvas text token');
   const caption=page.locator('.a2ui-text-caption').first();
   assert.equal(await styleOf(caption,'font-size'),'12px','caption reads at 12px, not the sub-12px SDK scale');
   assert.equal(await styleOf(caption,'color'),'rgb(86, 100, 119)','muted caption token');
   assert.equal(await styleOf(caption,'font-style'),'normal','captions keep an upright normal glyph');
   const captionText=page.locator('.a2ui-text-caption em').first();
   assert.equal(await styleOf(captionText,'font-style'),'normal','the actual caption text (SDK renders an <em>) is upright, not just the wrapper span');
   const summaryNumber=page.locator('h2').first();
   assert.equal(await styleOf(summaryNumber,'font-size'),'28px','summary numbers read at 28px');
   const card=page.locator('.a2ui-card').first();
   assert.equal(await styleOf(card,'background-color'),'rgb(255, 255, 255)','surface card token');
  }finally{await env.close();}
 });
 test('accent buttons carry a readable white label on the visible text span',async({page})=>{
  const env=await open(page,'rp03',fixture('RP03-guarded-form'));
  try{
   const submit=page.getByRole('button',{name:'提交信息，等待确认'});
   await expect(submit).toBeVisible();
   assert.equal(await styleOf(submit,'background-color'),'rgb(54, 92, 219)','primary accent token');
   assert.equal(await styleOf(submit,'color'),'rgb(255, 255, 255)','on-accent foreground stays white');
   const innerLabel=submit.locator('.a2ui-text').first();
   assert.equal(await styleOf(innerLabel,'color'),'rgb(255, 255, 255)','the visible text span inherits the white on-accent color, not the SDK dark default');
  }finally{await env.close();}
 });
 test('default, primary and borderless variants keep distinct readable looks',async({page})=>{
  const env=await open(page,'rp-variants','root = Card(Column([Row([Button(Text("默认按钮"),action=Event("noop_a")),Button(Text("主按钮"),variant="primary",action=Event("noop_b")),Button(Text("链接按钮"),variant="borderless",action=Event("noop_c"))])]))');
  try{
   const inner=(name:string)=>page.getByRole('button',{name}).locator('.a2ui-text').first();
   const regular=page.getByRole('button',{name:'默认按钮'});
   await expect(regular).toBeVisible();
   assert.equal(await styleOf(regular,'background-color'),'rgb(54, 92, 219)','default canvas button uses the accent');
   assert.equal(await styleOf(inner('默认按钮'),'color'),'rgb(255, 255, 255)','default button inner label is white (SDK on-secondary remapped inside accent buttons)');
   const primary=page.getByRole('button',{name:'主按钮'});
   assert.equal(await styleOf(primary,'background-color'),'rgb(54, 92, 219)','primary button uses the accent');
   assert.equal(await styleOf(inner('主按钮'),'color'),'rgb(255, 255, 255)','primary button inner label is white');
   const link=page.getByRole('button',{name:'链接按钮'});
   assert.equal(await styleOf(link,'background-color'),'rgba(0, 0, 0, 0)','borderless keeps a transparent link look');
   assert.equal(await styleOf(link,'border-style'),'none','borderless has no border');
   assert.equal(await styleOf(inner('链接按钮'),'color'),'rgb(54, 92, 219)','borderless inner label uses the accent');
  }finally{await env.close();}
 });
 test('component state styles survive the page-level control rules',async({page})=>{
  const env=await open(page,'rp-states-style','$/picker/teams = ["platform"]\nroot = Card(Column([StatusBadge(label="导出完成",status="success"),StatusBadge(label="配额即将耗尽",status="warning"),StatusBadge(label="同步失败",status="error"),SearchablePicker(label="选择团队",options=[{label:"平台组",value:"platform"},{label:"前端组",value:"frontend"}],value=$/picker/teams,variant="multipleSelection")]))');
  try{
   const selected=page.locator('pi-a2ui-searchable-picker .picker-options button[aria-pressed="true"]');
   await expect(selected).toHaveCount(1,{timeout:1500});
   assert.equal(await styleOf(selected.first(),'border-color'),'rgb(54, 92, 219)','selected option keeps the accent border');
   assert.equal(await styleOf(selected.first(),'color'),'rgb(54, 92, 219)','selected option keeps the accent text');
   const unselected=page.locator('pi-a2ui-searchable-picker .picker-options button[aria-pressed="false"]').first();
   assert.equal(await styleOf(unselected,'border-color'),'rgb(219, 226, 234)','unselected option keeps the neutral canvas border (page base rule; state colors win via the scoped reassertions)');
   const badge=page.locator('pi-a2ui-status-badge .badge');
   assert.equal(await styleOf(badge.filter({hasText:'success'}).first(),'color'),'rgb(22, 101, 52)','success badge keeps its foreground token');
   assert.equal(await styleOf(badge.filter({hasText:'warning'}).first(),'color'),'rgb(146, 64, 14)','warning badge keeps its foreground token');
   assert.equal(await styleOf(badge.filter({hasText:'error'}).first(),'color'),'rgb(180, 35, 24)','error badge keeps its foreground token');
  }finally{await env.close();}
 });
 test('keyboard focus shows a solid accent outline on inputs',async({page})=>{
  const env=await open(page,'rp03',fixture('RP03-guarded-form'));
  try{
   const field=page.getByRole('textbox').nth(0);// SDK TextField keeps an unassociated label element; positional order 资产名称/责任团队/登记备注 is the existing DOM contract
   await field.click();
   assert.equal(await styleOf(field,'outline-style'),'solid','focus indicator is a real outline, not removed');
   assert.equal(await styleOf(field,'outline-width'),'3px','focus outline meets the 3px visibility floor');
   assert.equal(await styleOf(field,'outline-color'),'rgb(29, 78, 216)','focus outline uses the focus accent');
  }finally{await env.close();}
 });
 test('validation errors are readable and state is not color-only',async({page})=>{
  const env=await open(page,'rp03',fixture('RP03-guarded-form'));
  try{
   await page.getByRole('button',{name:'提交信息，等待确认'}).click();
   const section=page.locator('pi-a2ui-form-validation section:not([hidden])');
   await expect(section).toBeVisible();
   assert.equal(await section.locator('li').count(),3,'three required-field messages (regression)');
   assert.equal(await styleOf(section,'color'),'rgb(180, 35, 24)','error text token');
   assert.equal(await styleOf(section,'background-color'),'rgb(255, 245, 243)','error surface token');
   assert.equal(await styleOf(section,'border-left-width'),'3px','error block keeps a structural accent besides color');
   assert.equal(env.posts.length,0,'invalid local submit never posts (regression)');
  }finally{await env.close();}
 });
 test('summary cards stack in one column at 360px without horizontal overflow',async({page})=>{
  const env=await open(page,'rp06',fixture('RP06-responsive-cards'));
  try{
   await page.setViewportSize({width:360,height:740});
   await page.evaluate(()=>document.fonts.ready.then(()=>true));
   const rows=await page.evaluate(()=>{
    const cards=[...document.querySelectorAll('a2ui-basic-row a2ui-card')].map(node=>{const rect=node.getBoundingClientRect();return{top:rect.top,bottom:rect.bottom,width:rect.width};});
    return{cards,overflow:document.documentElement.scrollWidth>innerWidth+1,innerWidth};
   });
   assert.equal(rows.cards.length,3,'three summary cards (setup)');
   assert.equal(rows.overflow,false,'page never overflows horizontally at 360px');
   for(const card of rows.cards)assert.ok(card.width>=300,'each summary card occupies the full column width at 360px, got '+card.width);
   for(let index=1;index<rows.cards.length;index++)assert.ok(rows.cards[index-1].bottom<=rows.cards[index].top+1,'summary cards stack vertically without overlap');
  }finally{await env.close();}
 });
});

test.describe('T2 data legibility: table numerics and chart legend/ticks',()=>{
 test('numeric cells right-align by derived type while strings stay left',async({page})=>{
  const env=await open(page,'rp02',fixture('RP02-long-table'));
  try{
   const aligns=await page.evaluate(()=>{
    const table=document.querySelector('pi-a2ui-data-table table')!;
    const headers=[...table.querySelectorAll('thead th')].map(node=>getComputedStyle(node).textAlign);
    const cells=[...table.querySelectorAll('tbody tr')].map(row=>[...row.querySelectorAll('td')].map(node=>getComputedStyle(node).textAlign));
    return{headers,cells};
   });
   assert.deepEqual(aligns.headers,['left','right','left','left'],'numeric column header aligns right');
   for(const row of aligns.cells)assert.deepEqual(row,['left','right','left','left'],'number column aligns right, string/boolean columns stay left');
  }finally{await env.close();}
 });
 test('string digits are never coerced into numeric alignment',async({page})=>{
  const env=await open(page,'mixed',mixedSource);
  try{
   const aligns=await page.evaluate(()=>{
    const table=document.querySelector('pi-a2ui-data-table table')!;
    return[...table.querySelectorAll('tbody tr')].map(row=>[...row.querySelectorAll('td')].map(node=>getComputedStyle(node).textAlign));
   });
   assert.deepEqual(aligns[0],['left','right','left'],'77 as number aligns right');
   assert.deepEqual(aligns[1],['left','left','left'],'"77" as string stays left');
   assert.deepEqual(aligns[2],['left','left','left'],'true as boolean stays left');
   assert.deepEqual(aligns[3],['left','left','left'],'null stays left');
   assert.deepEqual(aligns[4],['left','right','left'],'12040 as number aligns right');
  }finally{await env.close();}
 });
 test('scalar cells stay atomic and every scalar column is horizontally reachable at 360px',async({page})=>{
  const env=await open(page,'rp02',fixture('RP02-long-table'));
  try{
   await page.setViewportSize({width:360,height:740});
   await page.evaluate(()=>document.fonts.ready.then(()=>true));
   const report=await page.evaluate(()=>{
    const region=document.querySelector('pi-a2ui-data-table .table-scroll') as HTMLElement;
    const results:Array<{text:string;lines:number;visible:boolean}>=[];
    for(const td of [...region.querySelectorAll('tbody td')]){
     const value=td.getAttribute('data-rp-scalar');
     if(value!=='true')continue;
     const range=document.createRange();range.selectNodeContents(td);
     const boxes=[...range.getClientRects()].filter(rect=>rect.width>0&&rect.height>0);
     const regionRect=region.getBoundingClientRect();
     const target=td.getBoundingClientRect().left-regionRect.left+region.scrollLeft;
     region.scrollLeft=Math.max(0,target);
     const rect=td.getBoundingClientRect();
     results.push({text:(td.textContent??'').trim(),lines:boxes.length,visible:rect.right<=regionRect.right+1&&rect.left>=regionRect.left-1});
    }
    return{results,scrollable:region.scrollWidth>region.clientWidth,overflow:document.documentElement.scrollWidth>innerWidth+1};
   });
   assert.equal(report.overflow,false,'overflow stays inside the table region, not the page');
   assert.equal(report.scrollable,true,'scalar table scrolls horizontally at 360px');
   const wrapped=report.results.filter(entry=>entry.lines>1);
   assert.deepEqual(wrapped,[],'number/boolean/null values never split across lines: '+JSON.stringify(wrapped));
   const hidden=report.results.filter(entry=>!entry.visible);
   assert.deepEqual(hidden,[],'every scalar cell can scroll fully into view: '+JSON.stringify(hidden));
  }finally{await env.close();}
 });
 test('sort keeps numeric order for numbers, lexicographic order for strings and stable ties',async({page})=>{
  const env=await open(page,'rp02',fixture('RP02-long-table'));
  try{
   const names=async()=>page.locator('pi-a2ui-data-table tbody tr td:first-child').allTextContents();
   const numeric=page.getByRole('button',{name:'变更行数'});
   const files=page.getByRole('button',{name:'文件或模块'});
   await files.click();
   await expect(files.locator('..')).toHaveAttribute('aria-sort','ascending');
   assert.deepEqual(await names(),['docs/设计评审/固定场景与完整原始证据追踪说明.md','skills/pi-a2ui/references/visual-and-data-legibility.md','src/agent/permission-and-action-context-validation.ts','src/client/long-component-name-without-breakpoints-for-layout-verification.ts','报告与证据'],'string sort is lexicographic');
   await numeric.click();
   await expect(numeric.locator('..')).toHaveAttribute('aria-sort','ascending');
   assert.deepEqual(await names(),['报告与证据','src/client/long-component-name-without-breakpoints-for-layout-verification.ts','skills/pi-a2ui/references/visual-and-data-legibility.md','src/agent/permission-and-action-context-validation.ts','docs/设计评审/固定场景与完整原始证据追踪说明.md'],'0,8,77,158,12040 sort numerically, never "158"<"77"');
   await numeric.click();
   await expect(numeric.locator('..')).toHaveAttribute('aria-sort','descending');
   assert.deepEqual(await names(),['docs/设计评审/固定场景与完整原始证据追踪说明.md','src/agent/permission-and-action-context-validation.ts','skills/pi-a2ui/references/visual-and-data-legibility.md','src/client/long-component-name-without-breakpoints-for-layout-verification.ts','报告与证据'],'descending is the exact reverse');
   const filter=page.getByRole('searchbox',{name:'Filter 待评审变更（示例）'});
   await filter.fill('158');
   await expect.poll(names,{timeout:5000}).toEqual(['src/agent/permission-and-action-context-validation.ts']);
   await filter.fill('');
   await expect.poll(names,{timeout:5000}).toHaveLength(5);
   assert.equal(env.posts.length,0,'sort/filter stay local (regression)');
   assert.equal(JSON.stringify(env.session.snapshot()),env.snapshotJson,'server snapshot untouched by client sort/filter (regression)');
  }finally{await env.close();}
 });
 test('equal values keep document order through both sort directions',async({page})=>{
  const env=await open(page,'ties',tieSource);
  try{
   const names=async()=>page.locator('pi-a2ui-data-table tbody tr td:first-child').allTextContents();
   await page.getByRole('button',{name:'数值'}).click();
   await expect.poll(names).toEqual(['third','first','second']);// ascending: 8 first, then the tied 77s in document order
   await page.getByRole('button',{name:'数值'}).click();
   await expect.poll(names).toEqual(['first','second','third']);// descending keeps the tie stable too
  }finally{await env.close();}
 });
 test('chart exposes a semantic legend naming every series',async({page})=>{
  const env=await open(page,'rp01',fixture('RP01-dashboard'));
  try{
   const chart=page.locator('pi-a2ui-chart').first();
   const legend=chart.locator('.rp-legend li');
   await expect(legend).toHaveCount(2,{timeout:1500});
   assert.deepEqual(await legend.allTextContents(),['服务端','浏览器'],'legend lists series names in order');
   assert.ok(await chart.locator('.rp-legend').evaluate(node=>node.getAttribute('aria-label')!==null),'legend is announced semantically');
  }finally{await env.close();}
 });
 test('legend covers the four-series corpus case',async({page})=>{
  const env=await open(page,'four-series',chartSource(corpusCase('four-series')));
  try{
   const legend=page.locator('pi-a2ui-chart .rp-legend li');
   await expect(legend).toHaveCount(4,{timeout:1500});
   assert.deepEqual(await legend.allTextContents(),['服务端','浏览器','脚本','文档'],'four named entries, one per series');
  }finally{await env.close();}
 });
 test('chart renders deduplicated zero-baseline ticks for the dashboard',async({page})=>{
  const env=await open(page,'rp01',fixture('RP01-dashboard'));
  try{
   const ticks=page.locator('pi-a2ui-chart svg text.rp-tick');
   await expect(ticks).toHaveCount(3,{timeout:1500});
   assert.deepEqual(await ticks.allTextContents(),['0','37','74'],'ticks derive from the same zero-baseline domain as the plot');
  }finally{await env.close();}
 });
 test('chart x-axis labels stay inside the plot viewport and never overlap',async({page})=>{
  const audit=(chart:ReturnType<Page['locator']>)=>chart.evaluate((node)=>{
   const svg=node.querySelector('svg');
   if(!svg)throw new Error('chart svg missing');
   const svgBox=svg.getBoundingClientRect();
   const boxes=[...svg.querySelectorAll<SVGTextElement>('text.rp-x-label')].map(text=>{const box=text.getBoundingClientRect();return{left:box.left,right:box.right,text:(text.textContent??'').trim()};});
   boxes.sort((a,b)=>a.left-b.left);
   const minGap=boxes.length>1?boxes.slice(1).reduce((gap,box,index)=>Math.min(gap,box.left-boxes[index].right),Number.POSITIVE_INFINITY):null;
   const outside=boxes.filter(box=>box.left<svgBox.left-0.5||box.right>svgBox.right+0.5).length;
   return{count:boxes.length,minGap,outside,svgWidth:svgBox.width,nonEmpty:boxes.every(box=>box.text.length>0)};
  });
  const dashboards=await open(page,'rp01',fixture('RP01-dashboard'));
  try{
   const chart=page.locator('pi-a2ui-chart').first();
   await expect(chart).toBeVisible();
   const result=await audit(chart);
   assert.ok(result.count>=1,'line chart renders at least one x label');
   assert.equal(result.outside,0,'every rendered x label stays inside the svg viewport (no clipping)');
   assert.ok(result.minGap===null||result.minGap>=2,'rendered x labels keep at least 2px separation (no overlap)');
   assert.equal(result.nonEmpty,true,'rendered x labels keep their full text; hidden labels stay reachable via point titles');
   assert.ok(result.svgWidth>=540,'the plot keeps its minimum width through the dynamic svg min-width');
  }finally{await dashboards.close();}
  const secondPage=await page.context().newPage();
  try{
   const longLabels=await open(secondPage,'corpus-long-label',chartSource(corpusCase('long-label')));
   try{
    const chart=secondPage.locator('pi-a2ui-chart').first();
    await expect(chart).toBeVisible();
    const result=await audit(chart);
    assert.ok(result.count>=1,'long-label bar chart still renders at least one label');
    assert.equal(result.outside,0,'long labels never extend past the svg viewport');
    assert.ok(result.minGap===null||result.minGap>=2,'long labels never overlap each other');
   }finally{await longLabels.close();}
  }finally{await secondPage.close();}
 });
 for(const entry of corpus){
  test(`chart ticks match the hand-authored oracle for ${entry.id}`,async({page})=>{
   const env=await open(page,'corpus-'+entry.id,chartSource(entry));
   try{
    if(entry.expectedTickLabels.length===0){
     assert.equal(await page.locator('pi-a2ui-chart svg text.rp-tick').count(),0,'no fake ticks without data');
     await expect(page.locator('pi-a2ui-chart')).toContainText('No data yet');
     return;
    }
    const ticks=page.locator('pi-a2ui-chart svg text.rp-tick');
    await expect(ticks).toHaveCount(entry.expectedTickLabels.length,{timeout:1500});
    assert.deepEqual(await ticks.allTextContents(),entry.expectedTickLabels,entry.id+' tick oracle');
   }finally{await env.close();}
  });
 }
 test('chart keeps the exact original value table (regression)',async({page})=>{
  const env=await open(page,'rp01',fixture('RP01-dashboard'));
  try{
   const rows=await page.locator('pi-a2ui-chart .values tbody tr').evaluateAll(nodes=>nodes.map(node=>[...node.querySelectorAll('td')].map(td=>(td.textContent??'').trim())));
   assert.deepEqual(rows,[
    ['服务端','11/12','42'],['服务端','11/13','55'],['服务端','11/14','49'],['服务端','11/15','61'],['服务端','11/16','74'],['服务端','11/17','66'],
    ['浏览器','11/12','28'],['浏览器','11/13','35'],['浏览器','11/14','40'],['浏览器','11/15','46'],['浏览器','11/16','51'],['浏览器','11/17','57'],
   ],'legend/ticks never rewrite supplied values');
   assert.equal(JSON.stringify(env.session.snapshot()),env.snapshotJson,'server snapshot untouched');
  }finally{await env.close();}
 });
});

test.describe('contract regressions across the restyle',()=>{
 test('RP03 valid submission posts exactly once with the collected values',async({page})=>{
  const sent:string[]=[];
  const session=new UiSession(text=>{sent.push(text);});
  session.render('rp03',fixture('RP03-guarded-form'));
  const server=await startServer(session);
  try{
   const token=new URLSearchParams(new URL(server.openUrl).hash.slice(1)).get('token');
   expect((await page.request.post(server.origin+'/api/connect',{headers:{origin:server.origin},data:{token},timeout:5000})).status()).toBe(200);
   await page.goto(server.origin,{waitUntil:'load',timeout:10000});
   await page.locator('a2ui-surface').first().waitFor();
   await page.getByRole('textbox').nth(0).fill('画布渲染基线');// positional: 资产名称
   await page.getByRole('textbox').nth(1).fill('交互团队');// 责任团队
   await page.getByRole('textbox').nth(2).fill('仅收集信息');// 登记备注
   const section=page.locator('pi-a2ui-form-validation section');
   await expect(section).toBeHidden();
   await page.getByRole('button',{name:'提交信息，等待确认'}).click();
   await expect.poll(()=>sent.length,{timeout:5000}).toBe(1);
   const envelope=forwardedPayload(sent[0]!) as{epoch:string;revision:number;surfaceId:string;event:string;sourceComponentId:string;context:Record<string,string>};
   assert.equal(envelope.event,'collect_asset');
   assert.deepEqual(envelope.context,{name:'画布渲染基线',team:'交互团队',note:'仅收集信息'});
  }finally{await page.close();await server.close();session.close();}
 });
 test('RP06 draft survives presentation-only changes without posting',async({page})=>{
  const env=await open(page,'rp06',fixture('RP06-responsive-cards'));
  try{
   const field=page.getByRole('textbox');
   await field.fill('待确认：保留这份草稿');
   await page.emulateMedia({colorScheme:'dark'});
   await page.setViewportSize({width:360,height:740});
   await page.emulateMedia({colorScheme:'light'});
   await page.setViewportSize({width:1280,height:900});
   await expect(field).toHaveValue('待确认：保留这份草稿');
   assert.equal(env.posts.length,0,'presentation changes never post');
  }finally{await env.close();}
 });
 test('RP04 pause holds log output and resume shows the newest data',async({page})=>{
  const env=await open(page,'rp04',fixture('RP04-diff-log'));
  try{
   const pre=page.locator('pi-a2ui-log-view pre');
   env.session.updateLog('[固定样例，未执行真实命令]\n$ npm run check\nTypeScript: illustrative success\n$ npm test\nSample failure: expected 200, received 409','error',false);
   await expect.poll(async()=>pre.textContent(),{timeout:5000}).toMatch(/received 409/);
   await page.getByRole('button',{name:'Pause log display'}).click();
   await expect(page.getByRole('button',{name:'Resume log display'})).toBeVisible();
   env.session.updateLog('AFTER_PAUSE_MARKER: newest data line','error',false);
   await page.evaluate(()=>new Promise<void>(resolve=>{requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()));}));
   assert.doesNotMatch(await pre.textContent()??'',/AFTER_PAUSE_MARKER/,'paused display holds the old output');
   await page.getByRole('button',{name:'Resume log display'}).click();
   await expect.poll(async()=>pre.textContent(),{timeout:5000}).toMatch(/AFTER_PAUSE_MARKER/);
   assert.equal(env.posts.length,0,'log interactions never post');
  }finally{await env.close();}
 });
 test('RP05 states and modal keep their announced roles and flows',async({page})=>{
  const env=await open(page,'rp05',fixture('RP05-states'));
  try{
   await expect(page.getByText('Loading data',{exact:false})).toBeVisible();
   await expect(page.getByText('Data unavailable',{exact:false})).toBeVisible();
   await expect(page.locator('pi-a2ui-status-badge .badge').first()).toBeVisible();
   const modalTrigger=page.getByText('查看使用说明');
   await modalTrigger.click();
   const dialog=page.locator('pi-a2ui-modal dialog');
   await expect(dialog).toBeVisible();
   await expect(dialog).toContainText('本地说明弹窗');
   await page.keyboard.press('Escape');
   await expect(dialog).toBeHidden();
   assert.equal(JSON.stringify(env.session.snapshot()),env.snapshotJson,'states surface stays read-only');
  }finally{await env.close();}
 });
 test('no page errors, no business POSTs and no provider requests in the suite state',async({page})=>{
  const env=await open(page,'rp01',fixture('RP01-dashboard'));
  try{
   await expect(page.locator('pi-a2ui-chart').first()).toBeVisible();
   assert.deepEqual(env.pageErrors,[],'no uncaught page errors');
   assert.equal(env.posts.length,0,'no business POSTs');
   assert.equal(env.externalBlocked,0,'no attempted provider or external requests');
  }finally{await env.close();}
 });
});
