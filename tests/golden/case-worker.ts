import { compile } from '../../src/compiler.ts';
import { UiError } from '../../src/protocol.ts';
import type { CompileObservation } from './worker.ts';

process.once('message', (input: unknown) => {
  let result: CompileObservation;
  try {
    if (!input || typeof input !== 'object' || !('kind' in input) || input.kind !== 'compile'
      || !('source' in input) || typeof input.source !== 'string' || Buffer.byteLength(input.source) > 32768) {
      throw new Error('Invalid fixed worker request');
    }
    result = { kind: 'accepted', message: compile('golden', input.source) };
  } catch (error) {
    result = error instanceof UiError
      ? { kind: 'ui-error', status: error.status, reason: error.reason, diagnostic: error.diagnostic }
      : { kind: 'setup-error', detail: error instanceof Error ? error.message : String(error) };
  }
  process.send!(result, () => process.disconnect());
});
