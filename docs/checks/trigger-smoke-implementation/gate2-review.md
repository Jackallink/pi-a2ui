# Spec023 independent Gate2 / TDD kickoff review — GO

Date: 2026-11-16. Reviewed baseline HEAD `174d6686784ecb99871402470284767e9b745aba`, tree `55563424389a69062f6bf8b4b89ebd88a868962f`, clean worktree. This is a prospective kickoff audit, not implementation/code/live acceptance. The latest explicit user authorization supplied in this task covers the necessary minimal adapter, zero-inference checks and independent code GO, followed by exactly one new ≤4-request batch within Spec023. It supersedes the design-phase no-implementation/budget-pending restriction for that bounded future workflow; it does not waive any gate or authorize replay/frozen rescoring.

## Decision

**Gate2 / TDD kickoff GO for the bounded named-policy adapter and the test commitments below.** No unresolved design finding blocks writing the tests first. Code/live GO remains pending; no paid request is admitted by this review. The old pilot live path remains disabled.

The proposed shape is appropriately small: new fixed smoke entry/policy, shared budget/worker/control parameterized only by known experiment IDs with legacy defaults unchanged, reuse of the actual SDK/extension/renderer and unchanged R2 diagnostics. No arbitrary provider/profile/budget platform, duplicated renderer, product/skill changes or new dependencies are warranted. The new run root, exact-B capture, per-case map, nonpaired two-row report and authorization/replay locks address current concrete gaps.

## AC-to-test kickoff commitments

| AC | Required tests / observable oracle |
| --- | --- |
| AC-001 / SMG01 | Default dry-run and prepare/offline use no real config/external provider and need no paid grant. Missing/mismatched LIVE grant fails in CLI, direct worker script and imported API before workspace/config/HTTP. Persisted fs/fetch/creation counters survive child exit. Imported live API may explicitly refuse outside the reviewed worker invocation; import/module ordering cannot disable the guard or read config first. |
| AC-002 / SMG02 | Valid smoke IDs accepted, old/unknown IDs and wrong experiment/profile rejected. Negative second, positive fourth and batch fifth refused; unused negative quota cannot transfer. Journal parser, admissions and parent receipt independently agree on1/3/4. Short write/fsync failure/torn or wrong-profile journal dispatches0; complete admitted prefix retained, unknown never refunds. |
| AC-003 / SMS01 | Actual-SDK synthetic captures for the two natural messages have the shipped new clause, exact tools/native-enabled-low1536 body and no forced skill body. Canonical keys only; wrong-old-clause canary, meaningful path/date/context/source/profile/grant/body drift and wrong endpoint/model/native policy fail before dispatch. Validate every request, not only first context. |
| AC-004 / SMS02 | Actual-SDK normal 收到 passes; other text fails; read/render including schema-invalid complete calls record choice and block before execution/provider continuation. Incomplete tool/error/truncation is unknown. Usage-only absence is orthogonal. Positive requires the saved valid negative-pass receipt and successful cleanup; missing/malformed/non-pass/unknown/cleanup-failed negative means not_run. |
| AC-005 / SMS03 | Three preparation requests complete allowed final tools then stop as preparation_limited without fourth provider call; final-render result and earlier first schema/compile/handler results stop without repair. Actual synthetic legal form traverses compiler/server/DOM; missing fields/bindings/confirmation, native-only output and schema/compile failures remain distinct requested/attempted/committed/content outcomes. Button/action POST count0 and no real release. |
| AC-006 / SMS04 | Cancellation/stream/HTTP/SDK/receipt/cleanup failures stop batch, preserve primary error/admission lower bound and produce exactly2 rows including not_run. Real owned-process canaries establish total42/102-second worker and180-second batch ceilings including TERM2/grace/fallback cleanup; remaining batch time bounds children and insufficient time does not start the next episode. Usage/error diagnostics remain bounded/redacted; no raw thinking/headers/config. |
| AC-007 / SMI01 | Fixed candidate runs relevant tests, full local Node/type/all90 browser/68 compatible union and normal two-episode offline. Candidate input identity includes every new runtime policy/entry/guard plus lock/SDK/browser/76payload/archive/cases/captures. Verify historical raw/frozen receipts unchanged. Independent code/privacy/cost GO and final exact source/command grant precede one paid batch. |

Additional P0 admission/replay tests are part of SMG01/02 and SMS04, not optional follow-up:

