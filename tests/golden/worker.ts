import { spawn } from 'node:child_process';
import type { SurfaceMessage, UiDiagnostic } from '../../src/protocol.ts';

export type CompileObservation =
  | { kind: 'accepted'; message: SurfaceMessage }
  | { kind: 'ui-error'; status: number; reason: string; diagnostic?: Readonly<UiDiagnostic> }
  | { kind: 'setup-error' | 'timeout'; detail: string };

// The watchdog runs in this parent; synchronous SDK compilation runs only in its owned child.
export async function compileInOwnedWorker(source: string): Promise<CompileObservation> {
  return new Promise(resolve => {
    const child = spawn(process.execPath, ['--import', 'tsx', 'tests/golden/case-worker.ts'], {
      cwd: process.cwd(), stdio: ['ignore', 'ignore', 'pipe', 'ipc'],
    });
    let result: CompileObservation | undefined;
    let timedOut = false;
    let terminate: ReturnType<typeof setTimeout> | undefined;
    let force: ReturnType<typeof setTimeout> | undefined;
    let errors = '';
    const deadline = setTimeout(() => {
      timedOut = true;
      if (child.connected) child.send({ kind: 'cancel' });
      terminate = setTimeout(() => {
        child.kill('SIGTERM');
        force = setTimeout(() => child.kill('SIGKILL'), 2000);
      }, 5000);
    }, 30000);
    child.stderr?.on('data', chunk => { errors = (errors + String(chunk)).slice(0, 8192); });
    child.on('message', value => { result = value as CompileObservation; });
    child.once('error', error => { result = { kind: 'setup-error', detail: error.message }; });
    child.once('close', (code) => {
      clearTimeout(deadline); clearTimeout(terminate); clearTimeout(force);
      if (timedOut) resolve({ kind: 'timeout', detail: 'Owned compile work exceeded 30s' });
      else if (code !== 0 || !result) resolve({ kind: 'setup-error', detail: errors || `Worker exit ${code}` });
      else resolve(result);
    });
    child.once('spawn', () => child.send({ kind: 'compile', source }));
  });
}
