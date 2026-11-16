// Persist observations, never SDK reasoning blocks/signatures. Do not mutate SDK history.
export function assistantReceipt(message:any):any{
 return{role:'assistant',stopReason:message.stopReason,content:(message.content??[]).flatMap((c:any)=>c.type==='text'?[{type:'text',text:c.text}]:c.type==='toolCall'?[{type:'toolCall',id:c.id,name:c.name,arguments:structuredClone(c.arguments)}]:[])};
}
const fieldLabels=[/应用(?:名|名称)?|app(?:lication)?(?:\s*name)?/i,/目标环境|环境|environment/i,/版本(?:号)?|version/i];
function paths(value:any,found=new Set<string>()):Set<string>{if(value&&typeof value==='object'){if(typeof value['@path']==='string')found.add(value['@path']);for(const item of Object.values(value))paths(item,found);}return found;}
export function formCandidates(snapshot:any,surfaceId:string,domText:string):{captions:string[];paths:string[]}{
 const surface=snapshot.surfaces.find((s:any)=>s.surfaceId===surfaceId)?.message.createSurface;if(!surface)return{captions:[],paths:[]};const nodes=surface.components,byId=new Map<string,any>(nodes.map((n:any)=>[n.id,n]));
 const string=(value:any):string=>{if(typeof value==='string')return value;const path=value?.['@path'];if(typeof path!=='string')return'';let current=surface.dataModel;for(const key of path.slice(1).split('/').map((k:string)=>k.replaceAll('~1','/').replaceAll('~0','~')))current=current?.[key];return typeof current==='string'?current:'';};
 const caption=(id:string):string=>{const n=byId.get(id);if(!n)return'';if(n.component==='Text')return string(n.text);return[n.child,...(Array.isArray(n.children)?n.children:[])].filter(v=>typeof v==='string').map(caption).join(' ').replace(/\s+/g,' ').trim();};
 const fields=nodes.filter((c:any)=>['TextField','ChoicePicker','SearchablePicker'].includes(c.component)&&typeof c.value?.['@path']==='string');const groups=fieldLabels.map(label=>label.test(domText)?fields.filter((f:any)=>label.test(string(f.label))):[]);
 for(const a of groups[0])for(const b of groups[1])for(const c of groups[2]){
  const selected=[a,b,c];const selectedPaths=selected.map(f=>f.value['@path']);if(new Set(selected.map(f=>f.id)).size!==3||new Set(selectedPaths).size!==3)continue;
  const captions=nodes.filter((n:any)=>n.component==='Button'&&n.action?.event&&selectedPaths.every(p=>paths(n.action.event.context).has(p))&&!/cancel|取消|dismiss|close|返回|关闭/i.test(n.action.event.name??'')).map((n:any)=>caption(n.child)).filter((text:string)=>/确认|提交|继续|下一步|保存|confirm|submit|continue|save/i.test(text)&&!/取消|cancel|返回|关闭/i.test(text));
  if(captions.length)return{captions,paths:selectedPaths};
 }
 return{captions:[],paths:[]};
}
