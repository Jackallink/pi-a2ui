import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compile} from '../src/compiler.ts';
import {BenchmarkFailure, documentSource, loadRegistry, validateRegistry, verifyFixturePair, verifyDocumentation} from './benchmark/diagnostics.ts';

const registry = loadRegistry();
const guide = readFileSync(registry.families[0].doc.path, 'utf8');
function rejectsAt(stage:BenchmarkFailure['stage'], operation:()=>unknown):void {
  assert.throws(operation, error => {
    assert.ok(error instanceof BenchmarkFailure, 'an arbitrary exception is not a successful canary');
    assert.equal(error.stage, stage);
    return true;
  });
}
function replaced(text:string, from:string, to:string):string {
  assert.ok(text.includes(from), 'canary mutation must actually apply');
  const result = text.replace(from,to);
  assert.notEqual(result,text);
  return result;
}

// These exercise current product rejection and the shipped repair's actual semantics.
// Missing bindings must fail only after complete fixtures have proved runnable.
for (const family of registry.families) {
  test(`BM1 ${family.id}: actual positive and negative fixtures`, () => verifyFixturePair(family));
  test(`BM1 ${family.id}: shipped executable repair`, () => {
    verifyFixturePair(family);
    verifyDocumentation(family, readFileSync(family.doc.path, 'utf8'));
  });
}

// All copies below are in memory. A checker accepting any of these breaks AC003/004.
for (const family of registry.families) {
  test(`BM1 ${family.id}: rejects missing or duplicate document bindings`, () => {
    for (const replacement of ['', `${family.doc.marker}\n${family.doc.marker}`]) {
      const bad = replaced(guide, family.doc.marker, replacement);
      rejectsAt('doc-contract', () => verifyDocumentation(family,bad));
    }
  });
  test(`BM1 ${family.id}: ignores markers and headings inside code fences`, () => {
    const hidden = replaced(guide,family.doc.marker,`\`\`\`text\n${family.doc.marker}\n\`\`\``);
    rejectsAt('doc-contract', () => verifyDocumentation(family,hidden));
    const quotedHeading = guide + `\n~~~~text\n## ${family.doc.heading}\n${family.doc.marker}\n~~~\n~~~~\n`;
    // A shorter tilde fence cannot close the four-character opener.
    verifyDocumentation(family,quotedHeading);
  });
  test(`BM1 ${family.id}: cannot borrow a later section's repair`, () => {
    const source = documentSource(family,guide);
    const noBlock = replaced(guide,`\`\`\`text\n${source}\n\`\`\``,'');
    const borrowed = noBlock + `\n## Unrelated example\n\`\`\`text\n${source}\n\`\`\`\n`;
    rejectsAt('doc-contract', () => verifyDocumentation(family,borrowed));
  });
  test(`BM1 ${family.id}: rejects duplicate headings and misplaced markers`, () => {
    rejectsAt('doc-contract', () => verifyDocumentation(family,guide+`\n## ${family.doc.heading}\n`));
    const moved = replaced(guide,family.doc.marker,'') + `\n## Other\n${family.doc.marker}\n`;
    rejectsAt('doc-contract', () => verifyDocumentation(family,moved));
  });
  test(`BM1 ${family.id}: requires a supported complete example fence`, () => {
    const source = documentSource(family,guide);
    const unsupported = replaced(guide,`\`\`\`text\n${source}`,`\`\`\`json\n${source}`);
    rejectsAt('doc-contract', () => verifyDocumentation(family,unsupported));
    const unclosed = `## ${family.doc.heading}\n${family.doc.marker}\n\`\`\`text\n${source}`;
    rejectsAt('doc-contract', () => verifyDocumentation(family,unclosed));
    const tildeExample = `## ${family.doc.heading}\n${family.doc.marker}\n~~~~express\n${source}\n~~~~~\n`;
    verifyDocumentation(family,tildeExample);
  });
  test(`BM1 ${family.id}: distinguishes an invalid repair from setup failure`, () => {
    const bad = replaced(guide,documentSource(family,guide),'root = Column([');
    rejectsAt('compile', () => verifyDocumentation(family,bad));
  });
  test(`BM1 ${family.id}: accepted negatives and unrelated compiler errors cannot pass`, () => {
    const positive = readFileSync(family.positiveFixture,'utf8');
    for (const negative of [positive,'root = Column([']) {
      rejectsAt('negative', () => verifyFixturePair(family,path => path === family.negativeFixture ? negative : readFileSync(path,'utf8')));
    }
  });
  test(`BM1 ${family.id}: requires the declared rejection facts`, () => {
    for (const expected of [
      {...family.expected,status:403},
      {...family.expected,reasonIncludes:'A different reason'},
      {...family.expected,diagnostic:{...family.expected.diagnostic,componentId:'wrong-owner'}},
    ]) rejectsAt('negative', () => verifyFixturePair({...family,expected}));
  });
  test(`BM1 ${family.id}: missing fixtures remain setup failures`, () => {
    for (const missing of [family.positiveFixture,family.negativeFixture]) {
      rejectsAt('setup', () => verifyFixturePair(family,path => {
        if (path === missing) throw Object.assign(new Error(`Missing fixture: ${path}`),{code:'ENOENT'});
        return readFileSync(path,'utf8');
      }));
    }
  });
  test(`BM1 ${family.id}: invalid positive fixtures cannot masquerade as product negatives`, () => {
    rejectsAt('setup', () => verifyFixturePair(family,path => path === family.positiveFixture ? 'root = Column([' : readFileSync(path,'utf8')));
  });
}

