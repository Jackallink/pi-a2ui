// Bounded integration check: real Pi/model, installed package, real browser, two turns.
// Existing Pi credentials stay in Pi; do not print bootstrap URLs or raw RPC records.
import { formsSource, fillForms } from './acceptance-scenarios.mjs';
import { spawn } from 'node:child_process';
import { mkdir, writeFile, readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, join } from 'node:path';
import { chromium } from '@playwright/test';

const packagePath = resolve(process.argv[2] ?? '.local/installed/package');
const provider = process.env.A2UI_ACCEPT_PROVIDER ?? 'volcengine-ark';
const model = process.env.A2UI_ACCEPT_MODEL ?? 'glm-5.3-flash';
if(provider!=='volcengine-ark'||model!=='glm-5.3-flash') throw new Error('Only owner-authorized AgentPlan GLM model is allowed');
const scenario=process.env.A2UI_ACCEPT_SCENARIO??'basic';
const providerExtension = process.env.A2UI_ACCEPT_PROVIDER_EXTENSION;
const restoreOnly = process.env.A2UI_ACCEPT_RESTORE_ONLY === '1';
const additionalExtensions = providerExtension ? ['-e',resolve(providerExtension)] : [];
const workspace = resolve(process.env.A2UI_ACCEPT_WORKSPACE ?? '.local/live');
const urlFile = join(workspace,'open-url');
await mkdir(join(workspace,'bin'),{recursive:true});
await writeFile(join(workspace,'bin','open'),'#!/bin/sh\numask 077\nprintf "%s" "$1" > "$A2UI_ACCEPT_OPEN_FILE"\n', {mode:0o700});
const pi = spawn(process.execPath,[fileURLToPath(new URL('../node_modules/@earendil-works/pi-coding-agent/dist/bundle/cli.js',import.meta.url)),'--no-extensions','--no-mcp','--no-skills','--no-context-files','--no-prompt-templates','--no-themes','--mode','rpc','--provider',provider,'--model',model,'--thinking','off','--tools','a2ui_render','--session',join(workspace,`session-${provider}.jsonl`),...additionalExtensions,'-e',join(packagePath,'extension.ts')],{
  cwd:process.cwd(),env:{...process.env,PATH:`${join(workspace,'bin')}:${process.env.PATH}`,A2UI_ACCEPT_OPEN_FILE:urlFile,PI_OFFLINE:'1'},stdio:['pipe','pipe','pipe'],
});
let text='';let stderr='';const events=[];const waiters=new Set();let exited=false;
pi.stderr.on('data',chunk=>{stderr+=chunk.toString();});
pi.stdout.on('data',chunk=>{
  text+=chunk.toString();
  while(text.includes('\n')){
    const index=text.indexOf('\n');const line=text.slice(0,index);text=text.slice(index+1);
    try{const event=JSON.parse(line);events.push(event);for(const waiter of waiters)waiter();}catch{}
  }
});
pi.on('exit',()=>{exited=true;for(const waiter of waiters)waiter();});
function wait(predicate,after=0,timeout=180000){
  return new Promise((resolve,reject)=>{
    const check=()=>{
      const match=events.slice(after).find(predicate);
      if(match){clearTimeout(timer);waiters.delete(check);resolve(match);}
      else if(exited){clearTimeout(timer);waiters.delete(check);reject(new Error('Pi exited before acceptance event'));}
    };
    const timer=setTimeout(()=>{waiters.delete(check);reject(new Error('Timed out waiting for Pi acceptance event'));},timeout);
    waiters.add(check);check();
  });
}
function command(value){pi.stdin.write(JSON.stringify(value)+'\n');}
let browser;let origin;let result={};
try{
  command({id:'state',type:'get_state'});
  const initial=await wait(e=>e.type==='response'&&e.id==='state',0,30000);
  if(!initial.success)throw new Error('Pi state request failed');
  if (provider === 'volcengine-ark' && initial.data?.model?.baseUrl !== 'https://ark.cn-beijing.volces.com/api/plan/v3') throw new Error('Expected Agent Plan endpoint; refusing model request');
  if (initial.data?.model?.id !== model) throw new Error('Pi selected an unexpected model; refusing model request');
  if (!restoreOnly) {
  const basicSource='$/form/name = ""\nroot = Card(Column([Text("Pi A2UI local acceptance"), TextField("Acceptance phrase", $/form/name), Button(Text("Submit acceptance"), action=Event("submit", {name: $/form/name}))]))';
  const source=scenario==='forms'?formsSource:basicSource;
  command({id:'first',type:'prompt',message:`Local UI acceptance only. Call a2ui_render exactly once with surfaceId "acceptance" and source ${JSON.stringify(source)}. After successful tool call, say "Form ready" briefly. A later user message named A2UI browser context data is expected: when it arrives, reply "Accepted: " followed by the exact JSON object action.context (preserving boolean/number/array types); do not render again or invoke another tool.`});
  const rendered=await wait(e=>(e.type==='message_end'&&e.message?.role==='toolResult'&&e.message.toolName==='a2ui_render'&&!e.message.isError)||e.type==='agent_settled');
  if(rendered.type==='agent_settled'){
    const markers=events.filter(e=>e.type==='message_end').map(e=>e.message?.errorMessage??'').join(' ').match(/401|403|404|429|5\d\d|quota|balance|insufficient|not found/ig)??[];
    throw new Error('Model settled without a successful UI tool result'+(markers.length?': '+[...new Set(markers)].join(','):''));
  }
  const saved=rendered.message.details?.a2uiSnapshot;
  if(!saved?.surfaces?.some(s=>s.surfaceId==='acceptance'))throw new Error('Real Pi tool result missing committed surface');
  await wait(e=>e.type==='agent_settled');
  }
  command({id:'open',type:'prompt',message:'/a2ui'});
  await wait(e=>e.type==='response'&&e.id==='open',0,30000);
  // The OS browser-launch boundary is captured by a private PATH shim; Chromium
  // then visits that exact bootstrap URL. No credential is logged in RPC evidence.
  let openUrl;
  for(let attempt=0;attempt<100;attempt++){
    try{await access(urlFile);openUrl=await readFile(urlFile,'utf8');if(openUrl)break;}catch{}
    await new Promise(resolve=>setTimeout(resolve,50));
  }
  if(!openUrl)throw new Error('Pi /a2ui did not invoke the browser opener');
  origin=new URL(openUrl).origin;
  browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,headless:true});
  const page=await browser.newPage();const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
  await page.goto(openUrl).catch(()=>{throw new Error("Local canvas navigation failed");});
  await page.locator('input[type=text]').waitFor();
  if(page.url().includes('#'))throw new Error('Browser did not remove bootstrap fragment');
  if (restoreOnly) {
    await page.screenshot({path:join(workspace,'restored.png'),fullPage:true});
    result={provider,model,restoreOnly:true,restoredActualModelToolResult:true,browserForm:true,fragmentCleared:true,browserErrors:pageErrors.length};
    console.log(JSON.stringify(result));
  } else {
  const phrase='pi-a2ui-local-acceptance-20261113';
  await page.locator('input[type=text]').fill(phrase);
  if(scenario==='forms') await fillForms(page);
  const before=events.length;
  await page.getByRole('button',{name:'Submit acceptance'}).click();
  await page.getByText('Sent to Pi',{exact:true}).waitFor();
  await wait(e=>e.type==='agent_settled',before);
  const replies=events.slice(before).filter(e=>e.type==='message_end'&&e.message?.role==='assistant').flatMap(e=>e.message.content??[]).filter(c=>c.type==='text').map(c=>c.text).join('\n');
  result={provider,model,actualToolResult:true,browserForm:true,fragmentCleared:true,local202:true,actualNextTurnAttempted:true,actualNextTurnContainsSubmittedValue:replies.includes(phrase),browserErrors:pageErrors.length};
  await page.screenshot({path:join(workspace,'acceptance.png'),fullPage:true});
  if(scenario==='forms') {
    const json=replies.match(/\{[\s\S]*\}/)?.[0];
    const ack=json?JSON.parse(json):undefined;
    if(JSON.stringify(ack?.features)!=='["b"]'||ack?.enabled!==true||ack?.count!==7||ack?.date!=='2026-12-25'||ack?.name!==phrase)throw new Error('Actual next model reply did not preserve typed submitted context');
    result.typedContextAcknowledged=true;
  }
  if(!replies.includes(phrase))throw new Error('Actual subsequent model reply did not acknowledge submitted context');
  await page.screenshot({path:join(workspace,'acceptance.png'),fullPage:true});
  if(pageErrors.length)throw new Error('Browser emitted errors during actual Pi acceptance');
  result={...result,scenario,provider,model,pi:initial.data?.version??'local 1.5.0',surface:'acceptance',actualToolResult:true,browserForm:true,fragmentCleared:true,local202:true,actualNextTurnContainsSubmittedValue:true,browserErrors:pageErrors.length};
  console.log(JSON.stringify(result));
  }
}finally{
  await browser?.close();
  pi.stdin.end();
  if(!exited)await new Promise(resolve=>{const timer=setTimeout(()=>{pi.kill('SIGTERM');resolve();},5000);pi.once('exit',()=>{clearTimeout(timer);resolve();});});
  let released=true;if(origin){try{await fetch(origin);released=false;}catch{}}
  await writeFile(join(workspace,restoreOnly?'restore-result.json':`result-${provider}.json`),JSON.stringify({...result,listenerReleased:released,processExited:exited},null,2));
  if(!released)throw new Error('Pi shutdown did not release listener');
  // Do not print raw stderr: providers/extensions may include private configuration.
  if(stderr)await writeFile(join(workspace,'stderr.log'),stderr,{mode:0o600});
}
