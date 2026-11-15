# v0.1.9 Issue56 Handoff Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans inline; root implements, independent reviewers audit. User requests allfourissues in one nextversion; do not offer a new delegation/menu or leave56for anotherrelease. Steps below describe work, not liveprogress; use issuesforprogress andChecksforresults.

**Goal:** Finish43/51/52/56 with a reviewed compiler-identity handoff profile and one locally validated0.1.9candidate.
**Architecture:** Existingcompiler checkscomplete compiledSurfaceMessage identity; rawA/Bsources remain unchanged, fidelity recorded separately. Newv2profile and zero-model evidence are distinct from immutablev1/365realbaseline. ExistingSDK/helper/extension/browser flow unchanged.
**Tech Stack:** Node24.x, pinnedPiSDK1.5.0/A2UIcompiler,TypeScript,Playwright1254,existinggoldencanonicalization; no new dependency/runtime API.
**Spec:** docs/specs/019-v019-issue56-handoff.md, AC-001–006 and threeissue56walkthroughs.

## Global constraints

Node24.x only. Actions418909498 remainsdisabled; no workflowdispatch/rerun/re-enable. No newrealmodel/authaccess; sameglm-5.3-flash only if a futurebudget is granted. Preserve rawv1profile/Checks094–100/365score7of12; no rescore/automaticrepair. Exactlyonepreflight/first attemptedrender; same5totalrequests/8tools/3072maxoutputcaps. Git/localdistribution, no npmpublish/globalupgrade/credentialwrites. Runtime/SDK/catalog/permissions unchanged. Publication/closure onlyafteractualcandidatechecks; no tracker-onlysuccess.

### Task1 — actualfailure controls and minimalhandoff guard

Files: create `tests/benchmark-model/handoff.ts`, `tests/benchmark-handoff.test.ts`, `tests/benchmark-model/fixtures/handoff-v1-lf.json`; modify `tests/benchmark-model/worker.ts`, `tests/benchmark-model/browser.spec.ts`. Consumesactualcompiler/canonical; produces `compareHandoff(checked:unknown,attempted:unknown):HandoffObservation` and `requireHandoff(observation):void` perSpec019.

- [ ] Capture3actual365sourcepairs with source/report/case hashes, onlythe controlledtaskDSL, no auth/headers/userfiles. Assert eachfirstattemptuniqueness/byte lengths/terminalLFrelation; keepoldmodelscoreseparate.
- [ ] Add a validinitial byte-identity guard, reproducing existingv1behavior (not a missingmodule). Write consumer using independentactualcompilerpreconditions thenexpectformat-onlyhandoffaccepted:
```ts
const checked={surfaceId:'bm4',source:'root = Text("A")\n'};
const attempted={surfaceId:'bm4',source:'root = Text("A")'};
assert.deepEqual(compile('bm4',checked.source),compile('bm4',attempted.source));
const original=structuredClone(attempted);
const observation=compareHandoff(checked,attempted);
requireHandoff(observation); // v1byteguard must RED here
assert.deepEqual(attempted,original);
assert.equal(observation.byteIdentical,false);
assert.equal(observation.compiledSurfaceEqual,true);
```
Run Node24 `node --import tsx --test tests/benchmark-handoff.test.ts`; preserve targetRED with successfulcompilerpreconditions and existingexactsourcecontrol. Also add syntheticSDKmode that writesAwithterminalLF and first-render Bwithoutit; oldworker mustfailconsumer expecting actual202+typedqueue.
- [ ] Implement exactrecordarguments/sameid checks, actualcompileA/B, completecanonicalcomparison and diagnosticdigests. Casesinvalid/overbudgetsourcefailactualcompiler; changedlegalcontractdoesnotrender. Nevertrim/rewrite/inferUIequality. Negative tests independentlycompile bothA/B thenassert rejection for eventname/contextvalue/type/key/binding/initdata/Textliteral+whitespace/componentID/artifactref. Extra/missing/nonstring/wrongsurface arguments also reject.
- [ ] Worker captures attemptedBsource/hash and renderattemptbeforeguard; storesobservationevenwhenrejected. `requireHandoff` gatesunchangedactualBtoolcall. OnlyfailedcheckedA is harnesserror; candidateBlegality/equality separate. Preservefatalidentity/auth/cost/cancel/cleanupbehavior. SyntheticnativeLFpositive andchangedcontext/binding/artifactnegativecontrols assert actualcallcount/POST/typedqueue/sourcehash, no actualprovider.
- [ ] Run narrowunit/types/browsercontrols, freeze code and request independentreview. Commit RED/GREEN as distinctsourcebound checkpoints. Do not infermodelquality fromsyntheticruns.

### Task2 — profile/docs/version/local acceptance

