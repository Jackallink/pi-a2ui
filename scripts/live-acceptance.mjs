// Developer-only acceptance entry. Defaults to a no-model, normally registered startup check.
import { assertNode24, parseOptions, HELP, AcceptanceError, admitPackage, createRun, StageReport, packageFingerprint, operatorFingerprint, runNode, PI_ENTRY, verifyHelper, runtimeEnv, validateEvidenceParent } from './acceptance-support.mjs';
import { join } from 'node:path';
let report, options, identity, operatorBefore, run;
const operatorCwd = process.cwd();
try {
    assertNode24(process.versions.node);
    options = parseOptions(process.argv.slice(2));
    if (options.help) {
        process.stdout.write(HELP);
    }
    else {
        operatorBefore = await operatorFingerprint(operatorCwd);
        identity = await admitPackage(options, operatorCwd);
        const evidenceParent = await validateEvidenceParent(options, identity, operatorCwd);
        run = await createRun(evidenceParent);
        report = new StageReport(run, { mode: options.mode, node: process.version, nodeExecutable: process.execPath, packagePath: identity.root, packageVersion: identity.metadata.version, packageFingerprint: identity.fingerprint, modelRequestsAllowed: options.allowModel });
        await report.save();
        await report.step('helper-identity', async () => { const catalog = await verifyHelper(identity, run); report.data.catalogId = catalog.catalogId; });
        await report.step('host-identity', async () => {
            const host = await runNode(PI_ENTRY, ['--version'], { cwd: run, env: runtimeEnv(run, process.env, { offline: true }) });
            if (host.code !== 0)
                throw new AcceptanceError('identity', 'Cannot identify the development Pi host');
            report.data.hostPi = host.stdout.trim();
        });
        if (options.mode === 'component') {
            const { runComponent } = await import('./component-acceptance.mjs');
            const { preflightBrowser } = await import('./skill-acceptance.mjs');
            const browserPath = await report.step('browser-setup', () => preflightBrowser());
            const value = await report.step('component', () => runComponent({ ...options, packagePath: identity.root, workspace: run, cwd: run, browserPath, onFailure: async () => { report.data.failedStage ??= report.data.componentStage ?? 'component'; await report.save(); }, onCheckpoint: async (stage, observed) => { report.data.componentStage = stage; Object.assign(report.data.observed, observed); await report.save(); } }));
            Object.assign(report.data.observed, value, { suppliedDsl: true, skillForward: false, normalRegistration: false });
        }
        else {
            const { runAcceptance } = await import('./skill-acceptance.mjs');
            await runAcceptance({ options, identity, run, report });
        }
        await report.step('preservation', async () => {
            if (await packageFingerprint(identity.root, identity.metadata) !== identity.fingerprint || await operatorFingerprint(operatorCwd) !== operatorBefore)
                throw new AcceptanceError('preservation', 'Operator or package files changed during acceptance');
            Object.assign(report.data.observed, { packagePayloadUnchanged: true, operatorFilesUnchanged: true });
        });
        report.data.passed = true;
        await report.save();
        process.stdout.write(JSON.stringify({ ...report.data, receipt: join(run, 'result.json') }) + '\n');
    }
}
catch (error) {
    if (report) {
        report.data.passed = false;
        report.data.failedStage ??= report.data.componentStage ?? (error instanceof AcceptanceError ? error.stage : 'setup');
        report.data.error ??= error instanceof AcceptanceError ? error.message : 'Acceptance failed; inspect private evidence';
        try {
            if (identity)
                report.data.observed.packagePayloadUnchanged = await packageFingerprint(identity.root, identity.metadata) === identity.fingerprint;
            if (operatorBefore)
                report.data.observed.operatorFilesUnchanged = await operatorFingerprint(operatorCwd) === operatorBefore;
            await report.save();
        }
        catch {
            report.data.receiptWriteFailed = true;
        }
    }
    const summary = { passed: false, stage: report?.data.failedStage ?? (error instanceof AcceptanceError ? error.stage : 'identity'), code: error instanceof AcceptanceError ? error.code : 'SETUP', error: error instanceof AcceptanceError ? error.message : 'Acceptance setup failed', ...(run ? { receipt: join(run, 'result.json') } : {}), ...(report?.data.receiptWriteFailed ? { receiptWriteFailed: true } : {}) };
    process.stderr.write(JSON.stringify(summary) + '\n');
    process.exitCode = error instanceof AcceptanceError ? error.exit : 1;
}
