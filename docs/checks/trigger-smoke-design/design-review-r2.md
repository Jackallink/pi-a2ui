# Independent Gate1 design review R2 — GO (DESIGN only)

Date: 2026-11-16. Reviewed HEAD `3abed7e4d0d4a916ea08647c7cdd9b534f7c310c`, tree `1b059294d4f328987d55f4fe187aa02f50e37f6d`; worktree clean. Prior reviewed R1 source `736902724277674caa0e1f968af73dadecee6705`; unchanged runtime base `c8224a3361c99a0f8ebadfdaaee45bdb19aab5e1`.

## Decision and finding closure

**GO for Gate1 DESIGN only.** F-01 [P2] is closed by the reviewed text. No remaining P0/P1/P2/P3 finding requiring correction in this bounded design review.

Spec023 AC-001 now scopes the missing/mismatched-grant refusal before workspace/config/HTTP to LIVE CLI, worker-script and imported execution requests. It separately permits default dry-run and synthetic offline without a paid grant; the canonical implementation-boundary paragraph explicitly requires separate implementation authorization, owned fixtures, synthetic credentials/transport, and no real configuration or external provider access. The plan and all three walkthroughs carry the same distinction. Round2 splits current design, future offline and unauthorized LIVE paths. This resolves the P0 test-intent ambiguity without relaxing real-call authorization or authorizing implementation in the present design-only turn.

The original R1 NO-GO report is retained unchanged, both ignored original and tracked public copy, SHA256 `e2059aea86ae6ea5b1e7f5e9ffbdc74a0372422b6efe3c5bd6fa08980b043b32`. Original static-preflight is unchanged at `4b33d029533e625926f5c6fa7a055b323a717ced55549a9115cf5dd399c49be8`. R2 has its own receipt rather than rewriting R1 evidence.

## Design assessment

Scope and non-scope, testable AC, critical technical paths and error paths are sufficiently explicit for Gate1. The exact natural messages, same released 0.1.10 description, independent new IDs/sessions and unpaired two-row report remain fixed. Sole proposed model/endpoint is Ark AgentPlan `glm-5.3-flash`; Node24, Pi1.5.0 and locked browser identity are stated. There is no A-group comparison or improvement-rate claim and no reopening/rescoring of frozen BM4 or old unknown admissions.

SM02-B runs first at ≤1 request and passes only on complete normal text trimmed to 收到 with no complete tool call. Any complete tool call is observed and stopped before tool execution; render requested remains visible, but attempted/committed=false is a policy stop rather than schema rejection. Other text fails, incomplete/error/truncated output is unknown, and SM01 is not_run unless negative passes. Usage-only absence remains independently unknown without refunding admissions.

SM01-B has ≤3 requests, the batch ≤4 with no borrowing, retry, resume, fallback, probe, paid judge, warming or extra inference. Durable journal fsync precedes dispatch. The final admitted request may finish its permitted tool but cannot trigger another provider request. Preparation exhaustion or text-only clarification does not prove plugin failure. Requested/attempted/committed/content/DOM remain separate; success requires actual submitted UI with the three editable fields and confirmation affordance/bindings, plus clean protocol/cleanup. No real release or action button POST is authorized.

Wire limits (enabled/low, max_completion_tokens1536, tool_choice auto, parallel_tool_calls false, usage requested, 96KiB body, 1MiB response) and configured maximum 6144 output tokens are bounded request settings, not a monetary or measured-usage claim. Native service support and alias identity remain unverified observations for a future authorized run.

Time accounting remains coherent as hard **total** ceilings: request30s; active30/90; cleanup10; TERM-to-KILL2; worker total42/102; batch180 including setup/cleanup and excluding prior zero-inference capture. Future implementation must fit grace and parent fallback cleanup inside total ceilings and bound each child by remaining batch time. Reusing the old deadline-then-extra-grace behavior unchanged would fail the proposed acceptance contract. This is prospective code/test work, not a timing pass here.

## Concrete budget request permitted by this design decision

The coordinator may now ask the user for a new conditional authorization for exactly one new invocation, negative SM02-B≤1 first and positive SM01-B≤3 only after pass, total≤4, fixed messages/model/endpoint/wire/time/tool boundaries and no automatic extras. Such a request is concrete even though the adapter is pending, because the adapter and all offline/code/privacy/cost acceptance gates are explicit prerequisites to paid execution.

This GO supplies **no implementation authorization, no user budget, no current-code live readiness, no code-review GO and no executable final grant**. Current real-request budget remains 0. A future authorized implementation must pass Gate2, meaningful behavioral RED→GREEN, actual-SDK synthetic acceptance, fixed-source complete local Node/type/browser/golden checks and independent code/privacy/cost GO. Only then may the exact command and source/tree/lock/profile/scenario/capture/archive/runtime/guard hashes be bound in a new one-use grant. The executor cannot self-authorize via userAuthorizedRequests. If scope expands or gates fail, paid execution remains blocked. Old pilot live remains disabled and old run/lock/journal stay untouched.

## Source-bound checks and limits

Reviewed the full revised canonical spec, all revised plan/walkthrough/Check117 deltas, unchanged proposed profile and runtime-boundary assessment from R1. Rechecked exact source/tree and clean status. Independent read-only Python/hash/git assertions passed for all eight R2-bound document hashes, preserved R1 report/static receipt, 87 runtime inputs unchanged from runtime base including 76 payload files, five old raw-live hashes and two frozen hashes. R1→R2 changed files are docs only; git diff whitespace check passed.

