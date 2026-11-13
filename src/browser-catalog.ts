import {basicCatalog,type WebComponentImplementation} from '@a2ui/web_core/v1_0';
import {catalogs} from './catalog.js';
import {LogViewElement,ChartElement} from './live-elements.js';
import {CodeDiffElement,TestResultsElement} from './coding-elements.js';
const elements:Record<string,CustomElementConstructor>={CodeDiff:CodeDiffElement,TestResults:TestResultsElement,LogView:LogViewElement,Chart:ChartElement};
export const browserCatalogs=catalogs.map(catalog=>basicCatalog.derive({catalogId:catalog.id,functions:[],instructions:catalog.instructions,components:[...catalog.components.values()].map(api=>{
 const builtin=basicCatalog.components.get(api.name);
 if(builtin)return {...api,tagName:builtin.tagName,element:builtin.element};
 const element=elements[api.name];
 if(!element)throw new Error('Missing browser implementation: '+api.name);
 return {...api,element,tagName:({CodeDiff:'pi-a2ui-code-diff',TestResults:'pi-a2ui-test-results',LogView:'pi-a2ui-log-view',Chart:'pi-a2ui-chart'} as Record<string,string>)[api.name]} satisfies WebComponentImplementation;
})}));
