# BM3 — deterministic layout across search, audit and return

Lifecycle: complete. Profile: strict. Canonical spec; parent issue43. Baseline fef18935165efdc2d6b152bebf75e2f830a06341 contains independently reviewed BM2 candidate PR53; current source/runtime/assets remain018. User authorizes subsequent BM/issues implementation after each design/TDD gate. This slice is zero-model. No merge, release or global installation change.

> Delivery update2026-11-15: implemented, independently reviewed and accepted on actual integrated0.1.9 source `7bb6a0b0f4eb48820cf1d6f6c92dd29efa06ac8c`; see [Check106](../checks/106-v019-integrated-main.md). Earlier admission/unmerged/future-implementation wording below is retained design-stage context and is superseded for delivery status by this record. Functional constraints and all original RED/GLM v1 evidence remain unchanged. Local Node24 replaces hosted execution under the user quota instruction; it does not waive gates. Publication/tag/global upgrade and any new real-model budget remain separately authorized actions.

## Goal, non-goals and evidence boundary

Detect an unreadable/unclickable layout when a real search canvas changes to audit and returns. Gate concrete visible geometry, occlusion and actual native interactions, preserving the existing renderer and CSS. Keep3 inspectable screenshot baselines as advisory evidence. BM2's68cases and code/source identities remain separate; this is not a total component/layout/accessibility coverage claim or model outcome.

IN:2complete main-flow Express fixtures plus1Modal-control fixture,3states on one actual UiSession/server/browser, a small test-local explicit-pair geometry/hit oracle, actual POST202 and application-controller transitions, injected-overlap detector canary, legitimate nesting/modal controls, environment/source/fixture/asset/oracle fingerprints, inspected3PNG baseline for one declared environment, bounded Node24/lockedChromium CI and synthetic capture artifact retention.

OUT:runtime/CSS/SDK/permission/tool changes, screenshot pixel gate, all-DOM-pair scanning, inferred semantic equivalence, responsive/mobile/all-font/accessibility coverage, actual Pi/model execution, automatic baseline updates, provider/user-auth access, new npm dependencies, release/closure. Default TextField's visible label is not currently its accessible textbox name (BM2 characterization); use the unique textbox scoped to Canvas workbench and separately assert the visible Query label. Do not claim an accessibility fix.

## Concrete state machine and inputs

Sources: `tests/visual/fixtures/search.express` and `audit.express`, authored before the detector. Both compile through actual018compiler as6components. They contain illustrative data, not real source findings or executed tests.

1. **Search**: render workbench rev1; literal Search workspace, initialized Query string, Search Button/Event search binding query. Fill exact `example`.
2. **Audit**: actual browser Search click→actual POST/202→actual UiSession dispatch callback captured. A test-local application controller parses the accepted message and replaces the same surface with audit rev2: literal Audit results, DataTable Reported findings with2known illustrative rows, Back to search Button/Event back.
3. **Return**: actual Back click→POST/202→controller replaces with the original Search source, rev3. Query is empty (full replacement), epoch unchanged; first accepted query remains `example` in observed callback.

Callback-driven replacement simulates an application response, not a Pi/model turn. Capture actual request/status and accepted callback identities separately; no mocked202 or tool/Pi ACK claim. Confirm declared current version before each action. Do not rely on whether an obsolete client notice says Sent to Pi after replacement; actual server receipt and new state control are the judges. Observe no extra POST while typing, sorting/filtering or opening/closing a local Modal.

## Fixed subjects and layout oracle

Observation is actual native DOM geometry after a visible target and `document.fonts.ready`, not generated snapshots. A subject has a fixed name, observed bounding rect, visible state and (for active controls) center hit result. Known nonempty subjects must exist; missing/invalid/nonfinite rect, hidden target, unknown exception, font/environment/HTTP/bootstrap/teardown failure is setup/failure, never a successful negative.

|State|Explicit unrelated pairs (allowed intersection<=1CSSpx in either dimension)|Native controls requiring visible/nonzero/in-viewport bounds and unobscured center|
|---|---|---|
|Search/Return|Search workspace vs Query input; Query input vs Search; title vs Search|Query input,Search|
|Audit|Audit results vs DataTable host; table host vs Back; title vs Back|Filter Reported findings input,File/Status sort buttons,Back|

Title/table host require visible nonzero in-viewport bounds too, but no center pointer-action claim for a noninteractive container. These pairs are hand-selected unrelated subjects. Card/Column/label/input containment, table/header containment and Modal overlay are legitimate composition; **do not** scan every DOM pair and then blacklist false positives. No current sticky-header feature is inferred from old feedback.

