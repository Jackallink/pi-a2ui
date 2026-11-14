import { test as base, expect, type Page } from "@playwright/test";
import { UiSession } from "../src/session.ts";
import { startServer } from "../src/server.ts";

const form = (title = "Plan") => `$/form/name = ""
root = Card(Column([Text(${JSON.stringify(title)}), TextField("Name", $/form/name), Button(Text("Submit"), action=Event("submit", {name: $/form/name, kind: "plan"}))]))`;

type Canvas = { session: UiSession; sent: string[]; origin: string };
const test = base.extend<{ canvas: Canvas }>({
  canvas: async ({ page }, use) => {
    const sent: string[] = [];
    const session = new UiSession((text) => { sent.push(text); });
    session.render("form", form());
    const server = await startServer(session);
    // Authenticate without putting a bootstrap credential into browser failure URLs.
    const token = new URLSearchParams(new URL(server.openUrl).hash.slice(1)).get("token");
    const response = await page.request.post(`${server.origin}/api/connect`, {
      headers: { origin: server.origin }, data: { token },
    });
    expect(response.status()).toBe(200);
    try { await use({ session, sent, origin: server.origin }); }
    finally { await page.close(); await server.close(); session.close(); }
  },
});
test.use({ launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } });

async function open(page: Page, canvas: Canvas) {
  await page.goto(canvas.origin);
  await expect(page.getByRole("textbox")).toBeVisible();
}

async function delayActions(page: Page) {
  await page.addInitScript(() => {
    const realFetch = window.fetch.bind(window);
    const held: { resolve: (response: Response) => void; signal?: AbortSignal | null }[] = [];
    Object.assign(window, {
      heldActions: held,
      finishAction: (index: number) => held[index].resolve(new Response("{}", { status: 202 })),
    });
    window.fetch = (input, options) => {
      if (input === "/api/actions") {
        // Deliberately ignore abort: a late completion must still be harmless.
        return new Promise<Response>((resolve) => held.push({ resolve, signal: options?.signal }));
      }
      return realFetch(input, options);
    };
  });
}
const heldCount = (page: Page) => page.evaluate(() => (window as any).heldActions.length as number);
const finishAction = (page: Page, index: number) => page.evaluate((i) => (window as any).finishAction(i), index);

test("official form submits draft context and literal text remains escaped", async ({ page, canvas }) => {
  const errors: string[] = []; const external: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => { if (!request.url().startsWith(canvas.origin)) external.push(request.url()); });
  const literal = "<img src='https://example.invalid/a'> **literal**";
  canvas.session.render("form", form(literal));
  await open(page, canvas);
  await expect(page.getByText(literal, { exact: true })).toBeVisible();
  await expect(page.locator("img")).toHaveCount(0);
  await page.getByRole("textbox").fill("Ada from browser");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.locator("#notice")).toHaveText("Sent to Pi");
  expect(canvas.sent).toHaveLength(1);
  expect(canvas.sent[0]).toContain('"name":"Ada from browser"');
  expect(external).toEqual([]); expect(errors).toEqual([]);
});

test("unrelated surfaces and reconnect preserve drafts; replacement and reset clear them", async ({ page, canvas }) => {
  await open(page, canvas);
  const input = page.getByRole("textbox");
  await input.fill("Unsent draft");
  await input.evaluate((element) => { (window as any).originalInput = element; });
  canvas.session.render("other", 'root = Card(Text("Another surface"))');
  await expect(page.getByText("Another surface", { exact: true })).toBeVisible();
  await expect(input).toHaveValue("Unsent draft");
  expect(await input.evaluate((element) => element === (window as any).originalInput)).toBe(true);
  // BFCache's reconnect path reopens SSE and applies the complete current snapshot.
  await page.evaluate(() => {
    window.dispatchEvent(new PageTransitionEvent("pagehide"));
    window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true }));
  });
  await expect(page.locator("#connection")).toHaveText("Connected to Pi");
  await expect(input).toHaveValue("Unsent draft");
  expect(await input.evaluate((element) => element === (window as any).originalInput)).toBe(true);
  canvas.session.render("form", form("Replacement"));
  await expect(page.getByText("Replacement", { exact: true })).toBeVisible();
  await expect(input).toHaveValue("");
  await input.fill("Old epoch draft");
  canvas.session.reset(); canvas.session.render("form", form("New epoch"));
  await expect(page.getByText("New epoch", { exact: true })).toBeVisible();
  await expect(input).toHaveValue("");
  await expect(page.getByText("Another surface", { exact: true })).toHaveCount(0);
});

for (const change of ["epoch", "revision"] as const) {
  test(`obsolete pending POST releases new ${change} canvas and cannot clobber its operation`, async ({ page, canvas }) => {
    await delayActions(page); await open(page, canvas);
    await page.getByRole("textbox").fill("Old");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect.poll(() => heldCount(page)).toBe(1);
    await expect(page.locator("#surfaces")).toHaveAttribute("aria-busy", "true");
    if (change === "epoch") canvas.session.reset();
    canvas.session.render("form", form("Current form"));
    await expect(page.getByText("Current form", { exact: true })).toBeVisible();
    await expect(page.locator("#surfaces")).toHaveAttribute("aria-busy", "false");
    await page.getByRole("textbox").fill("Current");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect.poll(() => heldCount(page)).toBe(2);
    await finishAction(page, 0);
    await expect(page.locator("#notice")).toHaveText("Sending…");
    await expect(page.locator("#surfaces")).toHaveAttribute("aria-busy", "true");
    expect(await page.evaluate(() => (window as any).heldActions[0].signal.aborted)).toBe(true);
    await finishAction(page, 1);
    await expect(page.locator("#notice")).toHaveText("Sent to Pi");
    await expect(page.locator("#surfaces")).toHaveAttribute("aria-busy", "false");
  });
}

