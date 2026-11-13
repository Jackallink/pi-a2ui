# GLM Agent Plan acceptance and product value — 2026-11-13

Status: **LIVE-01 closed; local MVP acceptance complete**. Supersedes the previous quota-blocked conclusion in007 for current local acceptance. Independent code-review GO and prior automated evidence remain separate; public production readiness is not granted here.

## User model/cost constraint

User specified `glm-5.3-flash` on Volcengine Ark Agent Plan and stated other models' paid overage is not enabled. Subsequent model checks use only `volcengine-ark/glm-5.3-flash`. The acceptance harness now defaults to that selection and refuses a model request if Pi resolves a different model or a Volcengine baseUrl other than `https://ark.cn-beijing.volces.com/api/plan/v3`. Credentials and global provider settings were not changed. An isolated acceptance-workspace option avoids contaminating these runs with previous model sessions.

## Technical closed-loop evidence

Command: run `scripts/live-acceptance.mjs` against the already-installed `.local/installed/package`, with A2UI_ACCEPT_PROVIDER=volcengine-ark, A2UI_ACCEPT_MODEL=glm-5.3-flash, A2UI_ACCEPT_WORKSPACE pointing to `.local/live-glm-5.3-flash`, and the installed Chromium1248 executable.

Observed process exit0. Machine result `.local/live-glm-5.3-flash/result-volcengine-ark.json`:

- actualToolResult=true, browserForm=true, fragmentCleared=true.
- local202=true and actualNextTurnContainsSubmittedValue=true. The latter is an observed real model reply, not inferred from HTTP202.
- browserErrors=0, listenerReleased=true, processExited=true.
- Persisted session: one successful UI tool result, no assistant error records.

This closes the previously outstanding successful-model-reply acceptance path. The old DeepSeek-model quota errors did not establish that this enabled GLM model was unavailable.

## Concrete workflow: confirm requirements before coding

The model was asked to design a Chinese UI for confirming file-cache requirements. No fixed DSL source was provided in this case. The model generated an official Card/Column/Text/TextField/Button surface with:

1. Cache directory, bound to `/form/cacheDir`, initialized `.cache`.
2. TTL in seconds, bound to `/form/ttlSeconds`, initialized string `300`.
3. Acceptance criteria, bound to `/form/successCriteria`, initialized Chinese criteria text.
4. A “确认需求” button with `confirm_requirements` event and the three direct field bindings.

Browser changed the directory to `.cache-fast`, TTL to `120`, and criteria to the unique literal acceptance marker. One actual structured browser-action user message entered the same Pi session. The actual GLM response correctly repeated all three submitted values in Chinese and did not begin implementation, as requested. Browser errors0; process exit0; listener released. Snapshot and screenshot are under `.local/value-demo/`; screenshot `acceptance.png`. No project source files were read or modified by the model; only a2ui_render was enabled.

The first browser driver incorrectly assumed all three fields had the textbox role. GLM legitimately used the SDK number variant for TTL, which has spinbutton semantics. The driver was corrected to fill the three actual inputs/textarea, then restored the persisted model-generated UI and completed submission without regenerating the UI. This was a test-driver locator issue, not behavioral RED for production code; no production renderer change was made.

## Value and limits

This supports a concrete local use case: a coding agent can present multiple requirements together, keep field names/values explicit, and receive the user's edited values without manual transcription from prose. The same existing components can express named plan-choice buttons and concise progress/next-action cards, but those business scenarios have not received separate outcome studies.

Current MVP is a task interaction surface: six basic components, atomic full-surface updates, current-branch restoration and user actions returned to Pi. It does not add model intelligence, autonomous business execution, custom diff/chart/table widgets, live log dashboards or token-streaming preview. Ordinary code reading/writing can remain in the terminal. The useful adoption test is whether recurring human clarification/decision points become easier and require less rework; no measured productivity or cost saving is claimed from this acceptance demo.

The package runtime files and install archive were unchanged by this follow-up; only the acceptance driver defaults/guard and documentation changed. Prior43 Node checks,5 Chromium cases, independent reviews, actual reload and installation evidence remain the owning validation for the same runtime artifact. Known upstream Zod audit records remain disclosed; no public release or remote deployment occurred.
