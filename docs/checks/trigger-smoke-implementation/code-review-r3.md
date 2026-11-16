# Spec023 independent code / privacy / cost / authorization review R3

Reviewed exact source `05e1517fd266238d4f062aab5bb9cd152f6a50aa`, tree `51cc4016e09adf13ea8c3738161581a0b33c6205`, clean at entry. Prior R2 source `01fcd8a7255f4dd86e434f87200db2e70324740f`. The original R2 NO-GO report/public copy remains unchanged at SHA256 `3053a65fecf434786a237d21227fe937d3f8951efe56bc33564bb4a22bb69f95`.

## Initial source assessment — final acceptance pending

**No open blocking source/privacy/cost/authorization finding identified in this R3 correction.** Residual F-02 is closed by the new identity-preserving predicate and focused actual-SDK/DOM RED→GREEN evidence. This initial section is **not final code or live GO**: complete fixed-source checks and preservation/prepare receipts are pending. Later acceptance, if earned, must be appended with exact evidence; do not silently turn partial review into a paid-call admission.

## F-02 closure

formCandidates now returns the selected field IDs/paths/kinds and the specific bound button ID/caption. Each field label must identify exactly one semantic category; each confirmation context must identify exactly one contextual field per application/environment/version category, with three distinct paths. Cancel/empty-context/ambiguous alternatives cannot supply a valid candidate.

The DOM predicate traverses the canvas's actual rendered component hosts across shadow roots and matches host.context.componentModel.id to each selected snapshot component. Each selected field's own native control must pass the availability checks, and the selected bound button's own native button must be available with the selected caption. Unrelated input counts and unrelated same-caption buttons no longer satisfy the predicate. Visibility/state checks include connected/layout state, disabled/readOnly, hidden/inert/style and closed Details ancestry. This is a read-only observation at the captured UI state; it does not click/fill/submit or certify a real business release.

The worker invokes this self-contained predicate through canvas.evaluate and stores bounded component/path/availability evidence in contentBinding. No product or renderer-kernel code was modified. The earlier tsx __name serialization failure is explicitly retained as a setup failure rather than behavioral RED.

Inspected dom-binding-red.log: both hidden-selected and ambiguous-labels complete compiler/server/DOM controls were misclassified render_committed by the previous oracle and fail their intended ui_invalid assertion. These are genuine acceptance-behavior REDs. Inspected dom-binding-green-r2.log: normal, cancel-only, unbound-confirm, hidden-selected and ambiguous-labels all pass5/5. Their assertions preserve requested/attempted/committed distinctions, cleanup, DOM observation, no action POST and correct final contentValid status.

| Focused evidence | SHA256 |
| --- | --- |
| dom-binding-red.log | `36877026cac32882dd574bd8ebd45e8feb3c8872c7521ff10cd88a0c8c674ba7` |
| dom-binding-green-r2.log | `2ea9e07eb51b9d72b2800399c4abc7d0e997cf95f81e25072a3b96cb88265d14` |

## Prior findings and invariant scope

F-01 reasoning privacy projection, F-03 unknown/protocol classification and F-04 real-entry source/ticket/replay/negative-receipt acceptance remain closed as reviewed in R2. The R3 diff does not alter their code or weaken their contracts. Existing safe diagnostics remain unchanged; persisted assistant content still projects only public text/toolCall fields, not raw native reasoning/signatures. No SDK memory history/prompt/tool-description change occurred.

The sole proposed live model remains Ark AgentPlan glm-5.3-flash on the specified endpoint under Node24. The user already authorized exactly one future invocation, SM02-B≤1 first and SM01-B≤3 only after negative pass, aggregate≤4, no borrowing/refund/retry/resume/fallback/probe/judge. The R3 corrective diff changes only private oracle/fixtures and evidence docs, with no budget/profile/model/endpoint/public-product widening. Old pilot live stays disabled; old failed/unknown/frozen receipts must remain intact.

Final ordering remains: complete fixed-source zero-inference acceptance and independent code/privacy/cost GO → operator records the existing explicit user authorization in the exact source-bound one-use grant → independent grant/command binding → one authorized batch. This review does not require a grant before code GO and does not grant a second budget or allow a replacement invocation.

## Review method and pending evidence

Read-only source/diff/log/hash inspection only. No SDK, JS/Node/Pi, browser, config/auth, provider, network or test execution was performed by the reviewer. Only this ignored report is written. Candidate/base diff whitespace check passes. Focused typecheck log contains tsc --noEmit without errors, with successful exit reported by coordinator; complete fixed-source Node/browser/compatible golden union/default/public offline/prepare and source/runtime/archive/product/history fingerprints still need exact final evidence before code acceptance. Historical531/536results are not substituted for this source.

