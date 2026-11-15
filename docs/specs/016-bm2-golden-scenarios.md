# BM2 — layered golden scenarios

Lifecycle: draft. Profile: strict. 2026-11-15. Canonical BM2 specification; roadmap issue43, implementation steps [plan016](../plans/016-bm2-golden-scenarios.md). **Current authorization is design and independent review only**, after018release/#49closure; no BM2 implementation, fixture creation, workflow changes, model run, merge or publication. No version assignment beyond the frozen018baseline.

## Source, goal and evidence boundary

Design base **63ec895a607d4fe32cc9cedce1344754078ce93c** contains completed018 release records; immutable product tag018 peels24b8288ec6f717836f94743720238c82cb0a56c9. SDK agent0.1.0/web_core+lit0.15.0,32catalog types/19templates/8routes unchanged. Current source/lock/catalog and actual helper metadata are fingerprinted inCheck082. Userglobal017/originalprimarydrafts and018assets remain untouched.

Maintainers need a stable, diverse, explicitly scoped dataset that detects compiler, intended-data, state and interaction regressions without paying a model. BM1's2family repair gate is complete and remains separate. BM2 supplies a future frozen scenario contract for BM4, **not model-generated samples or model quality evidence**. Compilation is the sole product-legality oracle for a single tree; realUiSession/server own state/protocol legality, realbrowser owns observable interaction. Handwritten expected invariants express the declared intent; no second product validator or LLM judge is introduced.

IN for eventual implementation: **64 named scenarios,42positive/22negative**, fixed registry/complete source fixtures, three thin test-local adapters, independent semantic/state/action assertions, detector canaries, bounded Node24 unit/browser CI and source-bound receipts. OUT: runtime/SDK/deps/permissions/limits/queue/CLI/skill instruction changes, new components, all-behavior coverage, BM3geometry/pixel baseline, BM4/model inference/cost claims, global configuration, branch protection, automatic baseline updates. Current phase writes design only; all64 rows below are **planned,0implemented/0executed**.

## Registry / fixtures / adapters

Future `tests/golden/cases.json` has `{schemaVersion:1,profile:"v0.1.8-golden-v1",cases:[...]}` and exactly IDs C01–C46,S01–S12,B01–B06. Each case has exactly `id,contractVersion,contractKey,intent,layer,polarity,fixture,controlFixture,initialState,steps,expected,reference`. Layers compiler/session/browser and polarities positive/negative are explicit; negative means intentionally rejected product input, not broken setup. A valid local UI operation requiring0POST is positive. Harness canaries and positive controls do not pad64.

`fixture` names complete checked-in Express or JSON data under tests/golden/fixtures; negative compiler cases also require a complete positivecontrol differing in only the target defect. Reference existing018templates/tests/contracts when authoring, but never import arbitrary code from registry. All paths are relative, allowlisted, regular non-symlink files with realpaths contained in that root. `reference` is documentation/source provenance, not another executable loader. Only static TypeScript imports, fixed oracle/operation names and typed parameters are allowed: no eval/JS snippets/shell commands/module paths/remote URLs in case data.

Exactly64 unique IDs/contractKeys must match this matrix. Compiler subjects have distinct intentional contracts and complete fixture identities; identical compiler inputs cannot become multiple rows merely by changing labels/language/IDs. Session/browser fixtures may reuse a compiler layout, but their state/action sequences and expected observable contracts must differ. Registry checks reject exact duplicates and unknown/missing keys; independent matrix review checks semantic duplicates. There is no claim that arbitrary semantic equivalence can be automatically decided. Existing19templates, BM1cases and64rows are not added together as a misleading total.

Planned interface `evaluateCompiler(case:GoldenCase, sourceOverride?:string):CaseResult` accepts the optional source only for in-memory canaries, never from registry. Record its actual input hash and mark it canary/excluded from64; preserve original fixture hash separately. GoldenCase has the exact registry fields above; CaseResult has the stage/identity/result fields below.

Three adapters only: compiler adapter uses real `compile('golden',source)` and actual `a2ui.mjs check` parity; twelve static session case functions use actual UiSession/ArtifactStore/startServer methods; six static Playwright case functions use actual renderer+server. A dataset `steps` enum selects the approved static path; it is not a new general-purpose step interpreter/plugin framework. Handwritten expected values are committed before execution, never generated from observed output or a snapshot update command.

Example future case (data, not an implemented fixture/test):

