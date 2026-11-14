# Independent v0.1.6 A02/A03 acceptance design review — R2

2026-11-14. Exact candidate **`25ab3c3a8a825306fe8594d258051e79b8eb8db5`**, compared with R1 **`8f7e975691cacd8a3af810bc490d9fd3a1b268ef`**. **GO for this bounded design re-review: 0 open P0 / 0 open P1 / 0 additional P2.** R1's owned-cwd/environment P1 is closed at design level. R1 report remains unchanged as historical evidence.

## P1 closure

Spec011:29 now establishes a common hard boundary for **all three modes** after admission: NEW owned run cwd; all Pi children/model bash/helper subprocesses, adapted Express sources, generated component fixtures and evidence stay in the owned run. Original operator cwd and target package are read-only, package/target identity and operator sentinels/hashes stay unchanged, and actual child cwd is recorded/checked. This closes the distinction between isolated package loading and actual process/file-working-directory isolation.

The same paragraph explicitly prevents legacy WORKSPACE/RESTORE_ONLY/SCENARIO/PROVIDER_EXTENSION and provider/model environment from overriding admitted run/mode/scenario/package/tuple. The entry must reject such overrides before work or strip them and pass validated internal values; no hidden restore/provider-extension profile remains. The existing five supplied-DSL component scenarios remain explicitly available. This closes the absolute-workspace bypass as well as the ordinary process.cwd inheritance route.

Coverage is connected to implementation evidence rather than prose alone:

- Plan011:49 requires common owned cwd, read-only operator/package, sentinel/hash and actual child-cwd proof, with legacy override prevention.
- Round1 AC-006/007 at24–25 requires owned model/helper/source writes, unchanged operator/package, hostile legacy environment coverage, actual child cwd and failure cleanup. Existing AC-005/008 retain startup/component obligations.
- Round2 P-004:19 traces hostile-env removal/rejection, every child/helper/model-source cwd and unchanged target/operator through the actual skill/component path.
- Round3 IT-003:11 adds actual child cwd, sentinel preservation and hostile-environment rejection to integration intent.

The implementation must choose a clear rejection or sanitization policy and prove that hostile values cannot affect the admitted profile. No test-only bypass flag or new configuration surface is authorized by this closure.

## Related changes and retained boundaries

The A01 revision at spec011:17–23 removes raw SDK prose/positional signatures from the component response, uses public ComponentApi/Zod parameter metadata plus project notes/reference, limits native widgets to authoring stream, explicitly requires initialized value bindings for the six input types, and resolves typed cause chains with bounds/cycle handling. This is consistent with the read-only guidance goal and prevents the previously identified checks-removal/positional-index risk from contaminating A02 authoring. It does not modify runtime schemas or grant unsupported actions. The separate A01 specialist review remains independently applicable; this report does not substitute for its code review.

A02 still requires explicit absolute package/exact version, actual Node24 before worker imports/fixtures, default no-model startup, --allow-model for inference modes, exact successful actual provider/id/baseUrl preflight and no fallback. Normal project registration startup remains distinct from the explicit extension/skill model profile. Per-stage/private evidence, pageerrors before metadata extraction, typed content normalization and owned cleanup requirements remain intact. Component supplied DSL cannot be mislabeled as model-authored skill acceptance.

A03 still preserves32 catalog types/19 examples/8 patterns, the progressive known-template path, current browser/runtime/action/resource/dependency behavior and published/user-global015. Doctor remains deferred. Candidate016 metadata preparation does not authorize016 merge/tag/publication/npm or real-user installation changes. No single model case is promoted to a general cost/success-rate claim.

## Evidence and verdict limits

Verified exact HEAD and the complete committed five-document R1→R2 diff, including canonical spec, plan and all three walkthrough rounds. Only documentation changed. Existing untracked node_modules was preserved. No product/spec edits, Node processes/tests, model calls, auth/model configuration reads, installs, user-setting changes or remote writes were performed; only this ignored report was added.

This **design GO** allows the agreed next TDD/code workflow within the user's existing scope. It does not assert that admission order, isolation, model transport, browser interaction, stage persistence or production packaging is implemented/passing. Baseline166 checks and structural walkthrough validation remain distinct from future behavioral RED→GREEN and runtime acceptance. Meaningful existing-entry RED, focused code checks, actual no-model startup, separately admitted bounded GLM evidence and exact code/package review are still required by spec011.
