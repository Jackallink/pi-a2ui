import {A2uiLitElement,basicCatalog,type ComponentApi} from '@a2ui/web_core/v1_0';
import {html,css,nothing} from 'lit';
import {detailsApi} from './workbench.js';
export class DetailsElement extends A2uiLitElement<typeof detailsApi>{
 createRenderRoot(){return this;}
 static styles=css`:host{display:block}details{border:1px solid #cbd5e1;border-radius:8px;padding:.7em}summary{cursor:pointer;font-weight:600}.details-content{padding-top:.7em}`;
 render(){const p=this.controller.props;if(!p)return nothing;return html`<details ?open=${p.open}><summary @click=${(e:Event)=>e.stopPropagation()}>${p.title}</summary><div class="details-content">${this.renderNode(p.child)}</div></details>`;}
}

function focusable(root:ParentNode):HTMLElement[]{
 const result:HTMLElement[]=[];for(const node of root.querySelectorAll<HTMLElement>('*')){if(node.matches('button,input,select,textarea,a[href],[tabindex]')&&node.tabIndex>=0&&!node.matches(':disabled')&&node.getClientRects().length)result.push(node);if(node.shadowRoot)result.push(...focusable(node.shadowRoot));}return result;
}
const modalApi=basicCatalog.components.get('Modal')! as ComponentApi;
const iconApi=basicCatalog.components.get('Icon')! as ComponentApi;
export class ModalElement extends A2uiLitElement<typeof modalApi>{
 createRenderRoot(){return this;}
 static styles=css`:host{display:block}dialog{max-width:min(92vw,60em);max-height:85vh;overflow:auto;border:1px solid #94a3b8;border-radius:10px;padding:1em}dialog::backdrop{background:#0f172a99}.modal-close{float:right}`;
 disconnectedCallback(){this.querySelector('dialog')?.close();super.disconnectedCallback();}
 private trap(event:KeyboardEvent){if(event.key!=='Tab')return;const dialog=this.querySelector('dialog')!;const items=focusable(dialog);const current=event.composedPath()[0];if(!items.length){event.preventDefault();dialog.focus();return;}if(event.shiftKey&&current===items[0]){event.preventDefault();items.at(-1)!.focus();}else if(!event.shiftKey&&current===items.at(-1)){event.preventDefault();items[0].focus();}}
 render(){const p=this.controller.props;if(!p)return nothing;return html`<button class="modal-trigger" type="button" @click=${(e:Event)=>{e.stopPropagation();this.querySelector('dialog')?.showModal();}}>${this.renderNode(p.trigger)}</button><dialog aria-label="Details" tabindex="-1" @keydown=${this.trap} @close=${()=>this.querySelector<HTMLButtonElement>('.modal-trigger')?.focus()}><button class="modal-close" type="button" aria-label="Close details" @click=${(e:Event)=>{e.stopPropagation();this.querySelector('dialog')?.close();}}>Close</button>${this.renderNode(p.content)}</dialog>`;}
}
const icons:Record<string,string>={check:'M4 12l5 5L20 6',close:'M6 6l12 12M6 18L18 6',error:'M12 8v5m0 3h.01M3 3h18v18H3z',info:'M12 11v6m0-10h.01M3 3h18v18H3z',warning:'M12 3L2 21h20L12 3zM12 9v5m0 3h.01',folder:'M2 5h8l2 3h10v13H2z',help:'M9 8a3 3 0 016 0c0 3-3 3-3 6m0 3h.01',refresh:'M20 10a8 8 0 10-1 7M20 3v7h-7',play:'M7 3l14 9-14 9z',pause:'M7 3v18M17 3v18',search:'M11 3a8 8 0 110 16 8 8 0 010-16m6 14l5 5',settings:'M3 6h18M3 12h18M3 18h18M8 3v6M16 9v6M10 15v6'};
export class IconElement extends A2uiLitElement<typeof iconApi>{
 createRenderRoot(){return this;}
 static styles=css`:host{display:inline-flex;align-items:center;gap:.3em}svg{width:1.2em;height:1.2em;vertical-align:middle}`;
 render(){const p=this.controller.props;if(!p)return nothing;const name=String(p.name);return html`<span aria-label=${name}><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d=${icons[name]??''}></path></svg><span>${name}</span></span>`;}
}