1. Same granted batch invoked twice, including concurrent execute attempts: atomic fixed per-grant/per-experiment one-use lock admits at most one winner. Failure after lock creation but before first HTTP consumes that invocation; no reset/replacement grant/retry may reopen it.
2. Missing/forged/mismatched parent admission ticket, stale lock, duplicate episode start or out-of-order positive episode: no config/workspace/provider. Persisted once-per-episode start locks bind grant/run/experiment/episode; do not trust a caller-provided boolean or merely existing receipt filename. A direct import cannot impersonate a permitted invocation.
3. Grant/capture/ticket/journal/resource paths must remain owned, ordinary and identity-bound. Reject symlink/path substitution and lock/context drift; never touch the old run-LUrFUb, its lock or journal. Unknown/process failure remains non-resumable even when admissions are zero.
4. Every final report is exactly2 unpaired rows and separately reports transport, negative, positive selection and UI validity. Missing/malformed receipts retain known admissions rather than converting them to0/free/text-only. No old paired summary or harnessAccepted shortcut establishes UI acceptance.

## RED evidence standard and implementation order

Write test cases before behavior implementation. Observe meaningful failures against the old callable implementation or focused unchanged baseline: e.g. new legitimate smoke-ID acceptance, per-negative1 policy, exact-B attestation, negative observation/stop semantics and unpaired report behavior. Preserve the exact test/source identity and failure assertion. A missing new module/export, TypeScript/import/fixture error or resource setup failure is not behavioral RED. Existing safety invariants may already be GREEN; do not weaken them to manufacture RED. New synthetic actual-SDK cases must exercise real event ordering and inspect dispatch/tool/commit effects, not only a helper returning expected labels.

Before implementation, update lifecycle/authorization records to distinguish the now-authorized work from historical design-only Check117. Preserve Check117 and design review provenance as history; do not rewrite them into live or code evidence. Record this Gate2 decision and its expanded safety test intents in the appropriate Check/AC mapping, then move walkthrough-approved→tdd-approved→in-progress as evidence warrants. Test execution after this review is authorized only within the root user's stated zero-inference implementation workflow.

## Source and timing cautions for later code review

The current old budget is3/36, normalizes B to A, reports12 paired episodes and self-writes a historical36 authorization; those defaults cannot be used for the new batch. Named-policy plumbing must reach admission, journal parsing, receipt checking, parent scheduling, worker stop behavior and report. Keep legacy offline compatibility and live=false unchanged. No new generic override or test-only bypass may create a live path.

The current parent timeout schedules TERM at the supplied deadline then allows another2seconds. New42/102 are **total** ceilings, not42+2/102+2. Budget the grace and post-child fallback cleanup within those totals and180 overall; synthesize and measure the owned-process failure paths. The planned --prepare may create only owned zero-inference contexts on clean source and validated archive; final grant must bind the exact prepared state. A capture/live path or date mismatch fails closed rather than normalizing meaningful fields.

The final explicit user grant records this one existing user authorization after code GO; the executor cannot manufacture approval or increase scope. Independent code GO is a prerequisite to its issue/use, not permission to run a second batch. No real configuration or credential material is needed to complete tests or this audit.

## Verification performed in this audit

Read-only source/docs/test-intent inspection and source/tree/status/hash checks only. No SDK module loaded; no JS/Node/Pi/browser/config/auth/provider/network execution; no behavioral tests run. Listed tests are commitments, not completed results. This review writes only this ignored report. SHA256 fingerprints below bind baseline inputs; no implementation artifact exists in the reviewed tree.

