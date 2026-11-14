import {A2uiLitElement} from '@a2ui/web_core/v1_0';
import {html,css,nothing} from 'lit';
import {dataTableApi} from './workbench.js';
type Cell=string|number|boolean|null;
function compare(a:Cell,b:Cell):number{const rank=(x:Cell)=>x===null?0:typeof x==='boolean'?1:typeof x==='number'?2:3;const order=rank(a)-rank(b);return order||(a===b?0:a!<b!?-1:1);}
export class DataTableElement extends A2uiLitElement<typeof dataTableApi>{
 private filter='';private sort=-1;private ascending=true;
 createRenderRoot(){return this;}
 static styles=css`:host{display:block}.table-scroll{overflow:auto;max-height:28em}table{border-collapse:collapse;width:100%}td,th{text-align:left;padding:.5em;border-bottom:1px solid #cbd5e1;white-space:pre-wrap;overflow-wrap:anywhere}input{max-width:100%}`;
 render(){const p=this.controller.props;if(!p)return nothing;const rows=p.rows.filter(r=>r.cells.some(c=>String(c??'').toLowerCase().includes(this.filter.toLowerCase()))).map((row,index)=>({row,index}));if(this.sort>=0)rows.sort((a,b)=>(this.ascending?1:-1)*compare(a.row.cells[this.sort],b.row.cells[this.sort])||a.index-b.index);
 return html`<section aria-label=${p.caption}><label>Filter ${p.caption}<input type="search" maxlength="256" .value=${this.filter} @input=${(e:Event)=>{e.stopPropagation();this.filter=(e.target as HTMLInputElement).value.slice(0,256);this.requestUpdate();}}></label>${p.state!=='ready'?html`<p role=${p.state==='error'?'alert':'status'}>${p.state==='loading'?'Loading data':'Data unavailable'} ${p.message}</p>`:html`<div class="table-scroll"><table><caption>${p.caption}</caption><thead><tr>${p.columns.map((col,index)=>html`<th aria-sort=${this.sort!==index?'none':this.ascending?'ascending':'descending'}><button type="button" @click=${(e:Event)=>{e.stopPropagation();this.ascending=this.sort===index?!this.ascending:true;this.sort=index;this.requestUpdate();}}>${col.label}</button></th>`)}</tr></thead><tbody>${rows.map(({row})=>html`<tr>${row.cells.map(c=>html`<td>${c===null?'—':String(c)}</td>`)}</tr>`)}</tbody></table>${rows.length===0?html`<p>${p.rows.length===0?'No results':'No matching rows'}</p>`:nothing}</div>`}</section>`;}
}
