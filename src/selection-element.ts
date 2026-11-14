import {A2uiLitElement} from '@a2ui/web_core/v1_0';
import {html,css,nothing} from 'lit';
import {searchablePickerApi} from './interactions.js';
export class SearchablePickerElement extends A2uiLitElement<typeof searchablePickerApi>{
 createRenderRoot(){return this;}
 static styles=css`:host{display:block}section{display:grid;gap:.5em}.picker-options{display:flex;flex-wrap:wrap;gap:.4em}.picker-selected{display:flex;flex-wrap:wrap;gap:.4em}button[aria-pressed=true]{border:2px solid #2563eb}input{max-width:100%;padding:.5em}`;
 private query='';
 private choose(value:string){const p=this.controller.props;if(!p)return;const current=p.value as string[];const next=current.includes(value)?current.filter(v=>v!==value):p.variant==='multipleSelection'?[...current,value]:[value];p.setValue?.(next);}
 private search(event:Event){const input=event.target as HTMLInputElement;this.query=Array.from(input.value).slice(0,128).join('');input.value=this.query;this.requestUpdate();}
 private navigate(event:KeyboardEvent){
  if(event.key==='Escape'){event.preventDefault();this.query='';this.requestUpdate();this.querySelector('input')?.focus();return;}
  const controls=[...this.querySelectorAll<HTMLButtonElement>('.picker-options button')];
  if(!controls.length)return;let at=controls.indexOf(event.target as HTMLButtonElement);
  if(event.key==='ArrowDown')at=Math.min(controls.length-1,at+1);
  else if(event.key==='ArrowUp')at=at<0?controls.length-1:Math.max(0,at-1);
  else if(event.key==='Home'&&at>=0)at=0;
  else if(event.key==='End'&&at>=0)at=controls.length-1;
  else return;
  event.preventDefault();controls[at]?.focus();
 }
 render(){const p=this.controller.props;if(!p)return nothing;const selected=p.value as string[];const query=this.query.toLocaleLowerCase();const options=p.options.filter(o=>o.label.toLocaleLowerCase().includes(query));
 return html`<section aria-label=${p.label} @click=${(e:Event)=>e.stopPropagation()} @keydown=${(e:KeyboardEvent)=>{e.stopPropagation();this.navigate(e);}}>
 <label>${p.label}<input type="search" aria-label=${'Search '+p.label} .value=${this.query} @input=${this.search}></label>
 <div class="picker-selected" aria-label="Selected options">${p.options.filter(o=>selected.includes(o.value)).map(o=>html`<button type="button" aria-label=${'Remove '+o.label+' ('+o.value+')'} @click=${()=>this.choose(o.value)}>${o.label} ×</button>`)}</div>
 <div class="picker-options" role="group" aria-label=${p.label+' options'}>${options.map(o=>html`<button type="button" aria-pressed=${String(selected.includes(o.value))} @click=${()=>this.choose(o.value)}>${o.label} · ${o.value}</button>`)}</div>
 ${p.options.length===0?html`<p role="status">No options</p>`:options.length===0?html`<p role="status">No matches</p>`:nothing}
 </section>`;
 }
}
