// Private experiment worker. No real credentials or bootstrap URLs are serialized.
import './offline-read-guard.ts';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,rm,symlink,lstat} from 'node:fs/promises';
import {writeFileSync,appendFileSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import {homedir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {ModelRuntime,SettingsManager,SessionManager,DefaultResourceLoader,createAgentSession,type ExtensionAPI} from '@earendil-works/pi-coding-agent';
import {chromium,type Browser,type BrowserServer,type Page} from '@playwright/test';
import a2ui from '../../extension.ts';
import {configAdmission,literalCredentials,ordinaryPath,redact} from '../benchmark-model/guards.ts';
import {killTrackedDetachedChildren} from '../../node_modules/@earendil-works/pi-coding-agent/dist/utils/shell.js';
import {PilotBudget,observeAssistant,descriptionForArm,contextBody,canonical,hash} from './contracts.ts';
import {observeResponse,recordError,completeUsage} from './diagnostics.ts';
import {policyFor,assertOwned,verifyLiveWorker,verifyLiveRequest,OLD_ID} from '../trigger-smoke/policy.ts';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
for(const key of ['FORCE_COLOR','BASH_ENV','ENV','NODE_OPTIONS','LD_PRELOAD','DYLD_INSERT_LIBRARIES'])delete process.env[key];
const timeout=async<T>(work:Promise<T>,ms:number,label:string):Promise<T>=>{
 let timer:ReturnType<typeof setTimeout>;return Promise.race([work,new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error(label)),ms);})]).finally(()=>clearTimeout(timer));
};
function helperCall(command:string,helper:string,draft:string,cwd:string):{command:string;check:boolean}{
 assert.equal(typeof command,'string');assert.ok(!/[\r\n$`;&|<>\\]/.test(command),'shell syntax');
 const tokens=command.match(/"[^"\r\n]*"|'[^'\r\n]*'|[^\s"']+/g)?.map(t=>/^['"]/.test(t)?t.slice(1,-1):t)??[];
 assert.equal(command.replace(/"[^"\r\n]*"|'[^'\r\n]*'|[^\s"']+/g,'').trim(),'','shell quoting');
 assert.ok(tokens[0]==='node'||tokens[0]===process.execPath);assert.equal(resolve(cwd,tokens[1]??''),helper);
 const op=tokens[2];if(['catalog','patterns','examples'].includes(op))assert.equal(tokens.length,3);
 else if(['component','pattern','example'].includes(op)){assert.equal(tokens.length,4);assert.match(tokens[3],/^[A-Za-z0-9_-]+$/);}
 else{assert.equal(op,'check');assert.equal(tokens.length,6);assert.equal(tokens[3],'--surface-id');assert.match(tokens[4],/^[A-Za-z0-9_-]{1,64}$/);assert.equal(resolve(cwd,tokens[5]),draft);}
 const quote=(s:string)=>"'"+s.replaceAll("'","'\\''")+"'";
 return{command:[process.execPath,helper,...tokens.slice(2)].map(quote).join(' '),check:op==='check'};
}

export async function episode(id:string,run:string,kind:string,simulation='',experiment=OLD_ID){
 const policy=policyFor(experiment),PROFILE=policy.profile,SCENARIOS=policy.scenarios;
 if(kind==='live')verifyLiveWorker(run,id,experiment,true);
 assert.equal(process.versions.node.split('.')[0],'24');assert.ok(['capture','offline','live'].includes(kind));assert.ok(!simulation||kind==='offline');
 assertOwned(run,experiment);
 assert.ok(PROFILE.order.includes(id));const [scenarioId,arm]=policy.smoke?[id,'B']:id.split('-'),row=SCENARIOS.find((r:any)=>r.id===scenarioId)!;
 const workspace=join(run,'workspace'),project=join(workspace,'project'),agent=join(workspace,'agent'),pack=join(workspace,'package');
 // Parent owns this fixed path and runs workers serially. No user path is eligible.
 await rm(workspace,{recursive:true,force:true});for(const p of [project,agent,pack])await mkdir(p,{recursive:true,mode:0o700});
 const payload=JSON.parse(await readFile(join(ROOT,'tests/benchmark-model/payload.json'),'utf8')) as string[];
 for(const p of payload){assert.ok(!p.includes('..')&&!p.startsWith('/'));assert.equal((await lstat(join(ROOT,p))).isSymbolicLink(),false);await mkdir(dirname(join(pack,p)),{recursive:true});await writeFile(join(pack,p),await readFile(join(ROOT,p)));}
 await symlink(join(ROOT,'node_modules'),join(pack,'node_modules'),'dir');
 const helper=join(pack,'skills/pi-a2ui/scripts/a2ui.mjs'),skill=join(pack,'skills/pi-a2ui/SKILL.md'),draft=join(project,'draft.express');
 const journal=join(run,kind==='live'?'live-requests.jsonl':`synthetic-${policy.smoke&&kind==='offline'?'offline':simulation||kind}-requests.jsonl`),budget=new PilotBudget(journal,kind==='live'?'live':'offline',experiment);
 const record:any={id,kind,experiment,simulation:simulation||null,node:process.version,started:false,requests:0,renderRequested:false,renderAttempted:false,renderCommitted:false,preparation:false,outcome:'setup',transcript:[],tools:[],usage:[],requestDiagnostics:[],cleanupErrors:[],modelCalls:0};
 let session:any,runtime:any,browser:Browser|undefined,browserServer:BrowserServer|undefined,page:Page|undefined,opener:Promise<void>|undefined,origin:string|undefined;
 let stopped=false,toolCount=0,renderCount=0,checkAttempted=false,checkCallId:string|undefined,abortWait:Promise<void>|undefined,caseTimer:ReturnType<typeof setTimeout>|undefined,currentDiagnostic:any;
 const secrets:string[]=[];const realFetch=globalThis.fetch;let beforeConfig:(string|null)[]|undefined;
 const configPaths=['settings.json','auth.json','models.json','models-store.json'].map(p=>join(homedir(),'.pi/agent',p));
 const configHashes=async()=>Promise.all(configPaths.map(async p=>{try{return hash(await readFile(p));}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return null;throw e;}}));
 const stop=(reason:string,fatal=false,abort=true)=>{if(!stopped){stopped=true;record.outcome=reason;record.fatal=fatal;if(abort)abortWait=session?.abort();}};
 const error=(source:string,cause:unknown)=>{if(currentDiagnostic)recordError(currentDiagnostic,source,cause,secrets);};
 const interrupt=()=>{if(simulation!=='hang'){error('episode',new Error('worker interrupted'));stop('provider_unknown',true);}};process.once('SIGTERM',interrupt);process.once('SIGINT',interrupt);
 globalThis.fetch=async(input,options)=>{const url=new URL(typeof input==='string'||input instanceof URL?String(input):input.url);assert.ok(url.protocol==='http:'&&url.hostname==='127.0.0.1','non-provider external network forbidden');return realFetch(input,options);};
 try{
  let config:{key:string;headers:Record<string,string>;model:Record<string,unknown>};
  if(simulation==='offline-config-read')await readFile(configPaths[1],'utf8');
  if(kind==='live'){
   beforeConfig=await configHashes();
   try{config=configAdmission(await readFile(configPaths[2],'utf8'),await readFile(configPaths[1],'utf8').catch(e=>{if(e.code==='ENOENT')return '{}';throw e;}),process.env);}catch{throw new Error('trusted live config admission failed');}
  }else config={key:'synthetic-pilot-unused',headers:{},model:{}};
  secrets.push(config.key,...Object.values(config.headers));
  const models=join(agent,'models.json');await writeFile(models,JSON.stringify({providers:{[PROFILE.model.provider]:{baseUrl:PROFILE.model.baseUrl,api:'openai-completions',models:[{id:PROFILE.model.id,name:PROFILE.model.id,reasoning:true,input:['text'],contextWindow:65536,maxTokens:4096}]}}}),{mode:0o600});
  runtime=await ModelRuntime.create({credentials:literalCredentials(config.key),modelsPath:models,modelsStorePath:join(agent,'models-store.json'),allowModelNetwork:false,refreshOnCreate:false});
  const model=runtime.getModel(PROFILE.model.provider,PROFILE.model.id);assert.ok(model);const stream=runtime.streamSimple.bind(runtime);
  runtime.streamSimple=(selected:any,context:any,options:any)=>{
   currentDiagnostic=undefined;
   if(stopped)throw new Error('episode stopped before provider continuation');
   return stream(selected,context,{...options,maxTokens:1536,maxRetries:0,timeoutMs:30000,fetch:async(input:any,init:any)=>{
    if(stopped)throw new Error('episode stopped before transport');
    const url=typeof input==='string'||input instanceof URL?String(input):input.url;const body=JSON.parse(String(init?.body));body.parallel_tool_calls=false;body.tool_choice='auto';body.thinking={type:PROFILE.thinkingPolicy.type};body.reasoning_effort=PROFILE.thinkingPolicy.effort;const headers=new Headers(init?.headers);let diagnostic:any;
    try{
     const first=budget.rows().filter(r=>r.episode===id).length===0;
     if(first){const normalized=canonical(contextBody(body,experiment));record.firstBodySHA256=hash(normalized);record.inputBytes=Buffer.byteLength(JSON.stringify(body));
      if(kind==='capture')await writeFile(join(run,id+'.context.json'),JSON.stringify(body,null,2)+'\n',{mode:0o600});
      else{const approved=JSON.parse(await readFile(join(run,'contexts.json'),'utf8'));assert.equal(hash(normalized),approved[scenarioId],'actual initial context drift');}
      record.skillMetadataPresent=JSON.stringify(body.messages).includes('pi-a2ui');record.skillBodyPreloaded=JSON.stringify(body.messages).includes('# Pi A2UI');assert.equal(record.skillBodyPreloaded,false,'skill must not be forced');
     }
     if(simulation==='wrong-model')body.model='forbidden-model';
     if(kind==='live'){verifyLiveRequest(run,id);assert.equal(headers.get('authorization'),'Bearer '+config.key,'credential transport identity');for(const [k,v]of Object.entries(config.headers))headers.set(k,v);}
     budget.admit(id,url,selected,body);record.requests++;record.modelCalls=kind==='live'?record.requests:0;
     const row=budget.rows().at(-1)!;diagnostic={request:record.requests,journalIndex:row.index,bodySHA256:row.bodySHA256,status:null,usage:null,streamState:'pending',bytes:0,finishReasons:[],doneObserved:false,errors:[]};currentDiagnostic=diagnostic;record.requestDiagnostics.push(diagnostic);
    }catch(e){const isBudget=e instanceof Error&&e.message.includes('request budget');stop(isBudget?(record.preparation?'ui_preparation_only':'budget_limited'):'admission_error',!isBudget);throw new Error('pilot request admission stopped');}
    let response:Response;
    if(kind!=='live'){
     const turn=record.requests;let tool:any,text:string|undefined;
     if(kind==='capture'||simulation==='text'||simulation==='torn-journal')text='synthetic text only';
     else if(simulation==='schema-missing')tool={name:'a2ui_render',arguments:{surfaceId:'pilot'}};
     else if(simulation==='schema-type')tool={name:'a2ui_render',arguments:{surfaceId:{invalid:true},source:'root = Text("x")'}};
     else if(simulation==='prepare'||simulation==='budget'||simulation==='read-then-stream-error')tool={name:'read',arguments:{path:skill}};
     else if(simulation==='unsafe-shell')tool={name:'bash',arguments:{command:'touch forbidden'}};
     else if(simulation==='failed-check')tool=turn===1?{name:'write',arguments:{path:draft,content:'root = BadComponent()'}}:{name:'bash',arguments:{command:`node "${helper}" check --surface-id pilot "${draft}"`}};
     else tool={name:'a2ui_render',arguments:{surfaceId:'pilot',source:simulation==='compile'?'root = BadComponent()':'root = Text("Synthetic pilot control")'}};
     if(policy.smoke&&kind!=='capture'){
      if(id==='SM02-B'&&(!simulation||simulation==='usage-missing')){tool=undefined;text='收到';}
      if(id==='SM01-B'&&(!simulation||simulation==='hang'))tool={name:'a2ui_render',arguments:{surfaceId:'smoke',source:'$/app = ""\n$/env = ""\n$/version = ""\nroot = Column(children=[TextField(label="应用名",value=$/app),TextField(label="目标环境",value=$/env),TextField(label="版本号",value=$/version),Button(child=Text(text="确认"),action=Event("submit",{app:$/app,env:$/env,version:$/version}))])'}};
     }
     const delta=tool?{role:'assistant',tool_calls:[{index:0,id:'call-'+turn,type:'function',function:{name:tool.name,arguments:JSON.stringify(tool.arguments)}}]}:{role:'assistant',content:text};
     const common={id:'pilot-synthetic',object:'chat.completion.chunk',created:1,model:PROFILE.model.id};const usage=simulation==='usage-missing'?{}:{usage:{prompt_tokens:10,completion_tokens:2,total_tokens:12}};
     const chunks=[{...common,choices:[{index:0,delta,finish_reason:null}]},{...common,choices:[{index:0,delta:{},finish_reason:simulation==='truncated'?'length':tool?'tool_calls':'stop'}],...usage}];
     response=new Response(chunks.map(c=>'data: '+JSON.stringify(c)+'\n\n').join('')+'data: [DONE]\n\n',{headers:{'content-type':'text/event-stream'}});
     if(simulation==='rate-limit')response=new Response('{"error":{"message":"synthetic rate limit"}}',{status:429});
     if(simulation==='read-then-stream-error'&&turn===2)response=new Response(new ReadableStream({pull(c){c.error(new Error('synthetic interruption headers: {Authorization: "Bearer synthetic-hidden"}; body: {reasoning_content:"private-canary"}'));}}));
    }else try{response=await realFetch(url,{...init,headers,body:JSON.stringify(body),redirect:'error',signal:AbortSignal.any([...(init?.signal?[init.signal]:[]),AbortSignal.timeout(30000)])});}catch(cause){recordError(diagnostic,'transport',cause,secrets);stop('provider_unknown',true);throw new Error('pilot provider transport outcome unknown');}
    record.providerStatus=response.status;if(!response.ok)stop('provider_error',policy.smoke||[401,403,429].includes(response.status),!policy.smoke);
    return observeResponse(response,diagnostic,secrets);
   }});
  };
  const settings=SettingsManager.inMemory({retry:{enabled:false,maxRetries:0,provider:{maxRetries:0,timeoutMs:30000}},compaction:{enabled:false},cacheWarming:'off',transport:'sse'});
  const factory=(pi:ExtensionAPI)=>{
   const host:ExtensionAPI={...pi,registerTool:(tool:any)=>pi.registerTool(tool.name==='a2ui_render'?{...tool,description:descriptionForArm(tool.description,arm)}:tool),exec:async(command,args)=>{
    assert.ok(['open','xdg-open','rundll32'].includes(command));const url=new URL(args.at(-1)!);assert.equal(url.hostname,'127.0.0.1');origin=url.origin;secrets.push(url.href);const token=new URLSearchParams(url.hash.slice(1)).get('token');if(token)secrets.push(token);
    opener=(async()=>{browserServer=await chromium.launchServer({headless:true,handleSIGTERM:false,handleSIGINT:false,handleSIGHUP:false});const p=browserServer.process(),profileArg=p.spawnargs.find(a=>a.startsWith('--user-data-dir='));assert.ok(profileArg);await writeFile(join(run,id+'.resources.json'),JSON.stringify({workerPid:process.pid,browserPid:p.pid,profileArg,origin}),{mode:0o600});browser=await chromium.connect(browserServer.wsEndpoint());const context=await browser.newContext({viewport:{width:1280,height:900},locale:'en-US',timezoneId:'UTC',reducedMotion:'reduce'});record.actionPosts=0;context.on('request',r=>{if(r.url()===origin+'/api/actions'&&r.method()==='POST')record.actionPosts++;});await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());const response=await context.request.post(origin+'/api/connect',{headers:{origin},data:{token},timeout:5000});assert.equal(response.status(),200);page=await context.newPage();await page.goto(origin!,{timeout:5000});})();
    await opener;return{stdout:'',stderr:'',code:0,killed:false,truncated:false};
   }};
   a2ui(host);
   pi.on('message_end',event=>{const message=event.message as any;if(message.role!=='assistant')return;record.transcript.push({role:'assistant',content:message.content,stopReason:message.stopReason});const d=currentDiagnostic;if(d){d.sdkStopReason=message.stopReason;if(message.errorMessage)recordError(d,'sdk',message.errorMessage,secrets);}if(!stopped){observeAssistant(record,message);if(message.stopReason==='length')stop('output_truncated',policy.smoke);if(message.stopReason==='error'||message.stopReason==='aborted')stop('provider_unknown',true);
    if(policy.smoke&&kind!=='capture'&&!stopped&&id==='SM02-B'){const calls=message.content?.filter((c:any)=>c.type==='toolCall')??[],text=message.content?.filter((c:any)=>c.type==='text').map((c:any)=>c.text).join('')??'';if(calls.length){record.stoppedByPolicy=true;stop('negative_tool',true);}else stop(text.trim()==='收到'?'negative_pass':'negative_text',text.trim()!=='收到');}
   }});
   pi.on('tool_call',event=>{
    try{
     assert.equal(stopped,false);assert.ok(++toolCount<=6,'tool budget');assert.ok(!event.parentToolCallId,'nested tool');const args=event.input as any;
     if(event.toolName==='a2ui_render'){assert.equal(renderCount++,0,'one render');record.renderAttempted=true;record.surfaceId=args.surfaceId;}
     else{record.preparation=true;if(event.toolName==='read')ordinaryPath(args.path,[pack,project],project);
      else if(event.toolName==='write'||event.toolName==='edit'){assert.equal(checkAttempted,false);assert.equal(resolve(project,args.path),draft);if(event.toolName==='write')assert.ok(Buffer.byteLength(args.content)<=32768);}
      else{assert.equal(event.toolName,'bash');const command=helperCall(args.command,helper,draft,project);args.command=command.command;args.timeout=10;if(command.check){assert.equal(checkAttempted,false);ordinaryPath(draft,[project],project);checkAttempted=true;checkCallId=event.toolCallId;}}}
     record.tools.push({name:event.toolName,input:structuredClone(args)});
    }catch{stop('tool_policy');return{block:true,terminate:true,reason:'pilot sandbox rejected tool; episode stopped'};}
   });
   pi.on('tool_execution_end',event=>{if(event.toolName==='a2ui_render'&&!record.renderAttempted&&event.isError)stop('render_schema',policy.smoke);});
   pi.on('tool_result',async event=>{
    record.transcript.push({role:'tool',tool:event.toolName,isError:event.isError,content:event.content});
    if(stopped)return;
    if(event.toolCallId===checkCallId){record.preflightPassed=!event.isError;if(event.isError){stop('preflight_error',policy.smoke);return;}}
    if(policy.smoke&&event.isError){stop(event.toolName==='a2ui_render'?'render_compile':'tool_error',true);return;}
    if(event.toolName==='a2ui_render'){
     if(event.isError){stop('render_compile');return;}
     record.renderCommitted=true;record.snapshot=(event.details as any)?.a2uiSnapshot;
     try{await timeout(opener??Promise.reject(new Error('missing opener')),10000,'browser opener');assert.ok(page);const canvas=page.getByRole('region',{name:'Canvas '+record.surfaceId,exact:true});await canvas.waitFor({timeout:5000});record.domText=await canvas.innerText();record.browserVersion=browser!.version();assert.equal(record.actionPosts,0,'no action dispatch authorized');await page.screenshot({path:join(run,id+'.png')});record.domObserved=true;if(policy.smoke){const labels=[/应用(?:名|名称)?|app(?:lication)?(?:\s*name)?/i,/目标环境|环境|environment/i,/版本(?:号)?|version/i];const fields=record.snapshot.surfaces.find((s:any)=>s.surfaceId===record.surfaceId).message.createSurface.components.filter((c:any)=>["TextField","ChoicePicker","SearchablePicker"].includes(c.component)&&typeof c.value?.["@path"]==="string");record.contentChecks=labels.map(label=>fields.some((f:any)=>typeof f.label==="string"&&label.test(f.label))&&label.test(record.domText));record.nativeInputCount=await canvas.locator('input:not([type=hidden]),textarea,select,[role=combobox],[role=checkbox],[role=radio]').count();record.contentChecks.push(new Set(fields.map((f:any)=>f.value["@path"])).size>=3&&record.nativeInputCount>=3);record.contentChecks.push(await canvas.getByRole('button').count()>0);record.contentValid=record.contentChecks.every(Boolean);}if(simulation==='hang'){await writeFile(join(run,id+'.hang-ready'),'actual DOM observed\n');await new Promise(()=>{});}stop(policy.smoke&&!record.contentValid?'ui_invalid':'render_committed',policy.smoke&&!record.contentValid);}catch(error){record.browserError=error instanceof Error?error.message.slice(0,4096):'browser error';record.harnessFailure=true;stop('browser_error',true);}
    }else if(policy.smoke&&record.requests>=policy.limit(id))stop(record.preparation?'preparation_limited':'budget_limited');
   });
  };
  const safety=`Sandbox file writes are limited to ${draft}; use write/edit to create this file. Reads are limited to the shipped package and this workspace. Shell permits only a direct Node invocation of the shipped helper's read-only queries/check, without shell operators or redirection. Do not execute other programs. Follow the user's task; no real business operation is authorized.`;
  const loader=new DefaultResourceLoader({cwd:project,agentDir:agent,settingsManager:settings,noExtensions:true,noSkills:true,noThemes:true,noPromptTemplates:true,noContextFiles:true,additionalSkillPaths:[skill],extensionFactories:[factory],appendSystemPrompt:[safety]});await loader.reload();assert.equal(loader.getSkills().skills.length,1);
  const tools=['read','bash','write','edit','a2ui_render'];const created=await createAgentSession({cwd:project,agentDir:agent,modelRuntime:runtime,model,thinkingLevel:'low',settingsManager:settings,sessionManager:SessionManager.inMemory(project),resourceLoader:loader,tools});session=created.session;session.agent.toolExecution='sequential';assert.equal(created.modelFallbackMessage,undefined);await session.bindExtensions({mode:'rpc'});assert.deepEqual(session.getActiveToolNames().sort(),tools.sort());
  record.started=true;caseTimer=setTimeout(()=>{error('episode',new Error('episode deadline'));stop('provider_unknown',true);},policy.active(id));await session.prompt(row.request);await abortWait;if(!stopped)stop(record.outcome==='setup'?(record.preparation?'ui_preparation_only':'text_only'):record.outcome);
 }catch(cause){error('episode',cause);if(!stopped){record.harnessFailure=!record.started;stop(record.started?'provider_unknown':'setup_error',true);}}
 finally{
  if(caseTimer)clearTimeout(caseTimer);stopped=true;
  const until=Date.now()+10000;const clean=async(name:string,work:()=>Promise<unknown>)=>{try{await timeout(work(),Math.max(1,until-Date.now()),name);}catch{record.cleanupErrors.push(name);}};
  if(page)await clean('page',()=>page!.close());if(session){await clean('abort',()=>session.abort());await clean('shutdown',()=>session.extensionRunner.emit({type:'session_shutdown',reason:'quit'}));session.dispose();}
  if(browserServer)await clean('browser',()=>browserServer!.kill());if(browser?.isConnected())await clean('disconnect',()=>browser!.close());
  if(origin){try{await realFetch(origin,{signal:AbortSignal.timeout(1000)});record.cleanupErrors.push('server remains open');}catch{record.serverClosed=true;}}
  if(beforeConfig){try{assert.deepEqual(await configHashes(),beforeConfig);record.userConfigUnchanged=true;}catch{record.cleanupErrors.push('user config changed');}}
  killTrackedDetachedChildren();globalThis.fetch=realFetch;process.removeListener('SIGTERM',interrupt);process.removeListener('SIGINT',interrupt);
  await clean('workspace',()=>rm(workspace,{recursive:true,force:true}));record.toolAttempts=toolCount;record.toolCount=record.tools.length;record.offlineConfigGuard=(globalThis as any).pilotReadGuard;record.usage=record.requestDiagnostics.map((d:any)=>d.usage);record.usageKnown=record.usage.length===record.requests&&record.usage.every(completeUsage);if(record.cleanupErrors.length){record.harnessFailure=true;record.fatal=true;}
  if(simulation==='torn-journal'&&kind==='offline')appendFileSync(journal,'{"index":2');
  writeFileSync(join(run,id+'.'+kind+(simulation?'-'+simulation:'')+'.json'),redact(record,secrets)+'\n',{mode:0o600});
 }
 return record;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [id,run,kind,simulation,experiment]=process.argv.slice(2);episode(id,resolve(run),kind,simulation,experiment).catch(()=>{console.error('pilot worker setup/receipt failure; no automatic retry');process.exitCode=1;});
}
