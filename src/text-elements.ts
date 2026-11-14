import {A2uiLitElement} from '@a2ui/web_core/v1_0';
import {html,css,nothing,type TemplateResult} from 'lit';
import {codeBlockApi,markdownApi} from './workbench.js';
// No HTML parser or unsafeHTML: every source token remains an escaped Lit value.
function inline(text:string):Array<string|TemplateResult>{
 const pattern=/(`[^`\n]+`|\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g;const nodes:Array<string|TemplateResult>=[];let offset=0;
 for(const match of text.matchAll(pattern)){nodes.push(text.slice(offset,match.index));const value=match[0];nodes.push(value.startsWith('`')?html`<code>${value.slice(1,-1)}</code>`:value.startsWith('**')?html`<strong>${value.slice(2,-2)}</strong>`:html`<em>${value.slice(1,-1)}</em>`);offset=match.index!+value.length;}nodes.push(text.slice(offset));return nodes;
}
function markdown(text:string):TemplateResult[]{
 const lines=text.split(/\r\n|\r|\n/);const nodes:TemplateResult[]=[];
 for(let index=0;index<lines.length;){const line=lines[index];
  if(!line.trim()){index++;continue;}
  if(/^```[^`]*$/.test(line)){const code:string[]=[];index++;while(index<lines.length&&!/^```\s*$/.test(lines[index]))code.push(lines[index++]);if(index<lines.length)index++;nodes.push(html`<pre><code>${code.join('\n')}</code></pre>`);continue;}
  const heading=/^(#{1,3}) (.*)$/.exec(line);if(heading){const content=inline(heading[2]);nodes.push(heading[1].length===1?html`<h1>${content}</h1>`:heading[1].length===2?html`<h2>${content}</h2>`:html`<h3>${content}</h3>`);index++;continue;}
  const list=/^(?:[-*] |\d+\. )/.exec(line);if(list){const ordered=/^\d/.test(line);const items:TemplateResult[]=[];const pattern=ordered?/^\d+\. (.*)$/:/^[-*] (.*)$/;while(index<lines.length){const item=pattern.exec(lines[index]);if(!item)break;items.push(html`<li>${inline(item[1])}</li>`);index++;}nodes.push(ordered?html`<ol>${items}</ol>`:html`<ul>${items}</ul>`);continue;}
  const paragraph=[line];index++;while(index<lines.length&&lines[index].trim()&&!/^(?:#{1,3} |```|[-*] |\d+\. )/.test(lines[index]))paragraph.push(lines[index++]);nodes.push(html`<p>${inline(paragraph.join('\n'))}</p>`);
 }return nodes;
}
export class CodeBlockElement extends A2uiLitElement<typeof codeBlockApi>{
 private feedback='';private copying=false;
 createRenderRoot(){return this;}
 static styles=css`:host{display:block}pre{overflow:auto;max-height:28em;white-space:pre;background:#101827;color:#e2e8f0;padding:1em}header{display:flex;gap:1em}`;
 render(){const p=this.controller.props;if(!p)return nothing;return html`<section aria-label="Code block"><header><span>${p.language}</span>${p.copyable?html`<button type="button" ?disabled=${this.copying} @click=${async(e:Event)=>{e.stopPropagation();this.copying=true;this.requestUpdate();try{await navigator.clipboard.writeText(p.code);this.feedback='Copied';}catch{this.feedback='Copy unavailable; select the code manually';}finally{this.copying=false;this.requestUpdate();}}}>Copy code</button>`:nothing}<span role="status">${this.feedback}</span></header><pre><code>${p.code}</code></pre></section>`;}
}
export class MarkdownElement extends A2uiLitElement<typeof markdownApi>{
 createRenderRoot(){return this;}
 static styles=css`:host{display:block}p{white-space:pre-wrap}pre{overflow:auto;max-height:28em;white-space:pre}code{font-family:ui-monospace,monospace}`;
 render(){const p=this.controller.props;return p?html`<article aria-label="Markdown text">${markdown(p.text)}</article>`:nothing;}
}
