// Persist observations, never SDK reasoning blocks/signatures. Do not mutate SDK history.
export function assistantReceipt(message:any):any{
 return{role:'assistant',stopReason:message.stopReason,content:(message.content??[]).flatMap((c:any)=>c.type==='text'?[{type:'text',text:c.text}]:c.type==='toolCall'?[{type:'toolCall',id:c.id,name:c.name,arguments:structuredClone(c.arguments)}]:[])};
}
const fieldLabels=[/应用(?:名|名称)?|app(?:lication)?(?:\s*name)?/i,/目标环境|环境|environment/i,/版本(?:号)?|version/i];
function paths(value:any,found=new Set<string>()):Set<string>{if(value&&typeof value==='object'){if(typeof value['@path']==='string')found.add(value['@path']);for(const item of Object.values(value))paths(item,found);}return found;}
export interface FormCandidate{fields:Array<{id:string;path:string;kind:string}>;buttonId:string;caption:string}
export function formCandidates(snapshot:any,surfaceId:string):FormCandidate[]{
 const surface=snapshot.surfaces.find((s:any)=>s.surfaceId===surfaceId)?.message.createSurface;if(!surface)return[];const nodes=surface.components,byId=new Map<string,any>(nodes.map((n:any)=>[n.id,n]));
 const string=(value:any):string=>{if(typeof value==='string')return value;const path=value?.['@path'];if(typeof path!=='string')return'';let current=surface.dataModel;for(const key of path.slice(1).split('/').map((k:string)=>k.replaceAll('~1','/').replaceAll('~0','~')))current=current?.[key];return typeof current==='string'?current:'';};
 const caption=(id:string):string=>{const n=byId.get(id);if(!n)return'';if(n.component==='Text')return string(n.text);return[n.child,...(Array.isArray(n.children)?n.children:[])].filter(v=>typeof v==='string').map(caption).join(' ').replace(/\s+/g,' ').trim();};
 const fields=nodes.filter((c:any)=>['TextField','ChoicePicker','SearchablePicker'].includes(c.component)&&typeof c.value?.['@path']==='string'&&c.value['@path'].startsWith('/')).map((f:any)=>({...f,groups:fieldLabels.map((label,index)=>label.test(string(f.label))?index:-1).filter(index=>index>=0)})).filter((f:any)=>f.groups.length===1);
 const candidates:FormCandidate[]=[];
 for(const button of nodes.filter((n:any)=>n.component==='Button'&&n.action?.event&&!/cancel|取消|dismiss|close|返回|关闭/i.test(n.action.event.name??''))){
  const text=caption(button.child);if(!/确认|提交|继续|下一步|保存|confirm|submit|continue|save/i.test(text)||/取消|cancel|返回|关闭/i.test(text))continue;
  const context=paths(button.action.event.context),groups=fieldLabels.map((_,index)=>fields.filter((f:any)=>f.groups[0]===index&&context.has(f.value['@path'])));
  // A contextual field must name one category only; ambiguous alternatives do not prove a form.
  if(groups.some((group:any[])=>group.length!==1))continue;const selected=groups.map((group:any[])=>group[0]);if(new Set(selected.map(f=>f.value['@path'])).size!==3)continue;
  candidates.push({fields:selected.map(f=>({id:f.id,path:f.value['@path'],kind:f.component})),buttonId:button.id,caption:text});
 }
 return candidates;
}
// Serialized by Playwright: keep this function self-contained, with no module closures.
export function domFormBinding(root:HTMLElement,candidates:FormCandidate[]){
 const dom={
  elements(node:ParentNode):HTMLElement[]{return Array.from(node.querySelectorAll<HTMLElement>('*')).flatMap(element=>[element,...(element.shadowRoot?dom.elements(element.shadowRoot):[])]);},
  parent(element:HTMLElement):HTMLElement|null{return element.parentElement??(element.getRootNode() instanceof ShadowRoot?(element.getRootNode() as ShadowRoot).host as HTMLElement:null);},
  within(ancestor:HTMLElement,element:HTMLElement|null):boolean{for(let current=element;current;current=dom.parent(current))if(current===ancestor)return true;return false;},
  available(element:HTMLElement):boolean{
   if(!element.isConnected||!element.getClientRects().length||element.matches(':disabled')||element.getAttribute('aria-disabled')==='true'||(element as HTMLInputElement).readOnly)return false;
   if(dialogs.length&&!dialogs.some(dialog=>dom.within(dialog,element)))return false;
   for(let current:HTMLElement|null=element;current;current=dom.parent(current)){
    if(current instanceof HTMLDetailsElement&&!current.open){const summary=Array.from(current.children).find(child=>child.tagName==='SUMMARY') as HTMLElement|undefined;if(!summary||!dom.within(summary,element))return false;}
    const style=getComputedStyle(current);if(current.hidden||current.inert||style.visibility==='hidden'||style.display==='none'||style.opacity==='0')return false;
   }
   return true;
  },
  host(id:string){return all.find(element=>(element as HTMLElement&{context?:{componentModel?:{id:string}}}).context?.componentModel?.id===id);}
 };
 const all=dom.elements(root),dialogs=Array.from(root.ownerDocument.querySelectorAll<HTMLDialogElement>('dialog:modal'));
 const observations=candidates.map(candidate=>{
  const fields=candidate.fields.map(field=>{const owner=dom.host(field.id);const selector='input:not([type=hidden]),textarea,select,[role=combobox],[role=checkbox],[role=radio]'+(field.kind==='ChoicePicker'?',button':'');return{id:field.id,path:field.path,available:!!owner&&dom.elements(owner).some(element=>element.matches(selector)&&dom.available(element))};});
  const buttonHost=dom.host(candidate.buttonId);const buttonAvailable=!!buttonHost&&dom.elements(buttonHost).some(element=>element.matches('button')&&dom.available(element)&&element.textContent?.replace(/\s+/g,' ').trim()===candidate.caption);
  return{fields,buttonId:candidate.buttonId,buttonAvailable,matched:fields.length===3&&fields.every(field=>field.available)&&buttonAvailable};
 });
 return{candidates:observations,matched:observations.some(candidate=>candidate.matched)};
}
