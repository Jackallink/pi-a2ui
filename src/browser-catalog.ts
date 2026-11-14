import {ArtifactPreviewElement,ImageElement,VideoElement,AudioElement} from './artifact-elements.js';
import {StatusBadgeElement,TaskProgressElement} from './status-elements.js';
import {DetailsElement,ModalElement,IconElement} from './detail-elements.js';
import {CodeBlockElement,MarkdownElement} from './text-elements.js';
import {DataTableElement} from './table-elements.js';
import {basicCatalog,type WebComponentImplementation} from '@a2ui/web_core/v1_0';
import {catalogs} from './catalog.js';
import {LogViewElement,ChartElement} from './live-elements.js';
import {CodeDiffElement,TestResultsElement} from './coding-elements.js';
const elements:Record<string,CustomElementConstructor>={Video:VideoElement,AudioPlayer:AudioElement,ArtifactPreview:ArtifactPreviewElement,Image:ImageElement,Modal:ModalElement,Icon:IconElement,StatusBadge:StatusBadgeElement,TaskProgress:TaskProgressElement,Details:DetailsElement,CodeBlock:CodeBlockElement,MarkdownView:MarkdownElement,DataTable:DataTableElement,CodeDiff:CodeDiffElement,TestResults:TestResultsElement,LogView:LogViewElement,Chart:ChartElement};
export const browserCatalogs=catalogs.map(catalog=>basicCatalog.derive({catalogId:catalog.id,functions:[],instructions:catalog.instructions,components:[...catalog.components.values()].map(api=>{
 const builtin=basicCatalog.components.get(api.name);
 if(builtin&&!['Modal','Icon','Image','Video','AudioPlayer'].includes(api.name))return {...api,tagName:builtin.tagName,element:builtin.element};
 const element=elements[api.name];
 if(!element)throw new Error('Missing browser implementation: '+api.name);
 return {...api,element,tagName:({Video:'pi-a2ui-video',AudioPlayer:'pi-a2ui-audio',ArtifactPreview:'pi-a2ui-artifact-preview',Image:'pi-a2ui-image',Modal:'pi-a2ui-modal',Icon:'pi-a2ui-icon',StatusBadge:'pi-a2ui-status-badge',TaskProgress:'pi-a2ui-task-progress',Details:'pi-a2ui-details',CodeBlock:'pi-a2ui-code-block',MarkdownView:'pi-a2ui-markdown',DataTable:'pi-a2ui-data-table',CodeDiff:'pi-a2ui-code-diff',TestResults:'pi-a2ui-test-results',LogView:'pi-a2ui-log-view',Chart:'pi-a2ui-chart'} as Record<string,string>)[api.name]} satisfies WebComponentImplementation;
})}));
