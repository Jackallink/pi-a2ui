import type{Catalog,ComponentApi}from'@a2ui/web_core/v1_0';
import{APPROVED_ICON_NAMES}from'./workbench.js';
import{authoringParameters,expressCause}from'./authoring-policy.js';
export interface AuthoringExample{name:string;requires:string[]}
export type DiagnosticCode='USAGE'|'RUNTIME'|'LOOKUP'|'INPUT'|'COMPILE';
const core='references/core-components.md',coding='references/coding-and-live.md',workbench='references/workbench-components.md',artifacts='references/artifacts.md';
const input='Initialize a typed value. For interactive submission use an initialized absolute value binding and bind it directly in Event context; legacy literal initialization remains supported where the compiler permits it.';
const layout='Static reachable component children in one root tree; no dynamic templates. Keep existing component/depth/source/session budgets.';
const native='Native tool events only: author stream="tools" and omit state, counters, text, timing and omission fields. No fabricated execution. Live updates between successful tool-result checkpoints are not separately durable.';
const notes:Record<string,{reference:string;notes:string[]}>= {
 Text:{reference:core,notes:['Literal escaped plain text; Text does not render Markdown or HTML. Use MarkdownView for its limited safe Markdown subset.']},
 Column:{reference:core,notes:[layout]},Row:{reference:core,notes:[layout]},Card:{reference:core,notes:[layout,'child is a component reference or nested component, not a title string.']},
 Button:{reference:core,notes:['Use action=Event with literal event name and literal JSON or direct initialized input value bindings. Functions are unavailable; event context follows the committed definition. Never put interactive widgets inside Button.']},
 TextField:{reference:core,notes:[input,'value is a string; initialized value is required even though the SDK marks it optional.']},
 CheckBox:{reference:core,notes:[input,'value is boolean; checked state is not an execution permission.']},
 ChoicePicker:{reference:core,notes:[input,'Static allowed options and typed string-array selection, subset of declared values; mutually-exclusive mode accepts at most one. Basic filterable search stays local.']},
 Slider:{reference:core,notes:[input,'Finite numeric value in a static min/max/steps range.']},
 DateTimeInput:{reference:core,notes:[input,'Set enableDate/enableTime explicitly and use local YYYY-MM-DD, HH:mm or YYYY-MM-DDTHH:mm matching those flags; optional :00 seconds. Static bounds; no timezone/RFC3339-offset advice.']},
 Tabs:{reference:core,notes:[layout,'Static title/child entries; tab navigation stays local and preserves current drafts.']},Divider:{reference:core,notes:['Local layout separator; no event or model request.']},
 CodeDiff:{reference:coding,notes:['Bounded immutable proposalId/source records, read-only comparison. Declared follow-up Buttons carry the current literal proposalId; a source path is reported intent, not browser read permission.']},
 TestResults:{reference:coding,notes:['Supplied test records/provenance are reported evidence, not proof of execution. Immutable resultId and consistent counts; follow-up Buttons carry the current literal resultId.']},
 LogView:{reference:coding,notes:[native,'Bounded native log window; omitted earlier output stays marked.']},
 Chart:{reference:coding,notes:['Static finite aligned line/bar series only. Use a2ui_update_chart for data-only updates without replacing layout/drafts; no invented measurements or executable data binding.']},
 DataTable:{reference:workbench,notes:['Static bounded columns/rows with unique IDs, primitive cells and one cell per column. Sorting/filtering are browser-local, not remote queries or templates.']},
 CodeBlock:{reference:workbench,notes:['Literal escaped code up to16KiB/512lines; copy is local, never execute contents. No nesting inside Button.']},
 MarkdownView:{reference:workbench,notes:['Explicit limited safe Markdown subset up to16KiB/512lines; no HTML, links or images. Text remains literal.']},
 Details:{reference:workbench,notes:[layout,'Local disclosure with title/child/open. Multiple Details compose an accordion; do not nest in Button.']},
 StatusBadge:{reference:workbench,notes:['Status/provenance supplied by Pi is reported, not independent verification. Native TaskProgress is the real tool lifecycle alternative.']},
 TaskProgress:{reference:workbench,notes:[native,'Counts actual tracked native events, not an invented planned percentage; at most one per surface.']},
 List:{reference:workbench,notes:[layout,'children is a static component list, never a template object or _template helper.']},
 Modal:{reference:workbench,notes:['Local dialog: trigger is Text or Icon; at most one Modal per surface, no nested Modal or interactive Button ancestor. All hidden content still validates.']},
 Icon:{reference:workbench,notes:['Static approved local names only: '+APPROVED_ICON_NAMES.join(', ')+'. No remote icon fetch.']},
 Image:{reference:artifacts,notes:['url must be the exact opaque src registered by a2ui_register_artifact in this session. No external/file/data/blob/SVG source; description is static.']},
 Video:{reference:artifacts,notes:['url and optional posterUrl must be exact session-registered opaque artifact refs; supported WebM/MP4 depends on browser decoding. No external/file/data/blob/SVG, autoplay or microphone.']},
 AudioPlayer:{reference:artifacts,notes:['url must be exact session-registered opaque artifact src, supported WAV with browser decoding. No external/file/data/blob sources, autoplay or microphone.']},
 ArtifactPreview:{reference:artifacts,notes:['Use the exact src/kind returned by a2ui_register_artifact; immutable session copy, not an arbitrary path/URL. Pause/reset/restore expiry may show Unavailable; label is not verified metadata.']},
 SearchablePicker:{reference:'references/navigation-and-selection.md',notes:['Initialized absolute string-array value binding is required; static label/unique-value options up to200, declared subset/single-or-multiple selection only. Query is local and never submitted as free text; retained choices remain removable.']},
 FormValidation:{reference:'references/summaries-and-feedback.md',notes:['Stable explicit input/Button IDs, distinct bound field paths and direct coverage of every ruled path in every guarded Button context. required/minLength/maxLength only, typed constraints still apply. Client/server repeat validation; invalid business draft may render but invalid guarded submit dispatches nothing. Not execution authorization.']},
 ActivityTimeline:{reference:'references/timeline-and-evidence.md',notes:[native,'At most32 retained current-run rows with explicit omission. No model-authored entries/outcomes/durations; at most one per surface.']},
};
export function componentGuidance(catalog:Catalog<ComponentApi>,name:string,examples:AuthoringExample[]){
 const api=catalog.components.get(name),policy=notes[name];if(!api||!policy)throw new Error('Unknown component or authoring policy; use catalog for actual types and patterns for compositions');
 return {name,parameters:authoringParameters(api),notes:policy.notes,examples:examples.filter(example=>example.requires.includes(name)).map(example=>example.name),reference:policy.reference};
}
export function cliDiagnostic(error:unknown,code:DiagnosticCode,catalog?:Catalog<ComponentApi>,examples:AuthoringExample[]=[]){
 const message=error instanceof Error?error.message:String(error);let hint=code==='LOOKUP'?'Use catalog, component NAME, examples or patterns to select an actual supported item.':code==='INPUT'?'Read one regular UTF8 Express file without BOM, within32KiB, or pipe it to check using -.':code==='USAGE'?'Use --help for command names and exact arguments.':code==='RUNTIME'?'Select Node24.x with nvm use 24, then run the installed helper.':'Use an unmodified matching example, adapt named arguments, then check the complete source again. No automatic repair or retry.';
 const result:{error:string;code:DiagnosticCode;hint:string;reference:string;component?:string;allowedProperties?:string[];examples?:string[]}={error:message,code,hint,reference:code==='COMPILE'?'references/syntax-and-errors.md':'references/helper.md'};
 const cause=expressCause(error);
 if(code==='COMPILE'&&cause&&catalog){
  result.component=cause.compName;
  if(catalog.components.has(cause.compName)){const guidance=componentGuidance(catalog,cause.compName,examples);result.allowedProperties=guidance.parameters.map(p=>p.name);result.examples=guidance.examples;result.hint='Use component '+cause.compName+' for named parameters/project notes, or example '+(guidance.examples[0]??'user-form')+'; then check the corrected complete source.';}
  else result.hint='That name is not a component in this helper catalog. Use catalog for actual names or patterns/examples for compositions; do not invent a constructor.';
 }
 if(code==='COMPILE'&&message==='Executable expressions and checks are unavailable')result.hint='Executable checks/functions are unavailable. Use FormValidation for declared required/minLength/maxLength rules, then check the source.';
 return result;
}
export const AUTHORING_RESTRICTIONS=Object.freeze(['Named arguments only in this authoring reference; no positional constructor signature is implied.','No executable checks, functions or dynamic templates; interactive widgets cannot be inside Button.','Helper-local metadata does not certify a different running Pi, live capacity or reported execution; actual check/tool validation remains authoritative.']);
