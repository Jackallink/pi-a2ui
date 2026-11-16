# Independent Gate1 design review R1 — NO-GO (bounded wording correction)

Date: 2026-11-16. Scope: DESIGN only for Spec023 and its associated plan, three walkthroughs, proposed profile, static receipt and Check117. Review does not authorize implementation, SDK execution, configuration access or any provider request. Current real-request budget remains 0.

## Reviewed identity

- HEAD: `736902724277674caa0e1f968af73dadecee6705`
- Tree: `fa146865e4787bc58020a7fce5709035a4bde7ed`
- Base: `c8224a3361c99a0f8ebadfdaaee45bdb19aab5e1`
- Worktree was clean. Base-to-head diff contains exactly eight new design/document files, no runtime changes.
- This review writes only this ignored report. It does not alter tracked documents, source, index, remotes or old receipts.

## Finding

### F-01 [P2, Gate1 blocking]: qualify the no-grant guard as LIVE execution

Location: Spec023 line 71 (AC-001), mirrored at Round1 line 25 and the ambiguous future-unapproved path at Round2 line 9; Plan023 line 28 combines offline/default and unapproved-entry assertions without separating their resource expectations.

Canonical AC-001 says that without a new call authorization, *any entry* must reject before workspace creation. Read literally, this also rejects default dry-run and legitimate zero-inference synthetic/capture workers. The same design requires synthetic actual-SDK fixtures and normal smoke-offline acceptance before paid execution. The P0 test intent currently cannot distinguish the LIVE guard from those legitimate offline paths. This is an authorization/test-scope ambiguity, not evidence that existing code performs an unauthorized request.

Minimal correction: explicitly scope grant absence/mismatch and the no-workspace/no-config/no-HTTP expectation to **LIVE CLI / worker-script / imported execution requests**. Separately state that default dry-run remains zero inference and zero real-config/provider access, and synthetic/offline/capture may create only owned fixtures and use synthetic actual-SDK transport without a paid grant **after separately authorized future implementation work**. These paths must never access real config/provider transport. Synchronize AC/test intent and Round1/2/3/Plan wording as applicable. Preserve the present design-only prohibition on implementation and SDK/browser execution. Rebind static hashes and request a fresh design review; retain this R1 report.

No other P0/P1/P2 design finding identified in the reviewed source. No P3 recommendation is required for Gate1.

## Scope, correctness and interpretation assessment

The proposed two independent new-description sessions, SM02-B first at ≤1 then SM01-B at ≤3 only after negative pass, durable aggregate ≤4, no borrowing/refund/retry/resume/fallback/probe/judge, are concrete and internally consistent. Negative complete tool calls are observed and then blocked before execution, including malformed render arguments; they are policy stops, not schema refusals. Incomplete/error/truncated tool calls remain unknown. Exact trimmed 收到 is required for negative pass; usage-only absence is a separate unknown and does not return budget.

Positive preparation exhaustion is ui_not_observed, not proof of a product defect. Requested, attempted, committed and content/DOM validity remain separate. A render choice alone is not UI success. Content requires editable application/environment/version inputs and confirmation/submit affordance with appropriate bindings/reachable components. No business release or button action POST is allowed. The final report has exactly two unpaired rows and does not estimate gains or rescore old cases.

The 30s request, 30/90s active, 10s cleanup, 2s TERM-to-KILL grace, 42/102s worker total and 180s inclusive live-batch ceilings are coherent as prospective hard ceilings. Future code/tests must enforce the **total** 42/102/180 limits, with grace and parent fallback cleanup inside those ceilings; blindly retaining current runWorker's deadline-then-extra-2s implementation would not meet the spec. The remaining batch time must bound all worker/cleanup activity. No timing test was executed here.

A budget request can be concrete after F-01 correction: one new invocation, exactly these two new IDs/prompts and order, sole Ark AgentPlan glm-5.3-flash endpoint, 1/3/4 request ceilings, enabled/low/1536 wire policy, fixed time/resource limits and no automatic extras. It may grant a future bounded run conditional on all implementation/acceptance/code/privacy/cost gates. It cannot approve the still-absent adapter, current 36-request CLI, an unspecified final source, or itself replace the final fixed-source one-use grant. Any expanded scenario/model/endpoint/limit requires new scope review and authorization.

## Current adapter gap confirmed by source reading

