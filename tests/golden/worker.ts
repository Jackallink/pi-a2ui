import { spawn } from 'node:child_process';
import type { SurfaceMessage, UiDiagnostic } from '../../src/protocol.ts';

export type CompileObservation =
  | { kind: 'accepted'; message: SurfaceMessage }
  | { kind: 'ui-error'; status: number; reason: string; diagnostic?: Readonly<UiDiagnostic> }
  | { kind: 'setup-error' | 'timeout'; detail: string };

// The watchdog runs in this parent; synchronous SDK compilation runs only in its owned child.
export type WorkerRequest = {kind:'compile';source:string} | {kind:'session';caseId:string;ownedRoot:string;fixture:string};
export type SessionObservation = {kind:'session-ok';actualInputHash:string;observation:unknown} | {kind:'session-error';stage:'setup'|'session'|'cleanup';detail:string;actualInputHash?:string};
export type WorkerObservation = CompileObservation | SessionObservation;
export async function runOwnedWorker(request:WorkerRequest,signal?:AbortSignal):Promise<WorkerObservation> {
  return new Promise(resolve => {
    const child = spawn(process.execPath, ['--import', 'tsx', 'tests/golden/case-worker.ts'], {
      cwd: process.cwd(), stdio: ['ignore', 'ignore', 'pipe', 'ipc'],
    });
    let result: WorkerObservation | undefined;
    let invalid = false;
    let timedOut = false;
    let terminate: ReturnType<typeof setTimeout> | undefined;
    let force: ReturnType<typeof setTimeout> | undefined;
    let errors = '';
    const cancel = () => {
      if(timedOut)return;
      timedOut = true;
      if (child.connected) child.send({ kind: 'cancel' });
      terminate = setTimeout(() => {
        child.kill('SIGTERM');
        force = setTimeout(() => child.kill('SIGKILL'), 2000);
      }, 5000);
    };
    const deadline = setTimeout(cancel, 30000);
    signal?.addEventListener('abort',cancel,{once:true});
    child.stderr?.on('data', chunk => { errors = (errors + String(chunk)).slice(0, 8192); });
    child.on('message', value => {
      if(result || !value || typeof value!=='object' || Buffer.byteLength(JSON.stringify(value))>1024*1024 || !('kind' in value)) {invalid=true;child.kill('SIGTERM');return;}
      const item=value as WorkerObservation;
      const valid=item.kind==='accepted'?Array.isArray(item.message?.createSurface?.components)
        :item.kind==='ui-error'?Number.isInteger(item.status)&&typeof item.reason==='string'
        :item.kind==='session-ok'?'observation'in item&&/^[a-f0-9]{64}$/.test(item.actualInputHash)
        :item.kind==='session-error'?['setup','session','cleanup'].includes(item.stage)&&typeof item.detail==='string'
        :item.kind==='setup-error'&&typeof item.detail==='string';
      if(!valid){invalid=true;child.kill('SIGTERM');return;}result=item;
    });
    child.once('error', error => { result = { kind: 'setup-error', detail: error.message }; });
    child.once('close', (code) => {
      clearTimeout(deadline); clearTimeout(terminate); clearTimeout(force);
      signal?.removeEventListener('abort',cancel);
      if (timedOut) resolve({ kind: 'timeout', detail: JSON.stringify({deadline:'Owned case exceeded30s/cancelled',primary:result}) });
      else if (invalid || code !== 0 || !result) resolve({ kind: 'setup-error', detail: errors || `Invalid worker result/exit ${code}` });
      else resolve(result);
    });
    child.once('spawn', () => {child.send(request);if(signal?.aborted)cancel();});
  });
}
export async function compileInOwnedWorker(source:string,signal?:AbortSignal):Promise<CompileObservation> {
  const value=await runOwnedWorker({kind:'compile',source},signal);
  return value.kind==='session-ok'||value.kind==='session-error'?{kind:'setup-error',detail:'Wrong worker operation result'}:value;
}