```json
{"id":"C25","contractVersion":"v0.1.8-golden-v1","contractKey":"compiler/Slider/valid-grid","intent":"Show range0..10 with10intervals and initial value4.","layer":"compiler","polarity":"positive","fixture":"tests/golden/fixtures/C25.express","controlFixture":null,"initialState":{"kind":"none"},"steps":[{"op":"compile","surfaceId":"golden"}],"expected":{"outcome":"accepted","oracle":"component-shape","subject":{"id":"root","component":"Slider","values":{"min":0,"max":10,"steps":10,"value":4}}},"reference":{"source":"src/inputs.ts","existingTest":"tests/forms.test.ts"}}
```

Its source will be `root = Slider(label="Range",min=0,max=10,steps=10,value=4)`: steps denotes10intervals, not a step size. Valid alternative declaration order/irrelevant prose is allowed; no full DSL/message byte golden. Named subject IDs and relevant values/cardinalities are fixed. CLI positive output must preserve source bytes and surfaceId; CLI negative is exit1/COMPILE/no stdout with correct known facts. Only directcompile's UiError supplies HTTP-style status; do not invent a CLI status field.

## Frozen coverage matrix

Compiler positives C01–C32 cover the **actual** catalog, no invented TreeView/Breadcrumb/palette component. Root is the named type unless structural companions are necessary; these remain one connected tree. Every scalar below is a literal independent expected value; bound values use simple `/v` and explicit dataModel initialization. Fake media URL **/api/artifacts/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa** proves syntax only, not registration, authorization, decoding or file existence; S09 owns that boundary.

|ID|Contract key|Positive subject|Intent / independent expected invariant|
|---|---|---|---|
|C01|compiler/ActivityTimeline/initial-static|ActivityTimeline|stream tools; no authored successful run/outcomes; compiler shape only|
|C02|compiler/ArtifactPreview/local-shape|ArtifactPreview|fake local URL above,kind image,label Illustrative preserved|
|C03|compiler/AudioPlayer/local-shape|AudioPlayer|same syntactic local URL,description Audio; no external URL|
|C04|compiler/Button/file-intent|Button|child Text Go; Event inspect_file context exactly{file:"src/example.ts"}, no execution|
|C05|compiler/Card/static-child|Card|one Text Body child, reachable exactly once|
|C06|compiler/Chart/finite-negative-value|Chart|kind line; A series point{label:"one",value:-2}, finite negative values allowed|
|C07|compiler/CheckBox/bound-boolean|CheckBox|label Accept,binding/v initialized boolean true|
|C08|compiler/ChoicePicker/bound-array|ChoicePicker|multipleSelection; options a/b; binding/v initialized["a"] with string members|
|C09|compiler/CodeBlock/literal-lines|CodeBlock|code a\nb,language text; literal two-line content|
|C10|compiler/CodeDiff/illustrative-record|CodeDiff|proposal-golden/example.ts/base-golden,old→new; illustrative proposal, no execution|
|C11|compiler/Column/local64|Column|63Text children plusroot=64flatcomponents; order and local64boundary|
|C12|compiler/DataTable/typed-cells|DataTable|Scores,one score column; rows a.cells[2],b.cells[1]; IDs/cells preserved|
|C13|compiler/DateTimeInput/leap-day|DateTimeInput|2024-02-29,date enabled/time disabled; valid leap-day string|
|C14|compiler/Details/static-closed|Details|title More,Text Body child,explicitopen=false|
|C15|compiler/Divider/static|Divider|static horizontal divider; no event/data binding|
|C16|compiler/FormValidation/valid-definition|FormValidation|named field/name binding,submit Button; required,minLength2,maxLength5; empty initial string is legal before submission|
|C17|compiler/Icon/finite-name|Icon|settings from current finite local vocabulary|
|C18|compiler/Image/local-shape|Image|syntactic local media URL,description Image, no fetch claim|
|C19|compiler/List/static-order|List|static Text A/B children in order, no dynamic template|
|C20|compiler/LogView/initial-server-output|LogView|stream tools; empty/idle server-controlled initial content, no fabricated log|
|C21|compiler/MarkdownView/literal-source|MarkdownView|literal text **ok**, compiler preservation only, not DOM/sanitization proof|
|C22|compiler/Modal/distinct-slots|Modal|Text Open trigger/Text Body content, distinct reachable slots, no duplicated child|
|C23|compiler/Row/static-order|Row|Text A/B children in order, no repeated reference|
|C24|compiler/SearchablePicker/member-array|SearchablePicker|label Branch,options a/b,binding/v=["a"], no invented option|
|C25|compiler/Slider/valid-grid|Slider|0..10,10intervals,value4, numeric and on-grid|
|C26|compiler/StatusBadge/reported-provenance|StatusBadge|label Reported,status info,provenance reported; no inferred verification|
|C27|compiler/Tabs/distinct-children|Tabs|titles First/Second,distinct Text A/B child slots|
|C28|compiler/TaskProgress/server-owned|TaskProgress|stream tools,no authored settled/failed outcomes; initial server projection only|
|C29|compiler/TestResults/skip-summary|TestResults|result-golden,command example only,evidence "Illustrative fixture, not an executed test"; one skip,summary0/0/1/0|
|C30|compiler/Text/literal-markup|Text|literal <b>x</b> preserved, no HTML/renderer proof|
|C31|compiler/TextField/bound-string|TextField|Name,binding/v initializedstring Ada|
|C32|compiler/Video/local-shape|Video|syntactic local media URL,no externalposter/no playback proof|

