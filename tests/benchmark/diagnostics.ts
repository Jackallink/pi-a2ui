import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compile} from '../../src/compiler.ts';
import {UiError, type SurfaceMessage} from '../../src/protocol.ts';

type FamilyId = 'reserved-event-key' | 'coding-record-context';
type Stage = 'setup' | 'negative' | 'doc-contract' | 'compile' | 'semantic';
export interface Family {
  id: FamilyId;
  positiveFixture: string;
  negativeFixture: string;
  expected: {status:number; reasonIncludes:string; diagnostic:Record<string,string>};
  doc: {path:string; heading:string; anchor:string; marker:string};
  positiveOracle: 'literal-file-context' | 'all-declared-button-record-ids';
}
export interface Registry {schemaVersion:1; profile:'v0.1.7-dx-v1'; families:Family[]}
export class BenchmarkFailure extends Error {
  constructor(public readonly stage:Stage, public readonly familyId:string, location:string, cause:unknown) {
    super(`${familyId}: ${stage}: ${location}: ${cause instanceof Error ? cause.message : String(cause)}`, {cause});
  }
}
function checked<T>(stage:Stage, familyId:string, location:string, operation:()=>T):T {
  try {return operation();} catch(error) {throw new BenchmarkFailure(stage, familyId, location, error);}
}
function exactObject(value:unknown, keys:string[]):asserts value is Record<string,unknown> {
  assert.ok(value !== null && typeof value === 'object' && !Array.isArray(value), 'expected an object');
  assert.deepEqual(Object.keys(value).sort(), [...keys].sort(), 'unexpected or missing fields');
}
const docPath = 'skills/pi-a2ui/references/syntax-and-errors.md';
const routes = {
  'reserved-event-key': {heading:'Repair a literal filename', anchor:'repair-a-literal-filename', oracle:'literal-file-context'},
  'coding-record-context': {heading:'Extend a review surface', anchor:'extend-a-review-surface', oracle:'all-declared-button-record-ids'},
} as const;
export function validateRegistry(value:unknown):Registry {
  return checked('setup', 'registry', 'tests/benchmark/diagnostics.json', () => {
    exactObject(value, ['schemaVersion','profile','families']);
    assert.equal(value.schemaVersion, 1);
    assert.equal(value.profile, 'v0.1.7-dx-v1');
    assert.ok(Array.isArray(value.families));
    const ids:string[] = [];
    for (const family of value.families) {
      exactObject(family, ['id','positiveFixture','negativeFixture','expected','doc','positiveOracle']);
      assert.ok(family.id === 'reserved-event-key' || family.id === 'coding-record-context', 'unknown family');
      const id = family.id;
      ids.push(id);
      assert.equal(family.positiveFixture, `tests/benchmark/diagnostics/${id}-positive.express`);
      assert.equal(family.negativeFixture, `tests/benchmark/diagnostics/${id}-negative.express`);
      assert.equal(family.positiveOracle, routes[id].oracle);
      exactObject(family.doc, ['path','heading','anchor','marker']);
      assert.deepEqual(family.doc, {path:docPath, heading:routes[id].heading, anchor:routes[id].anchor, marker:`<!-- benchmark-diagnostic:${id} -->`});
      exactObject(family.expected, ['status','reasonIncludes','diagnostic']);
      assert.equal(family.expected.status, 400);
      assert.ok(typeof family.expected.reasonIncludes === 'string' && family.expected.reasonIncludes.length > 0);
      const expectedLocation:Record<string,string> = {surfaceId:'diagnostic',componentId:'inspect',componentType:'Button',propertyPath:'/action/event/context'};
      if (id === 'reserved-event-key') Object.assign(expectedLocation, {propertyPath:'/action/event/context/path',forbiddenKey:'path'});
      assert.deepEqual(family.expected.diagnostic, expectedLocation);
    }
    assert.deepEqual(ids.sort(), ['coding-record-context','reserved-event-key'], 'exactly two unique registered families are required');
    return value as unknown as Registry;
  });
}
export function loadRegistry():Registry {
  return checked('setup', 'registry', 'tests/benchmark/diagnostics.json', () =>
    validateRegistry(JSON.parse(readFileSync('tests/benchmark/diagnostics.json', 'utf8'))));
}
// Fixed intended values are independent of registry error expectations and compiler output.
const oracles:Record<Family['positiveOracle'], (message:SurfaceMessage)=>void> = {
  'literal-file-context'(message) {
    const buttons = message.createSurface.components.filter(component => component.component === 'Button');
    assert.equal(buttons.length, 1);
    assert.deepEqual(buttons[0].action, {event:{name:'inspect_file',context:{file:'src/example.ts'}}});
  },
  'all-declared-button-record-ids'(message) {
    const components = message.createSurface.components;
    const diffs = components.filter(component => component.component === 'CodeDiff');
    const results = components.filter(component => component.component === 'TestResults');
    const buttons = components.filter(component => component.component === 'Button');
    assert.equal(diffs.length, 1); assert.equal(results.length, 1); assert.equal(buttons.length, 2);
    assert.equal(diffs[0].proposalId, 'proposal-example');
    assert.equal(results[0].resultId, 'result-example');
    assert.equal(results[0].command, 'example only');
    assert.equal(results[0].evidence, 'Illustrative fixture, not an executed test');
    assert.deepEqual(results[0].summary, {pass:0,fail:0,skip:1,error:0});
    const cases = results[0].cases as Array<{status:string}>;
    assert.equal(cases.length, 1); assert.equal(cases[0].status, 'skip');
    const events = buttons.map(button => (button.action as {event:{name:string;context:unknown}}).event);
    assert.deepEqual(events.map(event => event.name).sort(), ['question','review']);
    for (const event of events) assert.deepEqual(event.context, {proposalId:'proposal-example',resultId:'result-example'});
  },
};
export function verifyFixturePair(family:Family, readText:(path:string)=>string = path => readFileSync(path, 'utf8')):void {
  checked('setup', family.id, family.positiveFixture, () => oracles[family.positiveOracle](compile('diagnostic', readText(family.positiveFixture))));
  const source = checked('setup', family.id, family.negativeFixture, () => readText(family.negativeFixture));
  let rejection:UiError|undefined;
  try {compile('diagnostic', source);} catch(error) {
    if (!(error instanceof UiError)) throw new BenchmarkFailure('setup', family.id, family.negativeFixture, error);
    rejection = error;
  }
  checked('negative', family.id, family.negativeFixture, () => {
    assert.ok(rejection instanceof UiError, 'negative fixture was accepted');
    assert.equal(rejection.status, family.expected.status);
    assert.ok(rejection.reason.includes(family.expected.reasonIncludes), `unexpected reason: ${rejection.reason}`);
    for (const [key,value] of Object.entries(family.expected.diagnostic)) assert.equal(rejection.diagnostic?.[key as keyof typeof rejection.diagnostic], value, key);
  });
}
export function documentSource(family:Family, markdown:string):string {
  return checked('doc-contract', family.id, family.doc.path, () => {
    const lines = markdown.split(/\r?\n/);
    const visible:Array<{line:number;text:string}> = [];
    const blocks:Array<{line:number;language:string;source:string}> = [];
    for (let line = 0; line < lines.length; line++) {
      const fence = lines[line].match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
      if (!fence) {visible.push({line,text:lines[line]}); continue;}
      const start = line, language = fence[2].trim();
      for (line++; line < lines.length; line++) {
        const close = lines[line].match(/^ {0,3}(`{3,}|~{3,})[ \t]*$/);
        if (close && close[1][0] === fence[1][0] && close[1].length >= fence[1].length) break;
      }
      assert.ok(line < lines.length, 'unclosed fence');
      blocks.push({line:start,language,source:lines.slice(start+1,line).join('\n')});
    }
    const headings = visible.flatMap(({line,text}) => {
      const heading = text.match(/^ {0,3}(#{1,6})[ \t]+(.+?)\s*#*\s*$/);
      return heading ? [{line,level:heading[1].length,title:heading[2]}] : [];
    });
    const matches = headings.filter(heading => heading.level === 2 && heading.title === family.doc.heading);
    assert.equal(matches.length, 1, 'expected one repair heading');
    const start = matches[0];
    const end = headings.find(heading => heading.line > start.line && heading.level <= start.level)?.line ?? lines.length;
    const markers = visible.filter(({text}) => text.trim() === family.doc.marker);
    assert.equal(markers.length, 1, 'expected one outside-fence diagnostic marker');
    assert.ok(markers[0].line > start.line && markers[0].line < end, 'marker must belong to its repair section');
    const block = blocks.find(block => block.line > markers[0].line && block.line < end);
    assert.ok(block && ['text','express'].includes(block.language), 'expected a complete text/express example in the same section');
    return block.source;
  });
}
export function verifyDocumentation(family:Family, markdown:string):void {
  const source = documentSource(family, markdown);
  let message:SurfaceMessage;
  try {message = compile('diagnostic', source);} catch(error) {
    throw new BenchmarkFailure(error instanceof UiError ? 'compile' : 'setup', family.id, family.doc.path, error);
  }
  checked('semantic', family.id, family.doc.path, () => oracles[family.positiveOracle](message));
}
