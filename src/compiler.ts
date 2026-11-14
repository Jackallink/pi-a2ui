import {validateWorkbench} from './workbench.ts';
import { A2uiGenerator, CatalogConfig, ExpressFormatFactory, RendererState } from '@a2ui/agent';
import { inputPaths, validateInputs } from './inputs.ts';
import { validateLive } from './live.ts';
import { validateCoding } from './coding.ts';
import { workbenchCatalog, catalogs } from './catalog.ts';
import { LIMITS, UiError, type Component, type SurfaceMessage } from './protocol.ts';

export function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}
export function exactKeys(value: Record<string, unknown>, required: string[], optional: string[] = []): void {
  if (required.some(key => !Object.hasOwn(value, key)) || Object.keys(value).some(key => !required.includes(key) && !optional.includes(key))) throw new UiError(400, 'Unexpected or missing fields');
}
export function boundedJson(value: unknown, bytes = LIMITS.snapshotBytes): void {
  const ancestors = new Set<object>();
  let entries = 0;
  function visit(item: unknown, depth: number): void {
    if (++entries > 4096) throw new UiError(413, 'JSON total entries limit exceeded');
    if (typeof item === 'string' && Buffer.byteLength(item, 'utf8') > bytes) throw new UiError(413, 'JSON byte limit exceeded');
    if (depth > LIMITS.depth) throw new UiError(413, 'JSON nesting exceeds limit');
    if (item === null || typeof item === 'string' || typeof item === 'boolean' || (typeof item === 'number' && Number.isFinite(item))) return;
    if (!Array.isArray(item) && !record(item)) throw new UiError(400, 'Expected JSON data');
    if ((Array.isArray(item) ? item.length : Object.keys(item).length) > 256) throw new UiError(413, 'JSON collection cardinality limit exceeded');
    if (ancestors.has(item)) throw new UiError(400, 'Cyclic JSON data');
    ancestors.add(item);
    for (const [key, child] of Object.entries(item)) {
      if (['__proto__', 'prototype', 'constructor'].includes(key)) throw new UiError(400, 'Unsafe data key');
      visit(child, depth + 1);
    }
    ancestors.delete(item);
  }
  visit(value, 0);
  if (Buffer.byteLength(JSON.stringify(value), 'utf8') > bytes) throw new UiError(413, 'JSON byte limit exceeded');
}
export function isBinding(value: unknown): value is { '@path': string } {
  return record(value) && Object.keys(value).length === 1 && typeof value['@path'] === 'string' && /^(?:\/(?:[^~/\x00-\x1f\x7f]|~[01])+)+$/.test(value['@path']);
}
function noExpressions(value: unknown): void {
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    if (key === 'checks' || key === 'path' || key.startsWith('@') && key !== '@path' || key === 'call' || key === 'callFunction') throw new UiError(400, 'Executable expressions and checks are unavailable');
    if (key === '@path' && !isBinding(value)) throw new UiError(400, 'Only absolute data bindings are supported');
    noExpressions(child);
  }
}
function processor(surfaceId: string) {
  return new A2uiGenerator([new CatalogConfig(workbenchCatalog)], undefined, new ExpressFormatFactory({ surfaceId })).createProcessor({ '1.0': { supportedCatalogIds: [workbenchCatalog.id] } });
}
export function promptSnippet(): string {
  const sdk = processor('surface').promptSnippet
    .replace(/IMPORTANT:.*\n\n/, '')
    .replace('Use these exact positional signatures to instantiate components. Do not output property keys:', 'These signatures show property order. Named arguments are supported and recommended when optional properties are skipped:')
    .replace(/^(7|9|11|12)\. [\s\S]*?(?=^\d+\. |^## )/gm, '')
    .replace(/## Positional Function Signatures[\s\S]*?(?=## Catalog Instructions)/, '')
    .replace(/   Prefix relative list scopes.*\n   A lone.*\n/, '')
    .replace(/While simple Markdown formatting.*presentation\./, 'Text renders literal plain text.')
    .replace(/ or function call/g, '')
    .replace(/, checks\? \(static\)/g, '');
  return 'Pass a complete Express DSL source string to a2ui_render. Source is unwrapped (omit sentinel tags). Use only the requested surfaceId. This MVP forbids functions, validation checks, dynamic templates, deletion, and extra surfaces. Text renders literal plain text.\n\n' + sdk;
}
export function validateSurface(input: unknown): SurfaceMessage {
  try {
    boundedJson(input);
    if (!record(input)) throw new UiError(400, 'Expected surface message');
    exactKeys(input, ['version', 'createSurface']);
    if (input.version !== '1.0' || !record(input.createSurface)) throw new UiError(400, 'Unsupported surface message');
    const create = input.createSurface;
    exactKeys(create, ['surfaceId', 'catalogId', 'components'], ['dataModel']);
    if (typeof create.surfaceId !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(create.surfaceId) || !catalogs.some(catalog=>catalog.id===create.catalogId) || !Array.isArray(create.components) || !create.components.length) throw new UiError(400, 'Invalid surface or empty root');
    if (create.components.length > LIMITS.components) throw new UiError(413, 'Component limit exceeded');
    noExpressions(create);
    for (const component of create.components) {
      if (!record(component) || typeof component.component !== 'string' || !catalogs.find(catalog=>catalog.id===create.catalogId)!.components.has(component.component)) throw new UiError(400, 'Unsupported component');
      if ('children' in component && !Array.isArray(component.children)) throw new UiError(400, 'Dynamic children are unavailable');
    }
    const message = structuredClone(input) as unknown as SurfaceMessage;
    const state = new RendererState(catalogs);
    state.apply(message);
    state.checkTopology([create.surfaceId]);
    const components = new Map(message.createSurface.components.map(component => [component.id, component]));
    const reachable = new Set<string>();
    function walk(id: string, depth: number, insideButton=false): void {
      if (depth > LIMITS.depth) throw new UiError(413, 'Tree depth exceeded');
      if (reachable.has(id)) throw new UiError(400, 'Components must form a tree without repeated children');
      const component = components.get(id);
      if (!component) throw new UiError(400, 'Missing root or child');
      if(insideButton && ['LogView','DataTable','CodeBlock','Details','TaskProgress','Modal','Image','ArtifactPreview','Video','AudioPlayer'].includes(component.component)) throw new UiError(400,component.component+' must not be nested in a Button');
      reachable.add(id);
      const children = component.component==='Modal'?[component.trigger,component.content]:component.component === 'Tabs' && Array.isArray(component.tabs) ? component.tabs.map(tab => (tab as {child:string}).child) : Array.isArray(component.children) ? component.children : typeof component.child === 'string' ? [component.child] : [];
      for (const child of children) {
        if (typeof child !== 'string') throw new UiError(400, 'Expected static child ID');
        walk(child, depth + 1, insideButton || component.component==='Button');
      }
    }
    walk('root', 1);
    if (reachable.size !== components.size) throw new UiError(400, 'Unreachable component');
    const dataModel = state.getSurface(create.surfaceId)!.dataModel;
    function checkBindings(value: unknown): void {
      if (isBinding(value)) {
        // SDK resolution owns decoded-segment safety and container traversal.
        dataModel.get(value['@path']);
      } else if (value && typeof value === 'object') {
        for (const child of Object.values(value)) checkBindings(child);
      }
    }
    checkBindings(message.createSurface.components);
    for (const component of components.values()) {
      const properties = component.component === 'Text' ? ['text'] : component.component === 'TextField' ? ['label', 'value', 'placeholder'] : ['CheckBox','ChoicePicker','Slider','DateTimeInput'].includes(component.component) ? ['label'] : [];
      const strings: Array<[string, unknown]> = properties.map(property => [property, component[property]]);
      if (component.component==='Tabs') for (const tab of component.tabs as Array<{title:unknown}>) strings.push(['tabs.title',tab.title]);
      if (component.component==='ChoicePicker') for (const option of component.options as Array<{label:unknown}>) strings.push(['options.label',option.label]);
      if (record(component.accessibility)) {
        strings.push(['accessibility.label', component.accessibility.label], ['accessibility.description', component.accessibility.description]);
      }
      for (const [property, binding] of strings) {
        if (isBinding(binding) && typeof dataModel.get(binding['@path']) !== 'string') throw new UiError(400, `Bound ${component.component}.${property} must resolve to an initialized string`);
      }
    }
    validateInputs(components.values(), path => dataModel.get(path));
    const fields = inputPaths(components.values());
    for (const component of components.values()) {
      if (component.component !== 'Button') continue;
      const action = component.action;
      if (!record(action) || !record(action.event)) throw new UiError(400, 'Only event actions are supported');
      exactKeys(action, ['event']);
      exactKeys(action.event, ['name'], ['context']);
      const context = action.event.context ?? {};
      if (!record(context)) throw new UiError(400, 'Expected event context');
      for (const value of Object.values(context)) {
        if (isBinding(value)) {
          if (!fields.has(value['@path'])) throw new UiError(400, 'Context must bind to a reachable input');
        } else if (JSON.stringify(value).includes('"@path"')) throw new UiError(400, 'Nested context bindings are unavailable');
      }
    }
    validateCoding(message);
    validateLive(message);
    validateWorkbench(message);
    return message;
  } catch (error) {
    if (error instanceof UiError) throw error;
    throw new UiError(400, 'Invalid A2UI surface: ' + (error instanceof Error ? error.message : 'validation failed'));
  }
}
// Bound parser work before entering the SDK. Quoted content is one lexical unit.
function preflightSource(source: string): void {
  let tokens = 0;
  const delimiters: string[] = [];
  for (let index = 0; index < source.length;) {
    if (/\s/.test(source[index])) { index++; continue; }
    if (source[index] === '#' || source.startsWith('//', index)) {
      while (index < source.length && source[index] !== '\n' && source[index] !== '\r') index++;
      continue;
    }
    if (source.startsWith('/*', index)) {
      const end = source.indexOf('*/', index + 2);
      if (end < 0) throw new UiError(400, 'Unterminated source comment');
      index = end + 2;
      continue;
    }
    if (++tokens > 4096) throw new UiError(413, 'Source token limit exceeded');
    if (source[index] === '"') {
      const triple = source.startsWith('"""', index);
      const delimiter = triple ? '"""' : '"';
      const raw = index > 0 && /[rR]/.test(source[index - 1]);
      index += delimiter.length;
      while (index < source.length) {
        if (!raw && source[index] === '\\') { index += 2; continue; }
        if (source.startsWith(delimiter, index)) { index += delimiter.length; break; }
        index++;
      }
    } else if ('([{'.includes(source[index])) {
      delimiters.push(source[index]);
      if (delimiters.length > 64) throw new UiError(413, 'Source delimiter nesting limit exceeded');
      index++;
    } else if (')]}'.includes(source[index])) {
      if (delimiters.pop() !== '([{'.charAt(')]}'.indexOf(source[index]))) throw new UiError(400, 'Unmatched source delimiter');
      index++;
    } else if (/[A-Za-z0-9_.~@-]/.test(source[index])) {
      do { index++; } while (index < source.length && /[A-Za-z0-9_.~@-]/.test(source[index]));
    } else index++;
  }
}
export function compile(surfaceId: string, source: string): SurfaceMessage {
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(surfaceId)) throw new UiError(400, 'Invalid surface ID');
  if (typeof source !== 'string' || !source.trim()) throw new UiError(400, 'Source must be nonempty');
  if (Buffer.byteLength(source, 'utf8') > LIMITS.sourceBytes) throw new UiError(413, 'Source byte limit exceeded');
  preflightSource(source);
  try {
    const state = new RendererState([workbenchCatalog]);
    const parts = processor(surfaceId).parseResponse(source, { wrapped: false, state });
    let creates = 0;
    for (const part of parts) {
      if (part.type !== 'a2ui') throw new UiError(400, 'Expected only UI content');
      for (const message of part.a2ui) {
        const wire = message as unknown as Record<string, any>;
        const command = wire.createSurface ?? wire.updateComponents ?? wire.updateDataModel;
        if (!command || command.surfaceId !== surfaceId) throw new UiError(400, 'Only the requested surface may be changed');
        if (wire.createSurface) creates++;
      }
    }
    if (creates !== 1 || state.surfaceIds.length !== 1 || state.surfaceIds[0] !== surfaceId) throw new UiError(400, 'Exactly one complete surface is required');
    state.checkTopology([surfaceId]);
    const surface = state.getSurface(surfaceId)!;
    const message:SurfaceMessage={version:'1.0',createSurface:{surfaceId,catalogId:workbenchCatalog.id,components:[...surface.componentsModel.getAll().values()].map(component=>component.componentTree as Component),dataModel:surface.dataModel.get('/')}};
    validateLive(message,true);
    validateWorkbench(message,true);
    return validateSurface(message);
  } catch (error) {
    if (error instanceof UiError) throw error;
    throw new UiError(400, 'Invalid Express source: ' + (error instanceof Error ? error.message : 'compilation failed'));
  }
}
