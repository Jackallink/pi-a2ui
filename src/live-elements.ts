import {A2uiLitElement} from '@a2ui/web_core/v1_0';
import {html,svg,css,nothing} from 'lit';
import {logViewApi,chartApi} from './live.js';
export class LogViewElement extends A2uiLitElement<typeof logViewApi>{
 private paused=false;private held='';private follow=true;
 createRenderRoot(){return this;}
 static styles=css`:host{display:block}pre{overflow:auto;max-height:16em;white-space:pre-wrap;overflow-wrap:anywhere;background:#101827;color:#e2e8f0;padding:1em;border-radius:8px}.log-header{display:flex;gap:1em;align-items:center}.omitted{color:#92400e}`;
 willUpdate(changed:Map<PropertyKey,unknown>){const pre=this.querySelector('pre');if(pre)this.follow=pre.scrollHeight-pre.scrollTop-pre.clientHeight<24;super.willUpdate(changed);}
 updated(){const pre=this.querySelector('pre');if(pre&&this.follow&&!this.paused)pre.scrollTop=pre.scrollHeight;}
 render(){const p=this.controller.props;if(!p)return nothing;return html`<section aria-label="Tool log" data-stream-state=${p.state}><div class="log-header"><strong>Tool output</strong><span>${p.state}</span><button type="button" @click=${(event:Event)=>{event.stopPropagation();if(!this.paused)this.held=p.text;this.paused=!this.paused;this.requestUpdate();}}>${this.paused?'Resume log display':'Pause log display'}</button></div>${p.omitted?html`<p class="omitted">Earlier content omitted</p>`:nothing}${this.paused?html`<p>Display paused; latest output remains bounded.</p>`:nothing}<pre>${this.paused?this.held:p.text}</pre></section>`;}
}
export class ChartElement extends A2uiLitElement<typeof chartApi>{
 createRenderRoot(){return this;}
 static styles=css`:host{display:block}svg{display:block;width:100%;max-height:260px}.values{max-height:12em;overflow:auto}table{border-collapse:collapse;width:100%}td,th{text-align:left;padding:.3em;border-bottom:1px solid #ddd}`;
 render(){const p=this.controller.props;if(!p)return nothing;
  const colors=['#2563eb','#d97706','#059669','#be123c'];const count=p.series[0]?.points.length??0;
  const maxAbs=Math.max(1,...p.series.flatMap(s=>s.points.map(point=>Math.abs(point.value))));
  const values=p.series.flatMap(s=>s.points.map(point=>point.value/maxAbs));const low=Math.min(0,...values),high=Math.max(0,...values);const span=high-low||1;
  const y=(value:number)=>210-((value/maxAbs-low)/span)*180;const x=(index:number)=>40+(count<=1?0:index/(count-1)*540);
  return html`<section aria-label="Chart"><h3>${p.kind==='line'?'Line':'Bar'} chart</h3>${count===0?html`<p>No data yet</p>`:nothing}<svg viewBox="0 0 640 250" role="img" aria-label=${p.kind+' chart'}><line x1="35" x2="615" y1=${y(0)} y2=${y(0)} stroke="#64748b"></line>${p.series.map((series,index)=>svg`<g data-series=${series.name}>${p.kind==='line'?svg`<polyline fill="none" stroke=${colors[index]} points=${series.points.map((point,i)=>`${x(i)},${y(point.value)}`).join(' ')}></polyline>`:nothing}${series.points.map((point,i)=>p.kind==='line'?svg`<circle cx=${x(i)} cy=${y(point.value)} r="3" fill=${colors[index]}><title>${series.name}: ${point.label} = ${point.value}</title></circle>`:svg`<rect x=${40+i*(540/Math.max(1,count))+index*(500/Math.max(1,count)/Math.max(1,p.series.length))} y=${Math.min(y(0),y(point.value))} width=${Math.max(.1,480/Math.max(1,count)/Math.max(1,p.series.length))} height=${Math.abs(y(point.value)-y(0))} fill=${colors[index]}><title>${series.name}: ${point.label} = ${point.value}</title></rect>`)}</g>`)}${p.series[0]?.points.map((point,i)=>svg`<text x=${p.kind==='line'?x(i):40+i*(540/Math.max(1,count))} y="235" font-size="10">${point.label}</text>`)}</svg><div class="values"><table><caption>Supplied chart values</caption><thead><tr><th>Series</th><th>Label</th><th>Value</th></tr></thead><tbody>${p.series.flatMap(series=>series.points.map(point=>html`<tr><td>${series.name}</td><td>${point.label}</td><td>${point.value}</td></tr>`))}</tbody></table></div></section>`;
 }
}
