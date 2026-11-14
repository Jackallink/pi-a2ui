import {basicCatalog,type WebComponentImplementation} from '@a2ui/web_core/v1_0';
import {catalogs} from './catalog.js';
import {CodeDiffElement,TestResultsElement} from './coding-elements.js';
const elements:Record<string,CustomElementConstructor>={CodeDiff:CodeDiffElement,TestResults:TestResultsElement};
export const browserCatalogs=catalogs.map(catalog=>basicCatalog.derive({catalogId:catalog.id,functions:[],instructions:catalog.instructions,components:[...catalog.components.values()].map(api=>{
 const builtin=basicCatalog.components.get(api.name);
 if(builtin)return {...api,tagName:builtin.tagName,element:builtin.element};
 const element=elements[api.name];
 if(!element)throw new Error('Missing browser implementation: '+api.name);
 return {...api,element,tagName:api.name==='CodeDiff'?'pi-a2ui-code-diff':'pi-a2ui-test-results'} satisfies WebComponentImplementation;
})}));