test("15 second action deadline releases busy state, reports uncertainty and never retries", async ({ page, canvas }) => {
  await delayActions(page); await open(page, canvas);
  await page.clock.install();
  await page.getByRole("textbox").fill("Uncertain");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect.poll(() => heldCount(page)).toBe(1);
  await page.clock.fastForward(15_001);
  await expect(page.locator("#notice")).toHaveText("Delivery is uncertain. Check Pi before sending again.");
  await expect(page.locator("#surfaces")).toHaveAttribute("aria-busy", "false");
  expect(await heldCount(page)).toBe(1);
  await finishAction(page, 0);
  await expect(page.locator("#notice")).toHaveText("Delivery is uncertain. Check Pi before sending again.");
  expect(await heldCount(page)).toBe(1);
});

test('typed controls submit actual values and tab navigation preserves bound drafts', async({page,canvas})=>{
 canvas.session.render('form',`$/f/ok = false
$/f/n = 2
$/f/options = ["a"]
$/f/date = "2026-11-13"
$/f/name = ""
root = Column([Tabs([{title:"Inputs",child:Column([TextField("Draft", $/f/name),CheckBox("Enabled", $/f/ok),Slider(label="Count",min=0,max=10,value=$/f/n,steps=10),ChoicePicker(label="Features",variant="multipleSelection",options=[{label:"Alpha",value:"a"},{label:"Beta",value:"b"}],value=$/f/options),DateTimeInput($/f/date,enableDate=true,enableTime=false,label="Date")])},{title:"Details",child:Text("Second panel")}]),Divider(),Button(Text("Save typed"),action=Event("save",{ok:$/f/ok,n:$/f/n,options:$/f/options,date:$/f/date,name:$/f/name}))])`);
 await page.goto(canvas.origin);
 await page.locator('input[type=text]').fill('Typed draft');
 await page.getByRole('checkbox',{name:'Enabled',exact:true}).check();
 await page.getByRole('slider').evaluate(e=>{(e as HTMLInputElement).value='7';e.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.getByRole('checkbox',{name:'Alpha',exact:true}).uncheck();
 await page.getByRole('checkbox',{name:'Beta',exact:true}).check();
 await page.locator('input[type=date]').fill('2026-12-25');
 await page.getByRole('button',{name:'Details',exact:true}).click();
 await expect(page.getByText('Second panel',{exact:true})).toBeVisible();
 canvas.session.render('other','root = Text("Unrelated")');
 await page.getByRole('button',{name:'Inputs',exact:true}).click();
 await expect(page.locator('input[type=text]')).toHaveValue('Typed draft');
 await expect(page.getByRole('checkbox',{name:'Enabled',exact:true})).toBeChecked();
 await page.getByRole('button',{name:'Save typed',exact:true}).click();
 await expect(page.locator('#notice')).toHaveText('Sent to Pi');
 expect(JSON.parse(canvas.sent[0].split('\n')[1]).context).toEqual({ok:true,n:7,options:['b'],date:'2026-12-25',name:'Typed draft'});
});

test('combined local date/time edits submit an equivalent whole-hour boundary',async({page,canvas})=>{
 canvas.session.render('form',`$/when = "2026-11-13T12:00"
root = Column([DateTimeInput($/when,enableDate=true,enableTime=true,min="2026-11-13T12:00:00",max="2026-11-14T13:00:00",label="When"),Button(Text("Save date"),action=Event("save",{when:$/when}))])`);
 await page.goto(canvas.origin);
 await expect(page.locator('input[type=date]')).toHaveValue('2026-11-13');
 await expect(page.locator('input[type=time]')).toHaveValue('12:00');
 await page.locator('input[type=date]').fill('2026-11-14');
 await page.locator('input[type=time]').fill('13:00');
 await page.getByRole('button',{name:'Save date',exact:true}).click();
 await expect(page.locator('#notice')).toHaveText('Sent to Pi');
 expect(JSON.parse(canvas.sent[0].split('\n')[1]).context.when).toBe('2026-11-14T13:00:00');
});

test('coding components escape source and display exact reported outcomes before ID-bound follow-up',async({page,canvas})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 canvas.session.render('form',`root = Column([CodeDiff(proposalId="p-browser",filename="new.ts",baseRevision="base",before="",after="<script>globalThis.bad = true</script>\\n新代码"),TestResults(resultId="r-browser",command="node --test",evidence="tool output run-browser",cases=[{id:"a",name:"Pass",status:"pass"},{id:"b",name:"Fail",status:"fail",details:"<img src=x>"},{id:"c",name:"Skip",status:"skip"},{id:"d",name:"Error",status:"error"}],summary={pass:1,fail:1,skip:1,error:1}),Button(Text("Review choice"),action=Event("review",{proposalId:"p-browser",resultId:"r-browser"}))])`);
 await page.goto(canvas.origin);
 await expect(page.getByText('new.ts',{exact:true})).toBeVisible();
 await expect(page.getByText('<script>globalThis.bad = true</script>',{exact:true})).toBeVisible();
 await expect(page.getByText('1 pass · 1 fail · 1 skip · 1 error',{exact:true})).toBeVisible();
 await expect(page.locator('pi-a2ui-code-diff .add')).toHaveCount(2);
 await expect(page.locator('pi-a2ui-code-diff .add').first()).toHaveCSS('display','flex');
 await expect(page.locator('pi-a2ui-code-diff .add').first()).toHaveCSS('background-color','rgb(220, 252, 231)');
 await expect(page.locator('pi-a2ui-code-diff pre').first()).toHaveCSS('white-space','pre-wrap');
 await expect(page.locator('pi-a2ui-test-results tbody tr')).toHaveCount(4);
 await expect(page.locator('pi-a2ui-code-diff script,pi-a2ui-test-results img')).toHaveCount(0);
 expect(await page.evaluate(()=>(globalThis as any).bad)).toBeUndefined();
 await page.getByRole('button',{name:'Review choice',exact:true}).click();
 await expect(page.locator('#notice')).toHaveText('Sent to Pi');
 expect(JSON.parse(canvas.sent[0].split('\n')[1]).context).toEqual({proposalId:'p-browser',resultId:'r-browser'});expect(errors).toEqual([]);
});

const liveSource=`$/name = ""
chart = Chart(kind="line",series=[{name:"A",points:[{label:"one",value:1}]}])
root = Column([TextField("Live draft",$/name),LogView(stream="tools"),chart,Button(Text("Continue live"),action=Event("continue",{name:$/name}))])`;
test('live batches preserve input identity, pause selection and current form authority',async({page,canvas})=>{
 canvas.session.render('form',liveSource);await page.goto(canvas.origin);const input=page.locator('input[type=text]');await input.fill('Unsent live draft');await input.evaluate(e=>(window as any).liveInput=e);
 canvas.session.updateLog('first output','running',false);await expect(page.locator('pi-a2ui-log-view pre')).toHaveText('first output');
 await page.getByRole('button',{name:'Pause log display',exact:true}).click();
 await page.locator('pi-a2ui-log-view pre').evaluate(e=>{const r=document.createRange();r.selectNodeContents(e);const s=getSelection()!;s.removeAllRanges();s.addRange(r);});
 canvas.session.updateLog('second output','running',false);canvas.session.updateChart('form',2,'chart',[{name:'A',points:[{label:'one',value:3}]}]);
 await expect(page.locator('pi-a2ui-chart tbody tr td').last()).toHaveText('3');
 await expect(page.locator('pi-a2ui-log-view pre')).toHaveText('first output');expect(await page.evaluate(()=>getSelection()?.toString())).toBe('first output');
 await page.getByRole('button',{name:'Resume log display',exact:true}).click();await expect(page.locator('pi-a2ui-log-view pre')).toHaveText('second output');
 await expect(input).toHaveValue('Unsent live draft');expect(await input.evaluate(e=>e===(window as any).liveInput)).toBe(true);
 await page.getByRole('button',{name:'Continue live',exact:true}).click();await expect(page.locator('#notice')).toHaveText('Sent to Pi');expect(canvas.sent[0]).toContain('"name":"Unsent live draft"');
});
test('live sequence gap reconnects a bounded snapshot and ignores superseded source events',async({page,canvas})=>{
 await page.addInitScript(()=>{const Native=window.EventSource;const streams:EventSource[]=[];(window as any).testStreams=streams;window.EventSource=class extends Native{constructor(url:string|URL,options?:EventSourceInit){super(url,options);streams.push(this);}};});
 canvas.session.render('form',liveSource);await page.goto(canvas.origin);const input=page.locator('input[type=text]');await input.fill('Gap draft');await input.evaluate(e=>(window as any).liveInput=e);
 canvas.session.updateLog('coherent snapshot','running',false);await expect(page.locator('pi-a2ui-log-view pre')).toHaveText('coherent snapshot');
 const snapshot=canvas.session.snapshot();const record=snapshot.surfaces[0];const log=record.message.createSurface.components.find(c=>c.component==='LogView')!;
 const gap={epoch:snapshot.epoch,surfaces:[{surfaceId:'form',revision:record.revision,sequence:(record.dataSequence??0)+2,components:[{...log,text:'GAP SHOULD NOT APPLY'}]}]};
 await page.evaluate(batch=>(window as any).testStreams[0].dispatchEvent(new MessageEvent('data',{data:JSON.stringify(batch)})),gap);
 await expect.poll(()=>page.evaluate(()=>(window as any).testStreams.length)).toBe(2);await expect(page.locator('#connection')).toHaveText('Connected to Pi');
 await expect(page.locator('pi-a2ui-log-view pre')).toHaveText('coherent snapshot');
 await page.evaluate(batch=>(window as any).testStreams[0].dispatchEvent(new MessageEvent('data',{data:JSON.stringify(batch)})),{...gap,surfaces:[{...gap.surfaces[0],sequence:(record.dataSequence??0)+1,components:[{...log,text:'STALE SOURCE'}]}]});
 canvas.session.updateLog('latest after recovery','completed',false);await expect(page.locator('pi-a2ui-log-view pre')).toHaveText('latest after recovery');await expect(input).toHaveValue('Gap draft');expect(await input.evaluate(e=>e===(window as any).liveInput)).toBe(true);
});
test('chart SVG coordinates remain finite for extreme signed data and match accessible values',async({page,canvas})=>{
 canvas.session.render('form',`root = Chart(kind="bar",series=[{name:"Signed",points:[{label:"negative",value:-1e308},{label:"zero",value:0},{label:"positive",value:1e308}]}])`);await page.goto(canvas.origin);await expect(page.locator('pi-a2ui-chart rect')).toHaveCount(3);expect(await page.locator('pi-a2ui-chart svg').evaluate(e=>e.outerHTML)).not.toMatch(/NaN|Infinity/);await expect(page.locator('pi-a2ui-chart tbody tr td').last()).toHaveText('1e+308');
 canvas.session.updateChart('form',2,'root',[{name:'Signed',points:[]}]);await expect(page.getByText('No data yet',{exact:true})).toBeVisible();
});

test('log view follows the bottom until the user scrolls upward',async({page,canvas})=>{
 canvas.session.render('form',liveSource);await page.goto(canvas.origin);const pre=page.locator('pi-a2ui-log-view pre');const text=Array.from({length:200},(_,i)=>'line '+i).join('\n');canvas.session.updateLog(text,'running',false);await expect(pre).toHaveText(text);
 await expect.poll(()=>pre.evaluate(e=>e.scrollTop+e.clientHeight>=e.scrollHeight-2)).toBe(true);await pre.evaluate(e=>{e.scrollTop=0;});canvas.session.updateLog(text+'\nnew line','running',false);await expect(pre).toContainText('new line');expect(await pre.evaluate(e=>e.scrollTop)).toBe(0);
});

test('W1 List and DataTable sort numeric cells, filter locally and distinguish empty/loading/error',async({page,canvas})=>{
 const source='root = List([DataTable(caption="Files",columns=[{id:"name",label:"Name"},{id:"size",label:"Size"}],rows=[{id:"a",cells:["<script>x</script>",10]},{id:"b",cells:["b",2]}])])';
 canvas.session.render('other',source);await open(page,canvas);await page.locator('input[type=text]').fill('Keep draft');
 const table=page.locator('pi-a2ui-data-table');await expect(table.locator('tbody tr')).toHaveCount(2);await expect(table.locator('script')).toHaveCount(0);
 await table.getByRole('button',{name:'Size',exact:true}).click();await expect(table.locator('tbody tr').first()).toHaveText('b2');
 await table.getByRole('searchbox').fill('script');await expect(table.locator('tbody tr')).toHaveCount(1);expect(canvas.sent).toHaveLength(0);await expect(page.locator('input[type=text]')).toHaveValue('Keep draft');
 for(const [state,text]of [['ready','No results'],['loading','Loading data'],['error','Data unavailable']]){canvas.session.render('other',`root = DataTable(caption="Empty",columns=[{id:"a",label:"A"}],rows=[],state="${state}")`);await expect(page.getByText(text,{exact:true})).toBeVisible();}
});

test('W1 table mixed-type order is deterministic and ties stable; bounded table scrolls',async({page,canvas})=>{
 const rows=[{id:'n',cells:[null,'null']},{id:'f',cells:[false,'false']},{id:'t',cells:[true,'true']},{id:'a',cells:[2,'first']},{id:'b',cells:[2,'second']},{id:'s',cells:['2','string']}];
 canvas.session.render('form',`root = DataTable(caption="Types",columns=[{id:"v",label:"Value"},{id:"id",label:"Row"}],rows=${JSON.stringify(rows)})`);await page.goto(canvas.origin);const table=page.locator('pi-a2ui-data-table');await table.getByRole('button',{name:'Value',exact:true}).click();expect(await table.locator('tbody tr td:last-child').allTextContents()).toEqual(['null','false','true','first','second','string']);
 const many=Array.from({length:200},(_,i)=>({id:'r'+i,cells:[i]}));canvas.session.render('form',`root = DataTable(caption="Many",columns=[{id:"a",label:"A"}],rows=${JSON.stringify(many)})`);await expect(table.locator('tbody tr')).toHaveCount(200);expect(await table.locator('.table-scroll').evaluate(e=>e.scrollHeight>e.clientHeight)).toBe(true);
});

test('W2 code preserves whitespace, clipboard success/failure stays local, Markdown has no executable URLs',async({page,canvas})=>{
 await page.addInitScript(()=>{Object.defineProperty(navigator,'clipboard',{value:{writeText:async(text:string)=>{if((window as any).rejectCopy)throw new Error('denied');(window as any).copied=text;}}});});
 const code='  <script>x</script>\n\tconst x = 1;\n';
 canvas.session.render('other',`root = Column([CodeBlock(code=${JSON.stringify(code)},language="ts"),MarkdownView(text="# Heading\\n\\n**Bold** and *italic* and \u0060inline\u0060\\n\\n- First\\n- Second\\n\\n1. Ordered\\n\\n\u0060\u0060\u0060ts\\n  <img src=x>\\n\u0060\u0060\u0060\\n\\n[link](https://example.invalid) <script>bad()</script>"),Text("**literal**")])`);await open(page,canvas);
 const block=page.locator('pi-a2ui-code-block');await expect(block.locator('code')).toHaveText(code,{useInnerText:false});expect(await block.locator('code').textContent()).toBe(code);
 await block.getByRole('button',{name:'Copy code',exact:true}).click();expect(await page.evaluate(()=>(window as any).copied)).toBe(code);await expect(block.getByRole('status')).toHaveText('Copied');
 await page.evaluate(()=>(window as any).rejectCopy=true);await block.getByRole('button',{name:'Copy code',exact:true}).click();await expect(block.getByRole('status')).toHaveText('Copy unavailable; select the code manually');expect(canvas.sent).toHaveLength(0);
 const md=page.locator('pi-a2ui-markdown');await expect(md.getByRole('heading',{name:'Heading',exact:true})).toBeVisible();await expect(md.locator('strong')).toHaveText('Bold');await expect(md.locator('em')).toHaveText('italic');await expect(md.locator('ul li')).toHaveCount(2);await expect(md.locator('ol li')).toHaveCount(1);await expect(md.locator('a,img,script')).toHaveCount(0);await expect(page.getByText('**literal**',{exact:true})).toBeVisible();
});
test('W2 native clipboard receives exact code from user click',async({page,context,canvas})=>{
 await context.grantPermissions(['clipboard-read','clipboard-write'],{origin:canvas.origin});const code='  hello\n\t世界\n';canvas.session.render('form',`root = CodeBlock(code=${JSON.stringify(code)})`);await page.goto(canvas.origin);await page.getByRole('button',{name:'Copy code',exact:true}).click();await expect(page.getByRole('status').filter({hasText:'Copied'})).toBeVisible();expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe(code);expect(canvas.sent).toEqual([]);
});

test('W2 Markdown treats CRLF and CR as logical line breaks',async({page,canvas})=>{canvas.session.render('form',`root = MarkdownView(text=${JSON.stringify('# Title\r\n\r\n- One\r- Two')})`);await page.goto(canvas.origin);await expect(page.getByRole('heading',{name:'Title',exact:true})).toBeVisible();await expect(page.locator('pi-a2ui-markdown li')).toHaveCount(2);});
test('W3 native disclosures preserve open draft selection and scroll during live patches',async({page,canvas})=>{
 const source='$/name = ""\nroot = Column([Details(title="Advanced",child=Column([TextField("Hidden draft",$/name),CodeBlock(code="Select this"),LogView(stream="tools")])),Details(title="Second",child=Text("Second content"))])';canvas.session.render('form',source);await page.goto(canvas.origin);
 const summary=page.locator('summary').first();await summary.focus();await page.keyboard.press('Enter');const details=page.locator('details').first();await expect(details).toHaveAttribute('open','');const input=page.locator('input[type=text]');await input.fill('Saved locally');await input.evaluate(e=>(window as any).detailsInput=e);
 await page.locator('summary').nth(1).click();await expect(page.locator('details').nth(1)).toHaveAttribute('open','');await page.locator('pi-a2ui-code-block code').evaluate(e=>{const r=document.createRange();r.selectNodeContents(e);const s=getSelection()!;s.removeAllRanges();s.addRange(r);});
 canvas.session.updateLog(Array.from({length:200},(_,i)=>'line'+i).join('\n'),'running',false);await expect(page.locator('pi-a2ui-log-view pre')).toContainText('line199');await page.locator('pi-a2ui-log-view pre').evaluate(e=>e.scrollTop=0);canvas.session.updateLog('next\n'.repeat(200),'running',false);await expect(page.locator('pi-a2ui-log-view pre')).toContainText('next');expect(await page.locator('pi-a2ui-log-view pre').evaluate(e=>e.scrollTop)).toBe(0);
 expect(await page.evaluate(()=>getSelection()?.toString())).toBe('Select this');await expect(input).toHaveValue('Saved locally');expect(await input.evaluate(e=>e===(window as any).detailsInput)).toBe(true);expect(canvas.sent).toEqual([]);
 canvas.session.render('form',source);await expect(page.locator('details').first()).not.toHaveAttribute('open');await page.locator('summary').first().click();await expect(page.locator('input[type=text]')).toHaveValue('');
});

test('W4 actual native tool events patch indeterminate progress without replacing draft',async({page,canvas})=>{
 const {LiveTools}=await import('../src/live-tools.ts');canvas.session.render('other','root = Column([StatusBadge(label="Claimed pass",status="success"),TaskProgress(),LogView()])');const live=new LiveTools(canvas.session);await open(page,canvas);await page.locator('input[type=text]').fill('Progress draft');await page.locator('input[type=text]').evaluate(e=>(window as any).progressInput=e);live.beginRun();live.start('one','bash');
 const widget=page.locator('pi-a2ui-task-progress');await expect(widget).toContainText('1 started');await expect(widget.locator('progress')).not.toHaveAttribute('value');await expect(page.locator('pi-a2ui-status-badge')).toContainText('Reported by Pi · not independently verified');live.end('one',{content:[{type:'text',text:'native output'}]},false);await expect(widget).toContainText('1 settled');await expect(widget).toContainText('running');live.finishRun();await expect(widget).toContainText('completed');await expect(widget.locator('progress')).toHaveCount(0);await expect(page.locator('input[type=text]')).toHaveValue('Progress draft');expect(await page.locator('input[type=text]').evaluate(e=>e===(window as any).progressInput)).toBe(true);live.close();
});

test('W5 modal traps focus, Escape returns it, local trigger never dispatches and content action stays authoritative',async({page,canvas})=>{
 const external:string[]=[];page.on('request',r=>{if(!r.url().startsWith(canvas.origin))external.push(r.url());});canvas.session.render('form','$/name = ""\nroot = Modal(trigger=Text("Open settings"),content=Column([Icon(name="settings"),TextField("Modal name",$/name),Button(Text("Apply"),action=Event("apply",{name:$/name}))]))');await page.goto(canvas.origin);
 const trigger=page.getByRole('button',{name:'Open settings',exact:true});await trigger.focus();await page.keyboard.press('Enter');const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();expect(canvas.sent).toEqual([]);await dialog.locator('input[type=text]').fill('Dialog draft');
 for(let i=0;i<6;i++)await page.keyboard.press('Tab');expect(await dialog.evaluate(e=>e.contains(document.activeElement)||document.activeElement===e)).toBe(true);await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();await expect(trigger).toBeFocused();await trigger.click();await expect(dialog.locator('input[type=text]')).toHaveValue('Dialog draft');await expect(page.locator('pi-a2ui-icon svg')).toHaveCount(1);await page.getByRole('button',{name:'Apply',exact:true}).click();await expect(page.locator('#notice')).toHaveText('Sent to Pi');expect(JSON.parse(canvas.sent[0].split('\n')[1]).context).toEqual({name:'Dialog draft'});expect(external).toEqual([]);
});
test('W5 ShiftTab wraps from dialog first focus and replacement removes modal top layer',async({page,canvas})=>{canvas.session.render('form','root = Modal(trigger=Icon(name="search"),content=Button(Text("Last action"),action=Event("last")))');await page.goto(canvas.origin);await page.getByRole('button',{name:'search',exact:true}).click();const close=page.getByRole('button',{name:'Close details',exact:true});await close.focus();await page.keyboard.press('Shift+Tab');await expect(page.getByRole('button',{name:'Last action',exact:true})).toBeFocused();await page.keyboard.press('Tab');await expect(close).toBeFocused();canvas.session.render('form',form('After modal'));await expect(page.getByText('After modal',{exact:true})).toBeVisible();await page.locator('input[type=text]').fill('Available');await expect(page.locator('dialog[open]')).toHaveCount(0);});
test('W5 dialog tab loop includes native Details summary and keyboard disclosure',async({page,canvas})=>{canvas.session.render('form','root = Modal(trigger=Text("Open disclosure"),content=Details(title="More",child=Text("Visible evidence")))');await page.goto(canvas.origin);await page.getByRole('button',{name:'Open disclosure',exact:true}).click();const close=page.getByRole('button',{name:'Close details',exact:true});const summary=page.locator('summary');await close.focus();await page.keyboard.press('Tab');await expect(summary).toBeFocused();await page.keyboard.press('Enter');await expect(page.getByText('Visible evidence',{exact:true})).toBeVisible();await page.keyboard.press('Tab');await expect(close).toBeFocused();await page.keyboard.press('Shift+Tab');await expect(summary).toBeFocused();});

test('W6 registered image decodes, preview uses actual metadata, expired restore degrades without losing draft',async({page,canvas})=>{
 const meta=await canvas.session.registerArtifact('tests/fixtures/blue.png','image',process.cwd());canvas.session.render('other',`root = Column([ArtifactPreview(src="${meta.src}",kind="image",label="Model label"),Image(url="${meta.src}",description="Blue square")])`);await open(page,canvas);await page.locator('input[type=text]').fill('Image draft');await expect(page.getByText('Registered in this Pi session',{exact:true})).toBeVisible();await expect(page.locator('pi-a2ui-artifact-preview')).toContainText('blue.png · image/png');const img=page.getByRole('img',{name:'Blue square',exact:true});await expect.poll(()=>img.evaluate(e=>(e as HTMLImageElement).naturalWidth)).toBe(32);expect(canvas.sent).toEqual([]);
 const saved=canvas.session.snapshot();canvas.session.reset(saved);await expect(page.getByText('Unavailable: artifact expired, busy or unsupported',{exact:true})).toBeVisible();await expect(page.getByText('Unavailable: image could not be displayed',{exact:true})).toBeVisible();await page.locator('input[type=text]').fill('Fresh draft after restore');await expect(page.locator('input[type=text]')).toHaveValue('Fresh draft after restore');
});
test('W6 pausing invalidates preview registration claim and re-enable cannot resurrect capability',async({page,canvas})=>{const meta=await canvas.session.registerArtifact('tests/fixtures/blue.png','image',process.cwd());canvas.session.render('other',`root = ArtifactPreview(src="${meta.src}",kind="image",label="Preview")`);await open(page,canvas);await expect(page.getByText('Registered in this Pi session',{exact:true})).toBeVisible();canvas.session.setEnabled(false);await expect(page.locator('#status')).toHaveText('Canvas paused');await expect(page.locator('pi-a2ui-artifact-preview')).toContainText('Unavailable');canvas.session.setEnabled(true);await expect(page.locator('#status')).toHaveText('Ready for your input');await expect(page.locator('pi-a2ui-artifact-preview')).toContainText('Unavailable');expect((await page.request.get(canvas.origin+meta.src)).status()).toBe(404);});

test('W7 real WAV and VP8WebM play through native controls and pause on pagehide and canvas disable',async({page,canvas})=>{
 const video=await canvas.session.registerArtifact('tests/fixtures/blue.webm','video',process.cwd());const audio=await canvas.session.registerArtifact('tests/fixtures/tone.wav','audio',process.cwd());canvas.session.render('other',`root = Column([Video(url="${video.src}"),AudioPlayer(url="${audio.src}",description="Tone")])`);await open(page,canvas);await page.locator('input[type=text]').fill('Media draft');
 for(const selector of ['video','audio']){const media=page.locator(selector);await expect.poll(()=>media.evaluate(e=>(e as HTMLMediaElement).readyState)).toBeGreaterThan(0);expect(await media.evaluate(e=>(e as HTMLMediaElement).duration)).toBeGreaterThan(.9);expect(await media.evaluate(e=>(e as HTMLMediaElement).paused)).toBe(true);const box=await media.boundingBox();await media.click({position:{x:25,y:box!.height-(selector==='video'?47:27)}});await expect.poll(()=>media.evaluate(e=>(e as HTMLMediaElement).currentTime)).toBeGreaterThan(.1);await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pagehide')));await expect.poll(()=>media.evaluate(e=>(e as HTMLMediaElement).paused)).toBe(true);await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));}
 const media=page.locator('audio');await media.evaluate(e=>(e as HTMLMediaElement).currentTime=0);const box=await media.boundingBox();await media.click({position:{x:25,y:box!.height-20}});await expect.poll(()=>media.evaluate(e=>(e as HTMLMediaElement).paused)).toBe(false);canvas.session.setEnabled(false);await expect.poll(()=>media.evaluate(e=>(e as HTMLMediaElement).paused)).toBe(true);canvas.session.setEnabled(true);await expect(page.locator('#status')).toHaveText('Ready for your input');expect(await media.evaluate(e=>(e as HTMLMediaElement).paused)).toBe(true);await expect(page.locator('input[type=text]')).toHaveValue('Media draft');expect(canvas.sent).toEqual([]);
});
test('W7 decoder failure and expired media have visible fallback while forms remain usable',async({page,canvas})=>{
 const {mkdtemp,writeFile,rm}=await import('node:fs/promises');const {tmpdir}=await import('node:os');const {join}=await import('node:path');const root=await mkdtemp(join(tmpdir(),'pi-a2ui-codec-'));try{await writeFile(join(root,'bad.wav'),'RIFF0000WAVE');const meta=await canvas.session.registerArtifact('bad.wav','audio',root);canvas.session.render('other',`root = AudioPlayer(url="${meta.src}",description="Bad audio")`);await open(page,canvas);await expect(page.getByText('Unavailable: media could not be played',{exact:true})).toBeVisible();await page.locator('input[type=text]').fill('Still usable');const video=await canvas.session.registerArtifact('tests/fixtures/blue.webm','video',process.cwd());canvas.session.render('other',`root = Video(url="${video.src}")`);canvas.session.reset(canvas.session.snapshot());await expect(page.getByText('Unavailable: media could not be played',{exact:true})).toBeVisible();await page.locator('input[type=text]').fill('Restored form');await expect(page.locator('input[type=text]')).toHaveValue('Restored form');}finally{await rm(root,{recursive:true,force:true});}
});
test('W7 paused canvas makes top-layer modal media controls inert',async({page,canvas})=>{const audio=await canvas.session.registerArtifact('tests/fixtures/tone.wav','audio',process.cwd());canvas.session.render('form',`root = Modal(trigger=Text("Open media"),content=AudioPlayer(url="${audio.src}",description="Modal audio"))`);await page.goto(canvas.origin);await page.getByRole('button',{name:'Open media',exact:true}).click();await expect.poll(()=>page.locator('audio').evaluate(e=>(e as HTMLMediaElement).readyState)).toBeGreaterThan(0);canvas.session.setEnabled(false);await expect(page.locator('#status')).toHaveText('Canvas paused');const audioBox=await page.locator('audio').boundingBox();await page.mouse.click(audioBox!.x+25,audioBox!.y+audioBox!.height-27);await page.waitForTimeout(150);expect(await page.locator('audio').evaluate(e=>(e as HTMLMediaElement).paused)).toBe(true);expect(await page.locator('dialog').evaluate(e=>(e as HTMLElement).inert)).toBe(true);canvas.session.setEnabled(true);await expect.poll(()=>page.locator('dialog').evaluate(e=>(e as HTMLElement).inert)).toBe(false);});


test("R01 hierarchy disclosure stays local and leaf intent is declared",async({page,canvas})=>{
 const {readFile}=await import('node:fs/promises');
 canvas.session.reset();canvas.session.render('navigation',await readFile('skills/pi-a2ui/examples/tree-navigation.express','utf8'));
 const actions:string[]=[];page.on('request',r=>{if(r.url().endsWith('/api/actions'))actions.push(r.url());});
 await page.goto(canvas.origin);
 await expect(page.getByRole('button',{name:'Workspace',exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'compiler.ts',exact:true})).toBeHidden();
 await page.locator('summary').filter({hasText:/^workspace$/}).press('Enter');
 await page.locator('summary').filter({hasText:/^src$/}).press('Enter');
 await expect(page.getByRole('button',{name:'compiler.ts',exact:true})).toBeVisible();
 expect(actions).toHaveLength(0);expect(canvas.sent).toHaveLength(0);
 await page.getByRole('button',{name:'compiler.ts',exact:true}).click();
 await expect(page.locator('#notice')).toHaveText('Sent to Pi');
 expect(actions).toHaveLength(1);expect(canvas.sent).toHaveLength(1);expect(canvas.sent[0]).toContain('"nodeId":"compiler"');
});


test("R02 keyboard search and hidden selections stay local across data patches",async({page,canvas})=>{
 const source=`$/chosen = ["main"]
 picker = SearchablePicker(label="Branch",variant="multipleSelection",options=[{label:"Main",value:"main"},{label:"Feature",value:"feat"}],value=$/chosen)
 submit = Button(child=Text(text="Choose branch"),action=Event("choose",{chosen:$/chosen}))
 chart = Chart(kind="line",series=[])
 root = Column(children=[picker,submit,chart])`;
 canvas.session.reset();canvas.session.render('pick',source);
 const requests:string[]=[];const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.url().endsWith('/api/actions'))requests.push(r.url());});
 await page.goto(canvas.origin);const query=page.getByRole('searchbox',{name:'Search Branch'});
 await query.fill('Fea');await expect(page.getByRole('button',{name:'Main · main',exact:true})).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Remove Main (main)',exact:true})).toBeVisible();
 canvas.session.updateChart('pick',1,'chart',[{name:'Run',points:[{label:'now',value:1}]}]);
 await expect(query).toHaveValue('Fea');await query.press('ArrowDown');
 await expect(page.getByRole('button',{name:'Feature · feat',exact:true})).toBeFocused();await page.keyboard.press('Enter');
 await expect(page.getByRole('button',{name:'Remove Feature (feat)',exact:true})).toBeVisible();
 await page.keyboard.press('Tab');await expect(page.getByRole('button',{name:'Choose branch',exact:true})).toBeFocused();
 await page.keyboard.press('Shift+Tab');await expect(query).toBeFocused();
 await page.keyboard.press('Escape');await expect(query).toHaveValue('');
 await query.press('ArrowUp');await page.keyboard.press('Home');
 await expect(page.getByRole('button',{name:'Remove Main (main)',exact:true})).toBeFocused();await page.keyboard.press('Enter');
 await query.fill('absent');await expect(page.getByText('No matches',{exact:true})).toBeVisible();
 expect(requests).toHaveLength(0);expect(canvas.sent).toHaveLength(0);
 await page.getByRole('button',{name:'Choose branch',exact:true}).click();await expect(page.locator('#notice')).toHaveText('Sent to Pi');
 expect(requests).toHaveLength(1);expect(canvas.sent[0]).toContain('"chosen":["feat"]');expect(errors).toEqual([]);
 canvas.session.render('pick','$/chosen = []\nroot = SearchablePicker(label="Branch",options=[],value=$/chosen)');
 await expect(page.getByText('No options',{exact:true})).toBeVisible();
});