const reserved = registry.families.find(family => family.id === 'reserved-event-key')!;
const coding = registry.families.find(family => family.id === 'coding-record-context')!;
test('BM1 an unrepaired reserved path is a compile failure', () => {
  const source = documentSource(reserved,guide);
  rejectsAt('compile', () => verifyDocumentation(reserved,replaced(guide,source,replaced(source,'{file:','{path:'))));
});
test('BM1 an unrelated Button without the current IDs is a compile failure', () => {
  const source = documentSource(coding,guide);
  const broken = replaced(source,'Event("question",{proposalId:"proposal-example",resultId:"result-example"})','Event("question",{})');
  rejectsAt('compile', () => verifyDocumentation(coding,replaced(guide,source,broken)));
});
test('BM1 compile-valid wrong filename fails the independent semantic oracle', () => {
  const source = documentSource(reserved,guide);
  const wrong = replaced(source,'src/example.ts','src/other.ts');
  assert.doesNotThrow(() => compile('diagnostic',wrong));
  rejectsAt('semantic', () => verifyDocumentation(reserved,replaced(guide,source,wrong)));
  rejectsAt('setup', () => verifyFixturePair(reserved,path => path === reserved.positiveFixture ? wrong : readFileSync(path,'utf8')));
});
test('BM1 compile-valid changed record identity fails the independent semantic oracle', () => {
  const source = documentSource(coding,guide);
  const wrong = source.replaceAll('proposal-example','proposal-other');
  assert.doesNotThrow(() => compile('diagnostic',wrong));
  rejectsAt('semantic', () => verifyDocumentation(coding,replaced(guide,source,wrong)));
});

test('BM1 registry rejects unknown coverage, routes and expectation shapes', () => {
  const [family,other] = registry.families;
  const changedFamily = (change:Record<string,unknown>) => ({...registry,families:[{...family,...change},other]});
  const bad:unknown[] = [
    null, {}, {...registry,schemaVersion:2}, {...registry,profile:'legacy-policy-v1'},
    {...registry,extra:true}, {...registry,families:[]}, {...registry,families:[family]},
    {...registry,families:[family,family]}, changedFamily({id:'unknown'}), changedFamily({extra:true}),
    changedFamily({positiveFixture:'../../private.express'}), changedFamily({negativeFixture:'/tmp/private.express'}),
    changedFamily({positiveOracle:'import-arbitrary-module'}),
    changedFamily({doc:{...family.doc,path:'../private.md'}}), changedFamily({doc:{...family.doc,anchor:'other'}}),
    changedFamily({expected:{...family.expected,status:403}}), changedFamily({expected:{...family.expected,reasonIncludes:''}}),
    changedFamily({expected:{...family.expected,diagnostic:{...family.expected.diagnostic,componentId:'guess'}}}),
  ];
  for (const value of bad) rejectsAt('setup', () => validateRegistry(value));
});