For native live components C01/C20/C28, current documented defaults may be checked but must not invent server outcomes or author forbidden server fields. Current helper parameter metadata is authoritative for fixture construction, not inferred signatures.

|ID|Contract key|Compiler negative / single defect|Expected rejection contract|
|---|---|---|---|
|C33|compiler/Event/reserved-path|C04file→path literalkey|400,Forbidden map key path,knownowner/property; currentBM1profile|
|C34|compiler/parser/unclosed-bracket|Close bracket removed from otherwisevalidColumn|400 parser family; no invented component locator|
|C35|compiler/catalog/unknown-type|Text type replaced with UnlistedWidget|400 unsupported/catalog family|
|C36|compiler/schema/unknown-property|Text adds unknown named property|400 schema/property family, no copying unsupportedSDKadvice|
|C37|compiler/tree/missing-child|Static child reference missing|400 topology/missing-child family|
|C38|compiler/tree/repeated-child|Two references to same child|400 tree/repeated-child family|
|C39|compiler/tree/unreachable|rootText A plus unusedText B|400 unreachable/orphan family; actualdesignprobe confirmed this SDK rejects it|
|C40|compiler/tree/depth17|17-level otherwisevalidnestedtree|413 depth; not source/setup error|
|C41|compiler/capacity/local65|C11adds64thText (65flat)|413 local65/64, no aggregate-state claim|
|C42|compiler/CheckBox/wrong-initial-type|C07boundinitialvalue becomesstring true|400 inputtype, not boolean coercion|
|C43|compiler/FormValidation/unreachable-target|C16rule targets nonexistent/unboundfield|400 reachable-input guard family|
|C44|compiler/TestResults/summary166|One visiblecase,summary.pass166|400 schema128bound; not full-suite aggregate API|
|C45|compiler/TestResults/summary-mismatch|One visiblepass,summary.pass2|400 Test summary does not match case records (within128)|
|C46|compiler/coding/unrelated-button-ids|Two coding Buttons; only unrelated inspect lacks both current IDs|400 codingIDs/knowninspectowner; complete positivecontrol asBM1, no actualcommand|

Errors use current UiError.status/reason/known diagnostic facts, including surface scope when location is unknown. Freeze concrete reason matchers from declared contracts/source at future TDD kickoff; do not copy first failing observed output into expected data or treat any throw as success. Unknown SDK/fixture failures are setup/compile failures, not a passed target negative.

