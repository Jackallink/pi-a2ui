// #67 render-polish acceptance closure (independent review R1 remaining work).
// Binds Spec028:67-76 acceptance criteria to real-browser computed evidence:
// AC-001 computed style coverage across all 32 component types, AC-003 200%
// zoom + narrow-viewport geometry/hit testing, AC-004/007 keyboard, focus,
// modal return, paused-canvas inertness and effective-background contrast,
// AC-006 dynamic chart updates, AC-002 source-bound screenshots. Synthetic
// only; screenshots are context, not the assertion itself.
import{test,expect,type Page}from'@playwright/test';
import assert from'node:assert/strict';
import{mkdtempSync,readFileSync,writeFileSync}from'node:fs';
import{join}from'node:path';
import{createHash}from'node:crypto';
import{execSync}from'node:child_process';
import{UiSession}from'../src/session.ts';
import{startServer}from'../src/server.ts';

const SHOTS=join(process.cwd(),'.local/render-polish-corrective/shots');
// Each run writes into its own unique temp directory and records a manifest
// binding every screenshot to the exact source/lock/browser it was taken on,
// so reruns never overwrite prior evidence (review R2 finding 4; R3 findings
// 4/5: mkdtemp for worker/retry isolation, identity captured up front and
// re-verified at the end, actual launched-browser version recorded).
const RUN=mkdtempSync(join(SHOTS,'run-'));
const taken:{name:string;path:string}[]=[];
let browserIdentity:{name:string;version:string}|null=null;
// Capture the evidence identity BEFORE any test runs; a mid-run commit switch
// would otherwise mislabel old screenshots with the new source.
const IDENTITY={
 source:execSync('git rev-parse HEAD').toString().trim(),
 dirty:execSync('git status --porcelain --untracked-files=normal').toString().length>0,
 lock:createHash('sha256').update(readFileSync('package-lock.json')).digest('hex'),
};
const fixture=(name:string)=>readFileSync('docs/designs/028-render-polish/fixtures/'+name+'.express','utf8');
const shot=async(page:Page,name:string)=>{const path=join(RUN,name+'.png');await page.screenshot({path,fullPage:true});taken.push({name,path});if(!browserIdentity){const browser=page.context().browser();browserIdentity=browser?{name:browser.browserType().name(),version:browser.version()}:null;}return path;};
test.afterAll(async()=>{
 const sha256=(path:string)=>createHash('sha256').update(readFileSync(path)).digest('hex');
 // The evidence must be bound to the same tree it was captured on: if the
 // source/lock changed mid-run, fail instead of mislabeling (review R3 finding 5).
 const nowSource=execSync('git rev-parse HEAD').toString().trim();
 const nowLock=createHash('sha256').update(readFileSync('package-lock.json')).digest('hex');
 if(nowSource!==IDENTITY.source||nowLock!==IDENTITY.lock)throw new Error('evidence identity changed mid-run: source '+IDENTITY.source+' -> '+nowSource+', lock '+(nowLock===IDENTITY.lock?'stable':'changed'));
 const declared=JSON.parse(readFileSync('node_modules/playwright-core/browsers.json','utf8')).browsers.find((entry:{name:string})=>entry.name==='chromium-headless-shell');
 const manifest={
  source:IDENTITY.source,
  dirty:IDENTITY.dirty,
  lock:IDENTITY.lock,
  lockedBrowser:{revision:declared?.revision??null,browserVersion:declared?.browserVersion??null},
  launchedBrowser:browserIdentity,
  browserVersionMatchesLock:browserIdentity?.version===declared?.browserVersion,
  shots:taken.map(entry=>({name:entry.name,file:join(RUN.slice(process.cwd().length+1),entry.name+'.png'),sha256:sha256(entry.path)})),
 };
 writeFileSync(join(RUN,'manifest.json'),JSON.stringify(manifest,null,1));
});

