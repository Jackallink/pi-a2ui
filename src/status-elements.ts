import {A2uiLitElement} from '@a2ui/web_core/v1_0';
import {html,css,nothing} from 'lit';
import {statusBadgeApi,taskProgressApi} from './workbench.js';
export class StatusBadgeElement extends A2uiLitElement<typeof statusBadgeApi>{
 createRenderRoot(){return this;}
 static styles=css`:host{display:block}.badge{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--pi-a2ui-color-border);border-radius:999px;padding:3px 12px;font-size:12px;line-height:1.5;background:var(--pi-a2ui-color-raised);color:var(--pi-a2ui-color-text)}[data-status=success]{color:var(--pi-a2ui-color-success);background:var(--pi-a2ui-color-success-surface);border-color:#b7dcc0}[data-status=error]{color:var(--pi-a2ui-color-error);background:var(--pi-a2ui-color-error-surface);border-color:var(--pi-a2ui-color-error-border)}[data-status=warning]{color:var(--pi-a2ui-color-warning);background:var(--pi-a2ui-color-warning-surface);border-color:#e5c37e}small{font-size:11px;color:var(--pi-a2ui-color-muted)}`;
 render(){const p=this.controller.props;return p?html`<p><span class="badge" data-status=${p.status}>${p.status} · ${p.label}</span> <small>Reported by Pi · not independently verified</small></p>`:nothing;}
}
export class TaskProgressElement extends A2uiLitElement<typeof taskProgressApi>{
 createRenderRoot(){return this;}
 static styles=css`:host{display:block}section p{font-size:13px;margin:0 0 8px}progress{width:100%;accent-color:var(--pi-a2ui-color-accent)}`;
 render(){const p=this.controller.props;return p?html`<section aria-label="Native tool progress"><p>Tracked tools · ${p.state}</p>${p.state==='running'?html`<progress aria-label="Tool execution in progress"></progress>`:nothing}<p>${p.started} started · ${p.settled} settled · ${p.failed} failed</p>${p.omitted?html`<p>Some tool events omitted; tracked counts are incomplete.</p>`:nothing}</section>`:nothing;}
}