test("R03 compact summary keeps units source and reported status visible",async({page,canvas})=>{
 const {readFile}=await import('node:fs/promises');canvas.session.reset();canvas.session.render('summary',await readFile('skills/pi-a2ui/examples/summary-metrics.express','utf8'));
 await page.goto(canvas.origin);
 await expect(page.getByText('Build duration: 12 s',{exact:true})).toBeVisible();
 await expect(page.getByText('Source: example build output — replace with actual evidence',{exact:true})).toBeVisible();
 await expect(page.getByText('Reported by Pi · not independently verified',{exact:true})).toBeVisible();
 expect(canvas.sent).toHaveLength(0);
});


test("R04 invalid submit shows inline errors without POST then corrected values submit once",async({page,canvas})=>{
 const {readFile}=await import('node:fs/promises');const validationSource=await readFile('skills/pi-a2ui/examples/validated-form.express','utf8');
 canvas.session.reset();canvas.session.render('form',validationSource);
 const requests:string[]=[];page.on('request',r=>{if(r.url().endsWith('/api/actions'))requests.push(r.url());});
 await page.goto(canvas.origin);const input=page.getByRole('textbox');
 await page.getByRole('button',{name:'Save form',exact:true}).click();
 await expect(page.locator('pi-a2ui-form-validation')).toContainText('Enter 2 to 5 characters');
 await expect(input).toHaveAttribute('aria-invalid','true');await expect(input).toBeFocused();
 expect(requests).toHaveLength(0);expect(canvas.sent).toHaveLength(0);
 await input.fill('A');await page.getByRole('button',{name:'Save form',exact:true}).click();await expect(input).toBeFocused();
 await input.fill('😀😀😀');await page.getByRole('checkbox').check();
 await expect(page.locator('.a2ui-field-error')).toHaveCount(0);await expect(input).not.toHaveAttribute('aria-invalid','true');
 expect(requests).toHaveLength(0);await page.getByRole('button',{name:'Save form',exact:true}).click();
 await expect(page.locator('#notice')).toHaveText('Sent to Pi');expect(requests).toHaveLength(1);expect(canvas.sent[0]).toContain('"name":"😀😀😀","ok":true');
});

