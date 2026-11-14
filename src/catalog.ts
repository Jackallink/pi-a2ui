import { workbenchApis } from './workbench.js';
import { liveApis } from './live.js';
import { codingApis } from './coding.js';
import { basicCatalog, type Catalog, type ComponentApi } from '@a2ui/web_core/v1_0';

// Keep the official implementations; pruning schema alone would not render in Lit.
const official = basicCatalog.derive({
  catalogId: basicCatalog.id,
  components: ['Text', 'Column', 'Row', 'Card', 'Button', 'TextField', 'CheckBox', 'ChoicePicker', 'Slider', 'DateTimeInput', 'Tabs', 'Divider'],
  functions: [],
  instructions: 'Use only the twelve declared components. Text is literal escaped plain text. Use event actions only. No functions, checks, templates, URLs, media or executable expressions. Bind event context only to absolute value paths of reachable inputs. Initialize TextField with strings, CheckBox booleans, Slider bounded finite numbers, ChoicePicker string arrays. Use explicit enableDate/enableTime flags and local YYYY-MM-DD / HH:mm / YYYY-MM-DDTHH:mm date/time strings, optional :00 seconds. Declare static ranges/options.',
});

// Keep document refs/options but strip browser constructors from server APIs.
const base:Catalog<ComponentApi>=official;
export const legacyCatalog=base.derive({catalogId:official.id,functions:[],instructions:official.instructions,components:[...official.components.values()].map(({element:_element,tagName:_tagName,...api})=>api)});
export const codingCatalog=legacyCatalog.derive({catalogId:'https://jackallink.github.io/pi-a2ui/catalogs/coding-v1.json',functions:[],components:[...legacyCatalog.components.values(),...codingApis],instructions:legacyCatalog.instructions?.replace('Use only the twelve declared components.','Use only the declared components/signatures.')+' CodeDiff and TestResults are static read-only records. Each surface has at most one of each; every Button must include current literal proposalId/resultId. IDs are immutable within a session. Test results are supplied tool evidence, not independently certified by the browser.'});
export const restrictedCatalog=codingCatalog.derive({catalogId:'https://jackallink.github.io/pi-a2ui/catalogs/live-v1.json',functions:[],components:[...codingCatalog.components.values(),...liveApis],instructions:codingCatalog.instructions+' LogView(stream="tools") is server-controlled native tool output; omit its text/state/omitted initial values. Never place it inside a Button. Chart supports only static line/bar aligned finite series. Use a2ui_update_chart to update an existing Chart without replacing inputs. No model call per output chunk.'});
export const workbenchCatalog=restrictedCatalog.derive({catalogId:'https://jackallink.github.io/pi-a2ui/catalogs/workbench-v1.json',functions:[],components:[...restrictedCatalog.components.values(),...workbenchApis,...['List'].map(name=>{const {element:_,tagName:__,...api}=basicCatalog.components.get(name)!;return api;})],instructions:restrictedCatalog.instructions+' List has static children. DataTable contains bounded primitive cells and unique row/column IDs. Table sorting and filtering are browser-local.'});
export const catalogs=[legacyCatalog,codingCatalog,restrictedCatalog,workbenchCatalog];
