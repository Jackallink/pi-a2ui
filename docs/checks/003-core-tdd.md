# Core compiler and session TDD — 2026-11-13

Scope: `src/catalog.ts`, `src/compiler.ts`, `src/session.ts`, `tests/session.test.ts`. Design basis: canonical spec and independent design GO in `001-design-review.md`; SDK characterization is separate evidence. No server, browser, extension, installation, model-turn or release claim is made here.

## Initial behavioral RED

Wrote 12 acceptance tests against executable API stubs, not missing modules or unresolved imports. `node --import tsx --test tests/session.test.ts` ran all tests and reported 12 failures. The catalog test observed the full official catalog instead of the six required components; form/session tests threw the deliberate `UiError(400, 'Not implemented')` at the intended behavior boundary. The SDK dependencies loaded successfully. This establishes missing behavior RED, not an old-product defect reproduction.

Initial GREEN after implementing the restricted catalog, real SDK compiler/materialization, session lifecycle/capacity and action authority: 12/12 pass, 0 skipped (467ms observed). Raw transient runner logs: `/tmp/pi-a2ui-core-red.log`, `/tmp/pi-a2ui-core-green1.log`.

## Defect regression cycles

Every following repair first ran its literal-oracle regression against the preceding implementation:

| Cycle | Observed RED | Repair | Observed GREEN |
| --- | --- | --- | --- |
| Legacy data binding alias | `Missing expected exception (UiError)` for event context `{path:'/undeclared'}`: SDK interprets it as a binding while host treated it as a literal | Reject legacy `path` alias; only canonical absolute `{'@path':...}` bindings are accepted | 15/15 |
| Repeated child amplification | `Missing expected exception (UiError)` for one child referenced twice | Require a true tree, each component reachable exactly once, preventing a small DAG expanding into a large rendered tree | 16/16 |
| Accepted ID with changed forged literal | Received 403 literal error while oracle required 409 ID conflict | Compare canonical accepted payload immediately after envelope/schema/epoch/revision validation | 17/17 |
| Pre-SDK collection/parser bounds | Oversized literal arrays/objects reached ordinary schema/context validation instead of the required 413 guard; oversized DSL tokens/nesting reached parser behavior | Own JSON cardinality/depth/bytes guard before SDK/Zod; source lexical preflight before SDK parsing | 20/20 |
| Restricted model guidance | Generic SDK prompt still instructed sentinel wrapping, functions, checks, dynamic templates and deletion | Retain actual SDK signatures and applicable syntax while removing unsupported generic instructions | 21/21 |
| Async observer failure | Runner reported `async observer failure` from rejected listener despite commit succeeding | Observe rejected listener promises without affecting committed state/tool return | 22/22 |

Raw transient logs are `/tmp/pi-a2ui-core-red2.log` through `red7.log` and corresponding `green2.log` through `green7.log`. Policy-preservation restore and depth/byte checks were added as passing coverage alongside the alias regression; no claim that they independently established additional RED behavior.

## Contracts and validation

Final observed focused command: `node --import tsx --test tests/session.test.ts` — **22 passed, 0 failed, 0 skipped**, 450ms. Final `npm run check` — **passed**, no TypeScript diagnostics. The earlier whole-repo check exposed a server-test header type error outside this scope; a later check passed after the owning agent fixed it.

AC-01: actual pinned SDK form compile, event/binding literal oracle, replacement/revision. AC-02: invalid/empty/function/template/check/extra-surface/source-limit rejection leaves old state unchanged; cancellation and operation generation invalidate reset/disable/close work. AC-03/04: exact event authority, bound string context, literal/key/type forgery rejection with zero dispatch, structured-data bridge text, one local dispatch attempt, synchronous exception does not cache, canonical ID conflict and non-evicting 1024-ID capacity. AC-06: full snapshot validation, clone isolation, atomic invalid restore, new epoch, current enabled policy preserved. Server/startup race, browser and real Pi continuation are owned by their integration checks.

State crosses every consumer boundary through `structuredClone`; synchronous and asynchronous listener failures are isolated. Restoring history never dispatches. Disabling invalidates operations even after reenabling. Reset validates before changing epoch/generation/cache/state. `enabled` from persisted history is validated but does not overwrite current user policy.

Own pre-SDK bounds are JSON <=4096 total visited values, <=256 entries in each array/object, depth<=16; UTF-8 snapshot<=256KiB and action body<=64KiB; source<=32KiB, <=4096 lexical units and delimiter nesting<=64; tree depth<=16, <=64 total components, <=4 surfaces. Tests assert own guard-specific errors to distinguish preflight rejection from downstream SDK/Zod rejection. Source quotation scanning treats ordinary/raw/triple string contents as a single lexical unit. These limits mitigate the known pinned transitive Zod constrained-collection exhaustion advisory; they do **not** establish a clean dependency audit or a parser CPU deadline. No incompatible dependency override was introduced.

Drift/clarification sent to the root agent for canonical-spec amendment: canonical-only bindings, true-tree references, precise cardinality/source preflight limits, preserve current enabled authorization across restoration. Full independent code review and wider integration gates remain outstanding.

Risk/rollback: local untrusted DSL/history still depends on the pinned SDK; bounded input is not a sandbox or hard CPU deadline. Revert these scoped core files to roll back implementation. No credentials, user installation/settings, forge publication or external messages were changed.