- CLI self-writes historical userAuthorizedRequests=36, iterates 12 episodes and uses 1,200,000ms batch logic.
- PilotBudget journal parsing/admission uses 36 globally and 3 per episode; receipt validation uses ≤3 universally.
- Capture/worker normalize B descriptions into A; this must not attest new-only B contexts.
- Worker does not implement the new exact-negative tool-before-execution rule, two-session result semantics, per-episode deadlines or new policy/grant identity.
- Summary is a twelve-row paired A/B analysis. Current live remains disabled in CLI, worker and pre-SDK guard.

Spec023 accurately lists these as future required changes. Reusing diagnostics/renderer/SDK machinery is reasonable, provided one validated bounded policy reaches all budget, journal parser, worker, receipt, report and three authorization paths. Existing Check116 results do not close these gaps.

## Evidence actually checked

Read-only shell/Python/git inspection verified exact HEAD/tree, clean worktree, eight-document-only delta, six design/profile hashes matching static-preflight, 87 runtime inputs unchanged from base including 76 payload files, five old raw-live receipt hashes and two frozen-file hashes. Reviewed all fourteen files fingerprinted below. The release archive hash is a cited design/static-record identity; this review did not locate or open the archive itself.

No SDK modules were loaded; no JS, runtime fixtures, real configuration, auth, provider, browser or network operation was executed. No new behavior/CI/live tests were run. SMG01–02, SMS01–04 and SMI01 remain **prospective test intent**, not passing tests. Current calls attributable to this review: 0. No raw reasoning, headers, configuration or credential material was retained.

## Decision

**NO-GO for Gate1 R1 solely pending F-01 wording correction and fresh independent review.** The intended small smoke experiment is otherwise reviewable and bounded. This is not a code/live NO-GO finding on a new implementation: no adapter exists or was tested in this turn. Design approval after correction would authorize only advancement to the separately requested user-budget decision; it would not authorize implementation or paid calls on its own.

## SHA256 fingerprints

| Reviewed file | SHA256 |
| --- | --- |
| `docs/specs/023-v0110-trigger-smoke.md` | `6c2060b6b409d5658e530d134aa69e44f3d5a44f6092998b5788554c575f2eea` |
| `docs/plans/023-v0110-trigger-smoke.md` | `bfbb9e40aa180ce6d4c4f1e5302d665a2f3fbd135a8cea90fffbcb4d826eb967` |
| `docs/walkthrough/trigger-smoke/01-round1-user-stories.md` | `ab8032b249bf97e66225c0729e3dd523bf0ab5e1f76813648d09b1954ba7deb8` |
| `docs/walkthrough/trigger-smoke/02-round2-technical-trace.md` | `7442d8cae1d1c6bc27efb6b592710998edd03087ca496078d41316e551a062db` |
| `docs/walkthrough/trigger-smoke/03-round3-integration-check.md` | `bd1a1a82a1abc7d0c1eea8a793cc12fb4f561fee3cfe15f764021310f37ccf16` |
| `docs/checks/trigger-smoke-design/profile.proposed.json` | `79a0c76770ae09915329083d92218ba1b13f804b5bd50a09dff641224009f869` |
| `docs/checks/trigger-smoke-design/static-preflight.json` | `4b33d029533e625926f5c6fa7a055b323a717ced55549a9115cf5dd399c49be8` |
| `docs/checks/117-trigger-smoke-design.md` | `c5e4e10ac88dc6ff57224f2bcbc41281c12d4f061615cf228d3d3739d30389f5` |
| `scripts/trigger-pilot.mjs` | `baac3e106a4ea169f2b0bf36c6da0a5b9d490d72cceb2466d40826fd78e1a604` |
| `tests/trigger-pilot/contracts.ts` | `3e90e1cf3453d5ecd8c677394e0691da6c1effe3ebe5cec57173ec98afa8cbc8` |
| `tests/trigger-pilot/control.ts` | `f2c2388fc5ba8623c68608c3c4d8729b72d5844940c39ee9085537f5de6cafa6` |
| `tests/trigger-pilot/worker.ts` | `f7e41e37bab34fab8b330dd6461feceb4ef6c72b48207caad0783b6c120722df` |
| `tests/trigger-pilot/offline-read-guard.ts` | `5386b3ee82239e8323a21907698183b3338225a0642e559677bd81717df1f44e` |
| `tests/trigger-pilot/diagnostics.ts` | `ae9496c3eca20e5809792fbe5a3051c4a130b68b3fe4d6262a3e718675c2bdb0` |
