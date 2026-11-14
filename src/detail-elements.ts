import {A2uiLitElement} from '@a2ui/web_core/v1_0';
import {html,css,nothing} from 'lit';
import {detailsApi} from './workbench.js';
export class DetailsElement extends A2uiLitElement<typeof detailsApi>{
 createRenderRoot(){return this;}
 static styles=css`:host{display:block}details{border:1px solid #cbd5e1;border-radius:8px;padding:.7em}summary{cursor:pointer;font-weight:600}.details-content{padding-top:.7em}`;
 render(){const p=this.controller.props;if(!p)return nothing;return html`<details ?open=${p.open}><summary @click=${(e:Event)=>e.stopPropagation()}>${p.title}</summary><div class="details-content">${this.renderNode(p.child)}</div></details>`;}
}