No real grant or request was supplied or approved at this stage. Current code/evidence decision remains pending, with no source correction demanded by the initial R3 review.

## Candidate fingerprints

| File | SHA256 at reviewed source |
| --- | --- |
| `docs/specs/023-v0110-trigger-smoke.md` | `5b5ec0b2b70df11c4cd999513fb0d7600331d2b0028e3f82dd2d0a49cce4075a` |
| `docs/plans/023-v0110-trigger-smoke.md` | `17c3fb1517c7be9e770403500b4c102945c090f7b794fd5f3ac39c28fbd5e8c8` |
| `docs/checks/118-trigger-smoke-implementation.md` | `5e0eb0188c81146a33b24ca44af471512f2c3c5d542e2a92fcad5fb29f627a5f` |
| `tests/trigger-smoke/observations.ts` | `d46cc8ae876af194d8ed4737207e7da20db49e6b93246fc11a87ed1c55e7c836` |
| `tests/trigger-smoke/policy.ts` | `6a46bd31864033d434e66ef0531ebd59b45f832d70dcbb73e253ab5128fd3fa3` |
| `tests/trigger-smoke/profile.json` | `a2746ccc5af09c397737b0f9f5fea334627500b48fa4bf2daf2558b9d38200a0` |
| `scripts/trigger-smoke.mjs` | `5473923aa90ff24342838260bf78b643e7b2d061a50faf04c53554e97e028d36` |
| `tests/trigger-pilot/worker.ts` | `d50ff2be819961f43f819580dd353fb7c62865c5c0312d551962e179d1b6b78c` |
| `tests/trigger-pilot/contracts.ts` | `a43cb655576b206d57ed3e81248dabe4a99324a3c83a75b38828b8eab74a157b` |
| `tests/trigger-pilot/control.ts` | `a350887f66f00dca986dc19cb645ad4114649c056211061c5745a4f0a49ce760` |
| `tests/trigger-pilot/offline-read-guard.ts` | `6429b5bacc4bfb5d3ee2c09e59e206f2a3310415f20c50d82e0cdd515aeeb582` |
| `tests/trigger-pilot/diagnostics.ts` | `ae9496c3eca20e5809792fbe5a3051c4a130b68b3fe4d6262a3e718675c2bdb0` |
| `tests/trigger-smoke-authority.test.ts` | `377a24ce2165eacb3d0eb3651bda959284dbbdd5c869548c19fd0abb5f11a10a` |
| `tests/trigger-smoke-sdk.test.ts` | `707966e7f5f4fdfa23a2666d90fdb9ed336edde44617ce5cd02e860e7f436af3` |
| `tests/trigger-smoke-cli.test.ts` | `b24dc11a584f2e38b64ce7bf148181b32895755dc292daba3f69c3e1f5a1b48f` |
| `tests/trigger-smoke-grant.test.ts` | `6ae99822b2ba5e5c5da65657d0b543c16614658f0ad649452d4527f5c536e30c` |

## Final fixed-source zero-inference acceptance — CODE / PRIVACY / COST / AUTHORIZATION GO

Reviewed source/tree still exactly `05e1517fd266238d4f062aab5bb9cd152f6a50aa` / `51cc4016e09adf13ea8c3738161581a0b33c6205`, clean after all supplied checks. Initial R3 prefix is preserved byte-for-byte at pre-addendum SHA256 `539acd67c7b6f74899bf3c4273d3b1134bbdeac3eec5027868d2abf6e25f2fd4`.

**Final CODE / privacy / cost / authorization-boundary GO for this exact candidate. Open P0/P1/P2 findings:0.** All R1/R2 findings close with their genuine synthetic RED→GREEN evidence preserved. This GO completes the independent code/evidence prerequisite; it does not itself create a user grant or approve a yet-unspecified live command. The operator may now record the user's existing one-invocation authorization in the exact prepared source-bound one-use grant, then submit that grant/command for final binding. There is no new or second model budget.

### Fixed-candidate acceptance inspected

