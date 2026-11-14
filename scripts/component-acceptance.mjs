// Bounded integration check: real Pi/model, installed package, real browser, two turns.
// Existing Pi credentials stay in Pi; do not print bootstrap URLs or raw RPC records.
import { formsSource, fillForms, codingSource, liveSource, liveChartSeries, workbenchSource } from './acceptance-scenarios.mjs';
import { spawnSync } from 'node:child_process';
import { mkdir, writeFile, readFile, access } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { chromium } from '@playwright/test';
import { MODEL, PI_ENTRY, assertNode24, assertModelTuple, runtimeEnv, RpcProcess, checkChildRuntime, requireListenerClosed, cleanupOwned, messageText } from './acceptance-support.mjs';
export async function runComponent({ packagePath, scenario, workspace, cwd, browserPath, onCheckpoint, onFailure }) {
    assertNode24(process.versions.node);
    if (typeof onCheckpoint !== 'function' || typeof onFailure !== 'function' || !packagePath || resolve(cwd) !== resolve(workspace) || !['basic', 'forms', 'coding', 'live', 'workbench'].includes(scenario))
        throw new Error('Invalid admitted component configuration');
    const provider = MODEL.provider, model = MODEL.id;
    const urlFile = join(workspace, 'open-url');
    if (scenario === 'workbench') {
        await mkdir(join(cwd, 'a2ui-fixtures'), { recursive: true });
        for (const name of ['blue.png', 'blue.webm', 'tone.wav'])
            await writeFile(join(cwd, 'a2ui-fixtures', name), await readFile(new URL('../tests/fixtures/' + name, import.meta.url)));
    }
    let testEvidence;
    if (scenario === 'coding') {
        await mkdir(workspace, { recursive: true });
        const source = 'import {test} from "node:test";import assert from "node:assert/strict";test("Arithmetic",()=>assert.equal(2+2,4));\n';
        const path = join(workspace, 'arithmetic.test.mjs');
        await writeFile(path, source);
        const execution = spawnSync(process.execPath, ['--test', '--test-reporter=tap', path], { encoding: 'utf8' });
        if (execution.status !== 0 || !/^# pass 1$/m.test(execution.stdout))
            throw new Error('Actual coding fixture did not pass; refusing invented results');
        testEvidence = { source, exitCode: execution.status, pass: 1, fail: 0, actualExecution: true };
        await writeFile(join(workspace, 'test-evidence.json'), JSON.stringify(testEvidence, null, 2));
    }
    await mkdir(join(workspace, 'bin'), { recursive: true });
    for (const program of ['open', 'xdg-open'])
        await writeFile(join(workspace, 'bin', program), '#!/bin/sh\numask 077\nprintf "%s" "$1" > "$A2UI_ACCEPT_OPEN_FILE"\n', { mode: 0o700 });
    const rpc = new RpcProcess(PI_ENTRY, ['--no-extensions', '--no-mcp', '--no-skills', '--no-context-files', '--no-prompt-templates', '--no-themes', '--mode', 'rpc', '--provider', provider, '--model', model, '--thinking', 'off', '--tools', scenario === 'live' ? 'a2ui_render,a2ui_update_chart,bash' : scenario === 'workbench' ? 'a2ui_render,a2ui_register_artifact,bash' : 'a2ui_render', '--session', join(workspace, `session-${provider}.jsonl`), '-e', join(packagePath, 'extension.ts')], {
        cwd, env: { ...runtimeEnv(workspace), A2UI_ACCEPT_OPEN_FILE: urlFile, PI_OFFLINE: '1' },
    });
    const pi = rpc.child, events = rpc.events;
    const wait = (predicate, after = 0, timeout = 180000) => rpc.wait(predicate, after, timeout);
    const command = value => rpc.send(value);
    let browser;
    let origin;
    let result = {};
    let liveEvidence = {};
    const pageErrors = [];
    let pageCreated = false;
    let failure;
    try {
        command({ id: 'state', type: 'get_state' });
        const initial = await wait(e => e.type === 'response' && e.id === 'state', 0, 30000);
        assertModelTuple(initial);
        await onCheckpoint('component.model', { agentPlanEndpointVerified: true, resolvedProvider: provider, resolvedModel: model });
        const basicSource = '$/form/name = ""\nroot = Card(Column([Text("Pi A2UI local acceptance"), TextField("Acceptance phrase", $/form/name), Button(Text("Submit acceptance"), action=Event("submit", {name: $/form/name}))]))';
        const source = scenario === 'workbench' ? workbenchSource('{{IMAGE}}', '{{VIDEO}}', '{{AUDIO}}') : scenario === 'forms' ? formsSource : scenario === 'coding' ? codingSource(testEvidence) : scenario === 'live' ? liveSource : basicSource;
        const artifactInstructions = scenario === 'workbench' ? 'First call a2ui_register_artifact on a2ui-fixtures/blue.png kind image, a2ui-fixtures/blue.webm kind video, and a2ui-fixtures/tone.wav kind audio. Substitute their returned opaque src values for {{IMAGE}}, {{VIDEO}} and {{AUDIO}} in the source below. After rendering run bash exactly once: printf v014-native-acceptance. Never use any other command. ' : '';
        command({ id: 'first', type: 'prompt', message: artifactInstructions + `Local UI acceptance only. Call a2ui_render exactly once with surfaceId "acceptance" and source ${JSON.stringify(source)}. After successful tool call, say "Form ready" briefly. A later user message named A2UI browser context data is expected: when it arrives, reply "Accepted: " followed by the exact JSON object action.context (preserving boolean/number/array types); do not render again or invoke another tool.` });
        const rendered = await wait(e => (e.type === 'message_end' && e.message?.role === 'toolResult' && e.message.toolName === 'a2ui_render' && !e.message.isError) || e.type === 'agent_settled');
        if (rendered.type === 'agent_settled') {
            const markers = events.filter(e => e.type === 'message_end').map(e => e.message?.errorMessage ?? '').join(' ').match(/401|403|404|429|5\d\d|quota|balance|insufficient|not found/ig) ?? [];
            throw new Error('Model settled without a successful UI tool result' + (markers.length ? ': ' + [...new Set(markers)].join(',') : ''));
        }
        const saved = rendered.message.details?.a2uiSnapshot;
        if (!saved?.surfaces?.some(s => s.surfaceId === 'acceptance'))
            throw new Error('Real Pi tool result missing committed surface');
        await wait(e => e.type === 'agent_settled');
        await onCheckpoint('component.browser', { actualToolResult: true });
        command({ id: 'open', type: 'prompt', message: '/a2ui' });
        await wait(e => e.type === 'response' && e.id === 'open', 0, 30000);
        // The OS browser-launch boundary is captured by a private PATH shim; Chromium
        // then visits that exact bootstrap URL. No credential is logged in RPC evidence.
        let openUrl;
        for (let attempt = 0; attempt < 100; attempt++) {
            try {
                await access(urlFile);
                openUrl = await readFile(urlFile, 'utf8');
                if (openUrl)
                    break;
            }
            catch { }
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        if (!openUrl)
            throw new Error('Pi /a2ui did not invoke the browser opener');
        origin = new URL(openUrl).origin;
        browser = await chromium.launch({ executablePath: browserPath, headless: true });
        const page = await browser.newPage();
        pageCreated = true;
        page.on('pageerror', e => pageErrors.push(e.message));
        await page.goto(openUrl).catch(() => { throw new Error("Local canvas navigation failed"); });
        await page.locator('input[type=text]').waitFor();
        if (page.url().includes('#'))
            throw new Error('Browser did not remove bootstrap fragment');
        const phrase = 'pi-a2ui-local-acceptance-20261113';
        await page.locator('input[type=text]').fill(phrase);
        if (scenario === 'forms')
            await fillForms(page);
        if (scenario === 'live') {
            await page.locator('input[type=text]').evaluate(element => globalThis.acceptanceOriginalInput = element);
            const runAfter = events.length;
            const commandText = "for i in 1 2 3; do printf 'live-tick-%s\\n' \"$i\"; sleep 0.4; done";
            command({ id: 'native-run', type: 'prompt', message: `Native tool/log acceptance. Call bash exactly once with command ${JSON.stringify(commandText)}. After it succeeds call a2ui_update_chart with surfaceId acceptance, revision 1, componentId chart, series ${JSON.stringify(liveChartSeries)}. Do not render another surface or run other commands. Then say Run complete. When the later A2UI browser context arrives, still acknowledge its exact JSON context as previously instructed.` });
            await page.locator('pi-a2ui-log-view [data-stream-state=running]').waitFor();
            await page.locator('pi-a2ui-log-view pre').filter({ hasText: 'live-tick-1' }).waitFor();
            const progressBeforeEnd = !events.slice(runAfter).some(e => e.type === 'tool_execution_end' && e.toolName === 'bash');
            if (!progressBeforeEnd)
                throw new Error('Native output was not observed while the tool was still running');
            await wait(e => e.type === 'agent_settled', runAfter);
            const completed = events.slice(runAfter).some(e => e.type === 'tool_execution_end' && e.toolName === 'bash' && e.isError === false);
            const updated = events.slice(runAfter).some(e => e.type === 'message_end' && e.message?.role === 'toolResult' && e.message.toolName === 'a2ui_update_chart' && !e.message.isError);
            if (!completed || !updated)
                throw new Error('Actual native bash/chart tool did not succeed');
            await page.locator('pi-a2ui-log-view [data-stream-state=completed]').waitFor();
            await page.locator('pi-a2ui-chart rect').nth(2).waitFor();
            if (await page.locator('input[type=text]').inputValue() !== phrase || !await page.locator('input[type=text]').evaluate(e => e === globalThis.acceptanceOriginalInput))
                throw new Error('Native live updates lost draft/input identity');
            liveEvidence = { actualNativeToolOutput: true, progressObservedBeforeToolEnd: true, actualChartTool: true, draftAndInputIdentityPreserved: true, nativeUpdateEvents: events.slice(runAfter).filter(e => e.type === 'tool_execution_update' && e.toolName === 'bash').length };
        }
        if (scenario === 'workbench') {
            await page.getByText('Registered in this Pi session', { exact: true }).waitFor();
            await page.waitForFunction(() => document.querySelector('pi-a2ui-image img')?.naturalWidth === 32);
            await page.getByRole('button', { name: 'Count', exact: true }).click();
            if ((await page.locator('pi-a2ui-data-table tbody tr').first().textContent()) !== 'two2')
                throw new Error('Installed table numeric sort failed');
            await page.locator('pi-a2ui-details summary').click();
            await page.getByText('Folded detail', { exact: true }).waitFor();
            await page.getByRole('button', { name: 'settings', exact: true }).click();
            await page.getByRole('dialog').waitFor();
            await page.keyboard.press('Escape');
            await page.getByText('Tracked tools · completed', { exact: true }).waitFor();
            if (!events.some(e => e.type === 'tool_execution_end' && e.toolName === 'bash' && e.isError === false))
                throw new Error('Actual native bash event missing');
            liveEvidence = { registeredArtifacts: 3, installedImageDecoded: true, installedTableSorted: true, installedDetailsAndModal: true, actualNativeTaskProgress: true };
        }
        await onCheckpoint('component.action', { browserErrors: pageErrors.length, fragmentCleared: true, ...liveEvidence });
        const before = events.length;
        await page.getByRole('button', { name: 'Submit acceptance' }).click();
        await page.getByText('Sent to Pi', { exact: true }).waitFor();
        await wait(e => e.type === 'agent_settled', before);
        await onCheckpoint('component.ack', { actualNextTurnAttempted: true });
        const replies = events.slice(before).filter(e => e.type === 'message_end' && e.message?.role === 'assistant').map(e => messageText(e.message)).join('\n');
        result = { ...liveEvidence, provider, model, actualToolResult: true, browserForm: true, fragmentCleared: true, local202: true, actualNextTurnAttempted: true, actualNextTurnContainsSubmittedValue: replies.includes(phrase), browserErrors: pageErrors.length };
        await page.screenshot({ path: join(workspace, 'acceptance.png'), fullPage: true });
        if (scenario === 'forms') {
            const json = replies.match(/\{[\s\S]*\}/)?.[0];
            const ack = json ? JSON.parse(json) : undefined;
            if (JSON.stringify(ack?.features) !== '["b"]' || ack?.enabled !== true || ack?.count !== 7 || ack?.date !== '2026-12-25' || ack?.name !== phrase)
                throw new Error('Actual next model reply did not preserve typed submitted context');
            result.typedContextAcknowledged = true;
        }
        if (scenario === 'coding') {
            const json = replies.match(/\{[\s\S]*\}/)?.[0];
            const ack = json ? JSON.parse(json) : undefined;
            if (ack?.proposalId !== 'proposal-live' || ack?.resultId !== 'result-live' || ack?.name !== phrase)
                throw new Error('Actual next model reply did not refer to reviewed proposal/results');
            result.actualExecutedTestEvidence = testEvidence?.actualExecution === true;
            result.currentCodingIdsAcknowledged = true;
        }
        if (!replies.includes(phrase))
            throw new Error('Actual subsequent model reply did not acknowledge submitted context');
        await page.screenshot({ path: join(workspace, 'acceptance.png'), fullPage: true });
        if (pageErrors.length)
            throw new Error('Browser emitted errors during actual Pi acceptance');
        result = { ...result, scenario, provider, model, pi: initial.data?.version ?? 'local 1.5.0', surface: 'acceptance', actualToolResult: true, browserForm: true, fragmentCleared: true, local202: true, actualNextTurnContainsSubmittedValue: true, browserErrors: pageErrors.length };
        await onCheckpoint('component.complete', result);
    }
    catch (error) {
        failure = error;
        try {
            await writeFile(join(workspace, 'component-error.log'), error instanceof Error ? (error.stack ?? error.message) : String(error), { mode: 0o600 });
            await onFailure();
        }
        catch { /* Cleanup below must still run if diagnostics cannot be persisted. */ }
    }
    finally {
        let released;
        const cleanup = await cleanupOwned([
            ['cleanup.browser', async () => { await browser?.close(); }],
            ['cleanup.pi', async () => { await rpc.close(workspace); }],
            ['cleanup.listener', async () => { if (origin)
                    released = await requireListenerClosed(origin); }],
            ['child-runtime', async () => { Object.assign(result, await checkChildRuntime(workspace, pi.pid)); }],
        ]);
        result = { ...result, node: process.version, ...(pageCreated ? { browserErrors: pageErrors.length } : {}), ...(origin ? { listenerReleased: released === true } : {}), processExited: rpc.exited, suppliedDsl: true, skillForward: false, normalRegistration: false, cleanupStages: cleanup.stages };
        await writeFile(join(workspace, 'component-result.json'), JSON.stringify(result, null, 2));
        await writeFile(join(workspace, 'component-events.json'), JSON.stringify(events), { mode: 0o600 });
        await onCheckpoint('component.cleanup', result);
        failure ??= cleanup.firstError;
        if (!rpc.exited)
            failure ??= new Error('Owned component process did not exit');
        // Do not print raw stderr: providers/extensions may include private configuration.
    }
    if (failure)
        throw failure;
    return result;
}
