import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { evaluateCompiler } from './golden/compiler.ts';
import { compileInOwnedWorker } from './golden/worker.ts';

for (const [id, from, to] of [['C04', 'src/example.ts', 'src/other.ts'], ['C25', 'value=4', 'value=5']]) {
  test(`BM2 evaluator intent canary ${id}: legal wrong intent must fail semantic`, async () => {
    const original = readFileSync(`tests/golden/fixtures/${id}.express`, 'utf8');
    assert.ok(original.includes(from), 'complete fixture supports the declared fault');
    const changed = original.replace(from, to);
    const precondition = await compileInOwnedWorker(changed);
    assert.equal(precondition.kind, 'accepted', 'canary source is legal to the real compiler');
    const row = JSON.parse(readFileSync('tests/golden/cases.json','utf8')).cases.find((row:{id:string}) => row.id === id);
    const result = await evaluateCompiler(row, changed);
    assert.equal(result.failedStage, 'semantic');
  });
}