type Env={session:UiSession;origin:string;posts:string[];sent:string[];pageErrors:string[];externalBlocked:{count:number};snapshotJson:string;close():Promise<void>};
async function open(page:Page,surfaceId:string,source:string|((session:UiSession)=>Promise<string>),opts:{keepPage?:boolean}={}):Promise<Env>{
 const sent:string[]=[],posts:string[]=[],pageErrors:string[]=[];const externalBlocked={count:0};
 const session=new UiSession(text=>{sent.push(text);});
 session.render(surfaceId,typeof source==='function'?await source(session):source);
 const snapshotJson=JSON.stringify(session.snapshot());
 const server=await startServer(session);
 try{
  page.on('pageerror',error=>pageErrors.push(String(error).slice(0,250)));
  await page.route('**/*',route=>{
   const url=new URL(route.request().url());
   if(url.origin!==server.origin){externalBlocked.count+=1;void route.abort();return;}
   if(url.pathname==='/api/actions'&&route.request().method()==='POST'){posts.push(route.request().postData()??'');void route.abort();return;}
   void route.continue();
  });
  const token=new URLSearchParams(new URL(server.openUrl).hash.slice(1)).get('token');
  expect((await page.request.post(server.origin+'/api/connect',{headers:{origin:server.origin},data:{token},timeout:5000})).status()).toBe(200);
  await page.goto(server.origin,{waitUntil:'load',timeout:10000});
  await page.locator('a2ui-surface').first().waitFor();
  await page.evaluate(()=>document.fonts.ready.then(()=>true));
  return{session,origin:server.origin,posts,sent,pageErrors,externalBlocked,snapshotJson,close:async()=>{
   await page.unrouteAll({behavior:'ignoreErrors'});if(!opts.keepPage)await page.close();await server.close();session.close();
  }};
 }catch(error){
  await page.unrouteAll({behavior:'ignoreErrors'}).catch(()=>{});
  if(!page.isClosed())await page.close().catch(()=>{});
  await server.close().catch(()=>{});session.close();
  throw error;
 }
}
const styleOf=(locator:ReturnType<Page['locator']>,name:string)=>locator.evaluate((node,property)=>getComputedStyle(node).getPropertyValue(property as string),name);

const assertClean=(env:Env,stage:string)=>{
  assert.deepEqual(env.pageErrors,[],stage+': no page errors');
  assert.equal(env.externalBlocked.count,0,stage+': no external requests blocked');
};

test.use({launchOptions:{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH},viewport:{width:1280,height:900},deviceScaleFactor:1,colorScheme:'light',locale:'en-US',timezoneId:'UTC',reducedMotion:'reduce',actionTimeout:5000,navigationTimeout:5000});
test.setTimeout(45000);

// Every declared component type mapped to its rendered host tag. Pi-side
// overrides and SDK catalog names are both listed (src/browser-catalog.ts +
// SDK tagName declarations).
const ALL32:string[]=[
 'a2ui-basic-text','a2ui-basic-row','a2ui-basic-column','a2ui-card','a2ui-divider','a2ui-list',
 'a2ui-tabs','a2ui-checkbox','a2ui-slider','a2ui-datetimeinput','a2ui-choicepicker','a2ui-basic-textfield','a2ui-basic-button',
 'pi-a2ui-icon','pi-a2ui-activity-timeline','pi-a2ui-form-validation','pi-a2ui-searchable-picker','pi-a2ui-video','pi-a2ui-audio','pi-a2ui-artifact-preview',
 'pi-a2ui-image','pi-a2ui-modal','pi-a2ui-status-badge','pi-a2ui-task-progress','pi-a2ui-details','pi-a2ui-code-block',
 'pi-a2ui-markdown','pi-a2ui-data-table','pi-a2ui-code-diff','pi-a2ui-test-results','pi-a2ui-log-view','pi-a2ui-chart'];

