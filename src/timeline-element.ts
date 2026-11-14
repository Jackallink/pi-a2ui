import {A2uiLitElement} from '@a2ui/web_core/v1_0';
import {html,css,nothing} from 'lit';
import {activityTimelineApi} from './interactions.js';
function observedTime(value:number){const date=new Date(value);return Number.isNaN(date.getTime())?value+' ms since epoch':date.toISOString();}
export class ActivityTimelineElement extends A2uiLitElement<typeof activityTimelineApi>{
 createRenderRoot(){return this;}
 static styles=css`:host{display:block}ol{max-height:24em;overflow:auto;padding-left:1.6em}li{padding:.4em}small{display:block;color:#475569}`;
 render(){const p=this.controller.props;if(!p)return nothing;return html`<section aria-label="Native tool timeline"><p>Native tool timeline · ${p.state}</p><small>Current agent run · bounded window</small>${p.entries.length?html`<ol tabindex="0" aria-label="Observed native tool events">${p.entries.map(row=>html`<li><strong>${row.name}</strong> · ${row.state}<small>Started ${observedTime(row.startedAt)} · ${row.elapsedMs} ms observed${row.state==='running'?' (last observed)':''}</small></li>`)}</ol>`:html`<p>No tracked tool events</p>`}${p.omitted?html`<p>Some tool events omitted; this window is incomplete.</p>`:nothing}</section>`;}
}
