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
