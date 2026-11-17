import {A2uiLitElement} from '@a2ui/web_core/v1_0';
import {html,css,nothing} from 'lit';
import {formValidationApi,type ValidationIssue} from './interactions.js';
export type DisplayIssue=ValidationIssue&{label:string};
export class FormValidationElement extends A2uiLitElement<typeof formValidationApi>{
 createRenderRoot(){return this;}
 static styles=css`:host{display:block}section{border:1px solid var(--pi-a2ui-color-error-border);border-left:3px solid var(--pi-a2ui-color-error);border-radius:10px;padding:12px 16px;background:var(--pi-a2ui-color-error-surface);color:var(--pi-a2ui-color-error);font-size:13px;line-height:1.5}section[hidden]{display:none}strong{font-weight:600}ul{margin:8px 0 0;padding-left:20px}li{margin:4px 0}`;
 private issues:DisplayIssue[]=[];
 setIssues(issues:DisplayIssue[]){this.issues=issues;this.requestUpdate();}
 render(){const p=this.controller.props;return p?html`<section aria-label=${p.title} aria-live="polite" tabindex="-1" ?hidden=${!this.issues.length}><strong>${p.title}</strong><ul>${this.issues.map(issue=>html`<li>${issue.label}: ${issue.message}</li>`)}</ul></section>`:nothing;}
}
