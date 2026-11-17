import {A2uiLitElement} from '@a2ui/web_core/v1_0';
import {html,svg,css,nothing} from 'lit';
import {logViewApi,chartApi} from './live.js';
export class LogViewElement extends A2uiLitElement<typeof logViewApi>{
 private paused=false;private held='';private follow=true;
 createRenderRoot(){return this;}
 static styles=css`:host{display:block}pre{overflow:auto;max-height:260px;white-space:pre-wrap;overflow-wrap:anywhere;background:#101a2d;color:#e4eaf4;padding:16px;border-radius:10px;font:12px/1.75 var(--pi-a2ui-font-mono)}.log-header{display:flex;gap:12px;align-items:center;font-size:12px;color:var(--pi-a2ui-color-muted);margin-bottom:8px}.log-header strong{font-weight:600;color:var(--pi-a2ui-color-text)}.log-header button{font-family:inherit;font-size:12px;border:1px solid var(--pi-a2ui-color-input-border);border-radius:8px;background:var(--pi-a2ui-color-surface);color:var(--pi-a2ui-color-text);padding:4px 10px;min-height:28px;cursor:pointer}.log-header button:focus-visible{outline:3px solid var(--pi-a2ui-color-focus);outline-offset:2px}.omitted{color:var(--pi-a2ui-color-warning);font-size:12px}`;
 willUpdate(changed:Map<PropertyKey,unknown>){const pre=this.querySelector('pre');if(pre)this.follow=pre.scrollHeight-pre.scrollTop-pre.clientHeight<24;super.willUpdate(changed);}
 updated(){const pre=this.querySelector('pre');if(pre&&this.follow&&!this.paused)pre.scrollTop=pre.scrollHeight;}
 render(){const p=this.controller.props;if(!p)return nothing;return html`<section aria-label="Tool log" data-stream-state=${p.state}><div class="log-header"><strong>Tool output</strong><span>${p.state}</span><button type="button" @click=${(event:Event)=>{event.stopPropagation();if(!this.paused)this.held=p.text;this.paused=!this.paused;this.requestUpdate();}}>${this.paused?'Resume log display':'Pause log display'}</button></div>${p.omitted?html`<p class="omitted">Earlier content omitted</p>`:nothing}${this.paused?html`<p>Display paused; latest output remains bounded.</p>`:nothing}<pre>${this.paused?this.held:p.text}</pre></section>`;}
}
export class ChartElement extends A2uiLitElement<typeof chartApi>{
 createRenderRoot(){return this;}
 static styles=css`:host{display:block}.chart-plot{overflow:auto}svg{display:block;width:100%;max-height:290px}.rp-legend{display:flex;flex-wrap:wrap;gap:8px 18px;list-style:none;margin:0 0 8px;padding:0;font-size:12px;color:var(--pi-a2ui-color-muted)}.rp-legend i{display:inline-block;width:16px;height:4px;border-radius:2px;margin-right:6px;vertical-align:middle}.rp-swatch{vertical-align:middle;margin-right:6px}.rp-tick{font-family:var(--pi-a2ui-font-mono)}.values{max-height:176px;overflow:auto}table{border-collapse:collapse;width:100%}td,th{text-align:left;padding:.3em;border-bottom:1px solid var(--pi-a2ui-color-border)}td:last-child{white-space:nowrap}caption{text-align:left;font-size:12px;color:var(--pi-a2ui-color-muted);padding:4px 0}`;
 render(){const p=this.controller.props;if(!p)return nothing;
  const colors=['#365cdb','#0f766e','#9a5b0a','#92419c'];
  // Approved non-color line marks (Spec028: solid/dashed/dotted/long-dash + marker shapes), index-aligned with colors.
  const lineMarks=[{dash:'none',marker:'circle'},{dash:'7 3',marker:'square'},{dash:'2 3',marker:'triangle'},{dash:'11 4',marker:'diamond'}] as const;
  const count=p.series[0]?.points.length??0;
  const maxAbs=Math.max(1,...p.series.flatMap(s=>s.points.map(point=>Math.abs(point.value))));
  const values=p.series.flatMap(s=>s.points.map(point=>point.value/maxAbs));const low=Math.min(0,...values),high=Math.max(0,...values);const span=high-low||1;
  const y=(value:number)=>210-((value/maxAbs-low)/span)*180;
  const gutter=40,plotSpan=540;const ticks=count===0?[]:tickValues(low,high,maxAbs);
  // Spec028: gutter from the largest ACTUAL tick label width (+12) in the mono tick font, at least 40px.
  const tickMeasure=tickMeasurer();
  const left=Math.max(gutter,Math.ceil(ticks.reduce((width,tick)=>Math.max(width,tickMeasure(tick.label)),0))+12);const width=left+plotSpan+24;
  const x=(index:number)=>left+(count<=1?0:index/(count-1)*plotSpan);
  const marker=(shape:'circle'|'square'|'triangle'|'diamond',cx:number,cy:number,color:string,title:string)=>shape==='circle'?svg`<circle cx=${cx} cy=${cy} r="3" fill=${color}><title>${title}</title></circle>`:shape==='square'?svg`<rect x=${cx-3} y=${cy-3} width="6" height="6" fill=${color}><title>${title}</title></rect>`:shape==='triangle'?svg`<polygon points=${`${cx},${cy-4.5} ${cx-4.5},${cy+3} ${cx+4.5},${cy+3}`} fill=${color}><title>${title}</title></polygon>`:svg`<polygon points=${`${cx},${cy-5} ${cx+4.5},${cy} ${cx},${cy+5} ${cx-4.5},${cy}`} fill=${color}><title>${title}</title></polygon>`;
  const swatch=(index:number)=>p.kind==='bar'?html`<i style=${'background:'+colors[index]}></i>`:svg`<svg class="rp-swatch" viewBox="0 0 18 8" width="18" height="8" aria-hidden="true"><line x1="1" x2="17" y1="4" y2="4" stroke=${colors[index]} stroke-width="2" stroke-dasharray=${lineMarks[index].dash}></line>${lineMarks[index].marker==='circle'?svg`<circle cx="9" cy="4" r="2.5" fill=${colors[index]}></circle>`:lineMarks[index].marker==='square'?svg`<rect x="6.5" y="1.5" width="5" height="5" fill=${colors[index]}></rect>`:lineMarks[index].marker==='triangle'?svg`<polygon points="9,1 12.5,6.5 5.5,6.5" fill=${colors[index]}></polygon>`:svg`<polygon points="9,0.5 12,4 9,7.5 6,4" fill=${colors[index]}></polygon>`}</svg>`;
  const xLabelItems=visibleXLabels(p.series[0]?.points.map(point=>point.label)??[],left,plotSpan,p.kind,count,labelMeasurer());
  const wrapRows=xLabelItems.reduce((rows,item)=>Math.max(rows,item.lines?.length??1),1);const height=250+(wrapRows-1)*11;
  return html`<section aria-label="Chart"><h3>${p.kind==='line'?'Line':'Bar'} chart</h3>${count===0?html`<p>No data yet</p>`:nothing}${p.series.length?html`<ul class="rp-legend" aria-label="Chart series color legend">${p.series.map((series,index)=>html`<li>${swatch(index)}${series.name}</li>`)}</ul>`:nothing}<div class="chart-plot"><svg class="rp-plot" viewBox="0 0 ${width} ${height}" style=${'min-width:'+width+'px'} role="img" aria-label=${p.kind+' chart'}><line x1=${left} x2=${left+plotSpan} y1=${y(0)} y2=${y(0)} stroke="#64748b"></line>${ticks.map(tick=>svg`<line class="rp-tick-mark" x1=${left-6} x2=${left} y1=${y(tick.value)} y2=${y(tick.value)} stroke="var(--pi-a2ui-color-border,#dbe2ea)"></line><text class="rp-tick" x=${left-8} y=${y(tick.value)+4} text-anchor="end" font-size="11" fill="var(--pi-a2ui-color-muted,#566477)">${tick.label}</text>`)}${p.series.map((series,index)=>{const mark=lineMarks[index];return svg`<g data-series=${series.name} data-mark=${p.kind==='line'?mark.marker:nothing}>${p.kind==='line'?svg`<polyline fill="none" stroke=${colors[index]} stroke-dasharray=${mark.dash} points=${series.points.map((point,i)=>`${x(i)},${y(point.value)}`).join(' ')}></polyline>`:nothing}${series.points.map((point,i)=>p.kind==='line'?marker(mark.marker,x(i),y(point.value),colors[index],`${series.name}: ${point.label} = ${point.value}`):svg`<rect x=${left+i*(plotSpan/Math.max(1,count))+index*((plotSpan-40)/Math.max(1,count)/Math.max(1,p.series.length))} y=${Math.min(y(0),y(point.value))} width=${Math.max(.1,480/Math.max(1,count)/Math.max(1,p.series.length))} height=${Math.abs(y(point.value)-y(0))} fill=${colors[index]}><title>${series.name}: ${point.label} = ${point.value}</title></rect>`)}</g>`;})}${xLabelItems.map(item=>item.lines?svg`<text class="rp-x-label" x=${item.x} y="235" font-size="10" text-anchor="middle"><title>${item.label}</title>${item.lines.map((line,row)=>svg`<tspan x=${item.x} dy=${row===0?0:11}>${line}</tspan>`)}</text>`:svg`<text class="rp-x-label" x=${item.x} y="235" font-size="10" text-anchor=${item.anchor}><title>${item.label}</title>${item.label}</text>`)}</svg></div><div class="values"><table><caption>Supplied chart values</caption><thead><tr><th>Series</th><th>Label</th><th>Value</th></tr></thead><tbody>${p.series.flatMap(series=>series.points.map(point=>html`<tr><td>${series.name}</td><td>${point.label}</td><td>${point.value}</td></tr>`))}</tbody></table></div></section>`;
 }
}
function tickValues(low:number,high:number,maxAbs:number):Array<{value:number;label:string}>{
 const format=(value:number):string=>{
  if(value===0)return'0';
  const abs=Math.abs(value);
  if(abs<0.01||abs>=1e6)return value.toExponential(2);
  return value.toLocaleString('en-US',{useGrouping:false,maximumFractionDigits:6});
 };
 const mid=(low+high)/2;const seen=new Set<number>();const entries:Array<{value:number;label:string}>=[];
 for(const value of [low*maxAbs,mid*maxAbs,high*maxAbs]){
  if(seen.has(value))continue;seen.add(value);entries.push({value,label:format(value)});
 }
 const collisions=new Map<string,number>();for(const entry of entries)collisions.set(entry.label,(collisions.get(entry.label)??0)+1);
 for(const entry of entries)if((collisions.get(entry.label)??0)>1)entry.label=String(entry.value);
 return entries;
}
let measureLabels:((label:string)=>number)|undefined;
const estimateLabel=(label:string):number=>label.length*10;
const labelMeasurer=():((label:string)=>number)=>{
 if(measureLabels)return measureLabels;
 let context:CanvasRenderingContext2D|null=null;
 try{context=document.createElement('canvas').getContext('2d');if(context)context.font='10px '+getComputedStyle(document.body).fontFamily;}catch{context=null;}
 if(context)measureLabels=(label:string)=>{try{return context!.measureText(label).width;}catch{return estimateLabel(label);}};
 return measureLabels??estimateLabel;
};
let measureTicks:((label:string)=>number)|undefined;
const estimateTick=(label:string):number=>label.length*6.6;
// Spec028: y ticks render in the --pi-a2ui-font-mono stack at 11px; gutter width is measured
// against that exact font when canvas accepts it, falling back to the generic monospace face
// (conservative: wider on most platforms) and then to a per-char bound. ASCII tick labels only.
const tickMeasurer=():((label:string)=>number)=>{
 if(measureTicks)return measureTicks;
 let context:CanvasRenderingContext2D|null=null;
 try{
  context=document.createElement('canvas').getContext('2d');
  if(context){
   const token=getComputedStyle(document.documentElement).getPropertyValue('--pi-a2ui-font-mono').trim();
   context.font='11px '+(token||'monospace');
   if(!context.font.startsWith('11px'))context.font='11px monospace';
  }
 }catch{context=null;}
 if(context)measureTicks=(label:string)=>{try{return context!.measureText(label).width;}catch{return estimateTick(label);}};
 return measureTicks??estimateTick;
};
type XLabelItem={label:string;x:number;anchor:'start'|'middle'|'end';lines?:Array<string>};
function wrapLabel(label:string,budget:number,measure:(label:string)=>number,maxLines:number):Array<string>{
 const lines:Array<string>=[];let current='';
 for(const char of label){
  if(current&&measure(current+char)>budget){lines.push(current);current=char;}
  else current+=char;
 }
 if(current)lines.push(current);
 if(lines.length<=maxLines)return lines;
 const kept=lines.slice(0,maxLines-1);const ellipsis='…';const room=budget-measure(ellipsis);let last='';let truncated=false;
 for(const line of lines.slice(maxLines-1)){
  for(const char of line){
   if(last&&measure(last+char+ellipsis)>room){truncated=true;break;}
   last+=char;
  }
  if(truncated)break;
 }
 return kept.concat([last+(truncated?ellipsis:'')]);
}
function visibleXLabels(labels:Array<string>,left:number,plotSpan:number,kind:'line'|'bar',count:number,measure:(label:string)=>number):Array<XLabelItem>{
 if(count<=0)return[];
 const slot=plotSpan/count;
 const items=labels.slice(0,count).map((label,i)=>{
  const anchor:'start'|'middle'|'end'=i===0?'start':i===count-1&&count>1?'end':kind==='bar'?'start':'middle';
  const x=kind==='bar'?(count>1&&i===count-1?left+plotSpan:left+i*slot):(i===0?left:i===count-1?left+plotSpan:left+i/(count-1)*plotSpan);
  const width=measure(label);
  const spanLeft=anchor==='start'?x:anchor==='middle'?x-width/2:x-width;
  return{label,x,anchor,spanLeft,spanRight:spanLeft+width};
 });
 const shown:Array<XLabelItem>=[];let lastRight=-Infinity;
 for(const item of items){
  if(item.spanLeft<left||item.spanRight>left+plotSpan)continue;
  if(item.spanLeft<lastRight+2)continue;
  shown.push({label:item.label,x:item.x,anchor:item.anchor});lastRight=item.spanRight;
 }
 if(shown.length>0)return shown;
 // Wrap fallback (Spec028: wrap long labels instead of erasing the axis): every legal label
 // exceeds the plot width. Thin to columns of at least 34px, wrap each kept label into at most
 // 3 measured lines inside its own column (ellipsis tail when truncated). Columns are disjoint
 // by construction, so the presentation stays nonempty, bounded and non-overlapping; the full
 // label remains in <title> and in the values table.
 const stride=Math.max(1,Math.ceil(34/slot));
 const column=slot*stride;
 const kept:Array<number>=[];
 for(let index=0;index<count;index+=stride)kept.push(index);
 const last=count-1;
 if(kept[kept.length-1]!==last){
  if(kept.length>1)kept.pop();
  kept.push(last);
 }
 // Each label stays inside its column; the final column is clipped to the plot's
 // right edge so a remainder column can never push the label past the viewBox.
 return kept.map(index=>{
  const colStart=left+index*slot;
  const colEnd=Math.min(colStart+column,left+plotSpan);
  const width=Math.max(12,colEnd-colStart);
  return{label:labels[index],x:(colStart+colEnd)/2,anchor:'middle' as const,lines:wrapLabel(labels[index],Math.max(12,width-6),measure,3)};
 });
}
