// Owned one-episode worker. Never log configuration, headers or bootstrap URLs.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,mkdtemp,appendFile,cp,symlink,rm,lstat,realpath} from 'node:fs/promises';
import {readFileSync} from 'node:fs';
import {resolve,join,dirname} from 'node:path';
import {homedir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {ModelRuntime,SettingsManager,SessionManager,DefaultResourceLoader,createAgentSession,type ExtensionAPI} from '@earendil-works/pi-coding-agent';
import {chromium,expect,type Browser,type BrowserServer,type Page} from '@playwright/test';
import a2ui from '../../extension.ts';
import {interactionsCatalog} from '../../src/catalog.ts';
import {MODEL,CAPS,RequestBudget,BudgetViolation,configAdmission,literalCredentials,ordinaryPath,helperCommand,redact} from './guards.ts';
import {intent,interact,type Scenario} from './oracles.ts';
import {SOURCES,PNG,bindingVariant} from './fixtures.ts';
import {killTrackedDetachedChildren} from '../../node_modules/@earendil-works/pi-coding-agent/dist/utils/shell.js';
import {forwardedPayload} from '../golden/oracles.ts';
import type {Snapshot} from '../../src/protocol.ts';
for(const name of ['FORCE_COLOR','BASH_ENV','ENV','NODE_OPTIONS','LD_PRELOAD','DYLD_INSERT_LIBRARIES'])delete process.env[name]; // normalize only this owned worker's helper stdout/stderr contract
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const rows=JSON.parse(readFileSync(join(root,'tests/benchmark-model/scenarios.json'),'utf8')) as Scenario[];
const hash=(value:Buffer|string)=>createHash('sha256').update(value).digest('hex');
const wait=async(predicate:()=>boolean,ms=5000)=>{const until=Date.now()+ms;while(!predicate()){assert.ok(Date.now()<until,'receipt deadline');await new Promise(resolve=>setTimeout(resolve,10));}};
async function deadline<T>(promise:Promise<T>,ms:number,label:string):Promise<T>{let timer:ReturnType<typeof setTimeout>;return await Promise.race([promise,new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error(label+' deadline')),ms);})]).finally(()=>clearTimeout(timer));}
export async function episode(row:Scenario,{offline,run,simulation}:{offline:boolean;run:string;simulation?:string}){
 assert.ok(!simulation||offline&&['failed-check','changed-render','unsafe-bash','rate-limit','no-render','wrong-intent','cleanup-fault','request-budget','tool-budget','browser-hang','identity','binding-layout','terminal-lf'].includes(simulation),'offline simulation only');
 assert.equal(process.versions.node.split('.')[0],'24');assert.ok(['darwin','linux'].includes(process.platform),'manual profile supports macOS/Linux');assert.equal(process.env.PI_OFFLINE,'1');
 const result:any={id:row.id,simulation:simulation??null,started:false,stage:'setup',requests:0,providerCompleted:0,requestOptions:[],providerUsage:[],actualModelRequests:0,compileValid:false,rendered:false,intentPass:false,interactionPass:false,staticPass:false,usage:[],tools:[],transcript:[],testFailures:[],cleanupFailures:[]};
 const budget=new RequestBudget(),secrets:string[]=[];const owned=await realpath(await mkdtemp(join(run,row.id+'-workspace-')));const agentDir=join(owned,'agent'),project=join(owned,'project'),pack=join(owned,'package');
 const configPaths=['settings.json','auth.json','models.json','models-store.json'].map(p=>join(homedir(),'.pi/agent',p));
 const configHashes=async()=>Promise.all(configPaths.map(async(path)=>{try{return hash(await readFile(path));}catch(error){if((error as NodeJS.ErrnoException).code==='ENOENT')return null;throw error;}}));
 let beforeHashes:(string|null)[]|undefined,session:Awaited<ReturnType<typeof createAgentSession>>['session']|undefined,browser:Browser|undefined,browserServer:BrowserServer|undefined,page:Page|undefined,origin:string|undefined,opener:Promise<void>|undefined,abortWait:Promise<void>|undefined;
 let stop=false,checkAttempted=false,artifactSrc:string|undefined,checked:{surfaceId:string;source:string}|undefined,toolCount=0,pending=false;const posts:any[]=[],statuses:number[]=[];
 const stopRun=(stage:string,error?:unknown)=>{if(!stop){stop=true;result.stage=stage;if(error)result.error=redact(error instanceof Error?error.message:String(error),secrets).slice(0,2048);}budget.stopped=true;if(session)abortWait=session.abort();};
 const interrupted=()=>{killTrackedDetachedChildren();stopRun('interrupted','owned worker interrupted');};process.once('SIGTERM',interrupted);process.once('SIGINT',interrupted);
 const realFetch=globalThis.fetch;
 globalThis.fetch=async(input,options)=>{const url=new URL(typeof input==='string'||input instanceof URL?String(input):input.url);assert.ok(url.protocol==='http:'&&url.hostname==='127.0.0.1','unexpected runtime network forbidden');return realFetch(input,options);};
 let timer:ReturnType<typeof setTimeout>|undefined;
 try{
  for(const path of [agentDir,project,pack])await mkdir(path,{recursive:true,mode:0o700});
  const payload=JSON.parse(await readFile(join(root,'tests/benchmark-model/payload.json'),'utf8')) as string[];assert.equal(payload.length,75);const payloadHashes:Record<string,string>={};
  for(const path of payload){assert.ok(!path.includes('..')&&!path.startsWith('/'));const from=join(root,path);assert.equal((await lstat(from)).isSymbolicLink(),false);await mkdir(dirname(join(pack,path)),{recursive:true});await cp(from,join(pack,path));payloadHashes[path]=hash(await readFile(join(pack,path)));}
  result.payloadHash=hash(JSON.stringify(payloadHashes));await symlink(join(root,'node_modules'),join(pack,'node_modules'),'dir');await writeFile(join(project,'sample.png'),PNG);const draft=join(project,'draft.express');
  const helper=join(pack,'skills/pi-a2ui/scripts/a2ui.mjs'),skill=join(pack,'skills/pi-a2ui/SKILL.md');
  const examples=JSON.parse(await readFile(join(pack,'skills/pi-a2ui/examples/manifest.json'),'utf8')) as {name:string;pattern?:string}[];
  const names={components:[...interactionsCatalog.components.keys()],examples:examples.map(e=>e.name),patterns:examples.flatMap(e=>e.pattern?[e.pattern]:[])};
  let config:{key:string;headers:Record<string,string>;model:Record<string,unknown>};
  if(offline)config={key:'synthetic-$opaque!key',headers:{'X-BM4-Fixture':'synthetic-$opaque!header'},model:{id:MODEL.id,name:MODEL.id,reasoning:false,input:['text'],contextWindow:65536,maxTokens:4096}};
  else{try{beforeHashes=await configHashes();const modelsText=await readFile(configPaths[2],'utf8');let authText='{}';try{authText=await readFile(configPaths[1],'utf8');}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}config=configAdmission(modelsText,authText,process.env);}catch{result.fatal=true;throw new Error('BM4 readonly Ark configuration admission failed (literal/env only; identity/credential/header must match)');}}

  secrets.push(config.key,...Object.values(config.headers));
  // Only non-secret static model identity is persisted; never real models/auth/header config.
  const modelsPath=join(agentDir,'models.json');await writeFile(modelsPath,JSON.stringify({providers:{[MODEL.provider]:{baseUrl:MODEL.baseUrl,api:'openai-completions',models:[config.model]}}}),{mode:0o600});
  const runtime=await ModelRuntime.create({credentials:literalCredentials(config.key),modelsPath,modelsStorePath:join(agentDir,'models-store.json'),allowModelNetwork:false,refreshOnCreate:false});
  const model=runtime.getModel(MODEL.provider,MODEL.id);assert.ok(model);assert.equal(model.baseUrl,MODEL.baseUrl);const realStream=runtime.streamSimple.bind(runtime);
  let syntheticTurn=0;
  runtime.streamSimple=(selected,context,options)=>{
   if(stop){result.cancelledContinuationCalls=(result.cancelledContinuationCalls??0)+1;throw new Error('owned case already stopped before provider transport');}
   if(selected.provider!==MODEL.provider||selected.id!==MODEL.id||selected.baseUrl!==MODEL.baseUrl){result.fatal=true;result.harnessFailure=true;stopRun('admission','runtime model identity or stopped continuation rejected');throw new Error('runtime identity rejected');}
   return realStream(selected,context,{...options,maxRetries:0,maxTokens:CAPS.maxTokens,timeoutMs:CAPS.requestMs,fetch:async(input,init)=>{
    const url=typeof input==='string'||input instanceof URL?String(input):input.url;let body:any,headers:Headers;
    try{
     body=JSON.parse(String(init?.body));if(simulation==='identity')body.model='forbidden-fixture-model';assert.equal(body.model,MODEL.id);assert.ok(body.max_tokens===CAPS.maxTokens||body.max_completion_tokens===CAPS.maxTokens,'actual output cap');body.parallel_tool_calls=false;
     headers=new Headers(init?.headers);assert.ok(headers.get('authorization')==='Bearer '+config.key,'opaque key bytes');for(const[name,value]of Object.entries(config.headers))headers.set(name,value);
     result.skillLoadedInProviderContext=JSON.stringify(body.messages).includes('Known task: example');assert.equal(result.skillLoadedInProviderContext,true);
     budget.admit(url,selected);
    }catch(error){if(!(error instanceof BudgetViolation)||error.kind!=='budget'){result.fatal=true;result.harnessFailure=true;}stopRun(error instanceof BudgetViolation&&error.kind==='budget'?'provider':'admission',error instanceof BudgetViolation?error.message:'request identity/body/auth/profile admission rejected');throw new Error('BM4 request admission stopped');}
    result.requests=budget.attempts;result.actualModelRequests=offline?0:budget.attempts;result.requestOptions.push({model:MODEL.id,maxTokens:CAPS.maxTokens,maxRetries:0,timeoutMs:CAPS.requestMs,redirect:'error'});
    // Durable before-dispatch admission journal: a missing final receipt never implies zero cost.
    await appendFile(join(run,row.id+'.requests.jsonl'),JSON.stringify({id:row.id,index:budget.attempts,mode:offline?'offline':'live',provider:MODEL.provider,model:MODEL.id,endpoint:MODEL.baseUrl+'/chat/completions'})+'\n',{mode:0o600});
    if(offline){assert.equal(headers.get('X-BM4-Fixture'),'synthetic-$opaque!header');syntheticTurn++;
     if(simulation==='rate-limit'){result.providerStatuses=[429];result.fatal=true;stopRun('provider','synthetic provider HTTP429');return new Response('synthetic429',{status:429});}
     if(simulation==='no-render')return new Response('data: '+JSON.stringify({id:'fixture',object:'chat.completion.chunk',model:MODEL.id,choices:[{index:0,delta:{role:'assistant',content:'No render fixture'},finish_reason:'stop'}]})+'\n\ndata: [DONE]\n\n',{headers:{'content-type':'text/event-stream'}});
     let tool:string,args:unknown;
     if(simulation==='request-budget'){tool='read';args={path:skill};}
     else if(row.id==='M12'&&syntheticTurn===1){tool='a2ui_register_artifact';args={path:'sample.png',kind:'image'};}
     else{const turn=syntheticTurn-(row.id==='M12'?1:0);if(turn===1){tool='write';args={path:draft,content:((simulation==='failed-check'?'root = UnknownComponent()':(simulation==='binding-layout'?bindingVariant(row.id):SOURCES[row.id]).replaceAll('ARTIFACT_SRC',artifactSrc??'MISSING'))+(simulation==='terminal-lf'?'\n':'')).replace('line:42',simulation==='wrong-intent'||simulation==='cleanup-fault'?'line:"42"':'line:42')}}else if(turn===2){tool='bash';args={command:`node "${helper}" check --surface-id bm4 "${draft}"`};}else{assert.equal(turn,3,'no postrender synthetic continuation');tool='a2ui_render';args=simulation==='terminal-lf'?{...checked,source:checked!.source.slice(0,-1)}:simulation==='changed-render'?{...checked,source:'root = Text("changed after check")'}:checked;}}
     if(simulation==='unsafe-bash'){tool='bash';args={command:'node '+helper+' catalog; touch SHOULD_NOT_EXIST'};}
     result.providerUsage.push({prompt_tokens:10,completion_tokens:2,total_tokens:12});
     const common={id:'synthetic-'+row.id+'-'+syntheticTurn,object:'chat.completion.chunk',created:1,model:MODEL.id};const chunks=[{...common,choices:[{index:0,delta:{role:'assistant',tool_calls:simulation==='tool-budget'?Array.from({length:9},(_,index)=>({index,id:'budget-call-'+index,type:'function',function:{name:'bash',arguments:JSON.stringify({command:'node '+helper+' catalog'})}})):[{index:0,id:'synthetic-call-'+syntheticTurn,type:'function',function:{name:tool,arguments:JSON.stringify(args)}}]},finish_reason:null}]},{...common,choices:[{index:0,delta:{},finish_reason:'tool_calls'}],usage:{prompt_tokens:10,completion_tokens:2,total_tokens:12}}];
     return new Response(chunks.map(c=>'data: '+JSON.stringify(c)+'\n\n').join('')+'data: [DONE]\n\n',{headers:{'content-type':'text/event-stream'}});
    }
    const response=await realFetch(url,{...init,headers,body:JSON.stringify(body),redirect:'error',signal:AbortSignal.any([...(init?.signal?[init.signal]:[]),AbortSignal.timeout(CAPS.requestMs)])});
    result.providerStatuses??=[];result.providerStatuses.push(response.status);if(response.status>=400){if([401,403,429].includes(response.status))result.fatal=true;stopRun('provider','provider HTTP '+response.status);}
    if(!response.body)return response;let pendingSSE='';const decoder=new TextDecoder();const observed=response.body.pipeThrough(new TransformStream<Uint8Array,Uint8Array>({transform(chunk,controller){pendingSSE+=decoder.decode(chunk,{stream:true});assert.ok(pendingSSE.length<1024*1024,'SSE diagnostic byte limit');const lines=pendingSSE.split('\n');pendingSSE=lines.pop()!;for(const line of lines)if(line.startsWith('data: ')){try{const data=JSON.parse(line.slice(6));if(data.usage&&typeof data.usage==='object')result.providerUsage.push({prompt_tokens:data.usage.prompt_tokens??null,completion_tokens:data.usage.completion_tokens??null,total_tokens:data.usage.total_tokens??null});}catch{ /* non-JSON [DONE] or provider control; SDK remains parser */ }}controller.enqueue(chunk);}}));return new Response(observed,{status:response.status,statusText:response.statusText,headers:response.headers});
   }});
  };
  const settings=SettingsManager.inMemory({retry:{enabled:false,maxRetries:0,provider:{maxRetries:0,timeoutMs:CAPS.requestMs}},compaction:{enabled:false},cacheWarming:'off',transport:'sse'});
  const factory=(pi:ExtensionAPI)=>{
   const host:ExtensionAPI={...pi,exec:async(command,args)=>{
    assert.ok(['open','xdg-open','rundll32'].includes(command),'host opener only');assert.equal(args.length,process.platform==='win32'?2:1);const privateUrl=args.at(-1)!;const parsed=new URL(privateUrl);assert.equal(parsed.hostname,'127.0.0.1');secrets.push(privateUrl);origin=parsed.origin;
    opener=(async()=>{browserServer=await chromium.launchServer({headless:true,handleSIGTERM:false,handleSIGINT:false,handleSIGHUP:false,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});const browserProcess=browserServer.process();const profileArg=browserProcess.spawnargs.find(arg=>arg.startsWith('--user-data-dir='));assert.ok(profileArg);await writeFile(join(run,row.id+'.resources.json'),JSON.stringify({workerPid:process.pid,browserPid:browserProcess.pid,profileArg,origin}),{mode:0o600});browser=await chromium.connect(browserServer.wsEndpoint());const context=await browser.newContext({viewport:{width:1280,height:900},locale:'en-US',timezoneId:'UTC',reducedMotion:'reduce'});await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());page=await context.newPage();page.setDefaultTimeout(5000);page.setDefaultNavigationTimeout(5000);
     page.on('request',request=>{if(request.url()===origin+'/api/actions'&&request.method()==='POST')posts.push(request.postDataJSON());});page.on('response',response=>{if(response.url()===origin+'/api/actions'&&response.request().method()==='POST')statuses.push(response.status());});
     const token=new URLSearchParams(parsed.hash.slice(1)).get('token');if(token)secrets.push(token);const connected=await context.request.post(origin+'/api/connect',{headers:{origin},data:{token},timeout:5000});assert.equal(connected.status(),200);await page.addInitScript(()=>{const original=window.fetch.bind(window);(window as any).bm4ActionStarts=0;window.fetch=(input,options)=>{if(new URL(String(input),location.href).pathname==='/api/actions')(window as any).bm4ActionStarts++;return original(input,options);};});await page.goto(origin!);
    })();await opener;return{stdout:'',stderr:'',code:0,killed:false,truncated:false};}};
   a2ui(host);
   pi.on('message_end',event=>{const message=event.message as any;if(message.role!=='assistant')return;if(message.stopReason==='error'&&!stop)stopRun('provider',message.errorMessage??'provider stream error');if(['toolUse','stop','length'].includes(message.stopReason))result.providerCompleted++;result.transcript.push({kind:'assistant',content:message.content,stopReason:message.stopReason});result.usage.push(message.usage?Object.fromEntries(['input','output','cacheRead','cacheWrite','totalTokens'].map(key=>[key,message.usage[key]??null])):null);});
   pi.on('tool_call',event=>{
    try{assert.equal(stop,false,'case stopped');assert.equal(pending,false,'overlapping tools forbidden');pending=true;assert.ok(++toolCount<=CAPS.tools,'tool budget');assert.ok(!event.parentToolCallId,'nestedtools forbidden');const input=event.input as any;
     if(event.toolName==='read')ordinaryPath(input.path,[pack,project],project);
     else if(event.toolName==='write'||event.toolName==='edit'){assert.equal(checkAttempted,false,'draft frozen after first preflight');assert.equal(resolve(project,input.path),draft,'write/edit owned draft only');if(event.toolName==='write')assert.ok(Buffer.byteLength(input.content)<=32768);}
     else if(event.toolName==='bash'){const admitted=helperCommand(input.command,helper,draft,project,names);input.command=admitted.command;input.timeout=10;if(admitted.check){assert.equal(checkAttempted,false,'only first preflight');ordinaryPath(draft,[project],project);checkAttempted=true;result.candidateChecked=true;}}
     else if(event.toolName==='a2ui_register_artifact'){assert.equal(input.path,'sample.png');assert.equal(input.kind,'image');assert.equal(artifactSrc,undefined,'register once');}
     else{assert.equal(event.toolName,'a2ui_render','allowed tool only');assert.ok(checked,'successful actual CLI required');assert.deepEqual(input,checked,'unchanged successfulcheck toolarguments');assert.equal(result.renderAttempted,undefined,'one render attempt');result.renderAttempted=true;}
     result.tools.push({name:event.toolName,input:structuredClone(input)});
    }catch(error){pending=false;stopRun('toolpolicy',error);return{block:true,terminate:true,reason:'BM4 guarded profile rejected tool; case stopped'};}
   });
   pi.on('tool_result',async event=>{
    pending=false;result.transcript.push({kind:'tool',tool:event.toolName,isError:event.isError,content:event.content});
    if(stop)return;
    const text=event.content.filter(c=>c.type==='text').map(c=>c.text).join('\n');
    if(event.toolName==='a2ui_register_artifact'&&!event.isError){artifactSrc=JSON.parse(text).src;result.artifact={src:artifactSrc,pngSHA256:hash(PNG)};}
    if(event.toolName==='bash'&&checkAttempted&&!checked){if(event.isError){stopRun('preflight',text);return;}try{const output=JSON.parse(text);assert.equal(output.surfaceId,'bm4');assert.equal(output.source,await readFile(draft,'utf8'));checked=output;result.compileValid=true;result.source=output.source;result.sourceSHA256=hash(output.source);}catch(error){stopRun('preflight',error);return;}}
    if(event.toolName==='a2ui_render'){
     if(event.isError){stopRun('compile',text);return;}
     result.rendered=true;let phase='browser-setup';
     try{await deadline(opener??Promise.reject(new Error('opener missing')),10000,'browser opener');assert.ok(page);const snapshot=(event.details as {a2uiSnapshot:Snapshot}).a2uiSnapshot;result.snapshot=snapshot;phase='intent';const expected=intent(row,snapshot,artifactSrc);result.intentPass=true;phase='browser';
      if(row.id==='M02'){await page!.getByRole('region',{name:'Canvas bm4'}).getByRole('button',{name:'Save form',exact:true}).click();await expect(page!.getByRole('region',{name:'Canvas bm4'}).getByRole('textbox')).toHaveAttribute('aria-invalid','true');assert.equal(await page!.evaluate(()=>(window as any).bm4ActionStarts),0);assert.equal(posts.length,0);assert.equal(session!.getFollowUpMessages().length,0);}
      await interact(row,page!);
      if(row.action){phase='action-queue';await wait(()=>statuses.length===1&&session!.getFollowUpMessages().length===1);assert.deepEqual(statuses,[202]);assert.equal(posts.length,1);const queue=session!.getFollowUpMessages();assert.equal(queue.length,1);const accepted=forwardedPayload(queue[0]);
       const fields={epoch:snapshot.epoch,revision:snapshot.surfaces[0].revision,surfaceId:'bm4',event:row.action.event,sourceComponentId:expected.buttonId,context:row.action.context};for(const [key,value]of Object.entries(fields))assert.deepEqual(accepted[key],value,'actual Pi queue '+key);for(const [key,value]of Object.entries(fields))if(['epoch','revision'].includes(key))assert.deepEqual(posts[0][key],value,'actual POST '+key);else assert.deepEqual(posts[0].message.action[key==='event'?'name':key],value,'actual POST '+key);result.queue=accepted;result.interactionPass=true;
      }else{assert.equal(posts.length,0);assert.equal(statuses.length,0);assert.equal(session!.getFollowUpMessages().length,0);result.staticPass=true;}
      if(simulation==='browser-hang')await new Promise<void>(()=>{});
      result.posts=posts;result.statuses=statuses;phase='evidence';await page!.screenshot({path:join(run,row.id+'.png')});stopRun('success');
     }catch(error){result.posts=posts;result.statuses=statuses;if(['browser-setup','evidence'].includes(phase))result.harnessFailure=true;stopRun(phase,error);}
    }else if(event.isError&&checkAttempted)stopRun('preflight',text);
   });
  };
  const hint=`Guarded benchmark profile. Use the actual pi-a2ui skill. Own draft ${draft}; use write/edit for this file (no shell file creation). Bash supports only node "${helper}" catalog|patterns|pattern NAME|component NAME|examples|example NAME or check --surface-id bm4 "${draft}". At most8tools and5totalmodelresponses. Firstpreflight once, pass output unchangedto a2ui_render, surfacebm4. No repair/retry after firstcheck/render. Query only neededrefs. Read only shippedpackage/projecttext; no otherfiles. Use toolcalls sequentially. Do not wait for action. sample.png is already supplied; do not write it.`;
  const loader=new DefaultResourceLoader({cwd:project,agentDir,settingsManager:settings,noExtensions:true,noSkills:true,noThemes:true,noPromptTemplates:true,noContextFiles:true,additionalSkillPaths:[skill],extensionFactories:[factory],appendSystemPrompt:[hint]});await loader.reload();
  assert.equal(loader.getSkills().skills.length,1);assert.equal(loader.getSkills().skills[0].filePath,skill);
  const tools=['read','bash','write','edit','a2ui_render','a2ui_register_artifact'];
  const created=await createAgentSession({cwd:project,agentDir,modelRuntime:runtime,model,thinkingLevel:'off',settingsManager:settings,sessionManager:SessionManager.inMemory(project),resourceLoader:loader,tools});session=created.session;session.agent.toolExecution='sequential';assert.equal(created.modelFallbackMessage,undefined);await session.bindExtensions({mode:'rpc'});assert.deepEqual(session.getActiveToolNames().sort(),tools.sort());result.activeTools=session.getActiveToolNames();result.skillPath='package/skills/pi-a2ui/SKILL.md';
  timer=setTimeout(()=>stopRun('provider','case deadline'),CAPS.caseMs);result.started=true;
  await session.prompt('/skill:pi-a2ui '+row.request);await abortWait;
  if(!stop)stopRun('no-render','model ended without first render');
 }catch(error){stopRun(result.started?'provider':'setup',error);if(!result.started)result.harnessFailure=true;}
 finally{
  if(timer)clearTimeout(timer);budget.stopped=true;
  const cleanupUntil=Date.now()+CAPS.cleanupMs;
  const clean=async(name:string,operation:()=>Promise<unknown>)=>{try{await deadline(operation(),Math.max(1,cleanupUntil-Date.now()),name);}catch(error){result.cleanupFailures.push(name+': '+redact(error instanceof Error?error.message:String(error),secrets));}};
  if(page)await clean('page',()=>page!.close());
  if(session){await clean('abort',()=>session!.abort());await clean('extension shutdown',()=>session!.extensionRunner.emit({type:'session_shutdown',reason:'quit'}));session.dispose();}
  if(browser)await clean('browser',async()=>{await browserServer?.kill();result.browserProcessClosed=true;if(browser!.isConnected())await browser!.close();if(simulation==='cleanup-fault')throw new Error('injected cleanup fault after actual browser closed');});
  if(origin)try{await realFetch(origin,{signal:AbortSignal.timeout(1000)});result.cleanupFailures.push('owned server remains reachable');}catch{result.serverClosed=true;}
  globalThis.fetch=realFetch;process.removeListener('SIGTERM',interrupted);process.removeListener('SIGINT',interrupted);
  if(beforeHashes){try{assert.deepEqual(await configHashes(),beforeHashes);result.userConfigUnchanged=true;result.userConfigHashes=beforeHashes;}catch{result.cleanupFailures.push('real config hashes changed');}}
  killTrackedDetachedChildren();await clean('workspace',()=>rm(owned,{recursive:true,force:true}));
  if(result.cleanupFailures.length)result.harnessFailure=true;
  result.requests=budget.attempts;result.blockedRequests=budget.blocked;result.toolAttempts=toolCount;result.toolCount=result.tools.length;result.usageKnown=result.providerUsage.length===budget.attempts&&result.providerUsage.every((u:any)=>['prompt_tokens','completion_tokens','total_tokens'].every(key=>typeof u[key]==='number')); 
  const output=redact(result,secrets);await writeFile(join(run,row.id+'.json'),output+'\n',{mode:0o600});
 }
 return result;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [id,run,mode,simulation]=process.argv.slice(2);assert.ok(['offline','live'].includes(mode));assert.ok(run.startsWith(join(root,'.local/')));assert.ok(rows.some(row=>row.id===id));
 await episode(rows.find(row=>row.id===id)!,{offline:mode==='offline',run,simulation});
}
