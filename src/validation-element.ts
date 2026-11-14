import {A2uiLitElement} from '@a2ui/web_core/v1_0';
import {html,css,nothing} from 'lit';
import {formValidationApi,type ValidationIssue} from './interactions.js';
export type DisplayIssue=ValidationIssue&{label:string};
export class FormValidationElement extends A2uiLitElement<typeof formValidationApi>{
 createRenderRoot(){return this;}
 static styles=css`:host{display:block}section{border:1px solid #b91c1c;border-radius:6px;padding:.8em;color:#991b1b}section[hidden]{display:none}`;
 private issues:DisplayIssue[]=[];
 setIssues(issues:DisplayIssue[]){this.issues=issues;this.requestUpdate();}
 render(){const p=this.controller.props;return p?html`<section aria-label=${p.title} aria-live="polite" tabindex="-1" ?hidden=${!this.issues.length}><strong>${p.title}</strong><ul>${this.issues.map(issue=>html`<li>${issue.label}: ${issue.message}</li>`)}</ul></section>`:nothing;}
}
