import { mkdir, writeFile, readFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { join, resolve } from 'node:path';
import { MODEL, PI_ENTRY, AcceptanceError, assertModelTuple, RpcProcess, runNode, runtimeEnv, checkChildRuntime, requireListenerClosed, cleanupOwned, messageText } from './acceptance-support.mjs';
export async function preflightBrowser({ browserType, timeoutMs = 15000 } = {}) {
    try {
        const chromium = browserType ?? (await import('@playwright/test')).chromium;
        const path = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || chromium.executablePath();
        await access(path, constants.X_OK);
        const browser = await chromium.launch({ headless: true, executablePath: path });
        const cleanup = await cleanupOwned([['preflight.browser', () => browser.close()]], {timeoutMs});
        if (cleanup.firstError) throw cleanup.firstError;
        return path;
    }
    catch {
        throw new AcceptanceError('browser-setup', 'Select an installed Chromium with PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH before model acceptance');
    }
}
async function opener(run) {
    await mkdir(join(run, 'bin'));
    const text = '#!/bin/sh\numask 077\nprintf "%s" "$1" > "$PI_A2UI_ACCEPT_OPEN_FILE"\n';
    for (const name of ['open', 'xdg-open'])
        await writeFile(join(run, 'bin', name), text, { mode: 0o700 });
}
function checkLoaded(rpc, list, identity, normal) {
    for (const name of ['a2ui', 'a2ui-status', 'a2ui-toggle', 'skill:pi-a2ui'])
        if (list.filter(item => item.name === name).length !== 1)
            throw new AcceptanceError('discovery', 'Missing or duplicate A2UI command/skill');
    const skill = list.find(item => item.name === 'skill:pi-a2ui');
    if (resolve(skill.sourceInfo?.path ?? '') !== join(identity.root, 'skills/pi-a2ui/SKILL.md'))
        throw new AcceptanceError('discovery', 'Skill did not originate in the admitted package');
    if (normal && (skill.sourceInfo.origin !== 'package' || skill.sourceInfo.scope !== 'project'))
        throw new AcceptanceError('discovery', 'Startup must discover the normally registered project package');
    if (/Failed to load extension|conflicts with/i.test(rpc.stdout + '\n' + rpc.stderr) || rpc.events.some(event => event.type === 'extension_error'))
        throw new AcceptanceError('startup', 'Package load/conflict/runtime diagnostic observed');
}
async function tagControls(page, ids) {
    await page.waitForFunction(ids => {
        const all = [];
        function visit(root) {
            for (const element of root.querySelectorAll('*')) {
                all.push(element);
                if (element.shadowRoot)
                    visit(element.shadowRoot);
            }
        }
        visit(document);
        for (const [name, id] of Object.entries(ids)) {
            const host = all.find(element => element.context?.componentModel?.id === id);
            if (!host)
                return false;
            host.setAttribute('data-a2ui-acceptance', name);
        }
        return true;
    }, ids);
}
function successfulRender(events) { return events.filter(event => event.type === 'message_end' && event.message?.role === 'toolResult' && event.message.toolName === 'a2ui_render' && event.message.isError === false); }
export function verifyPreflight(events, helper, renderStart) {
    const before = events.slice(0, events.indexOf(renderStart));
    const successfulCommands = before.filter(event => event.type === 'tool_execution_start' && event.toolName === 'bash' && typeof event.args?.command === 'string' && event.args.command.includes(helper)).map(start => ({ start, end: before.find(event => event.type === 'tool_execution_end' && event.toolCallId === start.toolCallId && event.isError === false) })).filter(item => item.end);
    const template = successfulCommands.find(item => /\bexample\s+["']?validated-form\b/.test(item.start.args.command));
    if (!template)
        return false;
    for (const { start, end } of successfulCommands) {
        if (!/\bcheck\b/.test(start.args.command) || before.indexOf(end) < before.indexOf(template.end))
            continue;
        for (const line of messageText(end.result).split('\n')) {
            try {
                const value = JSON.parse(line);
                if (value?.surfaceId === renderStart.args.surfaceId && value.source === renderStart.args.source && Object.keys(value).length === 2)
                    return true;
            }
            catch { /* Helper output may also include harmless shell text. */ }
        }
    }
    return false;
}
async function privateStartupAgent(run) { const agentDir = join(run, 'agent'); await mkdir(agentDir); const settings = '{"acceptanceFixture":true}'; await writeFile(join(agentDir, 'settings.json'), settings, { mode: 0o600 }); await writeFile(join(agentDir, 'models.json'), JSON.stringify({ providers: { [MODEL.provider]: { baseUrl: MODEL.baseUrl, api: 'openai-completions', apiKey: 'fixture-unused-no-request', models: [{ id: MODEL.id, name: 'Acceptance startup fixture', reasoning: false, input: ['text'], contextWindow: 128000, maxTokens: 4096 }] } } }), { mode: 0o600 }); return { agentDir, settings }; }
export async function runAcceptance({ options, identity, run, report }) {
    let rpc, browser, page, origin, failure, registrationAttempted = false, env, fixture;
    const pageErrors = [];
    const modelMode = options.mode === 'skill';
    Object.assign(report.data.observed, { normalRegistration: !modelMode, explicitPackageSkillProfile: modelMode, suppliedDsl: false, skillForward: modelMode });
    try {
        let browserPath;
        if (modelMode) {
            if (!['darwin', 'linux'].includes(process.platform))
                throw new AcceptanceError('browser-setup', 'Headless model acceptance currently requires a macOS/Linux opener shim');
            browserPath = await report.step('browser-setup', () => preflightBrowser());
            await opener(run);
            env = runtimeEnv(run);
            env.PI_A2UI_ACCEPT_OPEN_FILE = join(run, 'open-url');
        }
        else {
            fixture = await report.step('fixture', () => privateStartupAgent(run));
            env = runtimeEnv(run, process.env, { offline: true, agentDir: fixture.agentDir });
            registrationAttempted = true;
            await report.step('registration', async () => {
                const r = await runNode(PI_ENTRY, ['install', '-l', '--approve', identity.root], { cwd: run, env });
                await writeFile(join(run, 'registration.log'), r.stdout + r.stderr, { mode: 0o600 });
                if (r.code !== 0)
                    throw new AcceptanceError('registration', 'Private package registration failed');
            });
        }
        const profile = modelMode ? ['--no-extensions', '-e', identity.root, '--no-skills', '--skill', join(identity.root, 'skills/pi-a2ui')] : ['--approve'];
        const args = [...profile, '--no-mcp', '--no-context-files', '--no-prompt-templates', '--no-themes', '--mode', 'rpc', '--provider', MODEL.provider, '--model', MODEL.id, '--thinking', 'off', '--tools', modelMode ? 'read,bash,a2ui_render' : 'a2ui_render', '--session', join(run, 'session.jsonl')];
        await report.step('startup', async () => { rpc = new RpcProcess(PI_ENTRY, args, { cwd: run, env }); const state = await rpc.command('initial', 'get_state'); assertModelTuple(state); Object.assign(report.data.observed, { resolvedProvider: MODEL.provider, resolvedModel: MODEL.id, agentPlanEndpointVerified: true }); const commands = await rpc.command('commands', 'get_commands'); checkLoaded(rpc, commands.data?.commands ?? [], identity, !modelMode); Object.assign(report.data.observed, { uniqueA2uiCommands: 3, uniqueSkill: true }); });
        if (!modelMode) {
            await report.step('status', async () => {
                await rpc.command('status', 'prompt', { message: '/a2ui-status' });
                const notice = await rpc.wait(event => event.type === 'extension_ui_request' && event.method === 'notify' && typeof event.message === 'string' && event.message.startsWith('A2UI '));
                if (!notice.message.includes('enabled'))
                    throw new AcceptanceError('status', 'A2UI is not enabled');
                if (rpc.events.some(event => event.type === 'agent_start'))
                    throw new AcceptanceError('status', 'Startup unexpectedly attempted generation');
                Object.assign(report.data.observed, { statusCommandExecuted: true, agentRuns: 0, modelRequests: 0, externalFetchDenied: true });
            });
        }
        else {
            let surface, submit, textField, checkBox;
            await report.step('skill-render', async () => {
                const after = rpc.events.length;
                rpc.send({ id: 'story', type: 'prompt', message: '/skill:pi-a2ui 请用已知validated-form模板在浏览器建立一个最小验收表单，surfaceId固定skill-acceptance：恰好一个TextField标签Name，初值空且必填2至5个字符；一个CheckBox标签Accept，初值false且必选；受FormValidation保护的Submit acceptance按钮，Event.context固定包含name和accept的实时绑定。先实际用本技能helper取模板，按需修改，再check同一surfaceId成功，把check输出对象原样用作a2ui_render参数。已知模板无需先patterns或遍历全部文档，不猜参数。不要增加其它组件/表面。仅在当前私有工作目录内创建临时Express文件；包路径只读，禁止cd到包/改文件、安装依赖、读取配置或凭据。成功后简短说ready，不再执行工具。之后收到浏览器上下文，只回复实际action.context JSON，保留布尔类型，不render不调用工具。' });
                await rpc.wait(event => event.type === 'agent_settled', after, 180000);
                const phase = rpc.events.slice(after);
                const renders = successfulRender(phase);
                report.data.observed.renderSuccesses = renders.length;
                report.data.observed.renderFailures = phase.filter(event => event.type === 'message_end' && event.message?.toolName === 'a2ui_render' && event.message?.isError).length;
                if (!renders.length) {
                    const stopped = phase.find(event => event.type === 'message_end' && event.message?.role === 'assistant' && event.message.stopReason === 'error');
                    if (stopped)
                        report.data.observed.modelTransportError = true;
                    throw new AcceptanceError('skill-render', stopped ? 'Model transport failed before a successful render' : 'Model produced no successful UI render');
                }
                const render = renders.at(-1);
                const snapshot = render.message.details?.a2uiSnapshot;
                if (snapshot?.surfaces?.length !== 1 || snapshot.surfaces[0].surfaceId !== 'skill-acceptance')
                    throw new AcceptanceError('skill-render', 'Model did not commit the single requested surface');
                surface = snapshot.surfaces[0];
                const components = surface.message.createSurface.components;
                ({ textField, checkBox, submit } = guardedForm(components));
                const starts = phase.filter(event => event.type === 'tool_execution_start');
                const renderStart = starts.filter(event => event.toolName === 'a2ui_render').at(-1);
                if (!renderStart || !verifyPreflight(phase, identity.helper, renderStart))
                    throw new AcceptanceError('skill-render', 'No successful exact helper preflight precedes the rendered source');
                Object.assign(report.data.observed, { exactPreflightObserved: true, templateReadObserved: true, readCalls: starts.filter(e => e.toolName === 'read').length, bashCalls: starts.filter(e => e.toolName === 'bash').length });
            });
            const { chromium, expect } = await import('@playwright/test');
            browser = await chromium.launch({ headless: true, executablePath: browserPath });
            page = await browser.newPage();
            page.on('pageerror', error => pageErrors.push(error.message));
            const posts = [];
            page.on('request', request => {
                if (request.method() === 'POST' && new URL(request.url()).pathname === '/api/actions')
                    posts.push((() => { try {
                        return request.postDataJSON();
                    }
                    catch {
                        return null;
                    } })());
            });
            await report.step('browser', async () => {
                let url;
                for (let attempt = 0; attempt < 100; attempt++) {
                    try {
                        url = await readFile(join(run, 'open-url'), 'utf8');
                        if (url)
                            break;
                    }
                    catch { }
                    await new Promise(res => setTimeout(res, 50));
                }
                if (!url)
                    throw new AcceptanceError('browser', 'Automatic opener was not captured');
                const parsed = new URL(url);
                if (parsed.protocol !== 'http:' || parsed.hostname !== '127.0.0.1')
                    throw new AcceptanceError('browser', 'Canvas opener was not a loopback HTTP URL');
                origin = parsed.origin;
                await page.goto(url).catch(() => { throw new AcceptanceError('browser', 'Local canvas navigation failed'); });
                await tagControls(page, { name: textField.id, accept: checkBox.id, submit: submit.id });
                if (page.url().includes('#'))
                    throw new AcceptanceError('browser', 'Bootstrap fragment was not cleared');
                report.data.observed.fragmentCleared = true;
            });
            const name = page.locator('[data-a2ui-acceptance=name]').locator('input[type=text],textarea'), accept = page.locator('[data-a2ui-acceptance=accept]').locator('input[type=checkbox]'), button = page.locator('[data-a2ui-acceptance=submit]').locator('button');
            await report.step('invalid-submit', async () => {
                const before = rpc.events.length;
                await expect(name).toHaveCount(1);
                await expect(accept).toHaveCount(1);
                await expect(button).toHaveCount(1);
                await name.fill('');
                await accept.uncheck();
                await button.click();
                await expect(name).toHaveAttribute('aria-invalid', 'true');
                await new Promise(res => setTimeout(res, 100));
                if (posts.length || rpc.events.slice(before).some(event => event.type === 'agent_start'))
                    throw new AcceptanceError('invalid-submit', 'Invalid form dispatched a request or model run');
                Object.assign(report.data.observed, { invalidPosts: 0, invalidAgentRuns: 0 });
            });
            await report.step('valid-submit', async () => {
                await name.fill('Ada');
                await accept.check();
                const before = rpc.events.length;
                const response = page.waitForResponse(response => response.request().method() === 'POST' && new URL(response.url()).pathname === '/api/actions');
                await button.click();
                if ((await response).status() !== 202)
                    throw new AcceptanceError('valid-submit', 'Valid action was not accepted');
                report.data.observed.validPosts = posts.length;
                if (posts.length !== 1)
                    throw new AcceptanceError('valid-submit', 'Expected exactly one valid browser action');
                verifySubmittedAction(posts[0]?.message?.action, submit);
                report.data.observed.postContextVerified = true;
                await rpc.wait(event => event.type === 'agent_settled', before, 180000);
                const phase = rpc.events.slice(before);
                const contexts = phase.filter(event => event.message?.role === 'user').map(event => messageText(event.message)).filter(text => text.startsWith('A2UI browser context data')).map(text => { try {
                    return JSON.parse(text.slice(text.indexOf('\n') + 1));
                }
                catch {
                    return null;
                } });
                const forwarded = contexts.find(value => value?.surfaceId === 'skill-acceptance');
                verifySubmittedAction(forwarded && { ...forwarded, name: forwarded.event }, submit);
                report.data.observed.rpcContextVerified = true;
                const texts = phase.filter(event => event.type === 'message_end' && event.message?.role === 'assistant').map(event => messageText(event.message)).join('\n');
                let ack;
                try {
                    ack = JSON.parse(texts.match(/\{[\s\S]*\}/)?.[0] ?? '');
                }
                catch {
                    throw new AcceptanceError('valid-submit', 'Model did not return a JSON acknowledgement');
                }
                if (ack?.name !== 'Ada' || ack?.accept !== true || Object.keys(ack).length !== 2)
                    throw new AcceptanceError('valid-submit', 'Model acknowledgement did not preserve the exact typed context');
                report.data.observed.typedAcknowledgement = { name: 'Ada', accept: true };
                report.data.observed.agentRuns = rpc.events.filter(event => event.type === 'agent_start').length;
            });
            await report.step('browser-errors', async () => {
                report.data.observed.browserErrors = pageErrors.length;
                if (pageErrors.length)
                    throw new AcceptanceError('browser-errors', 'Browser page errors were observed');
                await page.screenshot({ path: join(run, 'acceptance.png'), fullPage: true });
            });
        }
    }
    catch (error) {
        failure = error;
        try {
            await writeFile(join(run, 'stage-error.log'), String(error instanceof Error ? (error.stack ?? error.message) : error).slice(0, 8192), { mode: 0o600 });
        }
        catch { /* Resource cleanup must continue if diagnostics cannot be written. */ }
    }
    finally {
        if (rpc)
            report.data.observed.agentRuns = rpc.events.filter(event => event.type === 'agent_start').length;
        if (page)
            report.data.observed.browserErrors = pageErrors.length;
        else
            report.data.observed.browserObserved = false;
        const cleanup = await cleanupOwned([
            ...(browser ? [['cleanup.browser', async () => { await browser.close(); }]] : []),
            ...(rpc ? [['cleanup.pi', async () => { report.data.observed.processExited = await rpc.close(run); }]] : []),
            ['cleanup.registration', async () => {
                    if (!registrationAttempted)
                        return;
                    let settings;
                    try {
                        settings = JSON.parse(await readFile(join(run, '.pi/settings.json'), 'utf8'));
                    }
                    catch (error) {
                        if (error.code === 'ENOENT')
                            settings = {};
                        else
                            throw error;
                    }
                    if (settings.packages?.length) {
                        const removed = await runNode(PI_ENTRY, ['remove', '-l', '--approve', identity.root], { cwd: run, env });
                        await writeFile(join(run, 'unregistration.log'), removed.stdout + removed.stderr, { mode: 0o600 });
                        if (removed.code !== 0)
                            throw new AcceptanceError('cleanup', 'Owned registration removal failed');
                        settings = JSON.parse(await readFile(join(run, '.pi/settings.json'), 'utf8'));
                        if (settings.packages?.length)
                            throw new AcceptanceError('cleanup', 'Owned package registration remains');
                    }
                    report.data.observed.privateRegistrationRemoved = true;
                    if (await readFile(join(fixture.agentDir, 'settings.json'), 'utf8') !== fixture.settings)
                        throw new AcceptanceError('cleanup', 'Private global fixture settings changed');
                }],
            ...(origin ? [['cleanup.listener', async () => { report.data.observed.listenerReleased = await requireListenerClosed(origin); }]] : []),
            ...(rpc ? [['child-runtime', async () => { Object.assign(report.data.observed, await checkChildRuntime(run, rpc.child.pid)); }]] : []),
            ['cleanup.diagnostics', async () => {
                    if (page)
                        await writeFile(join(run, 'page-errors.json'), JSON.stringify(pageErrors), { mode: 0o600 });
                }],
        ]);
        report.data.stages.push(...cleanup.stages);
        if (cleanup.firstError) {
            report.data.observed.cleanupFailed = true;
            report.data.failedStage ??= cleanup.stages.find(stage => stage.status === 'failed').name;
            report.data.error ??= cleanup.firstError instanceof AcceptanceError ? cleanup.firstError.message : 'Owned cleanup failed; inspect private diagnostics';
            failure ??= cleanup.firstError;
        }
        await report.save();
    }
    if (failure)
        throw failure;
}
export function guardedForm(components) {
    const texts = components.filter(c => c.component === 'TextField'), boxes = components.filter(c => c.component === 'CheckBox'), validators = components.filter(c => c.component === 'FormValidation');
    if (texts.length !== 1 || boxes.length !== 1 || validators.length !== 1)
        throw new AcceptanceError('skill-render', 'Model-authored form has ambiguous or missing controls');
    const textField = texts[0];
    const checkBox = boxes[0];
    const validator = validators[0];
    const submit = components.find(c => c.id === validator.buttons[0] && c.component === 'Button');
    if (!submit || validator.buttons.length !== 1 || !validator.rules.some(r => r.fieldId === textField.id && r.required && r.minLength === 2 && r.maxLength === 5) || !validator.rules.some(r => r.fieldId === checkBox.id && r.required))
        throw new AcceptanceError('skill-render', 'Requested guarded validation was not authored');
    const context = submit.action?.event?.context;
    const bindingPath = value => value && typeof value === 'object' && Object.keys(value).length === 1 && typeof value['@path'] === 'string' ? value['@path'] : undefined;
    if (!context || Object.keys(context).sort().join(',') !== 'accept,name' || !bindingPath(textField.value) || !bindingPath(checkBox.value) || bindingPath(context.name) !== bindingPath(textField.value) || bindingPath(context.accept) !== bindingPath(checkBox.value))
        throw new AcceptanceError('skill-render', 'Submit context must bind exactly name and accept to the requested controls');
    return { textField, checkBox, submit };
}
export function verifySubmittedAction(action, submit) {
    if (action?.surfaceId !== 'skill-acceptance' || action?.sourceComponentId !== submit.id || action?.name !== submit.action?.event?.name || !action.context || Object.keys(action.context).sort().join(',') !== 'accept,name' || action.context.name !== 'Ada' || action.context.accept !== true)
        throw new AcceptanceError('valid-submit', 'Actual submitted action did not preserve the exact typed context and declared identity');
    return true;
}