|ID/polarity|Contract key|Real state/API path|Independent expected invariant|
|---|---|---|---|
|S01+|session/capacity/surfaces4|FreshUiSession.render4 Text surfaces|4slots committed,4flatcomponents; source snapshots immutable|
|S02−|session/capacity/surfaces5|Samevalid4surfaces then fifth|413,deep-equal committedsnapshot before/after; no ghostslot/revision|
|S03+|session/capacity/aggregate64|TwoindividuallyvalidColumn surfaces37+27|64committedcomponents/2surfaces, exactknownflatcounts|
|S04−|session/capacity/aggregate65|37+28 attempted|413attempted65/current37; snapshot/eventidentity unchanged|
|S05+|session/capacity/replacement-reclaims|Replace first37with30,sameID; add34|sameIDreplacementrevision+1,slots2,total64; no archive capability|
|S06−|session/atomicity/invalid-replacement|Existingvalidsurface replaced by malformedsource|compiler400 and exactoldcommittedsnapshot/revision preserved|
|S07+|session/data/valid-chart-sequence|render namedChart atrev1; updateChart(golden,1,chart,newseries)|epoch/revision1unchanged,onlyseries changes; subscribeData aftercontrolledtimerflush emitssequence1, not immediate revision bump|
|S08−|session/data/stale-chart|Currentchartrev1,updatewithrevision2|409,unchangedstate and0invaliddataframes aftertimerflush|
|S09+|session/artifact/authenticated-revocation|OwnedPNG registerArtifact(relative,image,ownedroot);authenticatedGET;session.reset;GETagain|actualbytes/MIME200then404 withsameauth/serverstillalive; oldhandle revoked, no pretend remoteasset|
|S10−|session/artifact/relative-escape|OwnedvalidcontrolPNG then ../outside.png (also ownedfixture)|400relativeworkspacepath,oldassetstillservable/unchanged, no realuserfileaccess|
|S11+|session/event/accepted-reentrancy|acceptAction(validsnapshot),dispatchcallbackreentrantly replaces surface|oneforwarded JSON retains acceptedepoch/revision/context despite newerstate; no PiSDK queue/modeldelivery guarantee|
|S12−|session/event/stale-submit|renderreplacementthenacceptAction oldepoch/revision|409beforecallback,0dispatch; distinguish from alreadyacceptedS11|

Actual interfaces: compile→SurfaceMessage; UiSession.render/snapshot/reset/updateChart/registerArtifact/acceptAction/subscribeData/close; startServer(session)→origin/openUrl/closePromise. Use existing methods exactly, no test-only production APIs. S07controls real Node setTimeout/Date using node:test fakeclock, not private commitData/flushData calls or arbitrary sleeps. S09authenticates via current /api/connect before bothGETs; authentication failures cannot masquerade as revocation404. Every case owns its session/ephemeral server/files and finally closes resources even if assertion fails.

|ID/polarity|Contract key|Real browser intent|Observed oracle (no model)|
|---|---|---|---|
|B01+|browser/guard/valid-typed-submit|Guarded Name/Accept form; fill Ada,true;submit|oneactualPOST/202; exact typed{name:"Ada",accept:true},acceptedtuple fromactualsnapshot/forwardedcallback|
|B02−|browser/guard/invalid-no-post|SameformemptyName/falseAccept;submit|visiblevalidation/aria-invalid,0POST/0dispatch; serverboundaries still validated elsewhere|
|B03+|browser/picker/typed-selection|SearchablePicker Branch a/b;search/select b;declaredsubmit|selectedstringarray["b"],oneactualPOST/typedacceptedcontext|
|B04−|browser/palette/hidden-target|OpenFindactions;hide target beforeconfirm|target rechecked,visibleunavailability notice,0POST/dispatch|
|B05+|browser/table/local-sort|Scores table a=2,b=1;nativeScore sort|bodycellsorder[1,2],localonly0POST/dispatch|
|B06+|browser/modal/local-focus|Modal Text Open trigger;open/close|dialog visiblethenclosed,focus restored totrigger,0POST/dispatch|

Use existing browser fixture pattern: real UiSession/startServer and committedrenderer; authenticate with page.request.post /api/connect without putting bootstrap secrets in navigation/failureURLs, then page.goto(origin). Inject only the outbound Pi dispatch observer; no Pi process/provider, no intercepted fake action responses counted as realPOST success. Record actualrequest body/status and callback separately. Do not use snapshot-text matching, screenshot pixels or element-intersection thresholds as BM2 judges. No claim that these6cases prove all32components' visual behavior or keyboard/accessibility paths.

## Evaluation results, canaries and RED standard

Stages: setup/config/fixture/transport, compile, semantic, session, interaction, cleanup. Each receipt has id/layer/polarity/profile/source+lock+catalog+fixture+oracle hashes, attempted/observedOutcome/expectedOutcome,pass/fail/not-run and precise failedstage. Expectednegative passes only after validcontrol and correcttypedproduct rejection. Missingimport/fixture/browser/SDK/HTTPbootstrap,unknownexception/timeout orcleanupfailure never counts as a negative pass. A compile-valid wrong intent failssemantic even if compiler succeeded. Browser/transport failure is not DSL failure.

All64 selected? Only report64/64 if union of compatible compiler/session/browser resultIDs is exactly the matrix with0missing/duplicates/not-run/failure. Node-only58 passing explicitly leaves6browser not-run; separatejobs must have sameprofile/source/lock/fixture/oracle identity before combination. Failures and originalreceipts are retained; no auto-baseline normalization/retry/update. Randomepochs/URLs compare relational invariants/hashes, not staticbytes. Test counts/results belong inChecks, not this plan/spec.

