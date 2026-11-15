import assert from 'node:assert/strict';
import {execFile}from'node:child_process';
import {promisify}from'node:util';
import {lstatSync,readFileSync,readdirSync,realpathSync}from'node:fs';
import{mkdir,writeFile}from'node:fs/promises';
import{resolve}from'node:path';
import{release}from'node:os';
import{z}from'zod';
import type{Browser,Page}from'@playwright/test';
import{canonical,sha256}from'../golden/registry.ts';
import type{LayoutObservation}from'./layout.ts';
const exec=promisify(execFile);
export const PROFILE='v0.1.8-layout-v1';
export const STATE_IDS=['search','audit','return']as const;
export type StateId=typeof STATE_IDS[number];
export const RUN_DIR=`.local/bm3-layout/run-${Date.now()}-${process.pid}`;
export const CAPTURE_ONLY=process.env.BM3_CAPTURE_ONLY==='1';
export interface FontUsage{familyName:string;postScriptName:string;isCustomFont:boolean;glyphCount:number}
const environmentSchema=z.object({
 node:z.string().regex(/^v24\.\d+\.\d+$/),nodeMajor:z.literal(24),platform:z.string().min(1).max(32),arch:z.string().min(1).max(32),osRelease:z.string().min(1).max(128),browser:z.literal('158.0.8127.18'),playwright:z.literal('1.65.0'),revision:z.literal('1254'),
 viewport:z.object({width:z.literal(1280),height:z.literal(900)}).strict(),dpr:z.literal(1),theme:z.literal('light'),locale:z.literal('en-US'),timezone:z.literal('UTC'),reducedMotion:z.literal(true),fontStack:z.string().min(1).max(1024),
 fonts:z.array(z.object({selector:z.string(),fonts:z.array(z.object({familyName:z.string().min(1).max(256),postScriptName:z.string().min(1).max(256),isCustomFont:z.boolean(),glyphCount:z.number().int().positive()}).strict()).min(1).max(16)}).strict()).length(3),
}).strict();
export type Environment=z.infer<typeof environmentSchema>;

