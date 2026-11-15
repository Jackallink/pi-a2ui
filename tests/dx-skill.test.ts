import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compile} from '../src/compiler.ts';
import {UiError} from '../src/protocol.ts';

const review=readFileSync('skills/pi-a2ui/examples/review.express','utf8');
function reviewWithExtra(context:string){
  return `extra = Button(child=Text(text="Inspect file"),action=Event("inspect",${context}))\n`+review.replace(/\n\]\)\s*$/,',\n  extra\n])');
}
function documentedSource(heading:string){
  const guide=readFileSync('skills/pi-a2ui/references/syntax-and-errors.md','utf8');
  const section=guide.split(`## ${heading}\n`)[1]?.split('\n## ')[0];
  const source=section?.match(/```text\n([\s\S]*?)\n```/)?.[1];
  assert.ok(source,`missing executable reference example: ${heading}`);return source;
}

test('DX38 an additional declared Button on the review surface needs both literal IDs',()=>{
  assert.throws(()=>compile('review',reviewWithExtra('{file:"src/example.ts"}')),(error:unknown)=>{
    assert.ok(error instanceof UiError);assert.equal(error.diagnostic?.componentId,'extra');
    assert.match(error.reason,/Coding actions must reference current literal record IDs.*proposalId, resultId/);return true;
  });
  const message=compile('review',reviewWithExtra('{file:"src/example.ts",proposalId:"proposal-example",resultId:"result-example"}'));
  assert.deepEqual(message.createSurface.components.find(c=>c.id==='extra')?.action,{event:{name:'inspect',context:{file:'src/example.ts',proposalId:'proposal-example',resultId:'result-example'}}});
  // Template test records remain explicitly illustrative and skipped.
  const results=message.createSurface.components.find(c=>c.component==='TestResults')!;
  assert.equal(results.evidence,'Illustrative fixture, not an executed test');
  assert.deepEqual(results.summary,{pass:0,fail:0,skip:1,error:0});
});

test('DX38 documented filename repair compiles and delivers file rather than a reserved path key',()=>{
  const source=documentedSource('Repair a literal filename');
  const message=compile('inspect',source);
  assert.deepEqual(message.createSurface.components.find(c=>c.id==='inspect')?.action,{event:{name:'inspect_file',context:{file:'src/example.ts'}}});
  assert.throws(()=>compile('inspect',source.replace('file:', 'path:')),(error:unknown)=>error instanceof UiError&&error.diagnostic?.forbiddenKey==='path'&&error.diagnostic.componentId==='inspect');
});

test('DX38 documented review extension has two valid Buttons and preserves record provenance',()=>{
  const source=documentedSource('Extend a review surface');
  const message=compile('review',source);
  const buttons=message.createSurface.components.filter(c=>c.component==='Button');
  assert.equal(buttons.length,2);
  for(const button of buttons){
    const event=(button.action as {event:{context:unknown}}).event;
    assert.deepEqual(event.context,{proposalId:'proposal-example',resultId:'result-example'});
  }
  const results=message.createSurface.components.find(c=>c.component==='TestResults')!;
  assert.equal(results.evidence,'Illustrative fixture, not an executed test');
  assert.deepEqual(results.summary,{pass:0,fail:0,skip:1,error:0});
});

test('DX38 visible-case summaries accept128 matching rows and reject hidden totals or129 rows',()=>{
  const report=(count:number,passed=count)=>`root = TestResults(resultId="bounded",command="illustrative only",evidence="Synthetic boundary fixture; no command executed",cases=${JSON.stringify(Array.from({length:count},(_,i)=>({id:'c'+i,name:'Case '+i,status:'pass'})))},summary={pass:${passed},fail:0,skip:0,error:0})`;
  assert.equal(compile('cases',report(128)).createSurface.components[0].component,'TestResults');
  assert.throws(()=>compile('cases',report(1,2)),/Test summary does not match case records/);
  assert.throws(()=>compile('cases',report(1,166)),/128/);
  assert.throws(()=>compile('cases',report(129)),/128/);
});