- Full Node:538/538pass,0fail,246897.8875ms; complete r3-full-node.log. This source's total replaces neither the531 nor536historical result, which remain history.
- TypeScript: r3-fixed-types.log contains tsc --noEmit without errors; coordinator's execution record and evidence manifest report exit0.
- Complete serial browser runner:90/90pass,1worker,1.4m, all four browser groups present. Browser receipts identify this exact source and locked Chromium. Historical/advisory BM3 pixels remain advisory and do not establish a cross-platform pixel gate.
- Strict golden union: coordinator executed combine-local with exit0. Independently read both preserved raw reports and verified exact compatible identity, clean source, complete layer-specific IDs,68unique rows,45positive/23negative, pass=true/failedStage=null/canary=false, each actual-input hash equal to its current fixture hash. Independently recomputed dataset, oracle-set, lockfile and asset hashes. Browser/environment match Node24.18.1 and locked Chromium158.0.8127.18 revision1254.
- Default dry-run: providerRequests0/credentialReads0 and current fixed identity.
- Normal public offline: run-pWmoeQ/report.json at SHA256 `a99b955b2d0c641b1acec1baea9f94b481b84024acea4aa63b3d08a8f77a8a94` contains exactly2rows: negative_pass then render_committed, one synthetic request each, actualModelRequests0, clean cleanup, actionPosts0 and selected-component contentBinding.matched=true. This is synthetic UI acceptance, not a real-model result.
- Prepare: run-wdo9bd contains exactly the2zero-inference SDK captures with modelCalls0 and clean cleanup. Raw preflight file SHA256 `000b624e6873422504219c7b710b6e7839039336dcca30f3e482a1caaff51dd8`; its JSON.stringify semantic SHA256 `3c537bf94453f416679ba58e23212c84fa3464387483d4dce9557d2c57063fdd`. Independently verified those hashes, all92guarded current file hashes, source/tree/Node/Pi/clean state, contexts equality and all4capture-file hashes. Each capture receipt binds its approved first-body hash, requests1/modelCalls0, and actual body has glm-5.3-flash/native-enabled/low/max_completion_tokens1536 with no max_tokens.
- New full-suite authority fixture: legitimate negative/positive witnesses true; all13mutations refuse with config/network/workspace/spawn/claim0; real fake-repo concurrent CLI admission has one intercepted worker-spawn winner; replay cannot spawn. No actual credentials or provider requests occur.
- Preservation: independently rehashed all76production payload files and compared their bytes to the implementation baseline, the exact released archive, five old raw live files, two frozen files and one public stopped-result export. All match. Prior old2admissions and0complete-pairs facts are retained; no old run/frozen rescoring/global install change is authorized.

All ten hashes in r3-offline-evidence.json's logs map were independently checked. Additional preserved raw golden reports match the original .local/golden-reports copies byte-for-byte. The manifest reports all actual check exits0 and realProviderRequests0; the inspected raw terminal outputs agree with its counts. No JS/SDK/Pi/browser/config/auth/provider/network execution or test rerun was performed by this reviewer; only read-only Python/shell/hash inspection and this report append.

### Scope of the subsequent one-use grant

The existing user authorization remains **one** new invocation on the exact approved source/prepared state, SM02-B≤1 first and only if pass then SM01-B≤3, total≤4, only Ark AgentPlan glm-5.3-flash and Node24. All fixed wire/tool/time/body/output limits apply. No retry/resume/fallback/health probe/paid judge, quota borrowing/refund, old batch/frozen rerun or unrelated merge/push/release/global update is authorized. Any grant-lock acquisition consumes the invocation even before first POST, including setup failure. The executor cannot issue replacement approval or a second budget.

The exact grant file/id/hash/run/source/tree/preflight/profile/captures/input identity and full command still need final binding before execution. No live grant existed or was approved in the reviewed evidence. Do not alter this source or prepared artifacts between that binding and the single invocation; drift must refuse closed. Completion/failure/unknown of the batch is a later evidence tier, and cannot be inferred from this CODE GO.

### Final evidence fingerprints

| Bound evidence | SHA256 |
| --- | --- |
| `.local/trigger-smoke-implementation/r3-offline-evidence.json` | `67155cf9fa298f227304645c81ab7759b5e6e660a72a7c05374d141341c68389` |
| `.local/trigger-smoke-implementation/r3-preservation.json` | `35f0e4d46920f2270357a3add495ae8c2acaf1fe76e646bf59da2a878165ebfe` |
| `.local/trigger-smoke-implementation/r3-golden-node.json` | `46e9a00cc9d22a80ec91b0836e464eb64239776e433aa89717dc4147995934c1` |
| `.local/trigger-smoke-implementation/r3-golden-browser.json` | `51545ff6d26ea15a367ee8f36e897346629d1c1440620c645db9177a2b8babe8` |
| `.local/trigger-smoke-implementation/authority-1QtWrs/.local/result.json` | `ecd1c5aa8967fdc3a7a3ce7472d3511965e20d7a22c7750cd5083ca06d999417` |