For each pair, unexpected overlap iff intersection width>1 AND height>1 CSSpx. Each active control center must resolve to itself/its descendant using real document hit-testing through open shadow roots, and satisfy a native trial-click/actionability check. These are deterministic assertions, not a pixel similarity score. Real Search/Back and local controls must also actually work, not only have plausible rectangles.

## Canaries and first RED

Outside the3states, normal Search geometry is a positive control. Inject only a test-local style onto the actual Search native button: fixed at the observed Query input box, zero margins, high z-index. Independently observe positive-area overlap and Query center blocked before testing the detector. A constructed initial no-op detector must fail a consumer expecting named overlap/occluded faults despite complete valid fixtures; this is harness RED, not an018runtime defect or missing-module failure. Then minimal oracle returns the correct named faults; remove style and normal geometry/hit must pass again. A missing-subject canary must fail setup, not masquerade as overlap rejection.

Positive false-positive controls: actual Card/Column ancestry contains the normal subjects; actual table host contains header controls. A separate legal native Modal opens over the background, so evaluate active dialog controls only, assert actual local open/close/focus restore and0POST. Background occlusion while a modal is open is expected; never mark the dialog itself exempt from interaction/hit checks. No fake network success or source/CSS modification is used to make these pass.

## Screenshots and environment policy

Freeze Node24major, actual patch/executable/cwd observation, lockfile, exact Playwright/Chromium revision1254 (158.0.8127.18 in current lock),1280x900,DPR1,light,en-US,UTC,reduced-motion. Record actual OS/arch and computed font stack. Capture actual platform font family/PostScript/custom identities for fixed header text via Chromium CDP, after fonts.ready; `document.fonts.check` alone is **not** proof that a system font exists. Missing/unsupported font observation is setup failure. Record renderer asset/source/fixture/oracle hashes.

PNG comparison is **advisory from the start**, never a failing pixel gate silently downgraded. First declared baseline environment is darwin-arm64 with the exact observed browser/font profile. Keep3PNG files with a manifest of capture source/fixture/asset/oracle/environment identity after independent visual inspection. Linux CI captures its own3states and gates geometry/interaction, but reports screenshot comparison as not-defined-for-environment until a separately inspected Linux baseline exists. Never compare unmatched OS/fonts as the same pixels. Matching-profile PNG hash differences remain visible advisory changes, not an automatic overwrite/acceptance. No claim of pixel-perfect/font fidelity.

Initial baseline acquisition is explicit capture-only, non-acceptance: complete valid geometry/interaction and write owned private captures, report baseline pending/accepted=false. Root and independent reviewer inspect all3images; then manually copy those exact files/manifest into the declared baseline directory and review the addition. There is no baseline-update CLI or automatic CI writeback. Normal acceptance requires the declared local baseline manifest to exist and be structurally/hash valid; platform-not-defined is explicit for other environments, not missing declared-local baseline disguised as green.

All screenshots are page content from owned synthetic fixtures, never browser chrome or token-bearing navigation URLs. Authenticate using /api/connect then navigate plain origin. Save run images/report to ignored owned `.local/bm3-layout/`; retain synthetic diagnostic captures as a7day GitHub artifact using verified official actions/upload-artifact v7.0.2 commit `cf430e030ddbb5b0abf93d22962f4752f3646cd9` (action.yml using node24). Source/pin receipt is in Check088. Artifact absence after setup failure cannot make the failed job green. Do not retain credentials, bootstrap headers/cookies or user/model data.

## Lifetime, CI and packaging

Reuse real server/UiSession/renderer pattern and BM2 bounded owned cleanup (page2s,server2s,session close within5s; primary+cleanup failures retained). No user's browser/Pi/process is controlled. Browser actions/navigation/expect5s,case30s,teardown5s,owned browser runner5min,hosted job10min. Only async waits are deadline-raced; no synchronous preemption claim. Close every owned resource after positive, canary, timeout and setup failure. Screenshot/font collection has explicit5s per operation under case limit.