Mandatory detector canaries, **outside64**: invalid/missing/duplicate/unknowncase/contractkey/path config; compile-valid wrongC04file and wrongC25gridvalue from4→5 first independently compile then must failsemantic; altered expectednegative with a different validcompilererror mustfail; S11wrongforwardedrevision mustfail against independentpreacceptsnapshot; wrongreported64count with actual65 mustnotbe accepted; rendererclick that never reachedserver mustnotpassB01. Normalcases remainpositivecontrols. Do not modify actualruntime source/realfixture files just to create canaries; use validated in-memorycase/evidence copies or existing isolated browser fault injection.

For future TDD: first create complete runnablefixtures/control inputs and tests. Demonstrate realproduct expectednegatives separately from evaluator-contract RED. The new harness may initially delegate only to existingcompile: once runnable, a test requiring rejection of a **compile-valid wrongintent** must fail on that compile-only adapter, then pass after the independent semanticcheck. Pin that constructed new-adapter baseline; do not claim018runtime had a defect. Missingfunction/module/fixture is setup, never the behavioralRED. Session/interaction/canary failures must similarly exercise actual observed state/action rather than fail at imports. Future TDD kickoff independently approves concretefixture/expected matcher drafts before implementation expansion.

## Shared job identity vs per-case inputs (P2 clarification)

Both Node and browser jobs compute the same **datasetHash** from canonical profile+full64case registry and sorted relativepath→rawSHA256 map of **all**64fixtures/controls/media inputs, even the cases that job does not execute. Both compute **oracleSetHash** from the sorted paths/rawhashes of all registry/adapter/worker/oracle/browser test modules. Common sourcecommit,lockfileSHA,catalog/SDKidentity,datasetHash,oracleSetHash,profile must match before resultunion. Changing any dataset/oracle member invalidates combination; no partialmanifest hashing that hides the other layer's drift.

Each result separately records caseId, its declared fixture/control hashes and **actualInputHash**. Different cases naturally have different hashes: they are checked against their own commonmanifest entry, **never required equal acrossdifferentcaseIDs**. In-memory source/evidence canaries retain declaredfixturehash and actualmutatedinputhash, carrycanary=true and are excluded64. Node/browser actual environmentfields may differ by role; each must satisfy its frozen layerprofile (Node24major,lockedbrowser/environment), not fake identicalbrowsermetadata onNode-onlyjob. No automatic rebaseline if fingerprints disagree.

## Deadlines / cancellation / teardown (P2 clarification)

Future evaluator budgets are fixed test contracts, adjustable only through reviewed spec/TDD change, not retries or automatic timeout inflation:

|Operation|Deadline / failure behavior|
|---|---|
|Node compiler/session case work|30s parent real-monotonic watchdog; synchronous compiler/session work executes in a newly owned Node24 case child, not on the watchdog event loop|
|ActualCLI check child|10s; parent launches it directly (not as an untracked worker descendant); timeout is setup/transport failure, never expected COMPILE rejection|
|HTTP/connect/artifact/action request|5s AbortController; abort pending body/request on timeout, preserve URL origin/status but not token/cookies|
|Data flush observation S07/08|One controlled200ms fakeclock advance and bounded1s observation; fakeclock is case-child local, parent realwatchdog remains live; no privateflushmethod or unboundedsleep|
|Browser action/navigation/expect|5s each; Bcase30s Playwright timeout; never count click/pendingresponse alone as success|
|Teardown|5s separate grace, always runs; primary assertion/timeout and cleanup failures both retained; any cleanupfailure preventscasepass|
|Owned Nodechild termination|After worktimeout sendcancel/abort, allow5s teardown, then SIGTERM to that owned ChildProcess, SIGKILL after2s if stillalive; clear timers onexit, never select globalPIDs|
|Browser runner / hostedjob|Owned Playwright execution5min outerlimit; each futureCI job10min including setup. These are fail-closed execution caps, not model/billing bounds|

One thin future `tests/golden/case-worker.ts` provides fixed compiler/session execution only, with static imports/validatedcase IDs, boundedtypedJSON/IPC results; no arbitraryscript/module/shell selection. Compiler-only canary preconditions also use `compileInOwnedWorker(source)` returning an accepted/ui-error/setup-error/timeout observation; unexpected/timeout outcomes do not satisfy semantic preconditions. Parent runs worker and CLI as separately tracked directchildren. This limited isolation addresses the actual watchdog gap; it is not a generic worker framework or production API. Use portable ChildProcess ownership; no process-name/group sweeping. SynchronousJS cannot be preempted by Promise.race: do not claim otherwise.

