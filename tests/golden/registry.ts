import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { lstatSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';

export const PROFILE = 'v0.1.8-golden-v2';
const expectedSchema = z.object({
  outcome: z.enum(['accepted', 'rejected']), oracle: z.string().optional(),
  subject: z.object({ id: z.string(), component: z.string(), values: z.record(z.unknown()) }).strict().optional(),
  componentCount: z.number().int().positive().optional(), texts: z.array(z.string()).optional(),
  dataModel: z.record(z.unknown()).optional(), status: z.number().int().optional(),
  reasonIncludes: z.string().min(1).optional(), diagnostic: z.record(z.string()).optional(),
}).strict();
const caseSchema = z.object({
  id: z.string(), contractVersion: z.literal(PROFILE), contractKey: z.string(), intent: z.string().min(1),
  layer: z.enum(['compiler', 'session', 'browser']), polarity: z.enum(['positive', 'negative']),
  fixture: z.string(), controlFixture: z.string().nullable(), initialState: z.object({ kind: z.literal('none') }).strict(),
  steps: z.array(z.object({ op: z.enum(['compiler', 'session', 'browser']), caseId: z.string() }).strict()).length(1),
  expected: expectedSchema, reference: z.object({ source: z.string().min(1) }).strict(),
}).strict();
export type GoldenCase = z.infer<typeof caseSchema>;
export type Stage = 'setup' | 'compile' | 'semantic' | 'session' | 'interaction' | 'cleanup';
export class GoldenFailure extends Error {
  constructor(readonly stage: Stage, message: string) { super(message); }
}
export const sha256 = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');
export function canonical(value: unknown): string {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + canonical((value as Record<string,unknown>)[key])).join(',') + '}';
  return JSON.stringify(value);
}
export function fixtureBytes(path: string,root=process.cwd()): Buffer {
  assert.match(path, /^tests\/golden\/fixtures\/[A-Za-z0-9-]+\.(express|json|png)$/);
  const base=realpathSync(root);
  for (const segment of ['tests', 'tests/golden', 'tests/golden/fixtures', path]) {
    assert.equal(lstatSync(resolve(base,segment)).isSymbolicLink(), false, `symlink forbidden: ${segment}`);
  }
  const full=resolve(base,path);
  assert.ok(lstatSync(full).isFile(), 'fixture must be a regular file');
  assert.equal(realpathSync(full), full, 'fixture realpath must remain contained');
  const bytes = readFileSync(full); assert.ok(bytes.length <= 256 * 1024, 'fixture byte budget'); return bytes;
}
export function validateRegistry(input: unknown): GoldenCase[] {
  try {
    const value = z.object({ schemaVersion: z.literal(1), profile: z.literal(PROFILE), cases: z.array(caseSchema).length(68) }).strict().parse(input);
    const matrix = JSON.parse(readFileSync('tests/golden/matrix.json', 'utf8')) as Array<Pick<GoldenCase,'id'|'contractKey'|'layer'|'polarity'>>;
    assert.equal(matrix.length,68);
    assert.equal(new Set(value.cases.map(row => row.id)).size,68,'unique IDs');
    assert.equal(new Set(value.cases.map(row => row.contractKey)).size,68,'unique contract keys');
    assert.deepEqual(value.cases.map(({ id, contractKey, layer, polarity }) => ({ id, contractKey, layer, polarity })).sort((a,b)=>a.id.localeCompare(b.id)),matrix);
    const sourceHashes = new Set<string>();
    for (const row of value.cases) {
      assert.deepEqual(row.steps,[{op:row.layer,caseId:row.id}]);
      assert.equal(row.fixture,`tests/golden/fixtures/${row.id}.${row.layer==='compiler'?'express':'json'}`);
      const source = fixtureBytes(row.fixture);
      assert.equal(row.expected.outcome,row.polarity==='positive'?'accepted':'rejected');
      if (row.layer === 'compiler') {
        assert.ok(!sourceHashes.has(sha256(source)),'compiler cases must have distinct complete inputs'); sourceHashes.add(sha256(source));
        if (row.polarity === 'positive') { assert.ok(row.expected.subject); assert.equal(row.controlFixture,null); }
        else {
          assert.ok(row.expected.status && row.expected.reasonIncludes);
          assert.equal(row.controlFixture,`tests/golden/fixtures/${row.id}-control.express`); fixtureBytes(row.controlFixture!);
        }
      } else { assert.equal(row.controlFixture,null); assert.equal(row.expected.oracle,row.contractKey); }
    }
    return value.cases;
  } catch (error) { throw new GoldenFailure('setup',`Invalid golden registry: ${String(error)}`); }
}
export const loadCases = () => validateRegistry(JSON.parse(readFileSync('tests/golden/cases.json','utf8')));
export function datasetHash(): string {
  const names = readdirSync('tests/golden/fixtures').sort();
  const files = Object.fromEntries(names.map(name => {
    const path = 'tests/golden/fixtures/'+name; return [path,sha256(fixtureBytes(path))];
  }));
  return sha256(canonical({registry:JSON.parse(readFileSync('tests/golden/cases.json','utf8')),matrix:JSON.parse(readFileSync('tests/golden/matrix.json','utf8')),files}));
}
export interface CaseResult {
  id: string; layer: GoldenCase['layer']; polarity: GoldenCase['polarity'];
  pass: boolean; failedStage: Stage | null; detail?: string; observation?: unknown;
  fixtureHash: string; actualInputHash: string; canary: boolean;
}
export function caseResult(row:GoldenCase, source:string|Buffer, fields:Pick<CaseResult,'pass'|'failedStage'> & Partial<Pick<CaseResult,'detail'|'observation'>>):CaseResult {
  const fixtureHash=sha256(fixtureBytes(row.fixture));
  return {id:row.id,layer:row.layer,polarity:row.polarity,fixtureHash,actualInputHash:sha256(source),canary:sha256(source)!==fixtureHash,...fields};
}
