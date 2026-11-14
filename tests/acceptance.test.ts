import * as requireFs from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
const entry = resolve('scripts/live-acceptance.mjs');
function probe(args: string[]) {
    const cwd = mkdtempSync(join(tmpdir(), 'a2ui-admission-'));
    writeFileSync(join(cwd, 'sentinel.txt'), 'unchanged');
    try {
        const result = spawnSync(process.execPath, [entry, ...args], { cwd, env: { ...process.env, A2UI_ACCEPT_PROVIDER: 'deny-legacy-before-any-model' }, encoding: 'utf8', timeout: 15000 });
        assert.deepEqual(readdirSync(cwd), ['sentinel.txt'], 'admission must not create fixture/session files');
        return result;
    }
    finally {
        rmSync(cwd, { recursive: true, force: true });
    }
}
test('A02 help explains explicit target and opt-in model without evaluating old provider configuration or creating fixtures', () => {
    const r = probe(['--help']);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /--package/);
    assert.match(r.stdout, /--expected-version/);
    assert.match(r.stdout, /startup/);
    assert.match(r.stdout, /--allow-model/);
});
test('A02 incomplete or unknown acceptance arguments fail usage before Pi or fixture/model work', () => {
    for (const args of [[], ['--package'], ['--package', '/missing', '--expected-version', '0.1.6', '--mode', 'unknown'], ['--package', '/missing', '--expected-version', '0.1.6', '--mode', 'skill'], ['/old-positional-package']]) {
        const r = probe(args);
        assert.equal(r.status, 2, r.stderr);
        assert.equal(r.stdout, '');
        const e = JSON.parse(r.stderr);
        assert.equal(e.code, 'USAGE');
        assert.equal(e.stage, 'admission');
        assert.match(e.error, /package|mode|model|arguments|version/);
    }
});
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { createServer } from 'node:net';
const support = await import(new URL('../scripts/acceptance-support.mjs', import.meta.url).href);
const actualPackage = resolve('.');
const actualVersion = JSON.parse(readFileSync('package.json', 'utf8')).version;
function cleanEnv(extra: Record<string, string> = {}) {
    const env = { ...process.env };
    for (const key of Object.keys(env))
        if (key.startsWith('A2UI_ACCEPT_') || key.startsWith('PI_A2UI_ACCEPT_'))
            delete env[key];
    return { ...env, ...extra };
}
function admitted(args: string[], env = cleanEnv(), cwd = process.cwd()) { return spawnSync(process.execPath, [entry, ...args], { cwd, env, encoding: 'utf8', timeout: 30000 }); }
test('A02 old010 target version is rejected before executing its helper or creating evidence', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'a2ui-old-target-'));
    try {
        const pkg = join(cwd, 'old');
        mkdirSync(pkg);
        writeFileSync(join(pkg, 'package.json'), JSON.stringify({ name: 'pi-a2ui', version: '0.1.0' }));
        const evidence = join(cwd, 'evidence');
        const r = admitted(['--package', pkg, '--expected-version', '0.1.6', '--evidence-dir', evidence]);
        assert.equal(r.status, 1, r.stderr);
        assert.equal(JSON.parse(r.stderr).code, 'PACKAGE_IDENTITY');
        assert.equal(r.stdout, '');
        assert.ok(!existsSync(evidence));
        assert.deepEqual(readdirSync(pkg), ['package.json']);
    }
    finally {
        rmSync(cwd, { recursive: true, force: true });
    }
});
test('A02 hostile legacy env cannot widen model/profile/scenario or redirect workspace and never leaks values', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'a2ui-env-'));
    try {
        const evidence = join(cwd, 'evidence');
        const r = admitted(['--package', actualPackage, '--expected-version', actualVersion, '--evidence-dir', evidence], cleanEnv({ A2UI_ACCEPT_WORKSPACE: cwd, A2UI_ACCEPT_RESTORE_ONLY: '1', A2UI_ACCEPT_SCENARIO: 'workbench', A2UI_ACCEPT_PROVIDER_EXTENSION: '/never-print-this-value', A2UI_ACCEPT_MODEL: 'never-print-this-value' }));
        assert.equal(r.status, 2, r.stderr);
        const e = JSON.parse(r.stderr);
        assert.equal(e.stage, 'admission');
        assert.equal(e.code, 'USAGE');
        assert.doesNotMatch(r.stderr, /never-print-this-value/);
        assert.ok(!existsSync(evidence));
    }
    finally {
        rmSync(cwd, { recursive: true, force: true });
    }
});
test('A02 all actual model tuple fields are checked and non24 inputs fail without running another Node version', () => {
    support.assertNode24('24.18.1');
    for (const version of ['22.19.0', '25.0.0', '', '24fake'])
        assert.throws(() => support.assertNode24(version), /Node24/);
    const good = { success: true, data: { model: { provider: 'volcengine-ark', id: 'glm-5.3-flash', baseUrl: 'https://ark.cn-beijing.volces.com/api/plan/v3' } } };
    assert.doesNotThrow(() => support.assertModelTuple(good));
    for (const field of ['provider', 'id', 'baseUrl']) {
        const bad = structuredClone(good);
        (bad.data.model as any)[field] = 'unauthorized-fixture';
        assert.throws(() => support.assertModelTuple(bad), /exactly match/);
    }
    assert.throws(() => support.assertModelTuple({ ...good, success: false }), /exactly match/);
});
test('A02 normal registered startup runs only in a new private cwd with zero inference and preserves operator sentinel', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'a2ui-operator-'));
    try {
        writeFileSync(join(cwd, '.a2ui-acceptance-sentinel'), 'operator-sentinel');
        const r = admitted(['--package', actualPackage, '--expected-version', actualVersion], cleanEnv(), cwd);
        assert.equal(r.status, 0, r.stderr);
        const value = JSON.parse(r.stdout);
        assert.equal(value.mode, 'startup');
        assert.equal(value.passed, true);
        assert.equal(value.observed.normalRegistration, true);
        assert.equal(value.observed.uniqueSkill, true);
        assert.equal(value.observed.modelRequests, 0);
        assert.equal(value.observed.agentRuns, 0);
        assert.equal(value.observed.processExited, true);
        assert.equal(value.observed.privateRegistrationRemoved, true);
        assert.equal(value.observed.allCwdWithinOwnedRun, true);
        assert.equal(value.observed.allNode24, true);
        assert.equal(value.observed.packagePayloadUnchanged, true);
        assert.equal(value.observed.operatorFilesUnchanged, true);
        assert.equal(value.observed.browserObserved, false);
        assert.ok(!Object.hasOwn(value.observed, 'browserErrors'), 'startup did not observe a browser');
        assert.equal(readFileSync(join(cwd, '.a2ui-acceptance-sentinel'), 'utf8'), 'operator-sentinel');
        assert.deepEqual(readdirSync(cwd), ['.a2ui-acceptance-sentinel']);
    }
    finally {
        rmSync(cwd, { recursive: true, force: true });
    }
});
test('A02 phase report retains original failure and observed errors when later cleanup also fails, without raw secret text', async () => {
    const folder = mkdtempSync(join(tmpdir(), 'a2ui-stage-'));
    try {
        const report = new support.StageReport(folder, { mode: 'unit' });
        await report.step('observed', async () => { report.data.observed.browserErrors = 1; });
        await assert.rejects(report.step('metadata', async () => { throw new support.AcceptanceError('metadata', 'Known metadata failure'); }));
        await assert.rejects(report.step('cleanup', async () => { throw new Error('bootstrap#never-print-secret'); }));
        const raw = readFileSync(join(folder, 'result.json'), 'utf8');
        const value = JSON.parse(raw);
        assert.equal(value.failedStage, 'metadata');
        assert.equal(value.error, 'Known metadata failure');
        assert.equal(value.observed.browserErrors, 1);
        assert.equal(value.stages.at(-1).status, 'failed');
        assert.doesNotMatch(raw, /never-print-secret/);
        assert.equal(value.passed, false);
    }
    finally {
        rmSync(folder, { recursive: true, force: true });
    }
});
test('A02 RPC frames fragmented lines while ignoring non-record logs; string and array content are extracted safely', async () => {
    assert.equal(support.messageText({ content: 'literal' }), 'literal');
    assert.equal(support.messageText({ content: [{ type: 'text', text: 'array' }, { type: 'toolCall', name: 'ignored' }] }), 'array');
    assert.equal(support.messageText({ content: null }), '');
    const folder = mkdtempSync(join(tmpdir(), 'a2ui-rpc-'));
    try {
        const fixture = join(folder, 'fixture.mjs');
        writeFileSync(fixture, 'process.stdout.write("log\\nnull\\n[]\\n");let input="";process.stdin.on("data",c=>{input+=c;while(input.includes("\\n")){const n=input.indexOf("\\n"),line=input.slice(0,n);input=input.slice(n+1);const c=JSON.parse(line);const out=JSON.stringify({type:"response",id:c.id,success:true,data:{ready:true}})+"\\n";process.stdout.write(out.slice(0,7));setTimeout(()=>process.stdout.write(out.slice(7)),5);}});process.stdin.on("end",()=>process.exit(0));'.replaceAll('\\\\n', '\\n'));
        const rpc = new support.RpcProcess(fixture, [], { cwd: folder, env: cleanEnv() });
        try {
            const response = await rpc.command('one', 'get_state');
            assert.equal(response.data.ready, true);
            assert.equal(rpc.events.length, 1);
        }
        finally {
            assert.equal(await rpc.close(folder), true);
            assert.equal(rpc.exited, true);
        }
    }
    finally {
        rmSync(folder, { recursive: true, force: true });
    }
});
test('A02 runtime receipt detects an actual child cwd escape even though the Node interpreter remains24', async () => {
    const folder = mkdtempSync(join(tmpdir(), 'a2ui-cwd-'));
    const outside = mkdtempSync(join(tmpdir(), 'a2ui-outside-'));
    try {
        const fixture = join(folder, 'noop.mjs');
        writeFileSync(fixture, 'console.log(process.pid);');
        const r = await support.runNode(fixture, [], { cwd: outside, env: support.runtimeEnv(folder, cleanEnv()) });
        assert.equal(r.code, 0);
        await assert.rejects(support.checkChildRuntime(folder, Number(r.stdout.trim())), /outside the owned run/);
    }
    finally {
        rmSync(folder, { recursive: true, force: true });
        rmSync(outside, { recursive: true, force: true });
    }
});
test('A02 a listening socket is not reported closed merely because HTTP could hang', async () => {
    const server = createServer(socket => socket.destroy());
    await new Promise<void>(res => server.listen(0, '127.0.0.1', res));
    const port = (server.address() as any).port;
    const origin = 'http://127.0.0.1:' + port;
    await assert.rejects(support.requireListenerClosed(origin), /reachable|unverified/);
    await new Promise<void>((res, rej) => server.close(error => error ? rej(error) : res()));
    assert.equal(await support.requireListenerClosed(origin), true);
});
test('A02 absent Chromium fails before model startup in both opted-in profiles and retains a private receipt', () => {
    const operator = mkdtempSync(join(tmpdir(), 'a2ui-browser-setup-'));
    try {
        for (const mode of ['skill', 'component']) {
            const evidence = join(operator, mode);
            const r = admitted(['--package', actualPackage, '--expected-version', actualVersion, '--mode', mode, '--allow-model', '--evidence-dir', evidence], cleanEnv({ PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH: join(operator, 'missing-chromium') }), operator);
            assert.equal(r.status, 1, r.stderr);
            assert.equal(r.stdout, '');
            const summary = JSON.parse(r.stderr);
            assert.equal(summary.stage, 'browser-setup');
            const value = JSON.parse(readFileSync(summary.receipt, 'utf8'));
            assert.equal(value.passed, false);
            assert.equal(value.failedStage, 'browser-setup');
            assert.ok(!value.observed.agentRuns);
            assert.ok(!Object.hasOwn(value.observed, 'browserErrors'));
            assert.equal(value.observed.packagePayloadUnchanged, true);
            assert.equal(value.observed.operatorFilesUnchanged, true);
            const files = readdirSync(resolve(summary.receipt, '..'));
            assert.ok(!files.includes('session.jsonl'));
            assert.ok(!files.includes('rpc.json'));
        }
    }
    finally {
        rmSync(operator, { recursive: true, force: true });
    }
});
test('A02 cleanup still closes a real child and socket after browser cleanup fails', async () => {
    const folder = mkdtempSync(join(tmpdir(), 'a2ui-cleanup-'));
    const fixture = join(folder, 'fixture.mjs');
    writeFileSync(fixture, 'process.stdin.resume();process.stdin.on("end",()=>process.exit(0));');
    const rpc = new support.RpcProcess(fixture, [], { cwd: folder, env: cleanEnv() });
    const server = createServer(socket => socket.destroy());
    await new Promise<void>(res => server.listen(0, '127.0.0.1', res));
    const origin = 'http://127.0.0.1:' + (server.address() as any).port;
    try {
        const outcome = await support.cleanupOwned([
            ['browser', async () => { throw new Error('private-browser-failure'); }],
            ['pi', async () => { await rpc.close(folder); }],
            ['socket', async () => { await new Promise<void>((res, rej) => server.close(error => error ? rej(error) : res())); await support.requireListenerClosed(origin); }],
        ]);
        assert.equal(outcome.stages[0].status, 'failed');
        assert.equal(outcome.stages[1].status, 'passed');
        assert.equal(outcome.stages[2].status, 'passed');
        assert.equal(rpc.exited, true);
        assert.equal(await support.requireListenerClosed(origin), true);
        assert.doesNotMatch(JSON.stringify(outcome.stages), /private-browser-failure/);
    }
    finally {
        await rpc.close(folder);
        if (server.listening)
            await new Promise<void>(res => server.close(() => res()));
        rmSync(folder, { recursive: true, force: true });
    }
});
test('A02 preflight evidence must obtain the template and finish the exact check before rendering', async () => {
    const { verifyPreflight } = await import(new URL('../scripts/skill-acceptance.mjs', import.meta.url).href);
    const helper = '/admitted/skills/pi-a2ui/scripts/a2ui.mjs';
    const args = { surfaceId: 'skill-acceptance', source: 'root = Text("ok")' };
    const start = (id: string, command: string) => ({ type: 'tool_execution_start', toolName: 'bash', toolCallId: id, args: { command } });
    const end = (id: string, text: string, isError = false) => ({ type: 'tool_execution_end', toolCallId: id, isError, result: { content: [{ type: 'text', text }] } });
    const example = [start('example', `node "${helper}" example validated-form`), end('example', 'template source')];
    const check = [start('check', `node "${helper}" check --surface-id skill-acceptance form.express`), end('check', JSON.stringify(args))];
    const render = { type: 'tool_execution_start', toolName: 'a2ui_render', args };
    assert.equal(verifyPreflight([...example, ...check, render], helper, render), true);
    assert.equal(verifyPreflight([...check, render], helper, render), false, 'missing actual template fetch is not a skill fast-path proof');
    assert.equal(verifyPreflight([...example, render, ...check], helper, render), false, 'post-render check is not preflight');
    assert.equal(verifyPreflight([example[0], end('example', 'failed', true), ...check, render], helper, render), false);
    assert.equal(verifyPreflight([...example, check[0], end('check', JSON.stringify({ ...args, source: 'different' })), render], helper, render), false);
});
test('A02 review coding fixture executes its actual Node child in the owned cwd with runtime observation', async () => {
    const { runCodingFixture } = await import(new URL('../scripts/component-acceptance.mjs', import.meta.url).href);
    const folder = mkdtempSync(join(tmpdir(), 'a2ui-coding-cwd-'));
    const before = process.env.NODE_OPTIONS, receipt = process.env.PI_A2UI_ACCEPT_CWD_RECEIPT, testContext = process.env.NODE_TEST_CONTEXT;
    try {
        delete process.env.NODE_TEST_CONTEXT;
        process.env.NODE_OPTIONS = '--import=' + new URL('../scripts/acceptance-runtime-probe.mjs', import.meta.url).href;
        process.env.PI_A2UI_ACCEPT_CWD_RECEIPT = join(folder, 'child-runtime.jsonl');
        const value = await runCodingFixture(folder);
        assert.equal(value.actualExecution, true);
        const rows = readFileSync(join(folder, 'child-runtime.jsonl'), 'utf8').trim().split('\n').map(line => JSON.parse(line));
        const { realpathSync } = await import('node:fs');
        assert.ok(rows.length);
        for (const row of rows) {
            assert.match(row.node, /^v24\./);
            assert.equal(realpathSync(row.cwd), realpathSync(folder));
        }
    }
    finally {
        if (testContext === undefined)
            delete process.env.NODE_TEST_CONTEXT;
        else
            process.env.NODE_TEST_CONTEXT = testContext;
        if (before === undefined)
            delete process.env.NODE_OPTIONS;
        else
            process.env.NODE_OPTIONS = before;
        if (receipt === undefined)
            delete process.env.PI_A2UI_ACCEPT_CWD_RECEIPT;
        else
            process.env.PI_A2UI_ACCEPT_CWD_RECEIPT = receipt;
        rmSync(folder, { recursive: true, force: true });
    }
});
test('A02 review rejects literal/alias submit context even on a compiler-valid guarded form', async () => {
    const { guardedForm } = await import(new URL('../scripts/skill-acceptance.mjs', import.meta.url).href);
    const { compile } = await import('../src/compiler.ts');
    const source = '$/name = ""\n$/ok = false\nname = TextField(label="Name",value=$/name)\nok = CheckBox(label="Accept",value=$/ok)\nsubmit = Button(child=Text(text="Submit acceptance"),action=Event("save",{name:$/name,accept:$/ok}))\nvalidation = FormValidation(buttons=["submit"],rules=[{fieldId:"name",message:"Name",required:true,minLength:2,maxLength:5},{fieldId:"ok",message:"Accept",required:true}])\nroot = Column(children=[name,ok,validation,submit])';
    assert.doesNotThrow(() => guardedForm(compile('skill-acceptance', source).createSurface.components));
    const attack = source.replace('name:$/name,accept:$/ok', 'name:"Ada",accept:true,nameAlias:$/name,acceptAlias:$/ok');
    const compiled = compile('skill-acceptance', attack);
    assert.throws(() => guardedForm(compiled.createSurface.components), /context|binding/);
});
test('A02 review verifies actual submitted action context and identity before trusting an acknowledgement', async () => {
    const { verifySubmittedAction } = await import(new URL('../scripts/skill-acceptance.mjs', import.meta.url).href);
    const submit = { id: 'submit', action: { event: { name: 'save' } } };
    const action = { surfaceId: 'skill-acceptance', sourceComponentId: 'submit', name: 'save', context: { name: 'Ada', accept: true } };
    assert.equal(verifySubmittedAction(action, submit), true);
    for (const changed of [{ context: { name: 'Ada', accept: 'true' } }, { context: { name: 'Ada', accept: true, alias: 'Ada' } }, { sourceComponentId: 'different' }, { surfaceId: 'different' }, { name: 'different' }, { context: { name: 'Bob', accept: true } }])
        assert.throws(() => verifySubmittedAction({ ...action, ...changed }, submit), /Actual submitted action/);
});
test('A02 review times out a hung cleanup and still shuts down a real owned child', async () => {
    const folder = mkdtempSync(join(tmpdir(), 'a2ui-hung-cleanup-'));
    const fixture = join(folder, 'fixture.mjs');
    writeFileSync(fixture, 'process.stdin.resume();process.stdin.on("end",()=>process.exit(0));');
    const rpc = new support.RpcProcess(fixture, [], { cwd: folder, env: cleanEnv() });
    let outcome;
    try {
        outcome = await Promise.race([support.cleanupOwned([['hung-browser', () => new Promise(() => { })], ['pi', () => rpc.close(folder)]], { timeoutMs: 100 }), new Promise(res => setTimeout(() => res(null), 1000))]);
        assert.ok(outcome, 'cleanup deadline must allow later owned resources to close');
        assert.equal((outcome as any).stages[0].status, 'failed');
        assert.equal((outcome as any).stages[1].status, 'passed');
        assert.equal(rpc.exited, true);
    }
    finally {
        await rpc.close(folder);
        rmSync(folder, { recursive: true, force: true });
    }
});
test('A02 review explicit package paths are absolute before creating a private run', () => {
    assert.throws(() => support.parseOptions(['--package', '.', '--expected-version', '0.1.6'], {}), /absolute/);
});
test('A02 review unknown errors retain a bounded private cause without adding it to the public phase envelope', async () => {
    const folder = mkdtempSync(join(tmpdir(), 'a2ui-private-cause-'));
    try {
        const report = new support.StageReport(folder, { mode: 'unit' });
        await assert.rejects(report.step('locator', async () => { throw new Error('private-cause-token'); }));
        const raw = readFileSync(join(folder, 'result.json'), 'utf8');
        assert.doesNotMatch(raw, /private-cause-token/);
        const diagnostic = readdirSync(folder).find(file => /^stage-\d+-error\.log$/.test(file));
        assert.ok(diagnostic);
        assert.match(readFileSync(join(folder, diagnostic!), 'utf8'), /private-cause-token/);
    }
    finally {
        rmSync(folder, { recursive: true, force: true });
    }
});
test('A02 review evidence admission rejects readonly package descendants including new paths and symlink aliases before writing', () => {
    const { symlinkSync } = requireFs;
    const folder = mkdtempSync(join(tmpdir(), 'a2ui-evidence-target-'));
    const pkg = join(folder, 'package');
    mkdirSync(pkg);
    try {
        for (const path of ['src', 'dist', 'skills/pi-a2ui/scripts'])
            mkdirSync(join(pkg, path), { recursive: true });
        writeFileSync(join(pkg, 'package.json'), JSON.stringify({ name: 'pi-a2ui', version: '0.1.6', pi: { extensions: ['./extension.ts'], skills: ['./skills'] }, files: ['src/', 'dist/', 'skills/', 'extension.ts'] }));
        writeFileSync(join(pkg, 'extension.ts'), '');
        writeFileSync(join(pkg, 'dist/assistant-cli.mjs'), '');
        writeFileSync(join(pkg, 'skills/pi-a2ui/SKILL.md'), 'fixture');
        writeFileSync(join(pkg, 'skills/pi-a2ui/scripts/a2ui.mjs'), 'console.log(JSON.stringify({packageVersion:"0.1.6",catalogId:"fixture",components:[]}));');
        symlinkSync(pkg, join(folder, 'alias'), 'dir');
        for (const parent of [join(pkg, 'src/new/deep'), join(folder, 'alias/src/new/deep')]) {
            const r = admitted(['--package', pkg, '--expected-version', '0.1.6', '--evidence-dir', parent], cleanEnv(), folder);
            assert.equal(r.status, 2, r.stderr);
            assert.equal(JSON.parse(r.stderr).stage, 'admission');
            assert.match(JSON.parse(r.stderr).error, /evidence|read.only/i);
            assert.deepEqual(readdirSync(join(pkg, 'src')), []);
        }
    }
    finally {
        rmSync(folder, { recursive: true, force: true });
    }
});
