// #67 render polish (Spec028 / Plan028): fixture and corpus validity guards.
// These tests prove the Gate2 browser spec consumes the same real design
// fixtures and the hand-authored chart oracle; they do not duplicate CSS
// implementation or re-derive tick labels from the formatter.
import{test}from'node:test';
import assert from'node:assert/strict';
import{spawnSync}from'node:child_process';
import{readFileSync,readdirSync}from'node:fs';
import{join} from'node:path';
const fixtureDir='docs/designs/028-render-polish/fixtures';
const corpusPath='docs/designs/028-render-polish/chart-corpus.json';
const runHelper=(args:string[])=>spawnSync(process.execPath,['skills/pi-a2ui/scripts/a2ui.mjs',...args],{encoding:'utf8',timeout:60000});
test('RP design fixtures compile through the real helper and stay single-source',()=>{
 const files=readdirSync(fixtureDir).filter(name=>name.endsWith('.express')).sort();
 assert.equal(files.length,6,'six fixed render-polish fixtures');
 for(const name of files){
  const result=runHelper(['check','--surface-id','rp-fixture',join(fixtureDir,name)]);
  assert.equal(result.status,0,name+' must compile (status '+result.status+'): '+(result.stderr||result.stdout).slice(0,300));
  const parsed=JSON.parse(result.stdout) as{surfaceId:string;source:string};
  assert.deepEqual(Object.keys(parsed).sort(),['source','surfaceId'],'check emits exactly surfaceId+source');
  assert.ok(parsed.source.startsWith('root ')||parsed.source.startsWith('$/'),'fixture source survives unchanged');
 }
});
test('chart corpus stays the hand-authored tick oracle',()=>{
 const corpus=JSON.parse(readFileSync(corpusPath,'utf8')) as{schema:string;cases:Array<{id:string;kind:string;series:Array<{name:string;points:Array<{label:string;value:number}>}>;expectedTickLabels:string[]}>};
 assert.equal(corpus.schema,'rp67-chart-design-corpus-v1');
 assert.equal(corpus.cases.length,11,'eleven hand-authored boundary cases');
 for(const entry of corpus.cases){
  assert.ok(['line','bar'].includes(entry.kind),entry.id+' kind');
  assert.ok(entry.series.length<=4,entry.id+' series bound');
  assert.ok(entry.series.every(series=>series.points.length<=200),entry.id+' points bound');
  const labels=entry.expectedTickLabels;
  assert.equal(new Set(labels).size,labels.length,entry.id+' expected ticks are deduplicated');
  assert.ok(labels.every(label=>label!=='NaN'&&label!=='Infinity'&&label!=='-Infinity'),entry.id+' finite tick oracle');
 }
 const byId=new Map(corpus.cases.map(entry=>[entry.id,entry.expectedTickLabels]));
 assert.deepEqual(byId.get('empty'),[],'empty data stays explicit without fake ticks');
 assert.deepEqual(byId.get('minimum-subnormal'),['0','4.94e-324'],'subnormal mid tick rounds away, not to zero');
 assert.deepEqual(byId.get('maximum-finite'),['0','8.99e+307','1.80e+308'],'exponential(2) covers 1e6+ magnitudes');
});
