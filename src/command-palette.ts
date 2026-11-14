import {availableControl,componentHost,nativeControls} from './browser-interactions.js';
export const COMMAND_PALETTE_CAPABILITY='command-palette';
export interface PaletteSource{surfaceId:string;revision:number;sourceId:string;root:HTMLElement}
interface PaletteState{epoch?:string;revisionKey:string;available:boolean;sources:PaletteSource[]}
interface Target{surfaceId:string;revision:number;sourceId:string;label:string}
export class CommandPalette{
 private opener=document.createElement('button');private dialog=document.createElement('dialog');private query=document.createElement('input');private list=document.createElement('ul');private empty=document.createElement('p');private closeButton=document.createElement('button');
 private targets:Target[]=[];private visible:Target[]=[];private selected=0;private previous?:HTMLElement;private epoch?:string;private revisionKey='';
 constructor(bar:HTMLElement,private state:()=>PaletteState,private notify:(message:string,error?:boolean)=>void){
  this.opener.type='button';this.opener.textContent='Find actions';this.opener.title='Find actions (Ctrl/Cmd+K)';this.opener.addEventListener('click',()=>this.open());this.opener.addEventListener('keydown',e=>{if(e.repeat&&(e.key==='Enter'||e.key===' '))e.preventDefault();});bar.append(this.opener);
  this.dialog.className='command-palette';this.dialog.setAttribute('aria-label','Find actions');this.closeButton.type='button';this.closeButton.textContent='Close actions';this.closeButton.addEventListener('click',()=>this.close());
  const heading=document.createElement('h2');heading.textContent='Find actions';const label=document.createElement('label');label.textContent='Search actions';this.query.type='search';this.query.setAttribute('aria-label','Search actions');label.append(this.query);this.query.addEventListener('input',()=>{this.query.value=Array.from(this.query.value).slice(0,128).join('');this.render();});
  this.list.setAttribute('aria-label','Available canvas actions');this.empty.setAttribute('role','status');this.dialog.append(this.closeButton,heading,label,this.list,this.empty);document.body.append(this.dialog);
  this.dialog.addEventListener('keydown',e=>this.keys(e));this.dialog.addEventListener('cancel',e=>{e.preventDefault();this.close();});this.dialog.addEventListener('close',()=>{if(this.previous)this.close();});
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'&&!e.repeat){if(this.dialog.open){e.preventDefault();this.close();}else if(!document.querySelector('dialog:modal')&&this.state().available){e.preventDefault();this.open();}}});this.refresh();
 }
 private control(source:PaletteSource):HTMLButtonElement|undefined{const host=componentHost(source.root,source.sourceId);return host?nativeControls(host).find((element):element is HTMLButtonElement=>element instanceof HTMLButtonElement&&availableControl(element)):undefined;}
 open(){const state=this.state();if(this.dialog.open||!state.available||!state.epoch||document.querySelector('dialog:modal'))return;
  this.targets=state.sources.slice(0,64).flatMap(source=>{const control=this.control(source);return control?[{surfaceId:source.surfaceId,revision:source.revision,sourceId:source.sourceId,label:Array.from(control.textContent?.trim().replace(/\s+/g,' ')||'Unnamed action').slice(0,128).join('')}]:[];});
  this.epoch=state.epoch;this.revisionKey=state.revisionKey;this.previous=document.activeElement as HTMLElement;this.query.value='';this.render();this.dialog.showModal();this.query.focus();
 }
 close(){if(!this.dialog.open&&!this.previous)return;const previous=this.previous;this.previous=undefined;if(this.dialog.open)this.dialog.close();this.targets=[];this.visible=[];this.list.replaceChildren();this.query.value='';this.epoch=undefined;if(previous&&availableControl(previous))previous.focus();else if(availableControl(this.opener))this.opener.focus();}
 refresh(){const state=this.state();this.opener.disabled=!state.available||!state.epoch;if(this.dialog.open&&(state.epoch!==this.epoch||state.revisionKey!==this.revisionKey||!state.available)){this.close();if(state.available)this.notify('Actions changed. Open Find actions again.');}}
 private render(){const query=this.query.value.toLowerCase();this.visible=this.targets.filter(target=>target.label.toLowerCase().includes(query));this.selected=0;this.list.replaceChildren();const labels=new Map<string,number>();for(const target of this.targets)labels.set(target.label,(labels.get(target.label)??0)+1);
  for(const [index,target]of this.visible.entries()){const item=document.createElement('li');const button=document.createElement('button');button.type='button';button.textContent=(labels.get(target.label)??0)>1?target.label+' · '+target.surfaceId+' · '+target.sourceId:target.label;button.tabIndex=index===0?0:-1;button.dataset.current=String(index===0);button.addEventListener('click',()=>this.choose(index));item.append(button);this.list.append(item);}
  this.empty.hidden=!!this.visible.length;this.empty.textContent=this.targets.length?'No matching actions':'No available actions';
 }
 private choose(index:number){if(!this.dialog.open)return;const target=this.visible[index];if(!target)return;const epoch=this.epoch;const revisionKey=this.revisionKey;this.close();const state=this.state();
  const source=state.sources.find(source=>source.surfaceId===target.surfaceId&&source.revision===target.revision&&source.sourceId===target.sourceId);const control=source?this.control(source):undefined;
  if(!state.available||state.epoch!==epoch||state.revisionKey!==revisionKey||!control){this.notify('That action is no longer available. Open Find actions again.',true);return;}
  control.click();
 }
 private keys(event:KeyboardEvent){
  if(event.key==='Escape'){event.preventDefault();this.close();return;}
  const buttons=[...this.list.querySelectorAll('button')];const at=buttons.indexOf(document.activeElement as HTMLButtonElement);
  if(event.key==='Tab'){const items=[...this.dialog.querySelectorAll<HTMLElement>('button,input,[tabindex]')].filter(item=>item.tabIndex>=0&&availableControl(item,this.dialog));if(event.shiftKey&&document.activeElement===items[0]){event.preventDefault();items.at(-1)?.focus();}else if(!event.shiftKey&&document.activeElement===items.at(-1)){event.preventDefault();items[0]?.focus();}return;}
  if(event.target===this.closeButton)return;
  if(event.key==='Enter'){event.preventDefault();if(!event.repeat)this.choose(at>=0?at:this.selected);return;}
  let next:number;if(event.key==='ArrowDown')next=at<0?0:Math.min(buttons.length-1,at+1);else if(event.key==='ArrowUp')next=at<0?buttons.length-1:Math.max(0,at-1);else if(event.key==='Home'&&at>=0)next=0;else if(event.key==='End'&&at>=0)next=buttons.length-1;else return;
  event.preventDefault();if(!buttons.length)return;this.selected=next;buttons.forEach((button,index)=>{button.tabIndex=index===next?0:-1;button.dataset.current=String(index===next);});buttons[next]?.focus();
 }
}