test("R04 hidden errors use active Modal notice without echoing bound values or late focus",async({page,canvas})=>{
 canvas.session.reset();canvas.session.render('form',`$/secret = "private-fixture-42"
 field = TextField(label=$/secret,value=$/secret)
 submit = Button(child=Text(text="Validate inside"),action=Event("save",{value:$/secret}))
 validation = FormValidation(buttons=["submit"],rules=[{fieldId:"field",message:"Enter at least20 characters",minLength:20}])
 root = Column(children=[field,Details(title="Hidden errors",child=validation),Modal(trigger=Text(text="Open validation"),content=submit)])`);
 const requests:string[]=[];page.on('request',r=>{if(r.url().endsWith('/api/actions'))requests.push(r.url());});
 await page.goto(canvas.origin);await page.getByRole('button',{name:'Open validation',exact:true}).click();const dialog=page.getByRole('dialog');
 await dialog.getByRole('button',{name:'Validate inside',exact:true}).click();const local=dialog.locator('.a2ui-validation-notice');
 await expect(local).toHaveText('field: Enter at least20 characters');await expect(local).toBeFocused();await expect(local).not.toContainText('private-fixture-42');
 await page.keyboard.press('Tab');await expect(dialog.getByRole('button',{name:'Close details'})).toBeFocused();
 expect(requests).toHaveLength(0);await dialog.getByRole('button',{name:'Close details'}).click();await expect(page.locator('.a2ui-validation-notice')).toHaveCount(0);
 await page.getByRole('button',{name:'Open validation',exact:true}).click();
 await page.evaluate(()=>{document.querySelector<HTMLButtonElement>('dialog button:not(.modal-close)')?.click();document.querySelector<HTMLDialogElement>('dialog')?.close();});
 await expect(page.locator('.a2ui-validation-notice')).toHaveCount(0);
 canvas.session.reset();canvas.session.render('form','root = Text(text="Replacement")');
 await expect(page.getByText('Replacement',{exact:true})).toBeVisible();await expect(page.locator('.a2ui-field-error')).toHaveCount(0);expect(requests).toHaveLength(0);
});


test("R04 enhanced picker updates validation after its local binding setter",async({page,canvas})=>{
 canvas.session.reset();canvas.session.render('form',`$/chosen=[]
picker=SearchablePicker(label="Required choice",options=[{label:"Alpha",value:"a"}],value=$/chosen)
submit=Button(child=Text(text="Save choice"),action=Event("save",{chosen:$/chosen}))
root=Column(children=[picker,FormValidation(buttons=["submit"],rules=[{fieldId:"picker",message:"Choose one",required:true}]),submit])`);
 await page.goto(canvas.origin);await page.getByRole('button',{name:'Save choice',exact:true}).click();await expect(page.locator('.a2ui-field-error')).toHaveCount(1);
 await page.getByRole('button',{name:'Alpha · a',exact:true}).click();await expect(page.locator('.a2ui-field-error')).toHaveCount(0);expect(canvas.sent).toHaveLength(0);
 await page.getByRole('button',{name:'Save choice',exact:true}).click();await expect(page.locator('#notice')).toHaveText('Sent to Pi');expect(canvas.sent).toHaveLength(1);expect(canvas.sent[0]).toContain('"chosen":["a"]');
});
