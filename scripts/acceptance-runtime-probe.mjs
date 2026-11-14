import { appendFileSync } from 'node:fs';
const path = process.env.PI_A2UI_ACCEPT_CWD_RECEIPT;
if (path)
    appendFileSync(path, JSON.stringify({ pid: process.pid, node: process.version, nodeExecutable: process.execPath, cwd: process.cwd() }) + '\n', { mode: 0o600 });