Cleanup order: abort ownedpendingrequests/waits; close page/context so SSE/action traffic stops; await ownedserver.close; session.close clears listeners/data timers and artifact store; then close ownedfixturehandles/removeonlyownedtemporarydata while retaining failure receipts. Playwright manages only its newly launched headless browser; bounded fixture/runner teardown may terminate owned workers, never the user's browser/Pi. Cleanup after a failure must not replace the original failedstage with a misleadingpass. Unsupported termination/environment is a setup/cleanup failure, not a skippedgreen. No implementation of this protocol is created in the design phase.

## Environment / CI / packaging

Node24.x only; record actualpatch/executable/cwd/source/profile. Compiler/session under node:test/tsx, browser real Chromium from exact locked Playwright package/revision; record OS/browser/viewport1280x900,DPR1,light,localeen-US,timezoneUTC,reducedmotion. No pixel threshold/font-geometry gate here; BM3 independently freezes layout/fonts/screenshots policy. No provider/model/auth access or extra runtime dependency. Model evaluation remains futureBM4, only glm-5.3-flash with explicitopt-in/admission if later requested.

Future files: tests/golden/cases.json,fixtures/,registry.ts,compiler.ts,session.ts,case-worker.ts,browser.spec.ts,tests/golden.test.ts; test-localonly, no genericCLI or productionexport. Node defaultnpmtest discovers58data cases plus harnesscanaries; browsercommand `npm run test:browser -- tests/golden/browser.spec.ts` runs existing45 plusnew6; narrowerdirect Playwright path may run6duringdevelopment. FutureCI extends existing read-onlyNode24 workflow with a separate Chromium job (lock-installed browser/OS dependencies and timeouts), finalindependentworkflowreview before authorizedpush. No secrets/publish/branchprotection/newaction pins assumed. This design creates no job.

Assert npm pack excludes tests/golden/CI/reports; existing runtime/skill/CLI byteidentities remain unless a newly discovered defect receives separate spec/review approval. Generated reports/snapshots never go into source/productionpack bydefault. Failurelogs preserve stage/source/typedobservations and redact bootstrap/auth headers; private evidence0700, cleanup onlyownedresources. CI logs mustretain source/case/stage even if diagnostics artifacts are not uploaded; no screenshot-retention or syscall/billing trace claim.

## AC / admission / rollback

|AC|Given / When / Then and future test intent|
|---|---|
|AC-001|Given approvedmatrix/registry,when load/coverage checks,then exactly64/46+12+6/42+22 andstaticuniquecontracts; schema/path/dedupcanaries reject invalidsets|
|AC-002|Given completecompilercontrols,when actualcompile+CLI/independentoracles,then32validintent+14rightreasonnegatives; compilevalidwrongdata failssemantic|
|AC-003|Given ownedstate/assetfixtures,when12realpaths execute,then exact64/65,4/5,atomicity,revision/sequence,artifactrevocation andaccepted-vs-stale invariants|
|AC-004|Given authenticatedrealcanvas,when6nativeactions execute,then actualvisible/typedPOST/callback/local-only/focusobservables; no model/mock-response substitute|
|AC-005|Given samechecker andfaultcopies,when canaries run,then targetstagefail/validcontrols pass; setup/not-run/cleanup remain failures, notnegativepasses|
|AC-006|Given compatibleNode/browserreceipts,when approvedCI/delivery executes,then source-bound64completeandpackexclusion/no-runtime-drift; otherwisepartialexplicitlyreported|

Walkthrough [Round1](../walkthrough/benchmark-bm2/01-round1-user-stories.md), [Round2](../walkthrough/benchmark-bm2/02-round2-technical-trace.md), [Round3](../walkthrough/benchmark-bm2/03-round3-integration-check.md). Current exit is independent **design** GO only; fixture creation/TDDkickoff/code/CI/merge/publication require subsequent authorized phases. Risks: compiler-only falseconfidence, padding/duplicatecases, dynamicidentity overconstraint, asyncflakiness or leak. Countermeasures above are explicit contracts, not test results. Rollback futureimplementation as one test/fixture/CI slice without touching018tag/assets/globalconfig; retain originalfailedreceipts/designhistory. No unresolved productbehavior choice is delegated to a guessed oracle.