| Input | SHA256 |
| --- | --- |
| `docs/specs/023-v0110-trigger-smoke.md` | `fc3bd7b67b840c8c616711be998b8c5795cdac89eb8dfc5307b6df946eb8d4ab` |
| `docs/plans/023-v0110-trigger-smoke.md` | `195af09df2efc2278181ab9bd5c5a2a2f290ac1a39d65f2dc32f2c2600966957` |
| `docs/checks/117-trigger-smoke-design.md` | `9a377ca21e83c0f6a2da8840dbe6738dfeaeb0de29efdcbcd1874ef3a811016c` |
| `docs/checks/trigger-smoke-design/profile.proposed.json` | `79a0c76770ae09915329083d92218ba1b13f804b5bd50a09dff641224009f869` |
| `scripts/trigger-pilot.mjs` | `baac3e106a4ea169f2b0bf36c6da0a5b9d490d72cceb2466d40826fd78e1a604` |
| `tests/trigger-pilot/contracts.ts` | `3e90e1cf3453d5ecd8c677394e0691da6c1effe3ebe5cec57173ec98afa8cbc8` |
| `tests/trigger-pilot/control.ts` | `f2c2388fc5ba8623c68608c3c4d8729b72d5844940c39ee9085537f5de6cafa6` |
| `tests/trigger-pilot/worker.ts` | `f7e41e37bab34fab8b330dd6461feceb4ef6c72b48207caad0783b6c120722df` |
| `tests/trigger-pilot/offline-read-guard.ts` | `5386b3ee82239e8323a21907698183b3338225a0642e559677bd81717df1f44e` |
| `tests/trigger-pilot/diagnostics.ts` | `ae9496c3eca20e5809792fbe5a3051c4a130b68b3fe4d6262a3e718675c2bdb0` |
| `tests/trigger-pilot.test.ts` | `1d8e74c86becd8064a6b2b6752134160174bd10e0ace43a671b1613dafa633b2` |
| `tests/trigger-pilot-sdk.test.ts` | `5a93a4715cd3d501d62918b95bcc6934b065a7e4f4836f604b0b5c90b43406bf` |
| `tests/trigger-pilot-evidence.test.ts` | `23ed752c29605f791a70586832c38a9599e90bf78e49dd494e5e1d7443e10b68` |
| `tests/trigger-pilot-stream.test.ts` | `6ce0c2430f69e3de10130a1b23cb61e55f7cc54e1a23a30afddca1bfcb6d5094` |

## Source-bound kickoff/authorization addendum — Gate2 GO

Reviewed test-only checkpoint HEAD `b80ba844296f44f71cbd66d453f2a224d5ab05d4`, tree `5a889c29be33e695b0e060bae503682ed20da24d`; clean worktree. Relative to174d668, exactly three tracked files changed: Spec023 authorization addendum, Check118 and new tests/trigger-smoke.test.ts. No runtime implementation was written. Initial report prefix is preserved byte-for-byte (SHA256 `63b7fa0e5a8ae9b2a427293184422d22c1add5f289b44dbe9ebd10395f0d6184`).

**Gate2 GO confirmed for test-first bounded implementation.** Spec023 clearly labels the old budget0/design-only wording as historical and records the latest explicit user authorization without loosening its model/request/frozen-evidence limits. Check118 records the named-policy approach, exact5P0 commitments, hard-total timing reserve, separate fixed-source acceptance and independent code GO before one new paid batch. These close the lifecycle/authorization recording prerequisite of the initial kickoff review. The coordinator explicitly accepted all5P0 test commitments before implementation.

Read the existing raw budget-red.log, without executing/rerunning it. It contains3tests:2failures and1pass. The failures are behavioral assertion failures against the unchanged callable budget: valid new SM02-B is rejected with episode identity; requesting smoke policy over an old-format journal incorrectly reports complete=true. They are meaningful feature/policy RED, not import/compiler/fixture failures. The old-clause case passes because the current implementation rejects the new ID before clause validation; **it is not clause-canary RED**. Also, the first assertion fails before reaching later1/3/4/torn checks, so the log does not establish RED for those later boundaries. Those and other changed behaviors still require their own focused assertions/evidence while implementation proceeds. The log contains no command/Node-version header; execution exit1/Node24 provenance is supplied by the coordinator's tool record, not independently established by this log read.

The actual runtime/code remains unreviewed and not live-ready. No code/privacy/cost GO, complete local checks, capture/final grant or paid request is supplied by this kickoff. Later Check118 lifecycle updates may record Gate2 GO and advance tdd-approved→in-progress, preserving the source/test/raw-log identities below. No SDK/config/auth/provider/browser/network or test execution was performed by this reviewer. The only write is this appended audit.

| Bound input/evidence | SHA256 |
| --- | --- |
| `docs/specs/023-v0110-trigger-smoke.md` | `70c16f10618a8aff8715c167c9f663c2f92629b5458ac142cf09ecf155a8422e` |
| `docs/checks/118-trigger-smoke-implementation.md` | `d0d27f3db8aa96e7b79f97cac08ba498b32e815230f9d0f8ce9d16ee1d696882` |
| `tests/trigger-smoke.test.ts` | `b14c2861e0f72b3b20d281efcb0425a0652d2f4efb52694d6cb7d36f4232e874` |
| `.local/trigger-smoke-implementation/budget-red.log` | `986d901fdd6ae32f2c4299ee6fd204c44e8b144d26ce93263fec720ce94101f6` |
