import { compileInOwnedWorker } from './worker.ts';
import { readFileSync } from 'node:fs';

// Constructed first adapter: deliberately checks legality only, before adding intent checks.
export async function evaluateCompiler(row: {fixture:string; expected:unknown}, sourceOverride?:string) {
  const source = sourceOverride ?? readFileSync(row.fixture, 'utf8');
  const observation = await compileInOwnedWorker(source);
  return { pass: observation.kind === 'accepted', failedStage: observation.kind === 'accepted' ? null : 'compile', observation };
}
