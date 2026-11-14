import {validateSubmission,type ValidationIssue} from './interactions.js';
import type {Component} from './protocol.js';
import type {FormValidationElement,DisplayIssue} from './validation-element.js';
type Host=HTMLElement&{context?:{componentModel:{id:string;type?:string}}};
export function* elements(root:ParentNode):Generator<HTMLElement>{
 for(const element of root.querySelectorAll<HTMLElement>('*')){yield element;if(element.shadowRoot)yield*elements(element.shadowRoot);}
}
export function componentHost(root:ParentNode,id:string):HTMLElement|undefined{return [...elements(root)].find(element=>(element as Host).context?.componentModel.id===id);}
function parent(element:HTMLElement):HTMLElement|null{return element.parentElement??(element.getRootNode() instanceof ShadowRoot?(element.getRootNode() as ShadowRoot).host as HTMLElement:null);}
export function within(ancestor:HTMLElement,element:HTMLElement|null):boolean{for(let current=element;current;current=parent(current))if(current===ancestor)return true;return false;}
export function currentModal():HTMLDialogElement|null{
 let active=document.activeElement as HTMLElement|null;while(active?.shadowRoot?.activeElement)active=active.shadowRoot.activeElement as HTMLElement;
 const dialogs=[...document.querySelectorAll<HTMLDialogElement>('dialog:modal')];
 return dialogs.find(dialog=>within(dialog,active))??(dialogs.length===1?dialogs[0]:null);
}
export function availableControl(element:HTMLElement,modal=currentModal()):boolean{
 if(!element.isConnected||!element.getClientRects().length||element.matches(':disabled')||element.getAttribute('aria-disabled')==='true')return false;
 if(document.querySelector('dialog:modal')&&(!modal||!within(modal,element)))return false;
 for(let current:HTMLElement|null=element;current;current=parent(current)){const style=getComputedStyle(current);if(current.hidden||current.inert||style.visibility==='hidden'||style.display==='none'||style.opacity==='0')return false;}
 return true;
}
export function nativeControls(host:HTMLElement):HTMLElement[]{return [...elements(host)].filter(element=>element.matches('input,textarea,select,button,[tabindex]'));}
interface Notice{element:HTMLElement;show:(message:string,error?:boolean)=>void}
export class BrowserValidation{
 private owner=crypto.randomUUID();private disposed=false;private generation=0;private lastButton?:string;private scheduled=false;
 private spans:HTMLElement[]=[];private attributes:Array<{control:HTMLElement;invalid:string|null;described:string|null}>=[];private dialogNotice?:HTMLElement;
 constructor(private wrapper:HTMLElement,private components:Component[],private resolve:(path:string)=>unknown,private isCurrent:()=>boolean,private notice:Notice){
  for(const name of ['input','change','a2ui-input-change'])wrapper.addEventListener(name,this.edited);
  wrapper.addEventListener('close',this.closed,true);
 }
 private closed=()=>{this.lastButton=undefined;this.clear();};
 private edited=()=>{if(this.scheduled||!this.lastButton)return;this.scheduled=true;queueMicrotask(()=>{this.scheduled=false;if(this.disposed||!this.isCurrent()||!this.lastButton)return;const button=this.components.find(c=>c.id===this.lastButton);const declared=(button?.action as {event:{context?:Record<string,unknown>}}).event.context??{};const context:Record<string,unknown>={};try{for(const [key,value]of Object.entries(declared))context[key]=value&&typeof value==='object'&&'@path'in value?this.resolve(String(value['@path'])):value;this.present(validateSubmission(this.components,this.lastButton,context),false);}catch{this.notice.show('This form could not be validated. Reopen /a2ui to reconnect.',true);}});};
 check(sourceId:string,context:Record<string,unknown>):boolean{
  if(!this.components.some(c=>c.component==='FormValidation'&&(c.buttons as string[]).includes(sourceId)))return true;
  this.lastButton=sourceId;const issues=validateSubmission(this.components,sourceId,context);this.present(issues,true);return issues.length===0;
 }
 private clear(){
  this.generation++;for(const span of this.spans)span.remove();this.spans=[];this.dialogNotice?.remove();this.dialogNotice=undefined;
  for(const {control,invalid,described}of this.attributes){if(invalid===null)control.removeAttribute('aria-invalid');else control.setAttribute('aria-invalid',invalid);if(described===null)control.removeAttribute('aria-describedby');else control.setAttribute('aria-describedby',described);}this.attributes=[];
  const config=this.components.find(c=>c.component==='FormValidation');if(config)(componentHost(this.wrapper,config.id) as FormValidationElement|undefined)?.setIssues([]);
  if(this.notice.element.dataset.validationOwner===this.owner)this.notice.show('');
 }
 private present(issues:ValidationIssue[],focus:boolean){
  this.clear();if(!issues.length)return;const generation=this.generation;const modal=currentModal();
  const display:DisplayIssue[]=issues.map(issue=>{const field=this.components.find(c=>c.id===issue.fieldId)!;return {...issue,label:typeof field.label==='string'&&field.label?field.label:field.id};});
  const config=this.components.find(c=>c.component==='FormValidation')!;const summary=componentHost(this.wrapper,config.id) as FormValidationElement|undefined;summary?.setIssues(display);
  for(const issue of display){const host=componentHost(this.wrapper,issue.fieldId);if(!host)continue;const controls=nativeControls(host);const span=document.createElement('span');span.id='field-error-'+crypto.randomUUID();span.className='a2ui-field-error';span.textContent=issue.message;const root=controls[0]?.getRootNode();if(root instanceof ShadowRoot)root.append(span);else host.append(span);this.spans.push(span);
   for(const control of controls){this.attributes.push({control,invalid:control.getAttribute('aria-invalid'),described:control.getAttribute('aria-describedby')});control.setAttribute('aria-invalid','true');control.setAttribute('aria-describedby',[control.getAttribute('aria-describedby'),span.id].filter(Boolean).join(' '));}
  }
  this.notice.show('Check these fields: '+display.map(issue=>issue.label+': '+issue.message).join('; '),true);this.notice.element.dataset.validationOwner=this.owner;
  void Promise.resolve(summary?.updateComplete).then(()=>{
   if(this.disposed||generation!==this.generation||!this.isCurrent()||currentModal()!==modal)return;
   const control=display.flatMap(issue=>{const host=componentHost(this.wrapper,issue.fieldId);return host?nativeControls(host):[];}).find(control=>availableControl(control,modal));
   const section=summary?.querySelector<HTMLElement>('section');let target=control??(section&&availableControl(section,modal)?section:undefined);
   if(!target){
    if(modal){const local=document.createElement('div');local.className='a2ui-validation-notice';local.tabIndex=0;local.setAttribute('role','alert');local.textContent=display.map(issue=>issue.label+': '+issue.message).join('; ');modal.append(local);this.dialogNotice=local;target=local;}
    else if(!document.querySelector('dialog:modal')){this.notice.element.tabIndex=-1;target=this.notice.element;}
   }
   if(focus&&target&&availableControl(target,modal))target.focus();
  }).catch(()=>{/* A disposed renderer must not move focus or send an action. */});
 }
 dispose(){if(this.disposed)return;this.disposed=true;this.lastButton=undefined;for(const name of ['input','change','a2ui-input-change'])this.wrapper.removeEventListener(name,this.edited);this.wrapper.removeEventListener('close',this.closed,true);this.clear();}
}