export interface StateEvidence{id:StateId;revision:number;epoch:string;layout:LayoutObservation;image:string;pngHash:string;environment:Environment;environmentHash:string}
export interface Identity{profile:string;source:string;dirty:boolean;lockHash:string;fixtureSetHash:string;assetHash:string;oracleSetHash:string}
export interface Baseline{schemaVersion:1;profile:typeof PROFILE;inspected:true;captureIdentity:Identity;environment:Environment;environmentHash:string;images:Array<{id:StateId;path:string;sha256:string}>}
async function bounded<T>(promise:Promise<T>,label:string):Promise<T>{let timer:ReturnType<typeof setTimeout>|undefined;try{return await Promise.race([promise,new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('BM3 setup: '+label+' exceeded5s')),5000);})]);}finally{clearTimeout(timer);}}
export function ordinaryBytes(path:string,root=process.cwd()):Buffer{
 assert.ok(!path.startsWith('/')&&!path.split('/').some(part=>!part||part==='.'||part==='..'),'contained relative evidence path');
 const base=realpathSync(root);let current=base;
 for(const part of path.split('/')){current=resolve(current,part);assert.equal(lstatSync(current).isSymbolicLink(),false,'evidence symlink forbidden');}
 assert.ok(lstatSync(current).isFile());assert.ok(lstatSync(current).size<=2*1024*1024,'evidence byte cap');return readFileSync(current);
}
function filesHash(paths:string[]):string{return sha256(canonical(Object.fromEntries(paths.sort().map(path=>[path,sha256(ordinaryBytes(path))]))));}
export async function currentIdentity():Promise<Identity>{
 assert.equal(process.versions.node.split('.')[0],'24');
 const fixtures=readdirSync('tests/visual/fixtures').sort();assert.deepEqual(fixtures,['audit.express','modal.express','search.express']);
 const oracles=readdirSync('tests/visual').filter(name=>name.endsWith('.ts')).map(name=>'tests/visual/'+name);
 if(readdirSync('tests').includes('visual.test.ts'))oracles.push('tests/visual.test.ts');
 oracles.push('tests/golden/cleanup.ts','tests/golden/registry.ts','tests/golden/oracles.ts','tests/golden/run-browser.mjs');
 return{profile:PROFILE,source:(await exec('git',['rev-parse','HEAD'],{timeout:5000})).stdout.trim(),dirty:!!(await exec('git',['status','--porcelain','--untracked-files=normal'],{timeout:5000})).stdout.trim(),lockHash:sha256(readFileSync('package-lock.json')),fixtureSetHash:filesHash(fixtures.map(name=>'tests/visual/fixtures/'+name)),assetHash:filesHash(['dist/client.js','dist/client.css','dist/index.html']),oracleSetHash:filesHash(oracles)};
}
export function environmentHash(environment:Environment):string{
 // Runtime patch is recorded; pixel comparability is constrained by actual OS/browser/font/capture profile.
 const{node,...pixel}=environment;
 const fonts=pixel.fonts.map(item=>({selector:item.selector,fonts:item.fonts.map(({glyphCount,...font})=>font)}));
 return sha256(canonical({...pixel,fonts}));
}
export async function environment(page:Page,browser:Browser):Promise<Environment>{
 await bounded(page.evaluate(()=>document.fonts.ready.then(()=>{})),'fonts.ready');
 const cdp=await page.context().newCDPSession(page);const fonts:Environment['fonts']=[];
 try{
  await bounded(cdp.send('DOM.enable'),'DOM.enable');await bounded(cdp.send('CSS.enable'),'CSS.enable');
  const document=await bounded(cdp.send('DOM.getDocument',{depth:0}),'font document');
  for(const selector of ['h1','.brand','button']){
   const{nodeId}=await bounded(cdp.send('DOM.querySelector',{nodeId:document.root.nodeId,selector}),'font subject');assert.ok(nodeId,'font subject exists');
   const result=await bounded(cdp.send('CSS.getPlatformFontsForNode',{nodeId}),'actual platform fonts');assert.ok(result.fonts.length,'actual rendered font required');
   fonts.push({selector,fonts:result.fonts.sort((a:FontUsage,b:FontUsage)=>a.postScriptName.localeCompare(b.postScriptName))});
  }
 }finally{await bounded(cdp.detach(),'CDP cleanup');}
 const observed=await page.evaluate(()=>({dpr:devicePixelRatio,theme:matchMedia('(prefers-color-scheme: light)').matches?'light':'dark',locale:navigator.language,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,fontStack:getComputedStyle(document.body).fontFamily}));
 const locked=JSON.parse(readFileSync('node_modules/playwright-core/browsers.json','utf8')).browsers.find((item:{name:string})=>item.name==='chromium-headless-shell');
 const env=environmentSchema.parse({node:process.version,nodeMajor:24,platform:process.platform,arch:process.arch,osRelease:release(),browser:browser.version(),playwright:JSON.parse(readFileSync('node_modules/playwright/package.json','utf8')).version,revision:locked.revision,viewport:page.viewportSize()!,...observed,fonts});
 assert.equal(process.versions.node.split('.')[0],'24');assert.equal(env.browser,locked.browserVersion);assert.deepEqual(env.viewport,{width:1280,height:900});assert.equal(env.dpr,1);assert.equal(env.theme,'light');assert.equal(env.locale,'en-US');assert.equal(env.timezone,'UTC');assert.equal(env.reducedMotion,true);return env;
}
export function validateBaseline(value:unknown,root=process.cwd()):Baseline{
 const baseline=value as Baseline;assert.ok(baseline&&typeof baseline==='object');
 assert.equal(baseline.schemaVersion,1);assert.equal(baseline.profile,PROFILE);assert.equal(baseline.inspected,true,'baseline must be manually inspected');
 assert.match(baseline.captureIdentity.source,/^[a-f0-9]{40}$/);assert.equal(baseline.captureIdentity.profile,PROFILE);assert.equal(baseline.captureIdentity.dirty,false);
 for(const key of ['lockHash','fixtureSetHash','assetHash','oracleSetHash']as const)assert.match(baseline.captureIdentity[key],/^[a-f0-9]{64}$/);
 environmentSchema.parse(baseline.environment);assert.deepEqual(baseline.environment.fonts.map(item=>item.selector),['h1','.brand','button']);
 assert.equal(baseline.environment.platform,'darwin');assert.equal(baseline.environment.arch,'arm64');assert.equal(baseline.environment.revision,'1254');assert.equal(baseline.environment.nodeMajor,24);
 assert.equal(baseline.environmentHash,environmentHash(baseline.environment));assert.deepEqual(baseline.images.map(image=>image.id).sort(),[...STATE_IDS].sort());
 for(const image of baseline.images){
  assert.equal(image.path,`tests/visual/baselines/darwin-arm64/chromium-1254/${image.id}.png`);assert.match(image.sha256,/^[a-f0-9]{64}$/);
  const bytes=ordinaryBytes(image.path,root);assert.equal(sha256(bytes),image.sha256,'baseline PNG hash');assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10]);assert.equal(bytes.readUInt32BE(16),1280);assert.equal(bytes.readUInt32BE(20),900);
 }
 return baseline;
}
export function compareBaseline(baseline:Baseline,states:StateEvidence[],identity:Identity){
 const comparable=baseline.environmentHash===states[0].environmentHash&&baseline.captureIdentity.fixtureSetHash===identity.fixtureSetHash&&baseline.captureIdentity.assetHash===identity.assetHash&&baseline.captureIdentity.oracleSetHash===identity.oracleSetHash;
 return{status:comparable?'comparable-advisory':states[0].environment.platform==='darwin'?'not-comparable':'not-defined-for-environment',pixelGate:false,images:states.map(state=>({id:state.id,changed:comparable?state.pngHash!==baseline.images.find(image=>image.id===state.id)!.sha256:null}))};
}
export async function capture(page:Page,browser:Browser,id:StateId,revision:number,epoch:string,layout:LayoutObservation):Promise<StateEvidence>{
 await mkdir(RUN_DIR,{recursive:true,mode:0o700});const env=await environment(page,browser);const image=RUN_DIR+'/'+id+'.png';
 const bytes=await page.screenshot({path:image,animations:'disabled',caret:'hide',fullPage:false,timeout:5000});return{id,revision,epoch,layout,image,pngHash:sha256(bytes),environment:env,environmentHash:environmentHash(env)};
}
export async function writeEvidence(states:StateEvidence[],checks:Record<string,boolean>,cleanupFailures:unknown[],actions:unknown[]):Promise<void>{
 await mkdir(RUN_DIR,{recursive:true,mode:0o700});const identity=await currentIdentity();let baseline:unknown,baselineError:string|undefined;
 assert.deepEqual(Object.keys(checks).sort(),['flow','faultCanary','modalControl','missingSubject'].sort(),'exact visual checks');
 const complete=states.length===3&&states.every((state,index)=>state.id===STATE_IDS[index]&&state.revision===index+1&&state.epoch===states[0].epoch&&state.environmentHash===states[0].environmentHash)&&Object.values(checks).every(Boolean)&&Object.keys(checks).length===4&&!cleanupFailures.length;
 if(!CAPTURE_ONLY)try{const declared=validateBaseline(JSON.parse(ordinaryBytes('tests/visual/baseline-manifest.json').toString('utf8')));baseline=compareBaseline(declared,states,identity);}catch(error){baselineError=String(error);baseline={status:'invalid-declared-baseline',pixelGate:false,error:baselineError};}
 const report={identity,mode:CAPTURE_ONLY?'capture-only':'normal',accepted:complete&&!identity.dirty&&!CAPTURE_ONLY&&!baselineError,states,checks,cleanupFailures,actions,baseline:CAPTURE_ONLY?{status:'pending-inspection',pixelGate:false}:baseline};
 await writeFile(RUN_DIR+'/report.json',JSON.stringify(report,null,2)+'\n',{mode:0o600});
 if(CAPTURE_ONLY&&complete&&!identity.dirty){const proposal={schemaVersion:1,profile:PROFILE,inspected:false,captureIdentity:identity,environment:states[0].environment,environmentHash:states[0].environmentHash,images:states.map(state=>({id:state.id,path:`tests/visual/baselines/darwin-arm64/chromium-1254/${state.id}.png`,sha256:state.pngHash}))};await writeFile(RUN_DIR+'/baseline-proposal.json',JSON.stringify(proposal,null,2)+'\n',{mode:0o600});}
 console.log('BM3 evidence '+JSON.stringify({source:identity.source,mode:report.mode,accepted:report.accepted,states:states.length,checks,baseline:report.baseline,run:RUN_DIR}));
 assert.ok(complete,'BM3 all states/controls/canaries/cleanup must complete');if(!CAPTURE_ONLY)assert.equal(report.accepted,true,'BM3 normal acceptance requires clean source and declared valid baseline');
}