test('AC-001: all 32 component types render with the theme font and state families stay themed',async({page})=>{
  const mediaTags=['a2ui-basic-text','pi-a2ui-markdown','pi-a2ui-code-block','a2ui-divider','pi-a2ui-icon','pi-a2ui-status-badge','pi-a2ui-image','pi-a2ui-video','pi-a2ui-audio','pi-a2ui-artifact-preview','a2ui-card','a2ui-basic-column'];
  const formTags=['a2ui-basic-textfield','a2ui-checkbox','a2ui-slider','a2ui-datetimeinput','a2ui-tabs','pi-a2ui-details','pi-a2ui-modal','a2ui-list','a2ui-basic-row','a2ui-basic-column'];
 // Group A needs session-scoped artifact srcs inside the Express source, so
 // the source is built after the session exists via the factory hook.
 const envA=await open(page,'rp-acc-media',async session=>{
  const img=await session.registerArtifact('tests/fixtures/blue.png','image',process.cwd());
  const vid=await session.registerArtifact('tests/fixtures/blue.webm','video',process.cwd());
  const aud=await session.registerArtifact('tests/fixtures/tone.wav','audio',process.cwd());
  return `root = Card(child=Column(children=[

  Text("正文文本样式"),
  MarkdownView(text="**强调** 与列表"),
  CodeBlock(code="const x=1",language="ts",copyable=true),
  Divider(),
  Icon(name="info"),
  StatusBadge(label="错误状态",status="error"),
  StatusBadge(label="运行中",status="running"),
  Image(url="${img.src}",description="蓝色方块"),
  Video(url="${vid.src}"),
  AudioPlayer(url="${aud.src}",description="提示音"),
  ArtifactPreview(src="${img.src}",kind="image",label="资产预览")]))`;
 }, {keepPage:true});
 try{
  const bodyFontA=await page.evaluate(()=>getComputedStyle(document.body).fontFamily);
  const foundA=await page.evaluate((tags:string[])=>tags.map(tag=>({tag,count:document.querySelectorAll(tag).length,family:document.querySelector(tag)?getComputedStyle(document.querySelector(tag)!).fontFamily:null})),mediaTags);
  assert.deepEqual(foundA.filter(f=>!f.count).map(f=>f.tag),[],'group A media/static components all render: '+JSON.stringify(foundA));
  assert.deepEqual(foundA.filter(f=>f.count&&f.family!==bodyFontA).map(f=>f.tag),[],'group A hosts inherit the themed body font: '+JSON.stringify(foundA));
  await shot(page,'ac001-groupA-media');
  assertClean(envA,'AC-001 group A');
 }finally{await envA.close();}
 const envB=await open(page,'rp-acc-forms',`tfName = TextField(label="名称",value="",placeholder="输入名称")
check = CheckBox(label="同意条款",value=false)
volume = Slider(label="音量",min=0,max=100,value=40,steps=10)
when = DateTimeInput(value="2026-11-17T10:30",enableDate=true,enableTime=true,label="时间")
tabs = Tabs(tabs=[{title:"概览",child:Text("概览内容")},{title:"明细",child:Text("明细内容")}])
more = Details(title="更多说明",child=Text("详情正文"),open=true)
explain = Modal(trigger=Text("打开说明"),content=Text("说明正文"))
entry = List(children=[Text("条目一"),Text("条目二")],direction="vertical")
grid = Row(children=[Column(children=[Text("左列")]),Column(children=[Text("右列")])])
root = Column(children=[tfName,check,volume,when,tabs,more,explain,entry,grid])`, {keepPage:true});
 try{
  const bodyFontB=await page.evaluate(()=>getComputedStyle(document.body).fontFamily);
  const foundB=await page.evaluate((tags:string[])=>tags.map(tag=>({tag,count:document.querySelectorAll(tag).length,family:document.querySelector(tag)?getComputedStyle(document.querySelector(tag)!).fontFamily:null})),formTags);
  assert.deepEqual(foundB.filter(f=>!f.count).map(f=>f.tag),[],'group B form/structure components all render: '+JSON.stringify(foundB));
  assert.deepEqual(foundB.filter(f=>f.count&&f.family!==bodyFontB).map(f=>f.tag),[],'group B hosts inherit the themed body font: '+JSON.stringify(foundB));
  await expect(page.locator('a2ui-tabs .a2ui-tab-button-active')).toHaveCount(1);
  assert.equal(await styleOf(page.locator('a2ui-tabs .a2ui-tab-button-active'),'color'),'rgb(54, 92, 219)','active tab keeps accent text');
  await shot(page,'ac001-groupB-forms');
  assertClean(envB,'AC-001 group B');
 }finally{await envB.close();}
 const envC=await open(page,'rp-acc-data',`$/pick = ["t"]
$/region = ["n"]
$/fvName = ""
chips = ChoicePicker(label="环境",displayStyle="chips",variant="mutuallyExclusive",options=[{label:"测试",value:"t"},{label:"生产",value:"p"}],value=$/pick)
region = SearchablePicker(label="区域",options=[{label:"北区",value:"n"},{label:"南区",value:"s"}],value=$/region,variant="mutuallyExclusive")
chart = Chart(kind="line",series=[{name:"基线",points:[{label:"一",value:1},{label:"二",value:2}]},{name:"对照",points:[{label:"一",value:2},{label:"二",value:1}]}])
table = DataTable(caption="样例表",columns=[{id:"k",label:"键"},{id:"v",label:"值"}],rows=[{id:"r1",cells:["甲",1]},{id:"r2",cells:["乙",2]}])
fvName = TextField(label="必填项",value=$/fvName)
fvSubmit = Button(child=Text("保存"),action=Event("record_data",{fvName:$/fvName,proposalId:"p1",resultId:"tr1"}))
fv = FormValidation(title="校验",buttons=["fvSubmit"],rules=[{fieldId:"fvName",message:"必填",required:true}])
progress = TaskProgress(stream="tools")
timeline = ActivityTimeline(stream="tools")
log = LogView(stream="tools")
results = TestResults(resultId="tr1",command="npm test",evidence="synthetic",cases=[{id:"t1",name:"基线",status:"pass",details:"ok"}],summary={pass:1,fail:0,skip:0,error:0})
noteText = Text(text="普通正文")
badge = StatusBadge(label="错误状态",status="error")
diff = CodeDiff(proposalId="p1",filename="src/a.ts",baseRevision="rev0",before="const a=1",after="const a=2")
root = Column(children=[noteText,badge,chips,region,chart,table,fvName,fvSubmit,fv,progress,timeline,log,results,diff])`);
 try{
  // group C covers its own subset; A+B+C subsets union to ALL32 (asserted below)
  const dataTags=['a2ui-basic-text','pi-a2ui-status-badge','a2ui-choicepicker','pi-a2ui-searchable-picker','pi-a2ui-chart','pi-a2ui-data-table','a2ui-basic-textfield','a2ui-basic-button','pi-a2ui-form-validation','pi-a2ui-task-progress','pi-a2ui-activity-timeline','pi-a2ui-log-view','pi-a2ui-test-results','pi-a2ui-code-diff','a2ui-basic-column'];
  const bodyFont=await page.evaluate(()=>getComputedStyle(document.body).fontFamily);
  const found=await page.evaluate((tags:string[])=>{
   const missing:string[]=[];const offFont:string[]=[];
   for(const tag of tags){
    const hosts=[...document.querySelectorAll(tag)];
    if(!hosts.length){missing.push(tag);continue;}
    const family=getComputedStyle(hosts[0]!).fontFamily;
    if(family!==getComputedStyle(document.body).fontFamily)offFont.push(tag+'='+family);
   }
   return{missing,offFont};
  },dataTags);
  assert.deepEqual(found.missing,[],'every declared component type renders: '+JSON.stringify(found));
  assert.deepEqual(found.offFont,[],'every component host inherits the themed body font: '+JSON.stringify(found));
  // A∪B∪C coverage equals the full 32-component catalog
  const union=[...new Set([...mediaTags,...formTags,...dataTags])].sort();
  assert.deepEqual(union,[...ALL32].sort(),'three groups cover the whole 32-component catalog');
  // state families stay themed (tabs asserted in group B; chips/searchable/badge live here)
  assert.equal(await styleOf(page.locator('a2ui-choicepicker .a2ui-chip-selected'),'background-color'),'rgb(54, 92, 219)','selected chip keeps accent fill');
  assert.equal(await styleOf(page.locator('pi-a2ui-searchable-picker .picker-options button[aria-pressed=true]'),'color'),'rgb(54, 92, 219)','selected searchable option keeps accent text');
  const badge=page.locator('pi-a2ui-status-badge .badge').filter({hasText:'错误状态'}).first();
  assert.notEqual(await styleOf(badge,'color'),'rgba(0, 0, 0, 0)','error badge text is painted');
  assert.notEqual(await styleOf(badge,'background-color'),'rgba(0, 0, 0, 0)','error badge background is painted');
  await shot(page,'ac001-groupC-1280');
  // effective-background contrast pairs (luminance ratio, WCAG) on the rich data surface
  const ratiosC=await page.evaluate(()=>{
   const lum=(color:string)=>{
    const m=color.match(/rgba?\(([\d.]+), ([\d.]+), ([\d.]+)(?:, ([\d.]+))?\)/);
    if(!m)return null;
    if(m[4]!==undefined&&parseFloat(m[4]!)===0)return null;
    const f=(v:string)=>{const c=parseFloat(v)/255;return c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4);};
    return 0.2126*f(m[1]!)+0.7152*f(m[2]!)+0.0722*f(m[3]!);
   };
   const bg=(node:Element)=>{
    let at:Element|null=node;
    while(at){const c=getComputedStyle(at).backgroundColor;const l=lum(c);if(l!==null)return{hex:c,ratioBase:l};at=at.parentElement;}
    return{hex:'rgb(255, 255, 255)',ratioBase:1};
   };
   const ratio=(fgL:number,bgL:number)=>{const [hi,lo]=fgL>bgL?[fgL,bgL]:[bgL,fgL];return (hi+0.05)/(lo+0.05);};
   const pick=(selector:string,prop:string)=>{const node=document.querySelector(selector);if(!node)return{selector,error:'missing'};const s=getComputedStyle(node);const fg=s.getPropertyValue(prop);const lfg=lum(fg);if(lfg===null)return{selector,fg,error:'fg luminance'};const b=bg(node);return{selector,fg,bg:b.hex,ratio:Math.round(ratio(lfg,b.ratioBase)*100)/100};};
   return{
    bodyText:pick('a2ui-basic-text:not(.a2ui-text-caption)','color'),
    caption:pick('pi-a2ui-data-table caption','color'),
    tick:pick('text.rp-tick','fill'),
    button:pick('.a2ui-button','color'),
    badge:pick('pi-a2ui-status-badge .badge','color'),
    muted:pick('a2ui-basic-textfield label','color')
   };
  });
  const weakC=Object.entries(ratiosC as Record<string,{selector?:string;ratio?:number;error?:string}>)
   .filter(([,v])=>v&&v.ratio!==undefined&&v.ratio<4.5).map(([k,v])=>k+'='+v.ratio+' ('+v.selector+')');
  const erroredC=Object.entries(ratiosC as Record<string,{selector?:string;ratio?:number;error?:string}>)
   .filter(([,v])=>v&&v.error).map(([k,v])=>k+':'+v.error);
  assert.deepEqual(erroredC,[],'all contrast probes resolved: '+JSON.stringify(ratiosC));
  assert.deepEqual(weakC,[],'effective-background contrast pairs meet 4.5:1: '+JSON.stringify(ratiosC));
  await shot(page,'ac001-contrast');
  assertClean(envC,'AC-001 group C');
 }finally{await envC.close();}
});