Test-local files planned: tests/visual/fixtures/,layout.ts,browser.spec.ts,baseline-manifest.json,baselines/darwin-arm64/chromium-1254/*.png. A fixed report writer validates states/canaries/source/fixtures/assets/environment, not a second product validator. Extend existing owned browser runner with the visual spec and reviewed artifact step; current BM2 checker identity changes because that runner is included, but its68dataset and assertions do not. Node/browser job common fingerprints must still agree in new actual CI. No branch protection/publish action/secret/model call.

npm pack must still exclude tests/visual/baselines/reports/CI. Rollback this visual fixture/oracle/baseline/runner/artifact slice without changing018 assets or BM2's product documentation fixes; retain original failure/evidence. No new package version assigned.

## Acceptance and TDD mapping

|AC|Given/When/Then|Test intent|
|---|---|---|
|AC-001|Actual search→audit→return user clicks|3states,revisions1/2/3,sameepoch,2realPOST202,exact accepted contexts and old-version tuples; no model|
|AC-002|Each settled actual state|all named unrelated pairs clear,targets visible/inviewport/finite/unobscured; actual native controls work|
|AC-003|Normal then real CSS overlap then restoration|preconditions true; initial detector RED; same final detector reports named overlap/occlusion and normal restored control passes; missing target fails setup|
|AC-004|Nested Card/table and active Modal|legal containment/overlay not false positives,Modal real close/focus/0POST; active controls still hit-test correctly|
|AC-005|Frozen profile,capture-only then inspected baseline|3committed PNGs+valid manifest; declared-local missing/corrupt baseline fails; matching-profile differences advisory; Linux unknown explicitly scoped|
|AC-006|Failures/setup/teardown/CI|bounded owned cleanup and original failure retained; Node24/lockedbrowser/source-bound report,artifact/pack boundaries; actual hostedCI before delivery|

Three walkthroughs under docs/walkthrough/benchmark-bm3 and Plan017 define implementation steps. Current exit: independent design/TDD review of concrete sources, pair matrix, counterexample, environment/baseline policy and action pin before detector code. BM4 remains a separate cost/profile gate,12first-attempt glm-5.3-flash only, unexecuted.


Baseline classification is exact: invalid manifest/path/symlink/PNG hash/dimensions or a missing file from the declared3Mac images is setup failure on every platform. A well-formed committed baseline with a nonmatching currentOS/font/environment fingerprint is advisory not-comparable (Linux initially not-defined-for-environment); it is not a failed pixel check. Matching-profile image hash differences are advisory changed. Validate both declared baseline integrity and current geometry regardless of comparability. Capture-only never passes normal acceptance.

Font subjects are fixed `h1`, `.brand` and first native `button` (Find actions), which are present in all3states; CDP reports familyName/postScriptName/isCustomFont and glyphCount. Match environment font identity without using glyphCount as a font file identity. This observes these declared text samples, not every glyph/system font or OS font-file bytes. Preliminary Node24/lockedChromium characterization confirms actual .SF NS/Arial platform font records on thisMac; it is not a committed baseline or detector result.

Concrete Modal positive source is `tests/visual/fixtures/modal.express`: Card→Column→Legal containment Text and Modal(Text Open details trigger,Column(Text Local details,Text Nested body) content). While open, measure Local details/Nested body vs native Close details, require the active Close details center hit/native action, then actual close/focus return and0POST. Do not run background Search hit assertions in the active modal context.

Exact application callback expectations are independently handwritten: acceptedSearch `{epoch:initialEpoch,revision:1,surfaceId:"workbench",event:"search",sourceComponentId:"search",context:{query:"example"}}`; acceptedBack uses the same epoch,revision2,event/sourceComponentId back,context{}. Each actual POST envelope must carry that pre-action version/source/context and receive202. The single actual surface ends atrev3 and empty Query. Timestamp/UUID compare validity/fresh identity only, never byte snapshots.


Audit local-control inputs/outcomes are fixed before detector consumers: filter `src/example.ts`→visible first-column `["src/example.ts"]`; clear→`["src/example.ts","src/other.ts"]`. Click File twice: first ascending a/b, then descending b/a; click Status twice: first ascending a/b, then descending b/a. Assert native header aria-sort for each direction and literal visible file-column order (not internal row IDs). Finally click File once after Status to restore ascending a/b before the Audit capture. These operations must leave actual POST/dispatch count at1 after Search, before Back makes2. This detects a no-op sorting implementation despite initially sorted inputs, without adding geometric subjects.


Pixel advisory comparison controls are the declared profile/state recipe, actual OS/browser/font/environment and unchanged fixture data. Product source/render assets and checker code may change between baseline and candidate—the report must record these as explicit changed experimental variables, rather than suppress every possible rendering regression by requiring identical render bytes. Such changes never auto-approve a new baseline or prove pixel fidelity. A same-environment/fixture candidate can show advisory PNG differences across asset/oracle versions; mismatched environment/fixtures remains non-comparable. Geometry/native action gates always evaluate the current source.


Review refinements: Playwright body failures must be read from sanitized TestInfo.errors/error (use() alone does not reject for a failed body), retained alongside setup and cleanup observations, and prevent accepted evidence. A fixed owned non-discovery fixture plus Node canary exercises simultaneous real body assertion/cleanup error without requiring Chromium in the Node job. Await bounded fonts.ready before each observation/native actionability stage, remeasure after trials/hover and before capture. Persist actual request/status/decoded accepted callback/raw dispatch separately; the fixed report gate verifies both202and accepted old tuples, not only a flow=true flag and POST array.
