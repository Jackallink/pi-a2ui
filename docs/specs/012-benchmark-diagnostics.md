# BM1 — diagnostic documentation and executable recovery

Lifecycle: review-ready. Profile: strict. 2026-11-15. Canonical BM1 contract; [plan009](../plans/009-benchmark.md) owns steps/roadmap. User agreed to the two-family BM1 slice, independent design/code review then offline CI/PR verification, tentatively0.1.8. No merge/publication/global upgrade or BM2–BM4 implementation is inferred. Node24.x only, **zero model calls**.

## Source and historical drift

Integration base **46f04c6d63819c2cb72c6febd748322ffd7c3f5b** includes published017/closedDX34–38. Product inputs remain those of immutable017merge9e685b35. Existing [Check062](../checks/062-benchmark-design.md) and its two reports are historical design evidence for legacy-policy-v1, not admission of this updated profile. The eight original primary-workspace draft files are copied/fingerprinted before revision and remain untouched there; Check076 records identities. No duplicate canonical spec is introduced.

The old plan's blanket error-string grep and legacy message expectation are superseded. Current docs already contain both complete repairs and DX tests exercise them. New RED is **missing machine-verifiable diagnostic→section/example binding**, not missing prose or a runtime defect. Original issue43 wording must be reconciled in its tracker before delivery. Coverage is exactly2registered families; coverage of all project/SDK/session errors is unknown. Existing error-policy/profile changes require reviewed expectations, never auto-accept output.

## Goal / non-goals

Maintainers can run one offline test gate proving that registered actual rejections have a uniquely located shipped repair, and that the repair compiles and expresses fixed intended data. The detector must distinguish wrong data from compilation errors and its own setup failures.

IN: two-family data registry, four complete Express fixtures, a small test-local loader/document checker/static oracles, node:test tests/canaries, two markers in existing skill sections, one read-only Node24 GitHub workflow and real PR job evidence.

OUT: runtime/compiler/session/API/permissions/budgets/queue/SDK/dependency changes, new components/CLI/doctor, generalized Markdown/benchmark framework, all-error coverage,60scenario/visual/model evaluation, branch protection, model/auth/config access, npm/publication/global installation. Keep package/lock at017 for this development slice;0.1.8 release metadata is a later release step. Source SHA distinguishes the unreleased BM1 candidate from the shipped017tag. Only skill reference markers intentionally change packed bytes.

## Registered input contract

`tests/benchmark/diagnostics.json`: exact top-level fields `{schemaVersion:1,profile:"v0.1.7-dx-v1",families:[...]}`. Required IDs exactly `reserved-event-key` and `coding-record-context`, unique; unknown/missing/duplicate families, profile, extra fields, oracle or paths fail setup. Each entry has exactly `id,positiveFixture,negativeFixture,expected,doc,positiveOracle`. Fixture paths are exactly `tests/benchmark/diagnostics/<id>-positive.express` / `-negative.express`; doc path is fixed `skills/pi-a2ui/references/syntax-and-errors.md`. No caller-supplied paths, dynamic imports/eval or external registry functions.

`expected` has `status:400`, nonempty `reasonIncludes` and `diagnostic` with fixed `surfaceId:"diagnostic",componentId:"inspect",componentType:"Button",propertyPath:"/action/event/context"` (coding) or `"/action/event/context/path"` plus `forbiddenKey:"path"` (reserved). Assertions compare those declared facts with actual UiError.reason/diagnostic, not a broad catch-any-error predicate or full formatted message. `doc` has `path,heading,anchor,marker`; `positiveOracle` must be the family's static allowlisted function name.

| Family | Current reason fragment / oracle | Fixed independent positive expectation |
|---|---|---|
|reserved-event-key|`Forbidden map key "path"`; `literal-file-context`|One Button, event inspect_file, context exactly{file:"src/example.ts"}. Negative changes only file→path.|
|coding-record-context|`Coding actions must reference current literal record IDs (missing/mismatched: proposalId, resultId)`; `all-declared-button-record-ids`|One CodeDiff(proposal-example) and TestResults(result-example), two declared Buttons(review/question), both exact current literal IDs. TestResults one skip/summary0,0,1,0; command/evidence explicitly illustrative, not executed. Negative removes only inspect/question Button's IDs.|

Fixtures use named review/inspect Buttons for diagnostic ownership; doc's inline auto-generated component IDs need not match fixture IDs. Independent oracles are handwritten Node assertions on compiled components/values, not snapshots/generated expectations. The coding oracle also verifies the record counts/IDs and explicit illustrative TestResults evidence, not just presence of any Button.

## Test-local interfaces and stages

`tests/benchmark/diagnostics.ts` exports typed Family/Registry, `BenchmarkFailure(stage,familyId,message)`, `validateRegistry(value:unknown):Registry`, `loadRegistry():Registry`, `verifyFixturePair(family,readText?):void`, `documentSource(family,markdown):string`, `verifyDocumentation(family,markdown):void`. `readText` injection is test-local only: simulate missing/invalid-positive/positive-oracle fixture setup failures and accepted/wrong-reason negative classification canaries, without changing actual files. It receives only the family’s fixed fixture paths; default reads those paths. Oracles stay private/static. No production import of these helpers.

