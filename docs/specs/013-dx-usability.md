# DX usability — issues34/35/38

Lifecycle: review-ready. Strict. 2026-11-14. Design at e43da13 passed independent walkthrough/TDD-intent review (Check063); per-slice checks carry execution evidence. User authorized implementation in34→35→38 order after per-slice design/TDD and independent review. Isolated branch codex/dx-34-35-38 starts at PR44 fixed570b67a; PR44 itself and the primary benchmark drafts remain unchanged. This is a post016 source candidate, not a016 scope expansion or release authorization. Node24 only; no model evaluation needed for these deterministic changes.

## Scope and observable goal

D1/#34: actual forbidden key with component/property or surface location; owner-aware project validation errors; workspace-relative artifact root. D2/#35: model-visible committed component/surface usage on successful render and current/attempted counts on aggregate rejection. D3/#38: executable review template comment and error/budget references reflecting actual rules.

OUT: allow forbidden keys, change validation order/acceptance/status/limits, new archive/delete/reset command, summary totals semantics36, epoch/queue semantics37, benchmark implementation, SDK/dependencies/permissions, source-file render API, version/tag/npm publication/global install. No synthetic component IDs for parse/global/unknown SDK errors. Preserve SDK line/column/name evidence rather than infer IDs from names or text.

## D1 diagnostic contract

Add optional typed UiDiagnostic metadata to UiError/ErrorOptions: surfaceId,componentId,componentType,propertyPath,forbiddenKey,workspaceRoot. Keep status/cause and the unformatted reason; message appends available context once. Without diagnostic options existing constructors/messages remain compatible. locateUiError adds missing context without replacing a more specific existing owner or wrapping repeatedly; non-UiError validation failures retain400 and original cause. No arbitrary raw context values are included.

noExpressions keeps its exact key predicates/order and valid absolute @path exception. A banned key says Forbidden map key plus JSON-quoted actual key and currently blocked set; diagnostics expose forbiddenKey and a JSON-pointer property path. Declared component ownership is derived only from createSurface.components entries, not from arbitrary nested Event data that happens to contain id/component fields. Data-model/global errors carry surface scope, not a made-up component. Malformed @path remains rejected with real property context.

Project-owned validation loops in compiler/inputs/coding/live/workbench/interactions attach their actual current component when rejecting; retain iteration/cross-component rules and mutations as before. Shared-input conflicts identify the later conflicting input; multiple-per-surface checks identify the excess component. Missing child/tree/capacity/global errors use only their honest known scope. Existing SDK parse/schema messages and cause chains remain intact, including native component IDs already in SDK text; no regex locator guessing.

Coding record errors identify the offending Button and missing/mismatched proposalId/resultId without dumping context values. They still apply to all declared Buttons on that surface and require the exact existing literal IDs. UiError diagnostic metadata is additive; CLI coarse code/error/hint/reference remain, check success remains exactly{surfaceId,source}, source bytes/exit0/1/2 unchanged. CLI uses typed forbiddenKey metadata for its advice instead of treating every forbidden-key error as FormValidation. Tool contract lists reserved authoring keys and distinguishes artifact tool path parameters.

ArtifactStore rejection includes the root actually supplied to register (ctx.cwd override when present), lexically resolved, in message/diagnostic.workspaceRoot. No new realpath/open/read happens before an invalid input rejection; symlink/containment/signature/quota/cancel behavior stays identical.

## D2 budget contract

Single source is the actual committed Snapshot, no cached counter. Capacity is components=sum of compiled flat components across surfaces, surfaces=array length; include SDK-generated Text children. Limits remain64/4. A pure shared counter is used by capacity enforcement and render result presentation.

Aggregate rejection remains413 before commit and includes attempted components/surfaces and current components/surfaces with limits. Attempted snapshot has already replaced the same surface ID: subtract old tree, do not add it twice. Failure leaves snapshot/revisions/identities untouched. Single-surface compiler component overflow includes its available local count/64; it must not invent offline global usage.

Successful a2ui_render text includes committed components K/64, surfaces N/4 and this-surface component count; details retains a2uiSnapshot and adds a2uiUsage exactly shaped {components:{used,limit},surfaces:{used,limit},surface:{surfaceId,components}}. Actual known totals are data, not a guarantee of all byte/native/identity quotas. Offline check cannot know global session usage and its two-key success envelope is unchanged. Other surface/native updates and restore continue to enforce existing capacity semantics.

Guidance: reuse same surfaceId with a smaller replacement to reclaim component cost; it still uses one surface slot. There is no public archive/delete surface API, so do not promise one or repurpose reload/reset to discard state. New command design is out of scope.

## D3 executable knowledge

review.express adds a comment explaining all declared Buttons need current literal record IDs when CodeDiff/TestResults exist (native copy/sort/close controls are distinct). Keep19example names/8routes/32components, illustrative-not-executed provenance and all source semantics.

syntax-and-errors documents legacy Executable expressions and checks are unavailable and current Forbidden map key diagnostics, Coding actions must reference current literal record IDs, correct file-vs-path repair, real component locator limits, summary exact visible-case counts (<=128), aggregate64/4 limits, replacement vs slot usage. Do not imply summary166 can be admitted by changing one max;36 remains separate. Explain active workspace cwd for artifact registration. Human prose is reviewed; executable doc/template examples and actual helper outputs are validated, not whole-file text snapshots.

## AC and planned tests

AC-001 actual path/checks/call/callFunction/@bad rejects with key/location, valid @path and renamed file still accept; nested user id/component cannot spoof owner. tests/dx-diagnostics.test.ts.
AC-002 offending unrelated Button, input/Chart/table/FormValidation validators report true owner; global parse/cap errors do not fabricate IDs. Same test; existing validators regression.
AC-003 artifact invalid absolute path names actual override root before IO; ordinary-file/escape/symlink/cancel tests still reject identically. dx-diagnostics + artifacts tests.
AC-004 CLI actual check failure guides reserved-key repair, no generic FormValidation misdiagnosis; old success/error fields/status/source bytes remain. dx-diagnostics subprocess + authoring-cli/skill tests.
AC-005 actual37+30 rejects attempted67/current37 and snapshot unchanged; same-ID37→30 then34 fits64;65 and5surfaces reject with truthful known counts. tests/dx-budget.test.ts.
AC-006 real registered a2ui_render result exposes committed global and selected-surface usage on render/replace without losing snapshot/auto-open semantics. dx-budget through actual extension registration executor plus existing extension tests.
AC-007 review template and doc repair examples compile and have intended literal IDs/file keys; all19examples and32types unchanged. dx-skill + existing skill tests.
AC-008 includes direct UiError status/cause preservation, specific-owner merge/idempotence, and rejected aggregate identity reuse assertions. Source/dist parity, Node/full relevant regressions, independent code GO per slice; no paid model calls or real global config changes. Check records.

Three rounds in docs/walkthrough/dx-usability/. Plan013 carries implementation order. Risk/rollback: optional diagnostics and text may affect exact wording consumers, so keep status and existing reason substrings where meaningful; typed metadata avoids message parsing. Revert slice commits/rebuild dist, do not restore user files or move published tags. Gate1/TDD intent review before tests, then real behavioral RED before each production change. No new baselines or legacy errors are silently relabelled passed.
