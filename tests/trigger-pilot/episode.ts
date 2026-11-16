// Private experiment worker. No real credentials or bootstrap URLs are serialized.
import './offline-read-guard.ts';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,rm,symlink,lstat} from 'node:fs/promises';
import {readFileSync,writeFileSync,appendFileSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import {homedir} from 'node:os';
import {observeOwnedProcesses} from '../helper-adapter/process-witness.ts';
import {planHelperInvocation,HelperInvocationError} from '../helper-adapter/invocation.ts';
import {PAIR_ID} from '../authoring-pilot/profile.ts';
import {validatePackages,validateActivePackage,verifyPairWorker,verifyPairRequest} from '../authoring-pilot/authority.ts';
import {judgeSource,sourceMatch} from '../authoring-pilot/oracle.ts';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {ModelRuntime,SettingsManager,SessionManager,DefaultResourceLoader,createAgentSession,type ExtensionAPI} from '@earendil-works/pi-coding-agent';
import {chromium,type Browser,type BrowserServer,type Page} from '@playwright/test';
import a2ui from '../../extension.ts';
import {configAdmission,literalCredentials,ordinaryPath,redact} from '../benchmark-model/guards.ts';
import {killTrackedDetachedChildren} from '../../node_modules/@earendil-works/pi-coding-agent/dist/utils/shell.js';
import {PilotBudget,observeAssistant,descriptionForArm,contextBody,canonical,hash} from './contracts.ts';
import {observeResponse,recordError,completeUsage} from './diagnostics.ts';
import {policyFor,assertOwned,verifyLiveWorker,verifyLiveRequest,OLD_ID} from '../trigger-smoke/policy.ts';
import {assistantReceipt,formCandidates,domFormBinding} from '../trigger-smoke/observations.ts';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
for(const key of ['FORCE_COLOR','BASH_ENV','ENV','NODE_OPTIONS','LD_PRELOAD','DYLD_INSERT_LIBRARIES'])delete process.env[key];
const timeout=async<T>(work:Promise<T>,ms:number,label:string):Promise<T>=>{
 let timer:ReturnType<typeof setTimeout>;return Promise.race([work,new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error(label)),ms);})]).finally(()=>clearTimeout(timer));
};
class HelperInputError extends Error {}
function helperCall(command:string,helper:string,draft:string,cwd:string):{command:string;check:boolean;surfaceId?:string}{
 assert.equal(typeof command,'string');assert.ok(!/[\r\n$`;&|<>\\]/.test(command),'shell syntax');
 const tokens=command.match(/"[^"\r\n]*"|'[^'\r\n]*'|[^\s"']+/g)?.map(t=>/^['"]/.test(t)?t.slice(1,-1):t)??[];
 assert.equal(command.replace(/"[^"\r\n]*"|'[^'\r\n]*'|[^\s"']+/g,'').trim(),'','shell quoting');
 assert.ok(tokens[0]==='node'||tokens[0]===process.execPath);assert.equal(resolve(cwd,tokens[1]??''),helper);
 const op=tokens[2];if(['catalog','patterns','examples'].includes(op)){if(tokens.length!==3)throw new HelperInputError('read-only helper usage');}
 else if(['component','pattern','example'].includes(op)){if(tokens.length!==4||!/^[A-Za-z0-9_-]+$/.test(tokens[3]))throw new HelperInputError('read-only helper usage');}
 else{assert.equal(op,'check');if(tokens[5]!==undefined)assert.equal(resolve(cwd,tokens[5]),draft,'owned draft only');if(tokens.length!==6||tokens[3]!=='--surface-id'||!/^[A-Za-z0-9_-]{1,64}$/.test(tokens[4]))throw new HelperInputError('read-only helper usage');}
 const quote=(s:string)=>"'"+s.replaceAll("'","'\\''")+"'";
 return{command:[process.execPath,helper,...tokens.slice(2)].map(quote).join(' '),check:op==='check',surfaceId:op==='check'?tokens[4]:undefined};
}

export async function episode(id:string,run:string,kind:string,simulation='',experiment=OLD_ID){
 const policy=policyFor(experiment),PROFILE=policy.profile,SCENARIOS=policy.scenarios;
 if(kind==='live'){if(policy.paired)verifyPairWorker(run,id,true);else verifyLiveWorker(run,id,experiment,true);}
 assert.equal(process.versions.node.split('.')[0],'24');assert.ok(['capture','offline','live'].includes(kind));assert.ok(!simulation||kind==='offline');
 assertOwned(run,experiment);
 assert.ok(PROFILE.order.includes(id));const [scenarioId,arm]=policy.smoke?[id,'B']:id.split('-'),row=SCENARIOS.find((r:any)=>r.id===scenarioId)!;
 const workspace=join(run,'workspace'),project=join(workspace,'project'),agent=join(workspace,'agent'),pack=join(workspace,'package');
 // Parent owns this fixed path and runs workers serially. No user path is eligible.
 await rm(workspace,{recursive:true,force:true});for(const p of [project,agent,pack])await mkdir(p,{recursive:true,mode:0o700});
 const payload=JSON.parse(await readFile(join(ROOT,'tests/benchmark-model/payload.json'),'utf8')) as string[];
 if(policy.paired)validatePackages(run,experiment);const payloadRoot=policy.paired?join(run,'arms',arm,'package'):ROOT;
 for(const p of payload){assert.ok(!p.includes('..')&&!p.startsWith('/'));assert.equal((await lstat(join(payloadRoot,p))).isSymbolicLink(),false);await mkdir(dirname(join(pack,p)),{recursive:true});await writeFile(join(pack,p),await readFile(join(payloadRoot,p)));}
 await symlink(join(ROOT,'node_modules'),join(pack,'node_modules'),'dir');
 const helper=join(pack,'skills/pi-a2ui/scripts/a2ui.mjs'),skill=join(pack,'skills/pi-a2ui/SKILL.md'),draft=join(project,'draft.express');
 const journal=join(run,kind==='live'?'live-requests.jsonl':`synthetic-${(policy.smoke||policy.paired)&&kind==='offline'?'offline':simulation||kind}-requests.jsonl`),budget=new PilotBudget(journal,kind==='live'?'live':'offline',experiment);
 const record:any={id,kind,experiment,simulation:simulation||null,node:process.version,started:false,requests:0,renderRequested:false,renderAttempted:false,renderCommitted:false,preparation:false,outcome:'setup',transcript:[],tools:[],usage:[],requestDiagnostics:[],cleanupErrors:[],modelCalls:0,...(policy.paired?{fatal:false,firstCandidate:{submitted:false},workflow:{skillRead:false,exampleRead:false,checkBeforeCandidate:false},preSubmissionWrites:0}:{} )};
 let processWitness:ReturnType<typeof observeOwnedProcesses>|undefined;
 let session:any,runtime:any,browser:Browser|undefined,browserServer:BrowserServer|undefined,page:Page|undefined,opener:Promise<void>|undefined,origin:string|undefined;
 let stopped=false,toolCount=0,renderCount=0,checkAttempted=false,checkCallId:string|undefined,abortWait:Promise<void>|undefined,caseTimer:ReturnType<typeof setTimeout>|undefined,currentDiagnostic:any,checkedSource:string|undefined,renderedSource:string|undefined,armCompile:any,armValidate:any;
 const submitCandidate=(source:string,surfaceId:string,via:string)=>{if(!record.firstCandidate.submitted)record.firstCandidate={submitted:true,via,surfaceId,sourceSHA256:hash(source),grade:judgeSource(surfaceId,source,row,armCompile,armValidate),preSubmissionWrites:record.preSubmissionWrites,workflowBefore:{skillRead:record.workflow.skillRead,exampleRead:record.workflow.exampleRead}};};
 const secrets:string[]=[];const realFetch=globalThis.fetch;let beforeConfig:(string|null)[]|undefined;
 const configPaths=['settings.json','auth.json','models.json','models-store.json'].map(p=>join(homedir(),'.pi/agent',p));
 const configHashes=async()=>Promise.all(configPaths.map(async p=>{try{return hash(await readFile(p));}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return null;throw e;}}));
 const stop=(reason:string,fatal=false,abort=true)=>{if(!stopped){stopped=true;record.outcome=reason;record.fatal=fatal;if(abort)abortWait=session?.abort();}};
 const error=(source:string,cause:unknown)=>{if(currentDiagnostic)recordError(currentDiagnostic,source,cause,secrets);};
 const interrupt=()=>{if(simulation!=='hang'){error('episode',new Error('worker interrupted'));stop('provider_unknown',true);}};process.once('SIGTERM',interrupt);process.once('SIGINT',interrupt);
 globalThis.fetch=async(input,options)=>{const url=new URL(typeof input==='string'||input instanceof URL?String(input):input.url);assert.ok(url.protocol==='http:'&&url.hostname==='127.0.0.1','non-provider external network forbidden');return realFetch(input,options);};
 try{
  if(policy.helperAdapter)processWitness=observeOwnedProcesses(project,join(run,id+'.'+kind+'.process-witness.json'));
  let actualFactory=a2ui;if(policy.paired){validateActivePackage(run,id,experiment);record.loadedArm=arm;record.loadedPayload=JSON.parse(await readFile(join(run,'packages.json'),'utf8'))[arm];actualFactory=(await import(pathToFileURL(join(pack,'extension.ts')).href)).default;armCompile=(await import(pathToFileURL(join(pack,'src/compiler.ts')).href)).compile;armValidate=(await import(pathToFileURL(join(pack,'src/interactions.ts')).href)).validateSubmission;}
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
   if(policy.paired&&!stopped&&budget.rows().filter(r=>r.episode===id).length>=policy.limit(id))stop(record.preparation?'preparation_limited':'budget_limited');
   if(stopped)throw new Error('episode stopped before provider continuation');
   return stream(selected,context,{...options,maxTokens:1536,maxRetries:0,timeoutMs:30000,fetch:async(input:any,init:any)=>{
    if(stopped)throw new Error('episode stopped before transport');
    const url=typeof input==='string'||input instanceof URL?String(input):input.url;const body=JSON.parse(String(init?.body));body.parallel_tool_calls=false;body.tool_choice='auto';body.thinking={type:PROFILE.thinkingPolicy.type};body.reasoning_effort=PROFILE.thinkingPolicy.effort;const headers=new Headers(init?.headers);let diagnostic:any;
    try{
     const first=budget.rows().filter(r=>r.episode===id).length===0;
     if(first){const normalized=canonical(contextBody(body,experiment));record.firstBodySHA256=hash(normalized);record.inputBytes=Buffer.byteLength(JSON.stringify(body));
      if(kind==='capture')await writeFile(join(run,id+'.context.json'),JSON.stringify(body,null,2)+'\n',{mode:0o600});
      else{const approved=JSON.parse(await readFile(join(run,'contexts.json'),'utf8'));assert.equal(hash(normalized),approved[policy.paired?id:scenarioId],'actual initial context drift');}
      record.skillMetadataPresent=JSON.stringify(body.messages).includes('pi-a2ui');record.skillBodyPreloaded=JSON.stringify(body.messages).includes('# Pi A2UI');assert.equal(record.skillBodyPreloaded,false,'skill must not be forced');
     }
     if(policy.helperAdapter)record.helperHistoryHashes=(body.messages??[]).flatMap((m:any)=>m.role==='assistant'?(m.tool_calls??[]).flatMap((c:any)=>{if(c.function?.name!=='bash')return[];try{const args=JSON.parse(c.function.arguments);return typeof args.command==='string'?[hash(args.command)]:[];}catch{return[];}}):[]);
     if(simulation==='wrong-model')body.model='forbidden-model';
     if(kind==='live'){if(policy.paired)verifyPairRequest(run,id);else verifyLiveRequest(run,id);assert.equal(headers.get('authorization'),'Bearer '+config.key,'credential transport identity');for(const [k,v]of Object.entries(config.headers))headers.set(k,v);}
     budget.admit(id,url,selected,body);record.requests++;record.modelCalls=kind==='live'?record.requests:0;
     const row=budget.rows().at(-1)!;diagnostic={request:record.requests,journalIndex:row.index,bodySHA256:row.bodySHA256,status:null,usage:null,streamState:'pending',bytes:0,finishReasons:[],doneObserved:false,errors:[]};currentDiagnostic=diagnostic;record.requestDiagnostics.push(diagnostic);
    }catch(e){const isBudget=e instanceof Error&&e.message.includes('request budget');stop(isBudget?(record.preparation?(policy.paired?'preparation_limited':'ui_preparation_only'):'budget_limited'):'admission_error',!isBudget);throw new Error('pilot request admission stopped');}
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
      if(id==='SM02-B'&&(!simulation||simulation==='usage-missing'||simulation==='reasoning')){tool=undefined;text='收到';}
      if(id==='SM01-B'&&(!simulation||['hang','cancel-only','unbound-confirm','hidden-selected','ambiguous-labels'].includes(simulation)))tool={name:'a2ui_render',arguments:{surfaceId:'smoke',source:'$/app = ""\n$/env = ""\n$/version = ""\nroot = Column(children=[TextField(label="应用名",value=$/app),TextField(label="目标环境",value=$/env),TextField(label="版本号",value=$/version),Button(child=Text(text="确认"),action=Event("submit",{app:$/app,env:$/env,version:$/version}))])'}};
      if(simulation==='cancel-only')tool.arguments.source=tool.arguments.source.replace('text="确认"','text="取消"').replace('Event("submit",{app:$/app,env:$/env,version:$/version})','Event("cancel",{})');
      if(simulation==='unbound-confirm')tool.arguments.source=tool.arguments.source.replace('{app:$/app,env:$/env,version:$/version}','{}');
      if(simulation==='ambiguous-labels')for(const name of ['应用名','目标环境','版本号'])tool.arguments.source=tool.arguments.source.replace('label="'+name+'"','label="应用名 目标环境 版本号"');
      if(simulation==='hidden-selected')tool.arguments.source='$/x = ""\n$/y = ""\n$/z = ""\n'+tool.arguments.source.replace('root =','hidden =')+'\nroot = Column(children=[Details(title="Hidden form",child=hidden),Text(text="应用名 目标环境 版本号"),TextField(label="X",value=$/x),TextField(label="Y",value=$/y),TextField(label="Z",value=$/z),Button(child=Text(text="确认"),action=Event("cancel",{}))])';
     }
     if(policy.paired&&!policy.helperAdapter&&kind!=='capture'){
      const fixtures=JSON.parse(await readFile(join(ROOT,'tests/authoring-pilot/fixtures.json'),'utf8'));let source=fixtures[scenarioId];
      if(simulation==='compile'||simulation==='failed-check')source='root = BadComponent()';
      if(simulation==='semantic-check'||simulation==='numeric')source=source.replace('value=$/a','value=$/a,variant="number"');
      if(simulation==='password')source=source.replace('value=$/a','value=$/a,variant="obscured"');
      if(simulation==='hidden-selected')source=source.replace('root = Column','hidden = Column')+'\nroot = Details(title="Hidden",child=hidden)';
      if(!simulation||['workflow','failed-check','semantic-check','rewrite','repeat-check','reasoning','usage-missing','dom-number','hidden-selected','hang','numeric','password','compile'].includes(simulation)){
       tool=simulation==='workflow'||simulation==='failed-check'||simulation==='semantic-check'||simulation==='rewrite'||simulation==='repeat-check'?[
        {name:'read',arguments:{path:skill}},
        {name:'bash',arguments:{command:`node "${helper}" example validated-form`}},
        {name:'write',arguments:{path:draft,content:source}},
        {name:'bash',arguments:{command:`node "${helper}" check --surface-id pilot "${draft}"`}},
        simulation==='repeat-check'?{name:'bash',arguments:{command:`node "${helper}" check --surface-id pilot "${draft}"`}}:simulation==='rewrite'?{name:'write',arguments:{path:draft,content:source+'\n'}}:{name:'a2ui_render',arguments:{surfaceId:'pilot',source}}
       ][Math.min(turn-1,4)]:{name:'a2ui_render',arguments:{surfaceId:'pilot',source}};
      }
     }
     if(policy.paired&&simulation==='last-bundle')tool=turn<6?{name:'read',arguments:{path:skill}}:{name:'write',arguments:{path:draft,content:JSON.parse(await readFile(join(ROOT,'tests/authoring-pilot/fixtures.json'),'utf8'))[scenarioId]}};
     if(policy.paired&&simulation==='missing-done')tool={name:'a2ui_render',arguments:{surfaceId:'pilot',source:JSON.parse(await readFile(join(ROOT,'tests/authoring-pilot/fixtures.json'),'utf8'))[scenarioId]}};
     if(policy.paired&&simulation==='helper-timeout')tool={name:'bash',arguments:{command:`node "${helper}" catalog`}};
     if(policy.paired&&simulation==='input-limit')tool=[{name:'write',arguments:{path:draft,content:'root = Text(text="'+'A'.repeat(5000)+'UNIQUE_SENTINEL'+'B'.repeat(5000)+'")'}},{name:'edit',arguments:{path:draft,edits:[{oldText:'UNIQUE_SENTINEL',newText:'C'.repeat(30000)}]}},{name:'bash',arguments:{command:`node "${helper}" check --surface-id pilot "${draft}"`}}][Math.min(turn-1,2)];
     if(policy.paired&&simulation==='safe-usage')tool={name:'bash',arguments:{command:`node "${helper}" check`}};
     if(policy.paired&&simulation==='bad-surface')tool={name:'bash',arguments:{command:`node "${helper}" check --surface-id "bad id" "${draft}"`}};
     if(policy.paired&&simulation==='wrapped-caption')tool={name:'a2ui_render',arguments:{surfaceId:'pilot',source:JSON.parse(await readFile(join(ROOT,'tests/authoring-pilot/fixtures.json'),'utf8'))[scenarioId].replace('child=Text(text="提交信息")','child=Row(children=[Text(text="提交信息")])')}};
     if(policy.paired&&simulation==='missing-draft')tool={name:'bash',arguments:{command:`node "${helper}" check --surface-id pilot "${draft}"`}};
     if(policy.paired&&simulation==='unknown-tool')tool={name:'forbidden_execute',arguments:{}};
     if(policy.helperAdapter&&kind!=='capture'){
      const source=JSON.parse(await readFile(join(ROOT,'tests/helper-adapter/fixtures.json'),'utf8'))[scenarioId];
      const query=`node "${helper}" example validated-form`,check=`node "${helper}" check --surface-id pilot "${draft}"`;
      const wrap=(command:string)=>simulation==='direct'?command:`cd "${project}" && ${command}`;
      tool=[{name:'read',arguments:{path:skill}},{name:'bash',arguments:{command:wrap(query)}},{name:'write',arguments:{path:draft,content:source}},{name:'bash',arguments:{command:wrap(check)}},{name:'a2ui_render',arguments:{surfaceId:'pilot',source}}][Math.min(turn-1,4)];
      if(turn===2){
       if(simulation==='foreign-cwd')tool={name:'bash',arguments:{command:`cd "${workspace}" && ${query}`}};
       if(simulation==='extra-and')tool={name:'bash',arguments:{command:wrap(query)+` && node "${helper}" catalog`}};
       if(simulation==='redirect')tool={name:'bash',arguments:{command:wrap(query)+` > "${join(run,'forbidden-sentinel')}"`}};
       if(simulation==='substitution')tool={name:'bash',arguments:{command:wrap(query)+` $(touch "${join(run,'forbidden-sentinel')}")`}};
       if(simulation==='usage')tool={name:'bash',arguments:{command:wrap(`node "${helper}" check`)}};
       if(simulation==='missing-draft')tool={name:'bash',arguments:{command:wrap(check)}};
      }
      if(simulation==='prepare')tool={name:'read',arguments:{path:skill}};
     }
     const delta=tool?{role:'assistant',tool_calls:[{index:0,id:'call-'+turn,type:'function',function:{name:tool.name,arguments:JSON.stringify(tool.arguments)}}]}:{role:'assistant',content:text};
     if(policy.paired&&simulation==='last-bundle'&&turn===6)(delta as any).tool_calls=[tool,{name:'bash',arguments:{command:`node "${helper}" check --surface-id pilot "${draft}"`}},{name:'a2ui_render',arguments:{surfaceId:'pilot',source:tool.arguments.content}}].map((t:any,i:number)=>({index:i,id:'call-bundle-'+i,type:'function',function:{name:t.name,arguments:JSON.stringify(t.arguments)}}));
     if(policy.paired&&simulation==='tool-cap')(delta as any).tool_calls=Array.from({length:13},(_,i)=>({index:i,id:'call-many-'+i,type:'function',function:{name:'read',arguments:JSON.stringify({path:skill})}}));
     if(simulation==='reasoning')(delta as any).reasoning_content='PRIVATE_SMOKE_THOUGHT_DO_NOT_PERSIST';
     const common={id:'pilot-synthetic',object:'chat.completion.chunk',created:1,model:PROFILE.model.id};const usage=simulation==='usage-missing'?{}:{usage:{prompt_tokens:10,completion_tokens:2,total_tokens:12}};
     const chunks=[{...common,choices:[{index:0,delta,finish_reason:null}]},{...common,choices:[{index:0,delta:{},finish_reason:simulation==='truncated'?'length':tool?'tool_calls':'stop'}],...usage}];
     response=new Response(chunks.map(c=>'data: '+JSON.stringify(c)+'\n\n').join('')+(policy.paired&&simulation==='missing-done'?'':'data: [DONE]\n\n'),{headers:{'content-type':'text/event-stream'}});
     if(policy.paired&&simulation==='inflight-abort'){response=new Response(new ReadableStream({start(controller){setTimeout(()=>{error('episode',new Error('synthetic in-flight interruption'));stop('provider_unknown',true);controller.error(new Error('synthetic in-flight abort'));},100);}}),{headers:{'content-type':'text/event-stream'}});}
     if(simulation==='rate-limit')response=new Response('{"error":{"message":"synthetic rate limit"}}',{status:429});
     if(simulation==='read-then-stream-error'&&turn===2)response=new Response(new ReadableStream({pull(c){c.error(new Error('synthetic interruption headers: {Authorization: "Bearer synthetic-hidden"}; body: {reasoning_content:"private-canary"}'));}}));
    }else try{response=await realFetch(url,{...init,headers,body:JSON.stringify(body),redirect:'error',signal:AbortSignal.any([...(init?.signal?[init.signal]:[]),AbortSignal.timeout(30000)])});}catch(cause){recordError(diagnostic,'transport',cause,secrets);stop('provider_unknown',true);throw new Error('pilot provider transport outcome unknown');}
    record.providerStatus=response.status;if(!response.ok)stop('provider_error',policy.paired||policy.smoke||[401,403,429].includes(response.status),!policy.smoke&&!policy.paired);
    return observeResponse(response,diagnostic,secrets);
   }});
  };
  const settings=SettingsManager.inMemory({retry:{enabled:false,maxRetries:0,provider:{maxRetries:0,timeoutMs:30000}},compaction:{enabled:false},cacheWarming:'off',transport:'sse'});
  const factory=(pi:ExtensionAPI)=>{
   const host:ExtensionAPI={...pi,registerTool:(tool:any)=>{if(policy.paired&&tool.name==='a2ui_render')record.registeredRender={description:tool.description,promptSnippet:tool.promptSnippet};return pi.registerTool(!policy.paired&&tool.name==='a2ui_render'?{...tool,description:descriptionForArm(tool.description,arm)}:tool);},exec:async(command,args)=>{
    assert.ok(['open','xdg-open','rundll32'].includes(command));const url=new URL(args.at(-1)!);assert.equal(url.hostname,'127.0.0.1');origin=url.origin;secrets.push(url.href);const token=new URLSearchParams(url.hash.slice(1)).get('token');if(token)secrets.push(token);
    opener=(async()=>{browserServer=await chromium.launchServer({headless:true,handleSIGTERM:false,handleSIGINT:false,handleSIGHUP:false});const p=browserServer.process(),profileArg=p.spawnargs.find(a=>a.startsWith('--user-data-dir='));assert.ok(profileArg);await writeFile(join(run,id+'.resources.json'),JSON.stringify({workerPid:process.pid,browserPid:p.pid,profileArg,origin}),{mode:0o600});browser=await chromium.connect(browserServer.wsEndpoint());const context=await browser.newContext({viewport:{width:1280,height:900},locale:'en-US',timezoneId:'UTC',reducedMotion:'reduce'});record.actionPosts=0;context.on('request',r=>{if(r.url()===origin+'/api/actions'&&r.method()==='POST')record.actionPosts++;});await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());const response=await context.request.post(origin+'/api/connect',{headers:{origin},data:{token},timeout:5000});assert.equal(response.status(),200);page=await context.newPage();await page.goto(origin!,{timeout:5000});})();
    await opener;return{stdout:'',stderr:'',code:0,killed:false,truncated:false};
   }};
   actualFactory(host);
   pi.on('message_end',event=>{const message=event.message as any;if(message.role!=='assistant')return;if(policy.paired&&stopped&&!record.fatal&&message.stopReason==='aborted'&&!(message.content?.length)&&['stop','toolUse'].includes(record.requestDiagnostics.at(-1)?.sdkStopReason))return;record.transcript.push(assistantReceipt(message));const d=currentDiagnostic;if(d){d.sdkStopReason=message.stopReason;if(message.errorMessage)recordError(d,'sdk',message.errorMessage,secrets);}if(!stopped){observeAssistant(record,message);if(policy.paired){if((message.content??[]).some((c:any)=>c.type==='toolCall'&&!['read','bash','write','edit','a2ui_render'].includes(c.name)))stop('tool_policy',true);record.toolIntents=(record.toolIntents??0)+(message.content??[]).filter((c:any)=>c.type==='toolCall').length;if(record.toolIntents>12)stop('tool_limited');}if(message.stopReason==='length')stop('output_truncated',policy.smoke||policy.paired);if(message.stopReason==='error'||message.stopReason==='aborted')stop('provider_unknown',true);
    if(policy.smoke&&kind!=='capture'&&!stopped&&id==='SM02-B'){const calls=message.content?.filter((c:any)=>c.type==='toolCall')??[],text=message.content?.filter((c:any)=>c.type==='text').map((c:any)=>c.text).join('')??'';if(calls.length){record.stoppedByPolicy=true;stop('negative_tool',true);}else stop(text.trim()==='收到'?'negative_pass':'negative_text',text.trim()!=='收到');}
   }});
   pi.on('tool_call',event=>{
    try{
     assert.equal(stopped,false);assert.ok(++toolCount<=(policy.paired?12:6),'tool budget');assert.ok(!event.parentToolCallId,'nested tool');const args=event.input as any;
     if(event.toolName==='a2ui_render'){assert.equal(renderCount++,0,'one render');record.renderAttempted=true;record.surfaceId=args.surfaceId;if(policy.paired){renderedSource=args.source;record.renderSourceSHA256=hash(renderedSource!);record.renderedSource=renderedSource;submitCandidate(args.source,args.surfaceId,'render');}}
     else{record.preparation=true;if(event.toolName==='read'){ordinaryPath(args.path,[pack,project],project);if(policy.paired&&resolve(project,args.path)===skill)record.skillReadCall=event.toolCallId;}
      else if(event.toolName==='write'||event.toolName==='edit'){if(policy.paired&&checkAttempted){stop('candidate_rewrite_attempt');return{block:true,terminate:true,reason:'first candidate already submitted'};}assert.equal(checkAttempted,false);assert.equal(resolve(project,args.path),draft);if(policy.paired)record.preSubmissionWrites++;if(event.toolName==='write')assert.ok(Buffer.byteLength(args.content)<=32768);}
      else{assert.equal(event.toolName,'bash');const rawCommand=args.command,command=policy.helperAdapter?planHelperInvocation(rawCommand,{helper,draft,cwd:project}):helperCall(rawCommand,helper,draft,project);if(policy.helperAdapter){(record.helperAdmissions??=[]).push({toolCallId:event.toolCallId,version:(command as any).version,variant:(command as any).variant,cwd:project,argv:(command as any).argv,rawCommandSHA256:hash(rawCommand),commandSHA256:hash(command.command),status:'planned'});}args.command=command.command;args.timeout=policy.paired&&simulation==='helper-timeout'?0.001:10;if(policy.paired&&(policy.helperAdapter?(command as any).operation==='example':/\bexample\b/.test(command.command)))record.exampleReadCall=event.toolCallId;if(command.check){if(policy.paired&&checkAttempted){stop('check_limited');return{block:true,terminate:true,reason:'one preflight check only'};}assert.equal(checkAttempted,false);ordinaryPath(draft,[project],project);checkAttempted=true;checkCallId=event.toolCallId;if(policy.paired){checkedSource=readFileSync(draft,'utf8');record.checkedSourceSHA256=hash(checkedSource);record.checkedSource=checkedSource;record.workflow.checkBeforeCandidate=!record.firstCandidate.submitted;submitCandidate(checkedSource,command.surfaceId!,'check');}}}}
     record.tools.push({name:event.toolName,input:structuredClone(args)});
    }catch(cause){if(policy.helperAdapter){const planned=record.helperAdmissions?.find((p:any)=>p.toolCallId===event.toolCallId);if(planned)planned.status='blocked';if(cause instanceof HelperInvocationError)(record.helperRejections??=[]).push({toolCallId:event.toolCallId,kind:cause.kind,code:cause.code,rawCommandSHA256:hash(String((event.input as any).command))});}if(policy.paired&&(cause instanceof HelperInputError||cause instanceof HelperInvocationError&&cause.kind==='usage'||(cause as NodeJS.ErrnoException).code==='ENOENT')){stop('preparation_error');return{block:true,terminate:true,reason:'draft or helper input unavailable'};}stop('tool_policy',policy.paired);return{block:true,terminate:true,reason:'pilot sandbox rejected tool; episode stopped'};}
   });
   pi.on('tool_execution_end',event=>{if(event.toolName==='a2ui_render'&&!record.renderAttempted&&event.isError)stop('render_schema',policy.smoke);});
   pi.on('tool_result',async event=>{
    record.transcript.push({role:'tool',tool:event.toolName,isError:event.isError,content:event.content});
    if(policy.helperAdapter&&event.toolName==='bash'){const planned=record.helperAdmissions?.find((p:any)=>p.toolCallId===event.toolCallId);if(planned?.status==='planned'){planned.status=event.isError?'failed':'executed';planned.exitCode=(event.structuredContent as any)?.exit_code??null;}}
    if(policy.helperAdapter&&processWitness?.snapshot().auditErrors.length){record.harnessFailure=true;if(event.toolCallId===checkCallId)record.preflightPassed=!event.isError;stop('process_witness_error',true);return;}
    if(stopped)return;
    if(policy.paired&&!event.isError){if(event.toolCallId===record.skillReadCall)record.workflow.skillRead=true;if(event.toolCallId===record.exampleReadCall)record.workflow.exampleRead=true;}
    if(policy.paired&&event.toolName==='bash'&&event.isError&&!Number.isInteger((event.structuredContent as any)?.exit_code)){stop('helper_unknown',true);return;}
    if(event.toolCallId===checkCallId){if(policy.paired&&event.isError&&event.content.some(c=>c.type==='text'&&/\"code\"\s*:\s*\"(?:INPUT|USAGE)\"/.test(c.text))){record.firstCandidate={submitted:false,preparationDiagnostic:'INPUT/USAGE'};record.preflightPassed=false;stop('preparation_error');return;}record.preflightPassed=!event.isError;if(event.isError){stop('preflight_error',policy.smoke);return;}if(policy.paired&&!record.firstCandidate.grade.correct){stop('preflight_semantic');return;}}
    if(policy.paired&&event.isError&&event.toolName!=='a2ui_render'){stop('preparation_error');return;}
    if(policy.smoke&&event.isError){stop(event.toolName==='a2ui_render'?'render_compile':'tool_error',true);return;}
    if(event.toolName==='a2ui_render'){
     if(event.isError){stop('render_compile');return;}
     record.renderCommitted=true;record.snapshot=(event.details as any)?.a2uiSnapshot;
     try{await timeout(opener??Promise.reject(new Error('missing opener')),10000,'browser opener');assert.ok(page);const canvas=page.getByRole('region',{name:'Canvas '+record.surfaceId,exact:true});await canvas.waitFor({timeout:5000});record.domText=await canvas.innerText();record.browserVersion=browser!.version();assert.equal(record.actionPosts,0,'no action dispatch authorized');await page.screenshot({path:join(run,id+'.png')});record.domObserved=true;if(policy.smoke||policy.paired){const candidates=formCandidates(record.snapshot,record.surfaceId,policy.paired?row:undefined);if(policy.paired&&simulation==='dom-number')await canvas.evaluate(root=>{const search={walk(node:ParentNode):HTMLInputElement|undefined{for(const e of Array.from(node.querySelectorAll('*'))){if(e instanceof HTMLInputElement)return e;const found=e.shadowRoot&&search.walk(e.shadowRoot);if(found)return found;}return undefined;}};const input=search.walk(root);if(input)input.type='number';});record.contentBinding=await canvas.evaluate(domFormBinding,candidates);record.contentValid=record.contentBinding.matched;}if(simulation==='hang'){await writeFile(join(run,id+'.hang-ready'),'actual DOM observed\n');await new Promise(()=>{});}stop((policy.smoke||policy.paired)&&!record.contentValid?'ui_invalid':'render_committed',policy.smoke&&!record.contentValid);}catch(error){record.browserError=error instanceof Error?error.message.slice(0,4096):'browser error';record.harnessFailure=true;stop('browser_error',true);}
    }else if(policy.smoke&&record.requests>=policy.limit(id))stop(record.preparation?'preparation_limited':'budget_limited');
   });
  };
  const safety=`Sandbox file writes are limited to ${draft}; use write/edit to create this file. Reads are limited to the shipped package and this workspace. Shell permits only a direct Node invocation of the shipped helper's read-only queries/check, without shell operators or redirection. Do not execute other programs. Follow the user's task; no real business operation is authorized.`;
  const adapterSafety=policy.helperAdapter?` The exact redundant prefix cd \"${project}\" && before that single helper is also accepted. Other shell combinations remain forbidden.`:'';
  const loader=new DefaultResourceLoader({cwd:project,agentDir:agent,settingsManager:settings,noExtensions:true,noSkills:true,noThemes:true,noPromptTemplates:true,noContextFiles:true,additionalSkillPaths:[skill],extensionFactories:[factory],appendSystemPrompt:[safety+adapterSafety]});await loader.reload();assert.equal(loader.getSkills().skills.length,1);
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
  killTrackedDetachedChildren();if(processWitness)await clean('process witness',async()=>{record.processWitness=processWitness!.snapshot();processWitness!.restore();if(record.processWitness.auditErrors.length){record.harnessFailure=true;record.fatal=true;record.outcome='process_witness_error';}});globalThis.fetch=realFetch;process.removeListener('SIGTERM',interrupt);process.removeListener('SIGINT',interrupt);
  await clean('workspace',()=>rm(workspace,{recursive:true,force:true}));if(policy.paired){record.sourceMatch=sourceMatch(checkedSource,renderedSource);if(record.firstCandidate.submitted){record.workflow.skillRead=record.firstCandidate.workflowBefore.skillRead;record.workflow.exampleRead=record.firstCandidate.workflowBefore.exampleRead;}}record.toolAttempts=toolCount;record.toolCount=record.tools.length;record.offlineConfigGuard=(globalThis as any).pilotReadGuard;record.usage=record.requestDiagnostics.map((d:any)=>d.usage);record.usageKnown=record.usage.length===record.requests&&record.usage.every(completeUsage);if(record.cleanupErrors.length){record.harnessFailure=true;record.fatal=true;}
  if(simulation==='torn-journal'&&kind==='offline')appendFileSync(journal,'{"index":2');
  writeFileSync(join(run,id+'.'+kind+(simulation?'-'+simulation:'')+'.json'),redact(record,secrets)+'\n',{mode:0o600});
 }
 return record;
}