const AC003_SOURCE=`$/form/name = ""
name = TextField(label="资产名称",value=$/form/name)
submit = Button(child=Text("提交信息，等待确认"),action=Event("collect_asset",{name:$/form/name}))
validation = FormValidation(title="请先补齐以下信息",buttons=["submit"],rules=[{fieldId:"name",message:"请填写资产名称",required:true}])
more = Details(title="提交前会发生什么？",child=Text("缺少必填内容时只显示本地错误。"))
explain = Modal(trigger=Text("查看使用说明"),content=Text("本地说明弹窗，关闭后焦点应回到入口。"))
root = Card(child=Column(children=[name,validation,submit,more,explain]))`;

test('AC-003: 200% zoom keeps a guarded form usable and narrow viewports keep geometry sane',async({page})=>{
 const env=await open(page,'rp-acc-zoom',AC003_SOURCE);
 try{
  // hit-test: click the guarded submit while INVALID through physical coordinates at zoom
  // NOTE: headless Chromium cannot change browser-chrome zoom (Ctrl+= is inert);
  // this CSS zoom pass is a proxy. The physical-equivalent block below re-renders
  // at real 200% rendering parameters, but the ACTUAL browser-chrome 200% gate
  // (Spec028:63) requires a human desktop operation record that headless CI
  // cannot produce; that manual record is tracked in Check133 as an open item.
  const submit=page.getByRole('button',{name:'提交信息，等待确认'});
  await page.evaluate(()=>{(document.documentElement as HTMLElement).style.zoom='2';});
  await page.waitForTimeout(120);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  assert.ok(overflow<=0,'200% zoom must not create horizontal page overflow, delta='+overflow);
  const box=await submit.boundingBox();assert.ok(box,'submit has geometry at 200% zoom');
  await page.mouse.click(box!.x+box!.width/2,box!.y+box!.height/2);
  await expect(page.locator('.a2ui-field-error').first()).toBeVisible();// click through zoom reaches the guarded validation;
  assert.equal(env.posts.length,0,'guarded invalid submit posts nothing');
  // typing still lands in the field under zoom (input works, draft stays local)
  const input=page.getByRole('textbox').nth(0);
  await input.fill('缩放命中测试');
  await expect(input).toHaveValue('缩放命中测试');
  // modal geometry stays inside the zoomed viewport; Escape closes with focus return
  await page.getByText('查看使用说明').click();
  const dialog=page.locator('pi-a2ui-modal dialog');
  await expect(dialog).toBeVisible();
  const inView=await dialog.evaluate(node=>{const r=(node as HTMLElement).getBoundingClientRect();return r.left>=0&&r.top>=0&&r.right<=window.innerWidth&&r.bottom<=window.innerHeight;});
  assert.ok(inView,'modal stays inside the zoomed viewport');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();// Escape closes the native dialog;
  await expect(page.locator('.modal-trigger').first()).toBeFocused();// focus returns to the modal trigger after close;
  await shot(page,'ac003-zoom200-form');
  // narrow viewports keep the guarded form one-column and scrollable
  for(const [width,height,name] of [[360,740,'ac003-360'],[768,900,'ac003-768'],[1280,900,'ac003-1280']] as const){
   await page.setViewportSize({width,height});
   await page.evaluate(()=>{(document.documentElement as HTMLElement).style.zoom='';});
   await page.waitForTimeout(120);
   const narrowOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
   assert.ok(narrowOverflow<=0,width+'px viewport must not overflow horizontally, delta='+narrowOverflow);
   await shot(page,name);
  }
  assertClean(env,'AC-003');
 }finally{await env.close();}
 // Physical-equivalent 200%: a 1280-physical-px window at browser zoom 200%
 // renders a 640px CSS viewport with devicePixelRatio 2. This reproduces the
 // exact rendering parameters of real 200% zoom (same layout width, same DPR,
 // media queries re-evaluated) but does NOT operate the browser's own zoom
 // control; Spec028:63 therefore still requires the separate human desktop
 // record, tracked in Check133.
 const browser=page.context().browser();assert.ok(browser,'browser fixture available');
 const zoomContext=await browser.newContext({viewport:{width:640,height:450},deviceScaleFactor:2,colorScheme:'light',reducedMotion:'reduce',locale:'en-US',timezoneId:'UTC'});
 let zenv:Env|null=null;
 try{
  const zoomPage=await zoomContext.newPage();
  zenv=await open(zoomPage,'rp-acc-zoom-physical',AC003_SOURCE);
  const params=await zoomPage.evaluate(()=>({dpr:window.devicePixelRatio,innerWidth:window.innerWidth,stacked:getComputedStyle(document.querySelector('a2ui-basic-row')??document.body).display}));
  assert.equal(params.dpr,2,'devicePixelRatio 2 matches real 200% zoom on a 1280-physical-px window');
  assert.equal(params.innerWidth,640,'CSS viewport 640 matches real 200% zoom layout width');
  const overflow=await zoomPage.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  assert.ok(overflow<=0,'200% physical zoom must not create horizontal page overflow, delta='+overflow);
  const zsubmit=zoomPage.getByRole('button',{name:'提交信息，等待确认'});
  await zsubmit.click({timeout:3000});
  await expect(zoomPage.locator('.a2ui-field-error').first()).toBeVisible();// guarded validation reachable at real 200% zoom;
  assert.equal(zenv.posts.length,0,'invalid submit posts nothing at physical 200%');
  const zinput=zoomPage.getByRole('textbox').nth(0);
  await zinput.fill('物理缩放命中');
  await expect(zinput).toHaveValue('物理缩放命中');
  await zoomPage.getByText('查看使用说明').click();
  const zdialog=zoomPage.locator('pi-a2ui-modal dialog');
  await expect(zdialog).toBeVisible();
  const zInView=await zdialog.evaluate(node=>{const r=(node as HTMLElement).getBoundingClientRect();return r.left>=0&&r.top>=0&&r.right<=window.innerWidth&&r.bottom<=window.innerHeight;});
  assert.ok(zInView,'modal stays inside the 200% viewport');
  await zoomPage.keyboard.press('Escape');
  await expect(zdialog).toBeHidden();
  await expect(zoomPage.locator('.modal-trigger').first()).toBeFocused();// focus return works at physical 200% zoom;
  await shot(zoomPage,'ac003-zoom200-physical');
  assert.deepEqual(zenv.pageErrors,[],'physical zoom flow: no page errors');
  assert.equal(zenv.externalBlocked.count,0,'physical zoom flow: no external requests');
 }finally{
  if(zenv)await zenv.close();
  await zoomContext.close();
 }
});

