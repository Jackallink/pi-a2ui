import {A2uiLitElement,basicCatalog,type ComponentApi} from '@a2ui/web_core/v1_0';
import {html,css,nothing} from 'lit';
import {artifactPreviewApi} from './workbench.js';
const kinds:Record<string,string[]>={image:['image/png','image/jpeg','image/webp'],video:['video/webm','video/mp4'],audio:['audio/wav']};
export class ArtifactPreviewElement extends A2uiLitElement<typeof artifactPreviewApi>{
 private source='';private expectedKind='';private request?:AbortController;private artifactMeta?:{name:string;mime:string;size:number};private state='Loading artifact';
 createRenderRoot(){return this;}
 static styles=css`:host{display:block}section{border:1px solid #cbd5e1;border-radius:8px;padding:.7em}`;
 updated(){const p=this.controller.props;if(p&&(p.src!==this.source||p.kind!==this.expectedKind)){this.source=p.src;this.expectedKind=p.kind;void this.load(p.src,p.kind);}}
 disconnectedCallback(){this.request?.abort();this.source='';super.disconnectedCallback();}
 private async load(src:string,kind:string){this.request?.abort();const request=new AbortController();this.request=request;this.artifactMeta=undefined;this.state='Loading artifact';this.requestUpdate();try{const response=await fetch(src,{method:'HEAD',credentials:'same-origin',signal:request.signal});if(!response.ok)throw new Error();const mime=response.headers.get('content-type')??'';const size=Number(response.headers.get('content-length'));const name=decodeURIComponent(response.headers.get('x-a2ui-artifact-name')??'');if(!kinds[kind]?.includes(mime)||!Number.isSafeInteger(size)||size<1||!name)throw new Error();if(this.request!==request||request.signal.aborted)return;this.artifactMeta={mime,size,name};this.state='Registered in this Pi session';}catch{if(this.request!==request||request.signal.aborted)return;this.state='Unavailable: artifact expired, busy or unsupported';}this.requestUpdate();}
 render(){const p=this.controller.props;if(!p)return nothing;return html`<section aria-label="Artifact preview"><h3>${p.label}</h3><p role="status">${this.state}</p>${this.artifactMeta?html`<p>${this.artifactMeta.name} · ${this.artifactMeta.mime} · ${this.artifactMeta.size} bytes</p>`:nothing}</section>`;}
}
const imageApi=basicCatalog.components.get('Image')! as ComponentApi;
export class ImageElement extends A2uiLitElement<typeof imageApi>{
 private failed=false;private source='';createRenderRoot(){return this;}
 static styles=css`:host{display:block}img{max-width:100%;max-height:32em;display:block}`;
 willUpdate(changed:Map<PropertyKey,unknown>){super.willUpdate(changed);const p=this.controller.props;if(p&&p.url!==this.source){this.source=p.url;this.failed=false;}}
 disconnectedCallback(){this.querySelector('img')?.removeAttribute('src');super.disconnectedCallback();}
 render(){const p=this.controller.props;if(!p)return nothing;return this.failed?html`<p role="status">Unavailable: image could not be displayed</p>`:html`<img src=${p.url} alt=${p.description??'Image artifact'} style=${'object-fit:'+(p.fit??'contain')} @error=${()=>{this.failed=true;this.requestUpdate();}}>`;}
}
