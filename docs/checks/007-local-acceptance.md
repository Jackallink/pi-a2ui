# Local package and Pi acceptance — 2026-11-13

Historical partial-acceptance checkpoint. Current local acceptance is completed with the user-specified GLM model in [008-glm-agentplan-acceptance.md](008-glm-agentplan-acceptance.md). Retain quota and endpoint observations below as history.

Status: **code/review GO; project-local installation and runtime paths verified; full live acceptance BLOCKED at final model reply by provider quota**. Canonical spec remains review-ready, not complete. No public package/forge publication or remote deployment.

## Final artifact and installation

- Package: `.local/pi-a2ui-0.1.0.tgz` (~160 KiB compressed), bundled `dist/index.html`, `client.js`, `client.css`, extension and source imports.
- Final SHA256: `e2e09b58a79b1fb6116aff1c2f7c222f21ab6aceab2f3a2b8d241a0553fb872e`.
- Extracted to `.local/installed/package`, installed production dependencies only with `npm install --omit=dev --ignore-scripts --package-lock=false`. No esbuild/development build executable in installed tree. No build was run in the installed package.
- `pi install -l /Users/jakeliu/Workspace/pi-a2ui/.local/installed/package --approve` exited0. `pi list` shows it under Project packages. `.pi/settings.json` contains the package registration; existing user package/credential files were not changed.
- Compared every archive file byte-for-byte with installed counterpart: match. The package's TypeBox runtime dependency initially triggered an actual Pi host-module diagnostic. Removed it from runtime dependencies, declared optional peer `*` and dev version1.3.27, repacked/reinstalled. Fresh interactive Pi1.5.0 startup loaded extension with **zero extension warnings**. Independent scoped review of this metadata repair is in006.

## Final automated and independent evidence

- `npm run check`: exit0, no diagnostics.
- `npm test`: **43 passed,0 failed,0 skipped** (core32, HTTP6, controller/adapter5).
- `npm run build`/`npm pack`: exit0; archive includes all runtime imports and browser assets.
- Actual Chromium1248 suite: **5 passed** after string-binding initialization changes. Covers official renderer/form/context, literal HTML/no external requests, unsent input across unrelated updates, reconnect/replacement/epoch clearing, obsolete pending POST and deadline/no retry.
- Slow-client HTTP case: native paused SSE consumer is disconnected at the bounded queue; a new client receives the full current snapshot. Temporarily disabling only the queue guard made the assertion fail (`clients 1 !== 0`); restoring guard ->6/6 HTTP GREEN. This is targeted mutation verification, not an upstream SDK guarantee.
- Design review initially NO-GO, revised GO; final independent code/scoped repair reviews GO, no outstanding P0/P1 or reviewed binding/scanner P2. Reports001/004/006 distinguish independent runs from parent observations.
- Walkthrough structural validator and `git diff --check` pass. No claim that dependency audit is clean:4 high affected package records derive from unpatched upstream Zod advisory, as documented in005/006 and README.

## Real Pi/model/browser observations

The acceptance harness uses installed package source, real Pi1.5.0 RPC and a real Chromium browser. Only `a2ui_render` is enabled; unrelated tools/skills/MCP/context files are disabled for this bounded check. A private PATH shim captures `/a2ui`'s OS browser launch argument, then Chromium navigates to that exact bootstrap URL. This checks Pi command invocation and the actual page, not the operating system's default browser association. No credential URLs are printed or put in this record.

| Path | Observation |
| --- | --- |
| Native DeepSeek readiness | Credential readiness check ready; first real request refused InsufficientBalance; no UI tool executed. |
| Existing SiliconFlow provider | Provider-only auth check ready; existing provider extension loaded explicitly; real request refused insufficient balance; no UI tool executed. Initial auth check using an unavailable builtin custom model had returned invalid_state; it was not proof of credential failure. |
| Volcengine Ark / deepseek-v4-flash | Real model produced exactly one successful a2ui_render result containing the acceptance form, then replied “Form ready”. |
| Browser | Official Card/TextField/Button rendered; bootstrap fragment removed; form filled with literal `pi-a2ui-local-acceptance-20261113`; POST acknowledged Sent to Pi. |
| Same Pi session | Persisted session contains exactly one structured A2UI browser-context user message with that submitted value after the successful tool result. Actual subsequent model work began. |
| Final model reply | **Not passed**: provider returned429 AccountQuotaExceeded. Pi's own retries produced four quota error records; no successful subsequent assistant reply. We stopped further model requests. |
| Quota provider message | Reported weekly reset2026-11-16 00:00:00 +0800; this is the provider's reported time, not a scheduled follow-up or guarantee. |

These observations prove model generation/tool rendering and browser->same-session handoff. They do not convert HTTP202 into a successful-model acknowledgment or prove completion of the final reply path.

### Agent Plan endpoint audit after user challenge

The Volcengine run was **Agent Plan**, not Coding Plan. The harness selected `volcengine-ark/deepseek-v4-flash`; the local models.json declares that provider at `https://ark.cn-beijing.volces.com/api/plan/v3`. A fresh read-only Pi RPC `get_state` with the same provider/model returned api=openai-completions and exactly that baseUrl; no model request was sent during this audit. The old static Agent Plan extension is archived because the provider definition moved into models.json, so absence of that extension from installed packages did not imply fallback to Coding Plan. There was no `/api/coding/v3` override in the acceptance command.

The observed429/AccountQuotaExceeded applies to the recorded request on that Agent Plan model. It is not independent evidence that the whole Agent Plan account or every available model has no usable quota. Earlier chat wording generalized this too broadly; the unresolved acceptance step remains that specific failed subsequent reply. Do not silently swap to Coding Plan or infer a plan-wide quota diagnosis from this record.

## Zero-model runtime acceptance

- Restore-only run loaded the same persisted successful real-model tool snapshot from the installed package, opened the official UI, removed the bootstrap fragment, and observed0 page errors. It submitted no action and made no model request.
- Screenshot: `.local/live/restored.png`. Machine-readable result: `.local/live/restore-result.json` has restoredActualModelToolResult=true, browserForm=true, browserErrors=0, listenerReleased=true, processExited=true.
- Actual interactive Pi `/a2ui` started a200 shell; `/reload` reported resources reloaded and the old listener became unreachable. A second `/a2ui` opened a different origin returning200. Ctrl-D quit exited0 and released that listener. Result: `.local/live/reload-result.json`. This is real lifecycle evidence, not the unit-controller double.
- After the host-TypeBox metadata correction, a fresh interactive startup had no extension issue/warning. No provider request was made during these command-only checks.

## Remaining blocker and rollback

LIVE-01: observe a successful actual model reply containing the submitted form context after quota is available. Smallest action: restore a provider's usable quota or select an already-authorized provider/model with available quota, then run `scripts/live-acceptance.mjs` with the documented A2UI_ACCEPT_PROVIDER/MODEL/PROVIDER_EXTENSION and installed Chromium environment. Do not repeatedly retry accounts that already refuse balance/quota; do not purchase credit or change credentials automatically. Restore-only mode (`A2UI_ACCEPT_RESTORE_ONLY=1`) makes no model calls and is not a substitute for LIVE-01.

Project-local package remains installed for use. `/a2ui-toggle` pauses rendering/actions; `pi remove -l /Users/jakeliu/Workspace/pi-a2ui/.local/installed/package` removes only this project registration. Branch `codex/mvp` stays local; no merge/push/publication.
