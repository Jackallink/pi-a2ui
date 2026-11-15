import assert from 'node:assert/strict';
import {lstatSync,realpathSync,statSync} from 'node:fs';
import {resolve,relative,sep} from 'node:path';
import profile from './profile.json' with {type:'json'};
export const MODEL=Object.freeze(profile.model);
export const CAPS=Object.freeze(profile.caps);
export const PROFILE=profile.profile;
export class RequestBudget {
 attempts=0;blocked=0;stopped=false;
 constructor(readonly limit=CAPS.requests){}
 admit(url:string,model:{provider:string;id:string;baseUrl:string}):void {
  try{assert.deepEqual({provider:model.provider,id:model.id,baseUrl:model.baseUrl},MODEL,'model identity');assert.equal(url,MODEL.baseUrl+'/chat/completions','endpoint identity');
   assert.equal(this.stopped,false,'post-stop provider request');assert.ok(this.attempts<this.limit,'request budget exceeded');this.attempts++;
  }catch(error){this.blocked++;throw error;}
 }
}
export function configValue(value:unknown,env:NodeJS.ProcessEnv):string {
 assert.equal(typeof value,'string','config must be string');const text=value as string;
 assert.ok(!text.trimStart().startsWith('!'),'command config forbidden');
 const resolved=text.replace(/\$\$|\$!|\$\{([A-Za-z_][A-Za-z0-9_]*)\}|\$([A-Za-z_][A-Za-z0-9_]*)/g,(token,a,b)=>{
  if(token==='$$')return '$';if(token==='$!')return '!';const name=a||b;assert.ok(env[name],'missing configured environment value');return env[name]!;
 });
 assert.ok(resolved&&!/[\r\n]/.test(resolved),'empty/newline config forbidden');return resolved;
}
function rejectCommands(value:unknown):void {
 if(typeof value==='string')assert.ok(!value.trimStart().startsWith('!'),'command config forbidden');
 else if(Array.isArray(value))for(const item of value)rejectCommands(item);
 else if(value&&typeof value==='object')for(const item of Object.values(value))rejectCommands(item);
}
export function selectedConfig(models:unknown,auth:unknown,env:NodeJS.ProcessEnv):{key:string;headers:Record<string,string>;model:Record<string,unknown>} {
 const config=models as {providers?:Record<string,any>};const provider=config.providers?.[MODEL.provider];assert.ok(provider,'selected provider missing');
 const credential=(auth as Record<string,any>)[MODEL.provider];rejectCommands(provider);rejectCommands(credential);
 assert.equal(provider.baseUrl,MODEL.baseUrl,'AgentPlan endpoint required');assert.equal(provider.api,'openai-completions','API required');
 const model=provider.models?.find((item:any)=>item.id===MODEL.id);assert.ok(model,'selected model missing');
 assert.ok(!model.baseUrl||model.baseUrl===MODEL.baseUrl,'model endpoint override forbidden');assert.ok(!model.api||model.api==='openai-completions','model API override forbidden');
 if(credential)assert.equal(credential.type,'api_key','only API key credentials');
 assert.ok(!credential?.env,'credential environment override forbidden');
 const key=configValue(credential?.key??provider.apiKey,env);const headers:Record<string,string>={};
 for(const [name,value]of Object.entries({...provider.headers,...model.headers})){
  assert.match(name,/^[A-Za-z0-9-]+$/,'header name');assert.ok(!/^(authorization|host|content-length|content-type|connection|proxy-authorization)$/i.test(name),'reserved header forbidden');headers[name]=configValue(value,env);
 }
 return{key,headers,model:{id:MODEL.id,name:MODEL.id,reasoning:false,input:['text'],contextWindow:Math.min(Number(model.contextWindow)||65536,128000),maxTokens:4096}};
}
export function literalCredentials(key:string){
 return{async read(provider:string){assert.equal(provider,MODEL.provider);return{type:'api_key' as const,key};},async list(){return[{providerId:MODEL.provider,type:'api_key' as const}];},async modify(){throw new Error('readonly credential adapter');},async delete(){throw new Error('readonly credential adapter');}};
}
export function ordinaryPath(path:string,roots:string[],cwd:string):string {
 const full=resolve(cwd,path);const root=roots.find(root=>full===root||full.startsWith(root+sep));assert.ok(root,'path outside allowed roots');
 for(const part of relative(root!,full).split(sep).filter(Boolean))assert.ok(part!=='.'&&part!=='..');
 let current=root!;assert.equal(lstatSync(current).isSymbolicLink(),false,'root symlink');
 for(const part of relative(root!,full).split(sep).filter(Boolean)){current=resolve(current,part);assert.equal(lstatSync(current).isSymbolicLink(),false,'symlink forbidden');}
 assert.equal(realpathSync(full),full,'realpath escape');assert.ok(statSync(full).isFile(),'ordinary file required');assert.ok(statSync(full).size<=128*1024,'read byte limit');assert.ok(!full.endsWith('.png'),'image read outside text profile');return full;
}
export const quote=(value:string)=>"'"+value.replaceAll("'","'\\''")+"'";
export function helperCommand(command:string,helper:string,draft:string,cwd:string,names:{components:string[];examples:string[];patterns:string[]}):{command:string;check:boolean}{
 assert.ok(!/[\r\n$`;&|<>\\]/.test(command),'unsafe shell syntax');
 assert.equal(command.replace(/"[^"\r\n]*"|'[^'\r\n]*'|[^\s"']+/g,'').trim(),'','unbalanced shell quoting');
 const tokens=command.match(/"[^"\r\n]*"|'[^'\r\n]*'|[^\s"']+/g)?.map(token=>/^['"]/.test(token)?token.slice(1,-1):token)??[];
 assert.ok(tokens.length>=3&&tokens.length<=6,'helper argument count');assert.ok(tokens[0]==='node'||tokens[0]===process.execPath,'Node24 helper only');assert.equal(resolve(cwd,tokens[1]),helper,'bundled helper only');
 const [operation,name,...extra]=tokens.slice(2);let check=false;
 if(['catalog','patterns','examples'].includes(operation))assert.equal(tokens.length,3);
 else if(['component','example','pattern'].includes(operation)){
  assert.equal(tokens.length,4);assert.ok((operation==='component'?names.components:operation==='example'?names.examples:names.patterns).includes(name),'unknown helper query');
 }else{assert.equal(operation,'check');assert.deepEqual(extra,['bm4',tokens[5]]);assert.equal(name,'--surface-id');assert.equal(tokens.length,6);assert.equal(resolve(cwd,tokens[5]),draft);check=true;}
 return{command:[process.execPath,helper,...tokens.slice(2)].map(quote).join(' '),check};
}
export function redact(value:unknown,secrets:string[]=[]):string {
 const scrub=(input:string)=>{
  let text=input;for(const secret of secrets.filter(Boolean).sort((a,b)=>b.length-a.length))text=text.replaceAll(secret,'[REDACTED]');
  return text.replace(/Bearer\s+[^\s"\\]+/gi,'Bearer [REDACTED]').replace(/((?:token|access_token|authorization)[=:]\s*)[^\s&"\\]+/gi,'$1[REDACTED]');
 };
 return typeof value==='string'?scrub(value):JSON.stringify(value,(_key,item)=>typeof item==='string'?scrub(item):item,2);
}
