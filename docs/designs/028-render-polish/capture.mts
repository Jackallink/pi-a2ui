/** Design-only: real baseline renderer + local presentation sketch; never shipped. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,readdirSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import {chromium} from '@playwright/test';
import {UiSession} from '../../../src/session.ts';
import {startServer} from '../../../src/server.ts';
const root=resolve('docs/designs/028-render-polish'),baseOut=resolve('.local/render-polish-design');mkdirSync(baseOut,{recursive:true});const out=mkdtempSync(join(baseOut,'run-'));console.log(JSON.stringify({designCaptureRun:out}));
assert.match(process.version,/^v24\./);const sha=(x:string|Buffer)=>createHash('sha256').update(x).digest('hex');
const tracked=execFileSync('git',['ls-files','src','dist','skills','extension.ts','package.json','package-lock.json']).toString().trim().split('\n');
const preserved=Object.fromEntries(tracked.map(p=>[p,sha(readFileSync(p))]));
const css=readFileSync(join(root,'preview.css'),'utf8');const cases=readdirSync(join(root,'fixtures')).filter(x=>x.endsWith('.express')).sort();assert.equal(cases.length,6);
const browser=await chromium.launch({headless:true});const records:any[]=[],errors:any[]=[],sampleSources:any[]=[];let providerRequests=0,actionRequests=0,dispatches=0;
const viewports=[{id:'desktop',width:1280,height:900},{id:'tablet',width:768,height:900},{id:'mobile',width:360,height:900},{id:'reflow-200-equivalent',width:640,height:450}];
try{
 for(const file of cases){
  const id=file.replace('.express',''),source=readFileSync(join(root,'fixtures',file),'utf8');
  const session=new UiSession(()=>{dispatches++;throw new Error('Design capture must never dispatch business actions')});let server:any;let context:any;
  try{
   session.render('design',source);if(id==='RP04-diff-log'){let off=()=>{};const settled=new Promise<void>((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Fixture log data flush timed out')),2000);off=session.subscribeData(()=>{clearTimeout(timer);resolve();});});session.updateLog('[固定样例，未执行真实命令]\n$ npm run check\nTypeScript: illustrative success\n$ npm test\nSample failure: expected 200, received 409\nThis is a design fixture, not test evidence.','error',false);await settled;off();}
   const snapshot=session.snapshot(),snapshotSHA=sha(JSON.stringify(snapshot));sampleSources.push({id,sourceSHA256:sha(source),components:snapshot.surfaces[0].message.createSurface.components.length});
   server=await startServer(session);context=await browser.newContext({viewport:{width:1280,height:900},deviceScaleFactor:1,locale:'zh-CN',timezoneId:'Asia/Shanghai',colorScheme:'light',reducedMotion:'reduce'});
   await context.route('**/*',async(route:any)=>{const request=route.request(),url=new URL(request.url());if(url.origin!==server.origin){providerRequests++;await route.abort();return;}if(url.pathname==='/api/actions'&&request.method()==='POST'){actionRequests++;await route.abort();return;}await route.continue();});
   const token=new URLSearchParams(new URL(server.openUrl).hash.slice(1)).get('token');assert.equal((await context.request.post(server.origin+'/api/connect',{headers:{origin:server.origin},data:{token}})).status(),200);
   for(const viewport of viewports)for(const phase of ['before','after']){
    const page=await context.newPage();await page.setViewportSize({width:viewport.width,height:viewport.height});page.on('pageerror',error=>errors.push({id,phase,message:String(error).slice(0,250)}));
    await page.goto(server.origin,{waitUntil:'load',timeout:10000});await page.locator('a2ui-surface').waitFor();await page.waitForFunction(()=>document.querySelectorAll('#surfaces .a2ui-card').length>0);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(100);
    if(id==='RP06-responsive-cards')await page.getByRole('textbox').fill('待确认：保留这份草稿');
    const dataBefore=await page.locator('pi-a2ui-chart tbody').allTextContents();
    if(phase==='after'){
     await page.addStyleTag({content:css});
     const charts=snapshot.surfaces[0].message.createSurface.components.filter(c=>c.component==='Chart').map(c=>({kind:c.kind,series:c.series}));
     await page.evaluate((charts:any[])=>{
      const palette=['#365cdb','#0f766e','#9a5b0a','#92419c'];document.querySelectorAll('pi-a2ui-chart').forEach((host,index)=>{const props=charts[index],svg=host.querySelector('svg');if(!props||!svg)return;svg.setAttribute('viewBox','0 0 640 270');
       const legend=document.createElement('div');legend.className='rp-legend';legend.setAttribute('aria-label','设计预览：系列图例');props.series.forEach((s:any,i:number)=>{const item=document.createElement('span'),swatch=document.createElement('i');swatch.style.background=palette[i];item.append(swatch,document.createTextNode(s.name));legend.append(item);});svg.before(legend);
       const values=props.series.flatMap((s:any)=>s.points.map((p:any)=>p.value)),maxAbs=Math.max(1,...values.map(Math.abs)),low=Math.min(0,...values.map((v:number)=>v/maxAbs)),high=Math.max(0,...values.map((v:number)=>v/maxAbs)),span=high-low||1;const ns='http://www.w3.org/2000/svg';
       for(const tick of (values.length?[...new Set([low,(low+high)/2,high])]:[])){const y=210-(tick-low)/span*180,line=document.createElementNS(ns,'line'),text=document.createElementNS(ns,'text');line.setAttribute('x1','35');line.setAttribute('x2','615');line.setAttribute('y1',String(y));line.setAttribute('y2',String(y));line.setAttribute('stroke','#dbe2ea');text.setAttribute('x','2');text.setAttribute('y',String(y+3));text.setAttribute('fill','#566477');text.setAttribute('font-size','10');text.textContent=new Intl.NumberFormat('zh-CN',{maximumFractionDigits:2}).format(tick*maxAbs);svg.prepend(line,text);}
       host.querySelectorAll('g[data-series]').forEach((g,i)=>{g.querySelectorAll('polyline').forEach(el=>{el.setAttribute('stroke',palette[i]);el.setAttribute('stroke-width','2.5');el.setAttribute('stroke-dasharray',i===0?'none':i===1?'6 4':i===2?'2 3':'8 3 2 3');});g.querySelectorAll('circle,rect').forEach(el=>el.setAttribute('fill',palette[i]));});
      });
     },charts);
    }
    if(phase==='after'){const tables=snapshot.surfaces[0].message.createSurface.components.filter(c=>c.component==='DataTable').map(c=>c.rows);await page.evaluate((tables:any[])=>{document.querySelectorAll('pi-a2ui-data-table').forEach((host,index)=>{const rows=tables[index]??[];host.querySelectorAll('.table-scroll').forEach(el=>{el.setAttribute('tabindex','0');el.setAttribute('role','region');el.setAttribute('aria-label','固定表格：可横向滚动查看完整列');});host.querySelectorAll('tbody tr').forEach((tr,r)=>tr.querySelectorAll('td').forEach((td,col)=>{const value=rows[r]?.cells[col];if(typeof value==='number')td.setAttribute('data-rp-numeric','true');if(value===null||typeof value==='number'||typeof value==='boolean')td.setAttribute('data-rp-scalar','true');}));host.querySelectorAll('th').forEach((th,col)=>{if(rows.length&&rows.every((row:any)=>typeof row.cells[col]==='number'))th.setAttribute('data-rp-numeric','true');});});},tables);}
    assert.deepEqual(await page.locator('pi-a2ui-chart tbody').allTextContents(),dataBefore,'preview must not change original chart table');
    if(id==='RP03-guarded-form'){await page.getByRole('button',{name:'提交信息，等待确认',exact:true}).click();await page.getByText('请先补齐以下信息',{exact:true}).waitFor();assert.equal(await page.locator('pi-a2ui-form-validation li').count(),3);}
    if(id==='RP06-responsive-cards')assert.equal(await page.getByRole('textbox').inputValue(),'待确认：保留这份草稿');
    await page.evaluate(()=>{scrollTo(0,0);return new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
    const observations=await page.evaluate(()=>{const selectors=['main','#surfaces .a2ui-card','pi-a2ui-data-table th','pi-a2ui-data-table input','pi-a2ui-chart svg','pi-a2ui-form-validation section:not([hidden])','pi-a2ui-code-diff .add','pi-a2ui-log-view pre'];return{viewport:{width:innerWidth,height:innerHeight},pageOverflow:document.documentElement.scrollWidth>innerWidth+1,font:getComputedStyle(document.body).fontFamily,styles:selectors.flatMap(selector=>{const el=document.querySelector(selector);if(!el)return[];const s=getComputedStyle(el),r=el.getBoundingClientRect();return[{selector,shadow:!!el.shadowRoot,style:{display:s.display,font:s.font,color:s.color,background:s.backgroundColor,padding:s.padding,border:s.border,radius:s.borderRadius,maxHeight:s.maxHeight,overflowX:s.overflowX},rect:{x:r.x,y:r.y,width:r.width,height:r.height}}];}),title:document.title};});
    if(phase==='after'&&await page.locator('a2ui-basic-button button .a2ui-text').count()){const ink=await page.locator('a2ui-basic-button button .a2ui-text').first().evaluate(el=>getComputedStyle(el).color);assert.equal(ink,'rgb(255, 255, 255)','primary button label must preserve on-accent foreground');}
    const scalarLines=await page.evaluate((tables:any[])=>{const result:any[]=[];document.querySelectorAll('pi-a2ui-data-table').forEach((host,index)=>{const rows=tables[index]??[];host.querySelectorAll('tbody tr').forEach((tr,r)=>tr.querySelectorAll('td').forEach((td,col)=>{const v=rows[r]?.cells[col];if(v===null||typeof v==='number'||typeof v==='boolean'){const range=document.createRange();range.selectNodeContents(td);const boxes=[...range.getClientRects()].filter(r=>r.width>0&&r.height>0);result.push({value:v,text:td.textContent?.trim(),lines:boxes.length});}}));});return result;},snapshot.surfaces[0].message.createSurface.components.filter(c=>c.component==='DataTable').map(c=>c.rows));
    if(phase==='after')assert.ok(scalarLines.every(s=>s.lines<=1),'numeric/boolean/null values must remain atomic on narrow screens');
    const name=`${id}-${viewport.id}-${phase}.png`;await page.screenshot({path:join(out,name),fullPage:true,animations:'disabled'});assert.equal(sha(JSON.stringify(session.snapshot())),snapshotSHA,'presentation must not alter server snapshot');
    records.push({id,phase,viewport:viewport.id,file:name,sha256:sha(readFileSync(join(out,name))),sourceSHA256:sha(source),snapshotSHA256:snapshotSHA,...observations,scalarLines,prototypeDOM:phase==='after'?'CSS + chart legend/grid/line-style DOM presentation sketch only':'none'});
    if(id==='RP02-long-table'&&phase==='after'&&viewport.id==='mobile'){await page.locator('.table-scroll').evaluate(el=>{const td=el.querySelector('[data-rp-numeric]') as HTMLElement;el.scrollLeft=Math.max(0,td.offsetLeft-60);});await page.screenshot({path:join(out,'RP02-mobile-scalars-scroll-after.png'),fullPage:true,animations:'disabled'});}
    console.log(`${id} ${viewport.id} ${phase} overflow=${observations.pageOverflow}`);await page.close();
   }
  }finally{if(context)await context.close();if(server)await server.close();session.close();assert.equal(session.closed,true);}
 }
 assert.equal(providerRequests,0);assert.equal(actionRequests,0);assert.equal(dispatches,0);assert.deepEqual(errors,[]);for(const [p,h]of Object.entries(preserved))assert.equal(sha(readFileSync(p)),h,'protected product changed: '+p);
 writeFileSync(join(out,'manifest.json'),JSON.stringify({schema:'rp67-design-previews-v1',baseSource:execFileSync('git',['rev-parse','HEAD']).toString().trim(),node:process.version,browser:browser.version(),dpr:1,locale:'zh-CN',timezone:'Asia/Shanghai',reducedMotion:true,zoomBoundary:'640x450 is reflow-equivalent only, not proof of actual desktop browser 200% zoom',previewCSSSHA256:sha(css),captureScriptSHA256:sha(readFileSync(new URL(import.meta.url))),sampleSources,records,providerRequests,actionRequests,dispatches,errors,productFilesPreserved:preserved,modelEffect:'not_evaluated',productionImplemented:false,cleanup:'all pages/contexts/servers/browser closed in finally'},null,2)+'\n');
}finally{await browser.close();}