test('AC-004/007: keyboard flow, guarded errors, modal return focus and paused inertness',async({page})=>{
 const env=await open(page,'rp-acc-kbd',`$/form/name = ""
$/form/team = ""
$/form/note = ""
name = TextField(label="资产名称",value=$/form/name)
team = TextField(label="责任团队",value=$/form/team)
note = TextField(label="登记备注",value=$/form/note)
submit = Button(child=Text("提交信息，等待确认"),action=Event("collect_asset",{name:$/form/name,team:$/form/team,note:$/form/note}))
validation = FormValidation(title="请先补齐以下信息",buttons=["submit"],rules=[{fieldId:"name",message:"请填写资产名称",required:true},{fieldId:"team",message:"请填写责任团队",required:true},{fieldId:"note",message:"请填写登记备注",required:true}])
explain = Modal(trigger=Text("查看使用说明"),content=Text("本地说明弹窗，关闭后焦点应回到入口，不触发Pi动作。"))
root = Card(child=Column(children=[name,team,note,validation,submit,explain]))`);
 try{
  // keyboard order: fields follow source order (page chrome owns the first stops)
  await page.getByRole('textbox').nth(0).focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('textbox').nth(1)).toBeFocused();// next Tab reaches the second field
  // guarded submit: empty submit shows local errors, posts nothing
  await page.getByRole('button',{name:'提交信息，等待确认'}).click();
  await expect(page.locator('.a2ui-field-error')).toHaveCount(3);
  assert.equal(env.posts.length,0,'invalid guarded submit posts nothing');
  await page.getByRole('textbox').nth(0).fill('画布渲染基线');
  await page.getByRole('textbox').nth(1).fill('交互团队');
  await page.getByRole('textbox').nth(2).fill('仅收集信息');
  await page.getByRole('button',{name:'提交信息，等待确认'}).click();
  await expect(page.locator('.a2ui-field-error')).toHaveCount(0);
  // modal focus return (native dialog, Escape -> close -> trigger focus)
  await page.getByText('查看使用说明').click();
  const dialog=page.locator('pi-a2ui-modal dialog');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(page.locator('.modal-trigger').first()).toBeFocused();// modal focus returns to its trigger
  // pause: surfaces go inert, Tab cannot enter, status announces, valid POSTS blocked
  const validPosts=env.posts.length;
  env.session.setEnabled(false);
  await expect(page.locator('#status')).toHaveText('Canvas paused');
  const inert=await page.evaluate(()=>{const root=document.querySelector('#surfaces');return root?(root as HTMLElement).inert:null;});
  assert.equal(inert,true,'#surfaces container is inert while paused');
  const surfaceCount=await page.locator('a2ui-surface').count();assert.ok(surfaceCount>0,'surface present while paused');
  await page.locator('body').click({position:{x:4,y:400}});
  for(let i=0;i<8;i++)await page.keyboard.press('Tab');
  const inside=await page.evaluate(()=>!!document.activeElement?.closest('a2ui-surface'));
  assert.ok(!inside,'Tab cannot move focus into a paused canvas');
  env.session.setEnabled(true);
  await expect(page.locator('#status')).toHaveText('Ready for your input');
  await expect.poll(()=>page.evaluate(()=>[...document.querySelectorAll('a2ui-surface')].every(node=>!(node as HTMLElement).inert))).toBe(true);
  assert.equal(env.posts.length,validPosts,'pause window posts nothing');
  assertClean(env,'AC-004/007');
 }finally{await env.close();}
});

