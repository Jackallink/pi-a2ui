# Implementation validation — 2026-11-13

Historical checkpoint before final repairs/install. Superseded for current status and final counts by [007-local-acceptance.md](007-local-acceptance.md); retain original runs below as evidence.

Scope: canonical MVP spec, local installation/live test authorization only. Public publication excluded.

## Gate record

- draft: user stories, technical trace, error matrix and AC mapping recorded before code.
- walkthrough-approved: independent design review initially NO-GO for2 P1s; amended and independently re-reviewed GO in001-design-review.md. Bundled walkthrough structural validator passes.
- tdd-approved: user authorized continuation on independent GO; reviewed AC mapping and behavioral test intents cover all P1 paths before implementation.
- in-progress: real SDK core, HTTP boundary, Pi controller/adapter and browser built.

## RED / GREEN

- Core: 22 real-SDK session/compiler tests; individual regressions and precise outcomes in003-core-tdd.md.
- HTTP: initial runnable deny-all native server failed4 behavior assertions (401 vs200) without import/fixture failure. Implemented routes/auth/SSE/limits/cleanup ->4/4 GREEN.
- Reviewed transport defect: maximum256KiB JSON snapshot disconnected before headers with UND_ERR_SOCKET; new regression RED. Added64-byte fixed frame allowance ->5/5 HTTP GREEN, independently re-reviewed GO in004-transport-review.md.
- Controller: with real core and unguarded async startup,4 assertions failed (old session/shutdown render wrongly fulfilled;3 starts vs2; saved branch not restored). Origin operation token, shared retryable startup, close-on-late-start and current-branch restore ->4/4 GREEN.
- Pi adapter: empty initializer failed missing a2ui_render assertion. Implemented tool/commands/history/lifecycle -> adapter check GREEN; no browser credential appears in tool output/details.
- Browser P2: reconstructed original global sending implementation failed both old-epoch/revision regressions (aria-busy=true/inert retained). Fixed operation-owned abort/deadline/status isolation ->5/5 actual Chromium tests GREEN. Logs retained locally under .local/client-review; no credentials in report.

## Observed checks so far

`npm run check`: exit0. `npm test`:32 tests,32 passed,0 failed/skipped. Exact Node tests are core22 + HTTP5 + controller/adapter5. Browser acceptance uses official Lit/core component implementations and Chromium1248, not a mock renderer. Five cases exercise real form values, literal HTML escaping/no external request, preserved unsent input across another-surface update, reconnection, replacement/reset, obsolete pending POST isolation and15-second deadline/no retry. Use `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to select the installed Chromium1248; default Playwright1254 is absent on this machine. Browser history/refresh restores committed state, not unsubmitted keystrokes.

The official TextField renders a label without accessible for/id association; tests locate its textbox by role. This upstream accessibility limitation is recorded, not patched or claimed resolved.

## Dependency risk

`npm audit --json`:4 high-severity affected package records, all derive from one advisory GHSA-mrhx-c7xc-m3w5 / CVE-2023-54404 in Zod<4.6.6. Installed SDKs require Zod3; no compatible upstream fix. Advisory: https://github.com/advisories/GHSA-mrhx-c7xc-m3w5 . No forced major override/downgrade applied. Our JSON/source structural and size preflights bound work before SDK validation; this does not patch Zod or establish absence of denial-of-service possibilities. Local trusted-process trial scope remains distinct from public production readiness. Independent final reviewer must assess this boundary.

## Live readiness, not acceptance

Installed Pi reports1.5.0. Read-only `pi auth check --provider siliconflow --model deepseek-ai/DeepSeek-V4-Flash --json --no-refresh` returned invalid_state; no key values read/printed. Alternate already-configured native provider `deepseek` reports ready (api_key) and builtin model list includes deepseek-flash. Real model/browser turn still requires observed acceptance after code GO. No credential content is in this record.

## Remaining gate

Independent whole-branch code review, final package/install validation, actual same-session Pi model->tool->browser->action->next-turn and cleanup evidence are not implied by the above passes. Record them separately before complete.
