# Trigger pilot implementation plan

> Root executes inline in the existing isolated worktree. Independent reviewers assess fixed contracts and artifacts; the user authorized the defined36-request batch after offline checks/review, so no new execution-choice menu is required.

**Goal:** measure six new natural tasks under old/new trigger descriptions without touching frozen BM4 results.
**Architecture:** standalone zero-inference CLI orchestrates serial actual-Pi SDK workers. A durable per-batch journal limits requests before dispatch; a private host changes only the description clause. Synthetic capture proves equal first contexts and exercises actual schema/render/cleanup behavior before one authorized live batch.
**Tech stack:** Node24, Pi1.5.0, existing A2UI dependencies, locked Playwright. No new runtime dependency or product files.
**Spec:** docs/specs/022-v0110-trigger-pilot.md ACs in its three walkthroughs.

## Constraints

Only AgentPlan glm-5.3-flash;12episodes≤3requests each≤36batch;max_tokens1536;96KiBrequest;request30s/episode90s/cleanup10s/batch20min. One attempt, no model retry/fallback or paid judge, no post-render request or real business action. Frozen profiles/scenarios/reports and user installation/configuration remain unchanged. CLI defaults dry-run with zero credential reads; no hosted CI, merge, release or global upgrade is authorized by this pilot task.

## Task1: contracts and gate tests

Files: new tests/trigger-pilot/profile.json, scenarios.json, contracts.ts; new tests/trigger-pilot.test.ts. No changes under tests/benchmark-model.

Interfaces: `PilotBudget(journal,mode).admit(episode,url,model,body)` validates identity/options/body/tool choice and limits, synchronously journals/fsyncs before transport. `observeAssistant(record,message)` records complete pre-schema requested intent; `descriptionForArm(description,arm)` changes only the exact clause. `summarize` reports raw dimensions and only complete pairs. Default CLI never imports the actual credential/runtime worker.

- [ ] Write tests before contracts; safe initial stubs fail positive intent/admission behavior (not missing-import/compiler failure), preserve RED. Concrete test intent: `observeAssistant({}, {role:'assistant',stopReason:'toolUse',content:[{type:'toolCall',id:'x',name:'a2ui_render',arguments:{surfaceId:'x'}}]}).renderRequested === true` despite missing source; a fourth valid request must be rejected with journal length3. Inject endpoint/model/body/usage/description and summary counterexamples.
- [ ] Implement smallest guard/observer/profile/scenario layer, preserving6fixed messages and no case/helper hint in model prompts. Test batch37th and per-case4th, durable ordering, unknown receipts, description count/unchanged suffix, truncated classification and paired reporting.
- [ ] Map AC001/002/004/005/006 to these tests and actual SDK controls in Task2; independent Gate2 review before implementation. Check records retain admissions and original design revisions.

## Task2: actual SDK worker and safe standalone CLI

Files: new tests/trigger-pilot/worker.ts, control.ts, tests/trigger-pilot-sdk.test.ts; new scripts/trigger-pilot.mjs.

Interfaces: `worker(episode,arm,run,mode,simulation)` loads the unchanged release payload, normal skill discovery, actual extension factory and ModelRuntime. The parent runs one worker at a time, validates final receipts against the shared journal and requires each live initial normalized request to match its frozen synthetic context. Only a terminal observation/actual tool result may stop authoring; no steering prompt is injected.

- [ ] ActualSDK synthetic missing-source/invalid-surfaceId calls must record requestedtrue/attemptedfalse/committedfalse and stop with no next provider request. Synthetic text ends without UI. Read/helper/write preparations are separate. Valid render uses actualcompiler/server/headlessbrowser; no Button dispatch.
- [ ] Guard all tool executions: read package references/project ordinary text; write/edit only owned draft; bash only exact helper query/check; actual render source unmodified and preflight optional. First preflight failure/first render/schema outcome blocks subsequent provider calls. Disallow overlapping/nested/extra tools and unsafe paths/shell. Guard errors remain distinct from model/compiler choice.
- [ ] Wrap actual stream transport: select only approved in-memory credential; strict URL/model/options/no redirect; journal before fetch; capture real SSE usage presence (null is not zero). Synthetic transport has no auth reads. No fallback/retry; auth/rate-limit/unknown outcome or cleanup failure stops batch.
- [ ] Capture both actual SDK initial request bodies for every pair with the same visible paths/time/default system state, and require exact equality after only the trigger-clause normalization. Store source/context/guard/profile/scenario/artifact hashes; live verifies each first body before dispatch. Do not normalize other meaningful fields.
- [ ] Parent hard-stop owns process group/browser PID/profile ledger and only owned workspace. Verify actual hang/cleanup canary, default/invalid CLI zero-inference, malformed archive/context identities fail before auth, and unknown final receipt conservatively stops.

## Task3: freeze, review, run once and report

Files: Check114+bounded evidence, local raw pilot batch; Spec022 status metadata after actual gates. Package-excluded files only.

- [ ] Narrow guard/actualSDK controls, Node/type/complete browser regression and compatible golden union on a clean fixed candidate; verify unchanged76production payload and frozen baseline hashes. Pre-register precise commands and owned run directory.
- [ ] Independent code/cost/isolation review GO on exact source and offline evidence; any failure returns to correction and fresh review, preserving prior logs. No live call before this gate.
- [ ] Execute one serial12episode batch with the approved36-request ceiling. Keep failed/unknown/not-run outcomes; do not repair/retry/restart it for a better result. No frozen benchmark entry is run.
- [ ] Report12rows, complete pairs, requested/attempted/committed/content/DOM/preparation/errors, request/usage/unknown and all IDs/hashes. Content review uses task facts/actualsnapshot/DOM and human inspection, no judge model. Verify user/frozen/payload preservation and owned cleanup; update lifecycle accurately. No merge/publication beyond the explicitly requested local pilot.

Self-audit: all six ACs are covered across the pure limits, actual SDK observer and real render/control path, exact contexts and one authorized batch. Any three-request bottleneck stays a reported bounded outcome, not a reason to enlarge budget.