Files: new `tests/benchmark-model/profile-v2.json`, modifyguardsimport/scriptprofileselection/workerprofilemetadata, existinghelperreference and `docs/benchmarks/bm4.md`; version/rootlock/buildmetadata/README/CHANGELOG; newrootAGENTS and Check101+ evidence. Originalprofile.json/v1checks remainbyteidentical. ConsumesTask1guard; producesdefaultv2dryrun/offline receipts and finalizedcandidatearchivepin.

- [ ] Keepv1JSONunchanged. Newprofileidv0.1.9-glm-first-v2 copies sameMODEL/CAPS/node/pi/case/retry/CI fields and addscompiled-surface-identityhandoff. Newentryusesv2; individualcasereceiptsidentifyprofile, storechecked andattemptedcompile/byte/equality/render/intent/queueaxes. Realv2modelstatusnot-run. Rootversion019/payloadmetadata and candidateprepack providefinalarchiveSHA; tests/profileexcludedfrompackpreventselfreference.
- [ ] Helperdocs keepactualCLIcontractunchanged and exactsourcehandoffrecommendation; developerBM4doc explainsv1history/v2compiledidentity, zero-modelexamples and nativeacceptanceboundaries. Example:
```sh
nvm use 24
npm ci
node node_modules/playwright/cli.js install chromium-headless-shell
node scripts/benchmark-model.mjs
node scripts/benchmark-model.mjs --offline
```
Thesecommandsneverinfer; realexecuteisnotpartofthisplanbudget. Sourceonlytextualexamplesmustpassactualhelper/compilertests.
- [ ] Add rootAGENTS Scope/Inheritance/Override/EvidencePath withuserdatedlocalCIconstraint, no livecounts/status. Keepremote workflowdisabled and checks/reviews/sourceprooffull; no security/gate waiver.
- [ ] Prepareversion with Node24 `npm version 0.1.9 --no-git-tag-version`; assertonlyrootversion/rootlockentrieschanged, dependencygraphs unchanged. Prepack atownedignoredpackdir, verifyfileallowlist75/payloadbytes, computearchiveSHA andpinv2profile. `npm pack` runsbuild; avoidunnecessarydoublebuild. No npmpublish/tagyet.
- [ ] Commit clean candidate before fullrun. Node24 npmtest/tsc/fullbrowserrunner/strictsame-sourcecombine-local; actualdefaultdryrun0credentials/0models and actualmainoffline12cases. Preserveexactcommit/tree/lock/Nodepatch/browserrevision/logSHA/reportpaths. Validatev1profile+summarybytehashes unchanged. Independentcode/profile/packageGO; anyNO-GO requiresfocusedRED/fix/newreview.

### Task3 — integration, releasecandidate and issue closure

Files: existing53/54/55andnew56PR, sourceboundChecks/releaseartifacts/tracker, no unrelatedruntimechanges. Consumesreviewedcandidate/localreceipts. Producesoneversion withactualintegratedsource and honestissueclosure.

- [ ] Pushnewbranch/PRonlyafterconfirmremote workflowdisabled (nohostedrun). Preserve53/54/55originalhead/branch/evidence. Retargetdependents tomain insequence afterpredecessorintegration, keepbranchesuntilalldependentworkmerged. Beforeintegration resolveactualbasetree locally; no squash/rebase that obscuresancestrywithoutreason.
- [ ] Validateexactlocalintegration/finalmain source underNode24, fullrequiredchecks+pack+ownedGit/localinstallstartup/skill/tooluniqueness. Postmergeactualmainverification and premergecomponentchecks are distinct. AllnewtestsSDKprovider is synthetic; no liveGLM.
- [ ] Prepareconcrete0.1.9release notes/assets/digests and independentreleasegate, retainallv1negativeevidence andnewv2zeromodelresult. Any publication action mustmatchthe user'sapprovedscope; if a finalexplicitpublicationGO isstillrequired, presentexactreadyartifactratherthanstoppingbeforeprep. No globalupgrade.
- [ ] Afteractualintegrationacceptance, close51/52withdoc+testlinks; update43canonicalplanreferences/checklistandcloseonlyfourBM slicesaccepted; close56withdesign/RED/GREEN/v2evidenceandexplicitrealv2not-run. Assignrelease/milestoneonlyaccurately, readbacktracker/release/headstate. Do not closeanythingmerelybecauseplan/codeexists.

Self-review: everySpec019ACmapped above; no newpublicAPI/state/cache; no modelbill; originalhistoryimmutable; allmeaningfulnegativecontrols compilerlegal beforeidentityassertion. Rollback is incrementalbenchmark/docs/candidateonly; preserveuserstate andworkflowdisabled. Progressandcountsbelongintracker/Checks.