test('AC-006: visual changes keep drafts and revision/epoch; updateChart forward/reverse keeps legend marks, finite ticks and values',async({page})=>{
 const env=await open(page,'rp-acc-chart',`$/draft = ""
field = TextField(label="备注",value=$/draft)
chart = Chart(kind="line",series=[{name:"基线",points:[{label:"一",value:1},{label:"二",value:2}]}])
root = Column(children=[field,chart])`);
 try{
  const field=page.getByRole('textbox');
  await field.fill('动态更新期间保留草稿');
  const snap=env.session.snapshot();
  const surface=snap.surfaces.find(s=>s.surfaceId==='rp-acc-chart');assert.ok(surface);
  const chartComp=surface.message.createSurface.components.find(c=>c.component==='Chart');assert.ok(chartComp,'chart component present in snapshot');
  const componentId=chartComp.id;
  const revision=surface.revision;
  const epoch=snap.epoch;
  // Spec AC-006: drafts and revision/epoch must not be reset by VISUAL changes
  await page.emulateMedia({colorScheme:'dark'});
  await page.setViewportSize({width:360,height:740});
  await page.emulateMedia({colorScheme:'light'});
  await page.setViewportSize({width:1280,height:900});
  await expect(field).toHaveValue('动态更新期间保留草稿');// draft survives visual-only changes;
  const afterVisual=env.session.snapshot();
  assert.equal(afterVisual.epoch,epoch,'visual changes never bump the epoch');
  assert.equal(afterVisual.surfaces[0]!.dataSequence,0,'visual changes never touch the data sequence');
  assert.equal(afterVisual.surfaces[0]!.revision,revision,'visual changes never bump the revision');
  // forward: add a second series (data update)
  env.session.updateChart('rp-acc-chart',revision,componentId,[{name:'基线',points:[{label:'一',value:1},{label:'二',value:2}]},{name:'对照',points:[{label:'一',value:2},{label:'二',value:1}]}]);
  await expect(page.locator('.rp-legend li')).toHaveCount(2);
  const marks=await page.evaluate(()=>[...document.querySelectorAll('svg.rp-plot g[data-series]')].map(g=>({series:g.getAttribute('data-series'),dash:g.querySelector('polyline')?.getAttribute('stroke-dasharray')??null,marker:g.getAttribute('data-mark')})));
  assert.deepEqual(marks.map(m=>m.dash),['none','7 3'],'series keeps its deterministic dash mapping after update');
  const ticks=await page.evaluate(()=>[...document.querySelectorAll('svg.rp-plot text.rp-tick')].map(t=>t.textContent));
  assert.ok(ticks.length>=2&&ticks.every(t=>t!==''&&Number.isFinite(parseFloat(t!))),'ticks stay finite and labeled: '+JSON.stringify(ticks));
  const values=await page.locator('.values tbody tr').allTextContents();
  assert.equal(values.length,4,'values table covers both series after update');
  // exact cell contract: every row is [series, label, value] in supply order
  const cells=await page.evaluate(()=>[...document.querySelectorAll('.values tbody tr')].map(tr=>[...tr.querySelectorAll('td')].map(td=>td.textContent)));
  assert.deepEqual(cells,[['基线','一','1'],['基线','二','2'],['对照','一','2'],['对照','二','1']],'values table matches the exact supplied series after update');
  // finite geometry with strict parsing: attributes must exist, be non-empty,
  // form proper x,y pairs, one pair per supplied point, and all finite
  const coords=await page.evaluate(()=>({
   polylines:[...document.querySelectorAll('svg.rp-plot polyline')].map(pl=>{
    const raw=pl.getAttribute('points')??'';
    const pairs=raw.trim()===''?[]:raw.trim().split(/\s+/).map(pair=>pair.split(',').map(Number));
    return{raw,pairs,wellFormed:pairs.length>0&&pairs.every(pair=>pair.length===2&&pair.every(n=>Number.isFinite(n)))};
   }),
   ticks:[...document.querySelectorAll('svg.rp-plot text.rp-tick')].map(t=>({x:t.getAttribute('x'),y:t.getAttribute('y')})),
  }));
  assert.deepEqual(coords.polylines.map(pl=>pl.wellFormed),[true,true],'both polylines have well-formed non-empty coordinate pairs');
  assert.deepEqual(coords.polylines.map(pl=>pl.pairs.length),[2,2],'each polyline has exactly one pair per supplied point');
  assert.ok(coords.ticks.length>=2&&coords.ticks.every(t=>t.x!==null&&t.y!==null&&Number(t.x)!==0&&Number(t.y)!==0&&Number.isFinite(Number(t.x))&&Number.isFinite(Number(t.y))),'every tick has present non-zero finite x/y coordinates');
  const afterForward=env.session.snapshot();
  assert.equal(afterForward.surfaces[0]!.dataSequence,1,'updateChart advances the data sequence exactly once');
  assert.equal(afterForward.surfaces[0]!.revision,revision,'data update keeps the revision stable');
  assert.equal(afterForward.epoch,epoch,'data update keeps the epoch');
  // Data updates patch per-component, so the uncommitted draft survives
  // updateChart too (stronger than the Spec028:72 visual-only contract);
  // pinned here so silent draft loss cannot regress.
  await expect(field).toHaveValue('动态更新期间保留草稿');
  // reverse: back to one series
  const snap2=env.session.snapshot();
  const surface2=snap2.surfaces.find(s=>s.surfaceId==='rp-acc-chart');assert.ok(surface2);
  env.session.updateChart('rp-acc-chart',surface2.revision,componentId,[{name:'基线',points:[{label:'一',value:1},{label:'二',value:2}]}]);
  await expect(page.locator('.rp-legend li')).toHaveCount(1);
  const afterReverse=env.session.snapshot();
  assert.equal(afterReverse.surfaces[0]!.dataSequence,2,'reverse update advances the data sequence again');
  assert.equal(afterReverse.surfaces[0]!.revision,revision,'revision stays stable across the update cycle');
  assert.equal(await page.locator('.values tbody tr').count(),2,'reverse update restores the one-series values table');
  // reverse gets the same-strength assertions as forward (review R3 suggestion 2)
  const revCells=await page.evaluate(()=>[...document.querySelectorAll('.values tbody tr')].map(tr=>[...tr.querySelectorAll('td')].map(td=>td.textContent)));
  assert.deepEqual(revCells,[['基线','一','1'],['基线','二','2']],'reverse values table matches the exact supplied series');
  const revCoords=await page.evaluate(()=>[...document.querySelectorAll('svg.rp-plot polyline')].map(pl=>{const raw=pl.getAttribute('points')??'';const pairs=raw.trim()===''?[]:raw.trim().split(/\s+/).map(pair=>pair.split(',').map(Number));return{pairs,ok:pairs.length===2&&pairs.every(pair=>pair.length===2&&pair.every(n=>Number.isFinite(n)))};}));
  assert.deepEqual(revCoords.map(entry=>entry.ok),[true],'reverse polyline is well-formed with one pair per point');
  assert.equal(afterReverse.epoch,epoch,'reverse update keeps the epoch');
  await expect(field).toHaveValue('动态更新期间保留草稿');// draft survives the reverse data update too;
  assert.equal(env.posts.length,0,'data-only updates post nothing');
  // stale revision is rejected and the page is untouched
  const before=env.session.snapshot();
  assert.throws(()=>env.session.updateChart('rp-acc-chart',revision+1,componentId,[{name:'迟到的',points:[{label:'旧',value:9}]}]),/Stale chart surface revision/,'stale revision rejected');
  assert.deepEqual(env.session.snapshot(),before,'rejected update leaves the session untouched');
  await shot(page,'ac006-updatechart-reverse');
  assertClean(env,'AC-006');
 }finally{await env.close();}
});