Stages: `setup` for malformed registry, missing fixture or invalid positive fixture/positive oracle; `negative` for accepted negative, wrong status/reason/location; `doc-contract` for missing/duplicate/misplaced section/marker/block; `compile` for a structurally found repair rejected by realcompile; `semantic` for a compile-valid repair violating independent intended data. Unexpected non-UiError compiler failure is setup. Error text identifies family/stage/path without calling an arbitrary exception a successful canary. Call real `compile('diagnostic',source)`; product output/state are read-only.

First prove each positive fixture and intended data, then observe its negative's exact reason/location, then check real shipped documentation. New docs test must genuinely fail on017's absent markers after fixture checks succeed; no missing import/file/environment failure counts as RED. Detector GREEN needs no runtime patch.

## Document contract

Existing level2 headings/anchors remain `Repair a literal filename` / `repair-a-literal-filename` and `Extend a review surface` / `extend-a-review-surface`; do not rename existing sections or duplicate samples. Add exactly one standalone outside-fence marker to each respective section:

- `<!-- benchmark-diagnostic:reserved-event-key -->`
- `<!-- benchmark-diagnostic:coding-record-context -->`

The named heading must be unique outside code fences. Its section ends at the next same/higher-level heading. The marker must occur exactly once outside fences in the entire doc and inside this section. The first fenced block after it, before section end, must be complete text/express source. The small scanner handles standalone ATX headings and backtick/tilde fences of≥3 characters, closing same character/at least opener length; no headings/markers inside fences are structural. Unsupported/missing/unclosed example fences fail doc-contract; no cross-section borrowing. This is a narrow explicit authoring contract, not a general Markdown renderer.

Compile extracted source with existing compiler; run the same fixed positive oracle. Plain grep/marker presence alone is insufficient. Natural-language explanations remain independently reviewed, not automatically proven.

## AC / tests / required checks

All are P1, with GWT in [Round1](../walkthrough/benchmark-bm1/01-round1-user-stories.md), traces [Round2](../walkthrough/benchmark-bm1/02-round2-technical-trace.md), errors [Round3](../walkthrough/benchmark-bm1/03-round3-integration-check.md).

|AC|Planned tests / observable result|
|---|---|
|AC-001|Both fixture pairs: intended positive passes, actual400/reason/knownowner matches; no legacy error matching.|
|AC-002|Both real shipped doc repairs: unique heading/marker/complete same-section source, compiled and independently semantically valid.|
|AC-003|Same checker rejects missing/duplicate/inside-fence marker, cross-section block, invalidDSL, forbiddenpath, missingcodingIDs and compile-valid wrongfile/changedrecordidentity; normal docs pass. Wrongfile and changedidentity first independently compile successfully, then fail semantic.|
|AC-004|Registry missing/duplicate/unknownfamily,unknownprofile/oracle/extra fields/pathescape and missing/invalidpositive fixtures fail setup; wrongnegative reason/status/location or acceptednegative fail negative. Genuine compiler errors are not setup-canary success.|
|AC-005|Node24 targeted/full/tsc/build and75file pack boundary; unchanged product/scripts/deps/other skill files vsbase, test/fixture/workflow excluded. Independent codeGO then real read-only PR CI on correct source.|

Canaries operate only on in-memory doc/registry copies or injected fixture reads; never rewrite real docs. Checks record actual RED/GREEN/source hashes/counts, not plans. Narrow tests first, then full npmtest/check/build and package identity; no browser/model reruns for unchanged runtime. Real CI evidence is separate from local GREEN.

## CI / authorization / rollback

After offline code review GO, add `.github/workflows/benchmark.yml`: pull_request/workflow_dispatch; ubuntu-24.04,10min; permissions contents:read, checkout persist-credentials:false, setup-node24, actualNode major assertion/patch+checkout/event SHA logs; npmci→npmtest→npmruncheck. Pinned checkoutv7.0.1 SHA3d3c42e5aac5ba805825da76410c181273ba90b1/setup-nodev7.1.0 SHA949feb2413d6458794dcd2491c4babbbce0c15c1, both official action.yml Node24 reverified inCheck076. No secrets,models,publish,writepermission,pull_request_target or protection changes. PR synthetic merge/source SHA must be recorded honestly; unknown/cancelled/timeout is not GREEN. Workflow itself receives final independent review before authorized push/PR.

User agreement authorizes this bounded design→review→implementation→offlineCI/PR verification sequence; it does not authorize merging/publishing018 or closing parent43. BM1 child stays open until its eventual integrated delivery gate; report review-ready PR and realCI, then request release decision on concrete artifacts. Runtime regression discovered during work stops expansion and requires updated spec/review. Rollback reverts the test/fixture/helper/workflow/marker slice together; preserve original drafts/reports/failure receipts/userconfigs/tags/assets. Main risks: profile drift, false-positive detector or false coverage; explicit facts/oracles/canaries/stages and realCI address them.

## Implementation / CI admission evidence

Current-profile design/TDD GO is [Check076](../checks/076-bm1-current-profile-design.md); runnable document-binding RED, independent R1 NO-GO/F-01 corrective RED→GREEN and R2 code GO are [Check077](../checks/077-bm1-offline-implementation.md). Final workflow GO and the actual Node24 PR job are [Check078](../checks/078-bm1-workflow-pr-ci.md). Intended contracts are unchanged; implementation drift was the cross-level heading false-positive, repaired to match the existing uniqueness/H2 requirement. Historical legacy-policy-v1 design remains in Check062; no legacy expectation is used as a current product oracle. Review-ready is not merged/released/parent43 complete. Later evidence-only commits require latest-head CI readback before handoff.
