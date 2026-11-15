# BM2 golden scenarios — implementation intent

**Goal:** A repeatable64case dataset across compiler/state/browser, not a new product validator or modelbenchmark.
**Architecture:** Fixeddata+three thin static test adapters, existing compile/CLI/UiSession/server/renderer, handwritten expecteddata/state/interaction invariants.
**Tech Stack:** Node24.x, existing node:test/tsx/Playwright. No newruntime dependency/model/Pi process.
**Spec:** [016](../specs/016-bm2-golden-scenarios.md), exactmatrix/schema/AC-001–006 andenvironment arecanonical. Scope now **design+independentreview only**; steps below are futureimplementationintent, not executionpermission/progress. Issue43 ownslivestatus,Checks actualresults; versionunassigned, productbaseline018.

## Files and interfaces (future)

|Path|Responsibility / interface|
|---|---|
|tests/golden/cases.json,fixtures/|64fixedcases/completecontrols; noJS/modules/shell/eval|
|tests/golden/registry.ts|loadCases(root):GoldenCase[]; strictschema/fixedkeys/safecontainedregularfiles; noautodiscoverypadding|
|tests/golden/compiler.ts|evaluateCompiler(case:GoldenCase,sourceOverride?:string):CaseResult viarealcompile+CLI andfixedsemanticoracle|
|tests/golden/session.ts|evaluateSession(case,ownedRoot):Promise<CaseResult>;12staticrealstate/HTTPpaths; finallycleanup|
|tests/golden/browser.spec.ts|6staticrealPlaywrightcaseexecutors,existingcanvas/authpattern; noPi/model|
|tests/golden.test.ts|RootNodeauto-discovery;58data rows andseparateharnesscanaries|
|.github/workflows/benchmark.yml|Futureseparatebrowserjob + Nodejob,read-only/pinnedNode24; noactivitycreatednow|

GoldenCase/CaseResult shapes areSpec016'sregistry/stage/identityfields; noalternatevalidationcontract. Adapters combineonlymatchingprofile/source/lock/fixture/oracleidentities. Reports remainprivate/ignored; packagefiles declaration unchanged. No runtime API/SDK/permission/skill/CLI changes or guessedsourcecorrections.

## Task A — concrete fixtures / evaluator contract RED

- [ ] After userimplementationGO, independentTDDkickoff freezes completefixture/control sources and reason/location matchers against018contracts before codeexpansion. Validatefixturesavailable, separateexistingproductnegativesfromnewharnessbehavior.
- [ ] Write registry/coverage consumer tests first (64fixedIDs,42/22,46/12/6,path/oracle safety), then minimal runnable loader/fixtures. Missing files/import failures are setup, not behavioralRED.
- [ ] Implement minimal compiler adapter delegatingrealcompile; run a compile-valid wrongintent case before semanticchecks and observe evaluator-contractRED. Pin this newconstructedadapter source, never label it018productdefect. Example future assertion:

```ts
const repoRoot = process.cwd();
const caseC04 = loadCases(repoRoot).find(row => row.id === 'C04')!;
const fixture = readFileSync(resolve(repoRoot,caseC04.fixture),'utf8');
const changed = fixture.replace('src/example.ts','src/other.ts');
assert.doesNotThrow(() => compile('golden', changed));
assert.equal(evaluateCompiler(caseC04,changed).failedStage,'semantic');
```

`sourceOverride` is the explicitly declared optional test-local string argument, never a registry field or product API. Canary receipts hash actual override input and retain originalfixture identity; they do not count as golden rows.

## Task B — compiler GREEN / independent canaries

- [ ] Add staticoracles fromSpecmatrix, actualCLIparity exit0/exactsource or exit1/no stdout/COMPILE; directcompile alone ownsUiErrorstatus. Run32positive/14negative andpositivecontrols, wrongliteral/wronggridvalue compile-validsemanticcanaries, wrongnegativefamily/config/path/duplicationcanaries.
- [ ] Validate normativevalues independently (Slider10intervals;C11root+63Texts64;literalfile;codingIDs;syntheticmediaURLs syntaxonly;TestResults skipfixture notexecuted). Do not snapshotactualoutput as expected.
- [ ] Node24 narrowcompiler thenallunit/check/build andpackscope; independentcode review atfixedsource. Any unexpectedruntime bug stops for separatespec/review, no fix-forward.

## Task C — session/HTTP GREEN

- [ ] Write12caseintenttests againstactualUiSession APIs first; implementstatic adapters/data, no newstatevalidator/private methodcalls. Ownedtemp0700root+knownPNG,ephemeralservers; allfinallyclosed, retainfailedreceipts.
- [ ] Show64/65,4/5,failedreplacementatomicity,chartrevfixed/sequenceaftercontrolledflush,authenticated200→reset→404,ownedtraversalrejection,acceptedreentranttuplevsstale409. No actualPi queue/modelACK claim.
- [ ] Independentnegative/identity/resourcecanaries before claiming stateproof; samecase-contract signatures andsharedfixtures, butnot duplicate scenarios. Required narrow/full/type/cleanup checks andfreshreview.

## Task D — real browser paths

- [ ] SixspecBcases reuseactualserver/renderer andauthenticatedcontext; observeactualPOST/status+typedcallback or0localrequests; visibility/focus/state assertions only. Never substitute a fake response for successfulnetwork evidence.
- [ ] Captureonlysyntheticdata; bootstrap/authcookies private/nofragmentURLlogs. Fixedviewport/DPR/theme/locale/timezone, recordlockedbrowserrevision; noBM3geometry/pixeljudge.
- [ ] Run6narrow thenexisting45+6realbrowserregression; failures preservestage/source/logs andcloseonlyownedresources. Detectorcanary checks that a click withoutserverreceipt cannotpassB01. No modeldriver or providerconfig.

## Task E — CI / delivery (separate future admission)

- [ ] Reviewcompletecode/specdrift/testmatrix andworkflowdiff independently beforeauthorizedpush. ExtendexistingreadonlyNode24workflow withlockedChromiumjob andexplicittimeouts/install/checkcommands; keeppermissionsminimal, no newactionversionwithoutprimarysourceverification.
- [ ] RealNodejob58caseIDs +browserjob6 onexactsame source/profile/lock/fixture/oracles; unionexact64, setup/notrun/duplicate/cleanup failuresnotGREEN. Localtests do notprovehostedCI.
- [ ] UpdateChecks/source-boundreceipts andissue43progress; onlyauthorizedintegration/releaseafterindependentGO canmarkBM2delivered. BM3/BM4/parent43closure remainseparate. Rollbacktest/fixture/CI references together, preserve018releaseandfailedreceipts.
