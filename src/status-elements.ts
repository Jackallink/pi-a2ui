import {A2uiLitElement} from '@a2ui/web_core/v1_0';
import {html,css,nothing} from 'lit';
import {statusBadgeApi,taskProgressApi} from './workbench.js';
export class StatusBadgeElement extends A2uiLitElement<typeof statusBadgeApi>{
 createRenderRoot(){return this;}
 static styles=css`:host{display:block}.badge{border:1px solid #94a3b8;border-radius:1em;padding:.2em .6em}[data-status=success]{color:#166534}[data-status=error]{color:#991b1b}`;
 render(){const p=this.controller.props;return p?html`<p><span class="badge" data-status=${p.status}>${p.status} · ${p.label}</span> <small>Reported by Pi · not independently verified</small></p>`:nothing;}
}
export class TaskProgressElement extends A2uiLitElement<typeof taskProgressApi>{
 createRenderRoot(){return this;}
 static styles=css`:host{display:block}progress{width:100%}`;
 render(){const p=this.controller.props;return p?html`<section aria-label="Native tool progress"><p>Tracked tools · ${p.state}</p>${p.state==='running'?html`<progress aria-label="Tool execution in progress"></progress>`:nothing}<p>${p.started} started · ${p.settled} settled · ${p.failed} failed</p>${p.omitted?html`<p>Some tool events omitted; tracked counts are incomplete.</p>`:nothing}</section>`:nothing;}
}
