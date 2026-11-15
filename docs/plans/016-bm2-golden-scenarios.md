# BM2 golden scenarios — implementation intent

**Goal:** A repeatable68case dataset across compiler/state/browser, not a new product validator or modelbenchmark.
**Architecture:** Fixeddata+three thin static test adapters, existing compile/CLI/UiSession/server/renderer, handwritten expecteddata/state/interaction invariants.
**Tech Stack:** Node24.x, existing node:test/tsx/Playwright. No newruntime dependency/model/Pi process.
**Spec:** [016](../specs/016-bm2-golden-scenarios.md), exactmatrix/schema/AC-001–006 andenvironment arecanonical. User now authorizes implementation after updated independent TDD review; merge/publication remain separate gates. Issue43 ownslivestatus,Checks actualresults; versionunassigned, productbaseline018.

## Files and interfaces (future)

|Path|Responsibility / interface|
|---|---|
|tests/golden/cases.json,fixtures/|68fixedcases/completecontrols; noJS/modules/shell/eval|
|tests/golden/registry.ts|loadCases(root):GoldenCase[]; strictschema/fixedkeys/safecontainedregularfiles; noautodiscoverypadding|
|tests/golden/compiler.ts|evaluateCompiler(case:GoldenCase,sourceOverride?:string):Promise<CaseResult> viarealcompile+CLI andfixedsemanticoracle|
|tests/golden/case-worker.ts|FixedownedNode24C/S execution, typedIPC; compileInOwnedWorker(source):Promise<CompileObservation> observation for canarypreconditions; staticcases only, no usercode selection|
|tests/golden/session.ts|evaluateSession(case,ownedRoot):Promise<CaseResult>;15staticrealstate/HTTPpaths; finallycleanup|
|tests/golden/browser.spec.ts|7staticrealPlaywrightcaseexecutors,existingcanvas/authpattern; noPi/model|
|tests/golden.test.ts|RootNodeauto-discovery;61data rows andseparateharnesscanaries|
|.github/workflows/benchmark.yml|Futureseparatebrowserjob + Nodejob,read-only/pinnedNode24; noactivitycreatednow|

GoldenCase/CaseResult shapes areSpec016'sregistry/stage/identityfields; noalternatevalidationcontract. Adapters combineonlymatchingprofile/source/lock/fixture/oracleidentities. Reports remainprivate/ignored; packagefiles declaration unchanged. No runtime API/SDK/permission/CLI changes; only two skill reference clarifications or guessedsourcecorrections.

## Task A — concrete fixtures / evaluator contract RED

- [ ] After userimplementationGO, independentTDDkickoff freezes completefixture/control sources and reason/location matchers against018contracts before codeexpansion. Validatefixturesavailable, separateexistingproductnegativesfromnewharnessbehavior.
- [ ] Write registry/coverage consumer tests first (68fixedIDs,45/23,46/15/7,path/oracle safety), then minimal runnable loader/fixtures. Missing files/import failures are setup, not behavioralRED.
- [ ] Implement minimal compiler adapter delegatingrealcompile; run a compile-valid wrongintent case before semanticchecks and observe evaluator-contractRED. Pin this newconstructedadapter source, never label it018productdefect. Example future assertion inside an async node:test consumer:

```ts
const repoRoot = process.cwd();
const caseC04 = loadCases(repoRoot).find(row => row.id === 'C04')!;
const fixture = readFileSync(resolve(repoRoot,caseC04.fixture),'utf8');
const changed = fixture.replace('src/example.ts','src/other.ts');
const precondition = await compileInOwnedWorker(changed);
assert.equal(precondition.kind,'accepted');
const result = await evaluateCompiler(caseC04,changed);
assert.equal(result.failedStage,'semantic');
```

`sourceOverride` is the explicitly declared optional test-local string argument, never a registry field or product API. Canary receipts hash actual override input and retain originalfixture identity; they do not count as golden rows.

## Task B — compiler GREEN / independent canaries

- [ ] Add staticoracles fromSpecmatrix, actualCLIparity exit0/exactsource or exit1/no stdout/COMPILE; directcompile alone ownsUiErrorstatus. Run32positive/14negative andpositivecontrols, wrongliteral/wronggridvalue compile-validsemanticcanaries, wrongnegativefamily/config/path/duplicationcanaries.
- [ ] Validate normativevalues independently (Slider10intervals;C11root+63Texts64;literalfile;codingIDs;syntheticmediaURLs syntaxonly;TestResults skipfixture notexecuted). Do not snapshotactualoutput as expected.
- [ ] Node24 narrowcompiler thenallunit/check/build andpackscope; independentcode review atfixedsource. Any unexpectedruntime bug stops for separatespec/review, no fix-forward.

