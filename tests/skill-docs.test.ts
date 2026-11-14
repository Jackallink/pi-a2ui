import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {join, resolve, dirname} from 'node:path';
import {tmpdir} from 'node:os';
import {compile} from '../src/compiler.ts';
const skillDir = resolve('skills/pi-a2ui');
const skill = readFileSync(join(skillDir, 'SKILL.md'), 'utf8');
test('A03 the first skill recipe produces exact tool arguments for the known template from a different cwd', () => {
  const recipe = skill.match(/```sh\n([\s\S]*?)```/)?.[1];
  assert.ok(recipe, 'skill must contain an executable fast path');
  const cwd = mkdtempSync(join(tmpdir(), 'a2ui skill recipe '));
  try {
    writeFileSync(join(cwd,'form.express'),'USER-OWNED-SOURCE');
    const command = recipe.replaceAll('<absolute-skill-path>', skillDir);
    const r = spawnSync('/bin/sh', ['-eu', '-c', command], {cwd, env: process.env, encoding:'utf8', timeout:10000});
    assert.equal(r.status, 0, r.stderr);
    assert.equal(readFileSync(join(cwd,'form.express'),'utf8'),'USER-OWNED-SOURCE','documented recipe must preserve existing project files');
    const args = JSON.parse(r.stdout);
    assert.deepEqual(Object.keys(args).sort(), ['source', 'surfaceId']);
    assert.equal(args.surfaceId, 'form');
    const compiled = compile(args.surfaceId, args.source);
    assert.ok(compiled.createSurface.components.some(c => c.component === 'FormValidation'));
  } finally {rmSync(cwd, {recursive:true, force:true});}
});
test('A03 skill inline Express and local reference links remain executable/resolvable', () => {
  for (const block of skill.matchAll(/```text\n([\s\S]*?)```/g)) if (block[1].includes('root =')) assert.doesNotThrow(() => compile('inline', block[1]));
  const paths = ['SKILL.md', ...['helper', 'syntax-and-errors', 'core-components', 'workbench-components', 'coding-and-live', 'artifacts', 'navigation-and-selection', 'summaries-and-feedback', 'keyboard-actions', 'timeline-and-evidence'].map(name=>'references/'+name+'.md')];
  for (const file of paths) for (const link of readFileSync(join(skillDir,file),'utf8').matchAll(/\]\(([^)]+)\)/g)) {
    if (/^(https?:|#)/.test(link[1])) continue;
    assert.ok(existsSync(resolve(dirname(join(skillDir,file)),link[1].split('#')[0])), `${file}: ${link[1]}`);
  }
});
