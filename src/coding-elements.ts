import {A2uiLitElement} from '@a2ui/web_core/v1_0';
import {html,css,nothing} from 'lit';
import {codeDiffApi,testResultsApi,diffLines} from './coding.js';
export class CodeDiffElement extends A2uiLitElement<typeof codeDiffApi>{
 createRenderRoot(){return this;}
 static styles=css`:host{display:block}pre{margin:0;white-space:pre-wrap;overflow-wrap:anywhere}.diff{overflow:auto;border:1px solid #dbe1e7;border-radius:8px}.line{display:flex;font:12px/1.6 ui-monospace,monospace}.remove{background:#fee4e2}.add{background:#dcfce7}.numbers{min-width:7em;white-space:pre;color:#64748b;user-select:none}`;
 render(){const p=this.controller.props;if(!p)return nothing;return html`<section aria-label="Code difference"><h3>${p.filename}</h3><p>Proposal ${p.proposalId} · Base ${p.baseRevision} · Read only</p><div class="diff">${diffLines(p.before,p.after).map(line=>html`<div class="line ${line.kind}" data-kind=${line.kind}><span class="numbers">${String(line.before??'').padStart(3)} ${String(line.after??'').padStart(3)} ${line.kind==='remove'?'-':line.kind==='add'?'+':' '}</span><pre>${line.text}</pre></div>`)}</div></section>`;}
}
export class TestResultsElement extends A2uiLitElement<typeof testResultsApi>{
 createRenderRoot(){return this;}
 static styles=css`:host{display:block}table{border-collapse:collapse;width:100%}th,td{padding:.5em;text-align:left;border-bottom:1px solid #ddd}pre{white-space:pre-wrap;overflow-wrap:anywhere}caption{text-align:left;font-weight:600}`;
 render(){const p=this.controller.props;if(!p)return nothing;return html`<section aria-label="Test results"><h3>Test results · ${p.resultId}</h3><p>Reported by Pi · ${p.command}</p><p>${p.evidence}</p><p>${p.summary.pass} pass · ${p.summary.fail} fail · ${p.summary.skip} skip · ${p.summary.error} error</p><table><caption>Supplied test case records</caption><thead><tr><th>Case</th><th>Status</th><th>Details</th></tr></thead><tbody>${p.cases.map(row=>html`<tr data-status=${row.status}><td>${row.name} (${row.id})</td><td>${row.status}</td><td><pre>${row.details??''}</pre></td></tr>`)}</tbody></table></section>`;}
}