## Task C — session/HTTP GREEN

- [ ] Write15caseintenttests againstactualUiSession APIs first; implementstatic adapters/data, no newstatevalidator/private methodcalls. Ownedtemp0700root+knownPNG,ephemeralservers; allfinallyclosed, retainfailedreceipts.
- [ ] Show64/65,4/5,failedreplacementatomicity,chartrevfixed/sequenceaftercontrolledflush,authenticated200→reset→404,ownedtraversalrejection,acceptedreentranttuplevsstale409. No actualPi queue/modelACK claim.
- [ ] Independentnegative/identity/resourcecanaries before claiming stateproof; samecase-contract signatures andsharedfixtures, butnot duplicate scenarios. Required narrow/full/type/cleanup checks andfreshreview.

## Task D — real browser paths

- [ ] SevenspecBcases reuseactualserver/renderer andauthenticatedcontext; observeactualPOST/status+typedcallback or0localrequests; visibility/focus/state assertions only. Never substitute a fake response for successfulnetwork evidence.
- [ ] Captureonlysyntheticdata; bootstrap/authcookies private/nofragmentURLlogs. Fixedviewport/DPR/theme/locale/timezone, recordlockedbrowserrevision; noBM3geometry/pixeljudge.
- [ ] Run7narrow thenexisting45+7realbrowserregression; failures preservestage/source/logs andcloseonlyownedresources. Detectorcanary checks that a click withoutserverreceipt cannotpassB01. No modeldriver or providerconfig.

## Task E — CI / delivery (separate future admission)

- [ ] Reviewcompletecode/specdrift/testmatrix andworkflowdiff independently beforeauthorizedpush. ExtendexistingreadonlyNode24workflow withlockedChromiumjob andexplicittimeouts/install/checkcommands; keeppermissionsminimal, no newactionversionwithoutprimarysourceverification.
- [ ] RealNodejob61caseIDs +browserjob7 onexactsame source/profile/lock/fixture/oracles; unionexact64, setup/notrun/duplicate/cleanup failuresnotGREEN. Localtests do notprovehostedCI.
- [ ] UpdateChecks/source-boundreceipts andissue43progress; onlyauthorizedintegration/releaseafterindependentGO canmarkBM2delivered. BM3/BM4/parent43closure remainseparate. Rollbacktest/fixture/CI references together, preserve018releaseandfailedreceipts.

## Reviewed identity and lifetime refinements

Spec016common datasetHash includes the whole68registry/allfixture+controls/media map; commonoracleSetHash includes alladapters/worker/oracles includingbrowser eveninNodejob. Eachcaseactualinputhash is matched to itsown manifest, not othercases. Canaryoverrideinputhash/canary=trueexclude68. Samecommit/lock/catalog/profile/commonhashes precedeunion; layerenvironmentcompatibility is explicit.

Futurethin case-worker isolates synchronousC/S work under realparent30s watchdog; actualCLI is separatelytracked10schild; HTTP5s abort; S07/08controlledclock+1sobservation; browser5saction/30scase; teardown5s; onlyownedchildTERMthen2sKILL/runnercap. Schema/fixtures/concrete matchers and this boundedworker protocol receive TDDkickoff review before implementation. Currentdesignadds no worker/fixture/code/job. Cleanup order andprimary+cleanupfailure reporting followSpec016; no Promise.race syncpreemption or globalprocesskills.

All parent compiler/session/worker helpers are Promise-returning asynchronousspawn/IPC controllers. Tests await precondition/evaluation/childexit/teardown; only child-localrealcompile is synchronous. CompileObservation discriminator/payload is specified inSpec016, not inferred from arbitrarythrow/exitcode. No worker code is implemented in this design.

## Current implementation admission

User authorizes implementation followingupdatedindependentTDDGO. Spec016v2succession supersedes historical64/design-only scope:68cases (46C/15S/7B,45+/23−), Node61 +browser7, semantictransportdedup notruntimechange. Inline rootimplementation, independentreviewonlydelegation. Add51sortsemantics/52transport-vs-business-idempotency references andobservablecharacterizations, preserve intentionalnew-IDrepeat. Concretefixture/control drafts andreasonclassificationsfirst; no fakeRED foralreadycorrectruntime/prose. NewharnessoracleREDthenminimalGREEN,alllayers/identity/deadlines/canaries,realCI/codeGO beforePRhandoff. BM3/BM4separatelydesigned,12GLMfirstattemptbudgetonlyafterBM4offlineadmission. No newrelease/merge/globalupgrade yet.
