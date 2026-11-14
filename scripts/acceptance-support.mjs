import { createConnection } from 'node:net';
import { spawn } from 'node:child_process';
import { readFile, writeFile, readdir, lstat, realpath, mkdir, mkdtemp, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, join, relative, sep, dirname, delimiter, isAbsolute } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
export const MODEL = Object.freeze({ provider: 'volcengine-ark', id: 'glm-5.3-flash', baseUrl: 'https://ark.cn-beijing.volces.com/api/plan/v3' });
export const PI_ENTRY = fileURLToPath(new URL('../node_modules/@earendil-works/pi-coding-agent/dist/bundle/cli.js', import.meta.url));
export const HELP = 'Usage: node scripts/live-acceptance.mjs --package ABS_PATH --expected-version EXACT [--mode startup|skill|component] [--allow-model] [--scenario basic|forms|coding|live|workbench] [--evidence-dir PARENT]\nDefaults to startup: normal registration/skill discovery, no inference. skill/component require --allow-model and use only existing AgentPlan glm-5.3-flash. Node24.x only.\n';
export class AcceptanceError extends Error {
    constructor(stage, message, code = 'SETUP', exit = 1) { super(message); this.stage = stage; this.code = code; this.exit = exit; }
}
export function assertNode24(version) {
    if (!/^24\./.test(version))
        throw new AcceptanceError('admission', 'Node24.x is required; run nvm use 24', 'RUNTIME', 2);
}
export function parseOptions(args, env = process.env) {
    if (args.length === 1 && args[0] === '--help')
        return { help: true };
    const options = { mode: 'startup', scenario: 'basic', allowModel: false };
    const seen = new Set();
    const values = new Map([['--package', 'packagePath'], ['--expected-version', 'expectedVersion'], ['--mode', 'mode'], ['--scenario', 'scenario'], ['--evidence-dir', 'evidenceDir']]);
    for (let i = 0; i < args.length; i++) {
        const name = args[i];
        if (seen.has(name))
            throw new AcceptanceError('admission', 'Duplicate arguments: ' + name, 'USAGE', 2);
        seen.add(name);
        if (name === '--allow-model') {
            options.allowModel = true;
            continue;
        }
        const key = values.get(name);
        if (!key || !args[i + 1] || args[i + 1].startsWith('--'))
            throw new AcceptanceError('admission', 'Invalid arguments; use --package and --expected-version (see --help)', 'USAGE', 2);
        options[key] = args[++i];
    }
    if (!options.packagePath || !options.expectedVersion)
        throw new AcceptanceError('admission', 'Explicit --package and --expected-version are required', 'USAGE', 2);
    if (!isAbsolute(options.packagePath))
        throw new AcceptanceError('admission', 'The explicit package path must be absolute', 'USAGE', 2);
    if (!/^\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?$/.test(options.expectedVersion))
        throw new AcceptanceError('admission', 'Expected version must be exact, not a range', 'USAGE', 2);
    if (!['startup', 'skill', 'component'].includes(options.mode))
        throw new AcceptanceError('admission', 'Unknown mode', 'USAGE', 2);
    if (!['basic', 'forms', 'coding', 'live', 'workbench'].includes(options.scenario) || options.mode !== 'component' && seen.has('--scenario'))
        throw new AcceptanceError('admission', 'Scenario is available only for the component mode', 'USAGE', 2);
    if (options.mode === 'startup' && options.allowModel || options.mode !== 'startup' && !options.allowModel)
        throw new AcceptanceError('admission', 'Only skill/component use --allow-model; startup never uses a model', 'USAGE', 2);
    const legacy = Object.keys(env).filter(key => key.startsWith('A2UI_ACCEPT_'));
    if (legacy.length)
        throw new AcceptanceError('admission', 'Legacy acceptance environment arguments are not supported; use explicit CLI options: ' + legacy.join(', '), 'USAGE', 2);
    return options;
}
export function assertModelTuple(state) {
    if (!state?.success || state.data?.model?.provider !== MODEL.provider || state.data?.model?.id !== MODEL.id || state.data?.model?.baseUrl !== MODEL.baseUrl)
        throw new AcceptanceError('model-preflight', 'Resolved model must exactly match the allowed Ark AgentPlan GLM tuple', 'MODEL_IDENTITY');
}
export const contentBlocks = value => Array.isArray(value) ? value.filter(block => block && typeof block === 'object') : [];
export const messageText = message => typeof message?.content === 'string' ? message.content : contentBlocks(message?.content).filter(block => block.type === 'text').map(block => block.text ?? '').join('\n');
export const within = (root, path) => { const diff = relative(root, path); return diff === '' || diff !== '..' && !diff.startsWith('..' + sep) && !diff.startsWith(sep); };
export async function runNode(entry, args, { cwd, env, timeout = 30000 } = {}) {
    const child = spawn(process.execPath, [entry, ...args], { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '', stderr = '', overflow = false;
    const append = (key, chunk) => {
        if (stdout.length + stderr.length + chunk.length > 16 * 1024 * 1024) {
            overflow = true;
            child.kill('SIGTERM');
            return;
        }
        if (key === 'out')
            stdout += chunk;
        else
            stderr += chunk;
    };
    child.stdout.on('data', c => append('out', c));
    child.stderr.on('data', c => append('err', c));
    return await new Promise((res, rej) => {
        const timer = setTimeout(() => { child.kill('SIGKILL'); rej(new AcceptanceError('process', 'Owned command timed out')); }, timeout);
        child.once('error', () => { clearTimeout(timer); rej(new AcceptanceError('process', 'Could not start owned Node process')); });
        child.once('close', (code, signal) => {
            clearTimeout(timer);
            if (overflow)
                rej(new AcceptanceError('process', 'Diagnostic output exceeded acceptance bound'));
            else
                res({ stdout, stderr, code, signal });
        });
    });
}
async function fileHash(path) { return createHash('sha256').update(await readFile(path)).digest('hex'); }
export async function packageFingerprint(root, metadata) {
    const entries = new Map();
    let bytes = 0;
    async function visit(path) {
        const info = await lstat(path);
        if (info.isSymbolicLink())
            throw new AcceptanceError('identity', 'Package payload symlink is not supported for acceptance identity');
        if (info.isDirectory()) {
            for (const name of (await readdir(path)).sort())
                await visit(join(path, name));
            return;
        }
        if (!info.isFile())
            throw new AcceptanceError('identity', 'Package payload must contain ordinary files');
        if (entries.size >= 512 || (bytes += info.size) > 32 * 1024 * 1024)
            throw new AcceptanceError('identity', 'Package payload fingerprint bound exceeded');
        entries.set(relative(root, path), await fileHash(path));
    }
    for (const name of ['package.json', ...(metadata.files ?? [])]) {
        const path = resolve(root, name);
        if (!within(root, path) || ['.local', '.pi', '.git', 'node_modules'].includes(name.split(/[\/]/)[0]))
            throw new AcceptanceError('identity', 'Invalid package payload manifest path');
        await visit(path);
    }
    try {
        await visit(join(root, 'package-lock.json'));
    }
    catch (error) {
        if (error.code !== 'ENOENT')
            throw error;
    }
    return createHash('sha256').update(JSON.stringify([...entries].sort(([a], [b]) => a.localeCompare(b)))).digest('hex');
}
export async function operatorFingerprint(cwd) {
    const entries = [];
    for (const name of ['package.json', 'package-lock.json', '.pi/settings.json', '.a2ui-acceptance-sentinel'])
        try {
            entries.push([name, await fileHash(join(cwd, name))]);
        }
        catch (error) {
            if (error.code !== 'ENOENT')
                throw error;
        }
    return createHash('sha256').update(JSON.stringify(entries)).digest('hex');
}
export async function admitPackage(options, operatorCwd) {
    let root, metadata;
    try {
        root = await realpath(resolve(options.packagePath));
        metadata = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
    }
    catch {
        throw new AcceptanceError('identity', 'Cannot read the explicit package manifest');
    }
    if (metadata.name !== 'pi-a2ui' || metadata.version !== options.expectedVersion)
        throw new AcceptanceError('identity', 'Explicit package name/version does not match the requested pi-a2ui version', 'PACKAGE_IDENTITY');
    if (!Array.isArray(metadata.files) || !metadata.pi?.extensions?.includes('./extension.ts') || !metadata.pi?.skills?.includes('./skills'))
        throw new AcceptanceError('identity', 'Package does not declare the expected extension and skill');
    const helper = join(root, 'skills/pi-a2ui/scripts/a2ui.mjs');
    for (const name of ['extension.ts', 'skills/pi-a2ui/SKILL.md', 'skills/pi-a2ui/scripts/a2ui.mjs', 'dist/assistant-cli.mjs']) {
        try {
            if (!(await lstat(join(root, name))).isFile())
                throw new Error();
        }
        catch {
            throw new AcceptanceError('identity', 'Required packaged extension/skill/helper file is missing');
        }
    }
    const fingerprint = await packageFingerprint(root, metadata);
    return { root, metadata, helper, fingerprint };
}
export async function verifyHelper(identity, run) {
    const result = await runNode(identity.helper, ['catalog'], { cwd: run, env: runtimeEnv(run, process.env, { offline: true }), timeout: 10000 });
    let catalog;
    try {
        catalog = JSON.parse(result.stdout);
    }
    catch {
        throw new AcceptanceError('identity', 'Installed helper did not return catalog identity');
    }
    if (result.code !== 0 || catalog.packageVersion !== identity.metadata.version || typeof catalog.catalogId !== 'string' || !Array.isArray(catalog.components))
        throw new AcceptanceError('identity', 'Installed helper package/catalog identity mismatch', 'PACKAGE_IDENTITY');
    if (await packageFingerprint(identity.root, identity.metadata) !== identity.fingerprint)
        throw new AcceptanceError('identity', 'Package changed during read-only helper validation');
    identity.catalog = catalog;
    return catalog;
}
async function canonicalDestination(path) {
    const tail = [];
    let cursor = resolve(path);
    for (;;) {
        try {
            return join(await realpath(cursor), ...tail.reverse());
        }
        catch (error) {
            if (error.code !== 'ENOENT')
                throw new AcceptanceError('admission', 'Cannot resolve the requested evidence location', 'USAGE', 2);
        }
        const parent = dirname(cursor);
        if (parent === cursor)
            throw new AcceptanceError('admission', 'Cannot resolve the requested evidence location', 'USAGE', 2);
        tail.push(cursor.slice(parent.length + (parent.endsWith(sep) ? 0 : 1)));
        cursor = parent;
    }
}
export async function validateEvidenceParent(options, identity, operatorCwd) {
    const parent = await canonicalDestination(options.evidenceDir ?? tmpdir());
    const protectedPaths = [identity.root, ...await Promise.all(['.pi', 'package.json', 'package-lock.json', '.a2ui-acceptance-sentinel'].map(name => canonicalDestination(join(operatorCwd, name))))];
    if (protectedPaths.some(path => within(path, parent)))
        throw new AcceptanceError('admission', 'Evidence location overlaps a read-only package or protected operator path', 'USAGE', 2);
    return parent;
}
export async function createRun(parent) {
    process.umask(0o077);
    const dir = parent ? resolve(parent) : tmpdir();
    if (parent)
        await mkdir(dir, { recursive: true });
    const root = await mkdtemp(join(dir, 'pi-a2ui-accept-'));
    return await realpath(root);
}
export class StageReport {
    constructor(root, identity) { this.root = root; this.data = { ...identity, passed: false, stages: [], observed: {} }; }
    async save() { await writeFile(join(this.root, 'report.tmp'), JSON.stringify(this.data, null, 2), { mode: 0o600 }); await rename(join(this.root, 'report.tmp'), join(this.root, 'result.json')); }
    async step(name, fn) {
        const record = { name, status: 'running' };
        this.data.stages.push(record);
        await this.save();
        try {
            const value = await fn();
            record.status = 'passed';
            await this.save();
            return value;
        }
        catch (error) {
            record.status = 'failed';
            this.data.failedStage ??= name;
            record.error = error instanceof AcceptanceError ? error.message : 'Acceptance stage failed; inspect private diagnostics';
            this.data.error ??= record.error;
            try {
                await writeFile(join(this.root, `stage-${this.data.stages.length}-error.log`), String(error instanceof Error ? (error.stack ?? error.message) : error).slice(0, 8192), { mode: 0o600 });
            }
            catch { /* Retain the original stage failure even when diagnostic writing fails. */ }
            await this.save();
            throw error;
        }
    }
}
export async function stopChild(child) {
    if (!child.pid || child.exitCode !== null || child.signalCode !== null)
        return true;
    const waitExit = ms => new Promise(res => {
        const done = () => { clearTimeout(timer); child.removeListener('exit', done); res(true); };
        const timer = setTimeout(() => { child.removeListener('exit', done); res(false); }, ms);
        child.once('exit', done);
        if (child.exitCode !== null || child.signalCode !== null)
            done();
    });
    child.stdin?.end();
    if (await waitExit(5000))
        return true;
    child.kill('SIGTERM');
    if (await waitExit(2000))
        return true;
    child.kill('SIGKILL');
    return await waitExit(2000);
}
export class RpcProcess {
    constructor(entry, args, { cwd, env }) {
        this.child = spawn(process.execPath, [entry, ...args], { cwd, env, stdio: ['pipe', 'pipe', 'pipe'] });
        this.events = [];
        this.stdout = '';
        this.stderr = '';
        this.pending = '';
        this.exited = false;
        this.watchers = new Set();
        this.failed = false;
        this.child.stdin.on('error', () => {
            this.failed = true;
            for (const w of this.watchers)
                w();
        });
        this.child.on('error', () => {
            this.failed = true;
            if (!this.child.pid)
                this.exited = true;
            for (const w of this.watchers)
                w();
        });
        const collect = (key, chunk) => {
            if (this.stdout.length + this.stderr.length + chunk.length > 16 * 1024 * 1024) {
                this.failed = true;
                this.child.kill('SIGTERM');
                for (const w of this.watchers)
                    w();
                return;
            }
            this[key] += chunk;
            if (key !== 'stdout')
                return;
            this.pending += chunk;
            while (this.pending.includes('\n')) {
                const at = this.pending.indexOf('\n'), line = this.pending.slice(0, at);
                this.pending = this.pending.slice(at + 1);
                try {
                    const event = JSON.parse(line);
                    if (event && typeof event === 'object' && !Array.isArray(event)) {
                        this.events.push(event);
                        for (const w of this.watchers)
                            w();
                    }
                }
                catch { }
            }
        };
        this.child.stdout.on('data', c => collect('stdout', c));
        this.child.stderr.on('data', c => collect('stderr', c));
        this.child.on('exit', () => {
            this.exited = true;
            for (const w of this.watchers)
                w();
        });
    }
    send(value) {
        if (this.exited || this.failed)
            throw new AcceptanceError('rpc', 'Pi is unavailable');
        this.child.stdin.write(JSON.stringify(value) + '\n');
    }
    wait(predicate, after = 0, timeout = 30000) {
        return new Promise((res, rej) => {
            const check = () => {
                const e = this.events.slice(after).find(predicate);
                if (e) {
                    clearTimeout(timer);
                    this.watchers.delete(check);
                    res(e);
                }
                else if (this.exited || this.failed) {
                    clearTimeout(timer);
                    this.watchers.delete(check);
                    rej(new AcceptanceError('rpc', 'Pi exited or failed before expected response'));
                }
            };
            const timer = setTimeout(() => { this.watchers.delete(check); rej(new AcceptanceError('rpc', 'Pi RPC/agent stage timed out')); }, timeout);
            this.watchers.add(check);
            check();
        });
    }
    async command(id, type, extra = {}) {
        this.send({ id, type, ...extra });
        const response = await this.wait(e => e.type === 'response' && e.id === id);
        if (!response.success)
            throw new AcceptanceError('rpc', 'Pi RPC command failed: ' + type);
        return response;
    }
    async close(root) {
        const exited = await stopChild(this.child);
        await writeFile(join(root, 'rpc.json'), JSON.stringify(this.events), { mode: 0o600 });
        await writeFile(join(root, 'pi-stdout.log'), this.stdout, { mode: 0o600 });
        await writeFile(join(root, 'pi-stderr.log'), this.stderr, { mode: 0o600 });
        if (!exited)
            throw new AcceptanceError('cleanup', 'Owned Pi process did not exit');
        return true;
    }
}
export function runtimeEnv(run, base = process.env, { offline = false, agentDir } = {}) {
    const env = { ...base };
    for (const key of Object.keys(env))
        if (key.startsWith('A2UI_ACCEPT_') || key.startsWith('PI_A2UI_ACCEPT_'))
            delete env[key];
    env.PI_OFFLINE = '1';
    env.PATH = [dirname(process.execPath), join(run, 'bin'), base.PATH ?? ''].join(delimiter);
    env.PI_A2UI_ACCEPT_CWD_RECEIPT = join(run, 'child-runtime.jsonl');
    const modules = [...(offline ? [fileURLToPath(new URL('./acceptance-network-guard.mjs', import.meta.url))] : []), fileURLToPath(new URL('./acceptance-runtime-probe.mjs', import.meta.url))];
    env.NODE_OPTIONS = modules.map(path => '--import=' + pathToFileURL(path).href).join(' ');
    if (agentDir)
        env.PI_CODING_AGENT_DIR = agentDir;
    return env;
}
export async function checkChildRuntime(run, pid) {
    const canonicalRun = await realpath(run);
    let rows;
    try {
        rows = (await readFile(join(run, 'child-runtime.jsonl'), 'utf8')).trim().split('\n').map(line => JSON.parse(line));
    }
    catch {
        throw new AcceptanceError('identity', 'Missing actual child runtime/cwd observations');
    }
    if (!rows.some(row => row.pid === pid) || rows.some(row => !/^v24\./.test(row.node) || !within(canonicalRun, resolve(row.cwd))))
        throw new AcceptanceError('identity', 'A child used a non-Node24 runtime or cwd outside the owned run');
    return { observedNodeProcesses: rows.length, allNode24: true, allCwdWithinOwnedRun: true };
}
export async function requireListenerClosed(origin) {
    const url = new URL(origin);
    if (url.hostname !== '127.0.0.1' || url.protocol !== 'http:')
        throw new AcceptanceError('cleanup', 'Unexpected listener identity');
    const closed = await new Promise(resolve => { const socket = createConnection({ host: url.hostname, port: Number(url.port) }); const finish = value => { socket.destroy(); resolve(value); }; socket.once('connect', () => finish(false)); socket.once('error', error => finish(error.code === 'ECONNREFUSED')); socket.setTimeout(1500, () => finish(false)); });
    if (!closed)
        throw new AcceptanceError('cleanup', 'Owned canvas listener is still reachable or closure is unverified');
    return true;
}
export async function cleanupOwned(tasks, { timeoutMs = 15000 } = {}) {
    const stages = [];
    let firstError;
    for (const [name, action] of tasks) {
        let timer;
        try {
            await Promise.race([Promise.resolve().then(action), new Promise((_, reject) => { timer = setTimeout(() => reject(new AcceptanceError('cleanup', 'Owned cleanup deadline exceeded')), timeoutMs); })]);
            stages.push({ name, status: 'passed' });
        }
        catch (error) {
            firstError ??= error;
            stages.push({ name, status: 'failed', error: error instanceof AcceptanceError ? error.message : 'Owned cleanup failed; inspect private diagnostics' });
        }
        finally {
            clearTimeout(timer);
        }
    }
    return { stages, firstError };
}
