import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compile} from '../src/compiler.ts';
import {canonical} from './golden/registry.ts';
import {compareHandoff,requireHandoff} from './benchmark-model/handoff.ts';
import controls from './benchmark-model/fixtures/handoff-v1-lf.json' with {type:'json'};

test('v2 handoff retains an existing exact-source positive control',()=>{
 const input={surfaceId:'bm4',source:'root = Text("A")'};compile(input.surfaceId,input.source);const observation=compareHandoff(input,structuredClone(input));requireHandoff(observation);assert.equal(observation.byteIdentical,true);
});
for(const row of controls.cases)test('v2 actual '+row.id+' terminal LF handoff is compiler-equal and stays eligible',()=>{
 assert.equal(row.checked.source,row.attempted.source+'\n');assert.notEqual(row.checked.source,row.attempted.source);
 assert.equal(canonical(compile('bm4',row.checked.source)),canonical(compile('bm4',row.attempted.source)),'independent actual compiler precondition');
 const original=structuredClone(row.attempted);const observation=compareHandoff(row.checked,row.attempted);requireHandoff(observation);assert.equal(observation.byteIdentical,false);assert.equal(observation.compiledSurfaceEqual,true);assert.deepEqual(row.attempted,original,'candidate source never rewritten');
});