The R2 static receipt SHA256 is `a65e272f07f3f39114caecdad504841d4046ab162e86f5e082dc1721faf32a12`. Archive identity was reviewed as a design/static-record assertion; this review did not locate/open the release archive. No SDK, JS, fixture, real-config/auth, provider, browser or network operation was executed. No behavioral, CI or live tests were run. All SMG/SMS/SMI rows remain prospective test intent; no existing Check116 result substitutes for future adapter acceptance. Calls attributable to this review: 0. This review writes only its separately authorized ignored report and retains no raw thinking/headers/configuration.

## SHA256 fingerprints of reviewed inputs

| File | SHA256 |
| --- | --- |
| `docs/specs/023-v0110-trigger-smoke.md` | `3bcbcc5581444777a3e9b5bee3b720b91175c096323e0597e3d802018cc26800` |
| `docs/plans/023-v0110-trigger-smoke.md` | `195af09df2efc2278181ab9bd5c5a2a2f290ac1a39d65f2dc32f2c2600966957` |
| `docs/walkthrough/trigger-smoke/01-round1-user-stories.md` | `a682eb0f05a254aa54aa5842028eaeb97ecb2c186820958ec043abebb27d4627` |
| `docs/walkthrough/trigger-smoke/02-round2-technical-trace.md` | `268b82b79bb3f4b5823a342148fb898224f5d03cd4ef103e5ec0bcee93f72bdc` |
| `docs/walkthrough/trigger-smoke/03-round3-integration-check.md` | `5989b979e5bada29ddce43ec27270f59e3d583d89c367fac76c96d2d4332c70b` |
| `docs/checks/trigger-smoke-design/profile.proposed.json` | `79a0c76770ae09915329083d92218ba1b13f804b5bd50a09dff641224009f869` |
| `docs/checks/trigger-smoke-design/static-preflight.json` | `4b33d029533e625926f5c6fa7a055b323a717ced55549a9115cf5dd399c49be8` |
| `docs/checks/trigger-smoke-design/static-preflight-r2.json` | `a65e272f07f3f39114caecdad504841d4046ab162e86f5e082dc1721faf32a12` |
| `docs/checks/trigger-smoke-design/design-review-r1.md` | `e2059aea86ae6ea5b1e7f5e9ffbdc74a0372422b6efe3c5bd6fa08980b043b32` |
| `docs/checks/117-trigger-smoke-design.md` | `493b28e11870f78627ebe592c0876384dbed8aea59ccfbc40bc2a680ce82c8ff` |
| `scripts/trigger-pilot.mjs` | `baac3e106a4ea169f2b0bf36c6da0a5b9d490d72cceb2466d40826fd78e1a604` |
| `tests/trigger-pilot/contracts.ts` | `3e90e1cf3453d5ecd8c677394e0691da6c1effe3ebe5cec57173ec98afa8cbc8` |
| `tests/trigger-pilot/control.ts` | `f2c2388fc5ba8623c68608c3c4d8729b72d5844940c39ee9085537f5de6cafa6` |
| `tests/trigger-pilot/worker.ts` | `f7e41e37bab34fab8b330dd6461feceb4ef6c72b48207caad0783b6c120722df` |
| `tests/trigger-pilot/offline-read-guard.ts` | `5386b3ee82239e8323a21907698183b3338225a0642e559677bd81717df1f44e` |
| `tests/trigger-pilot/diagnostics.ts` | `ae9496c3eca20e5809792fbe5a3051c4a130b68b3fe4d6262a3e718675c2bdb0` |

## Final metadata/artifact binding addendum — limited GO

Date: 2026-11-16. Base reviewed HEAD/tree remains `3abed7e4d0d4a916ea08647c7cdd9b534f7c310c` / `1b059294d4f328987d55f4fe187aa02f50e37f6d`. This addendum reviews the three uncommitted tracked document changes listed below. It does not claim a final commit/tree identity. The initial R2 section is preserved byte-for-byte; its pre-addendum SHA256 is `b435aa9dde0f65c9dd0da243193b206aecbfa5771680c5df58b4580d9816ec5f`.

**Limited GO for these exact final metadata/artifact contents.** Spec023 and Round1 accurately record walkthrough-approved after R2, with Gate2/implementation/execution unapproved. Check117 accurately preserves the R1 NO-GO → correction → R2 design GO chain, distinct R1/R2 static provenance, pending adapter/local-CI/actual-SDK synthetic/independent-code gates and budget0. Its proposed new user authorization is explicitly conditional: necessary minimal adapter and zero-inference acceptance first, independent code/privacy/cost GO, then one new bounded 1/3/4 batch with final source/command/profile/capture/grant binding. It does not invent an executable command or treat a later executor-generated grant as a second source of budget. The actual grant may only record the user's explicit authorization and cannot expand it. Historical frozen data, old unknown attempts, runtime-disabled status and current no-implementation boundary remain intact.

Only these three tracked files differ from the reviewed R2 HEAD; other R2-bound artifacts retain their original hashes. No new scope/behavior/profile/model/prompt/budget/test change was introduced, and no further finding is raised. Copying this exact review report into the linked documentation and creating a docs-only local checkpoint does not alter the reviewed experiment policy. Any later substantive artifact change needs fresh review. No SDK/config/provider/browser/network or behavioral test was executed for this binding; current paid-call authorization remains absent.

| Final document | SHA256 |
| --- | --- |
| `docs/specs/023-v0110-trigger-smoke.md` | `fc3bd7b67b840c8c616711be998b8c5795cdac89eb8dfc5307b6df946eb8d4ab` |
| `docs/walkthrough/trigger-smoke/01-round1-user-stories.md` | `d6d01cd6ba3fccd641a7aa3fe2fa4903212f51419cc2f5aef29aeb5cb997c4d6` |
| `docs/checks/117-trigger-smoke-design.md` | `9a377ca21e83c0f6a2da8840dbe6738dfeaeb0de29efdcbcd1874ef3a811016c` |
