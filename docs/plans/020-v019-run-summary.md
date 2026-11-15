# v0.1.9 issue57 implementation plan

> For agentic workers: use superpowers:executing-plans inline. Rootimplements; independentreviewersonly. Useradds57to019; do not askagainaboutdelegation/versionornewmodelbudget. Scope/publicationgatesremainexplicit.

**Goal:** deliverconnected-canvasnative-runsummarywithsafeownership/branchrestorationin019.
**Architecture:** synchronoussettledadapter→existingservedUiSession.render→LiveTools.flush→officialappendEntry; boundedownerrevisionmetadata sharedbyknowncustomandsuccessfultoolreceipts. Existingkernelvalidation/catalog/protocol/defaultnativebehaviorretained.
**Tech Stack:** Node24.x/Pi1.5/officialA2UIexisting32types/TypeScript/lockedPlaywright1254;nonewdependency.
**Spec:** docs/specs/020-v019-run-summary.md AC-001–008andthreeissue57walkthroughs.

## Global constraints

Basec5089d8934f0db1ec6cb04febf4d8d3e819ead81. LocalCIonly/workflow418909498disabled; Node24forallJS/npm/Pi.0realmodel/authcalls/newbudget; frozenprofilev1/Check099/report7of12unchanged. Keepcf8/15e7109userworktree/old0196a2candidate; do notcopyunrelatedproactiveprompt. Git/localdistribution/no npmpublish/globalupgrade;publicationtagseparateGO. PreservepublicmodelIDrun-summary,usematching-ownedrevisiononly. Actualsessionstillownsall64component/4surface/byte/nativeheadroomvalidation.

## Task1 — native hook, ownership and persistent branch contract

Files:create src/run-card.ts,tests/run-card.test.ts;modifyextension.ts,src/live-tools.ts,src/controller.ts,tests/extension.test.ts,tests/browser.spec.ts. Existingflowsarecoupled: cannotshipownership/persistenceapartfromcardhook.

Interfaces:run-card exports RUN_CARD_SURFACE_ID/RUN_CARD_ENTRY,RunOutcome,runCardSource(outcome),shouldRenderRunCard(snapshot,{browserClients,toolCount,ownedRevision}),ownedRunCardRevision(snapshot:unknown,marker:unknown):number|undefined,runCardMetadata(snapshot,marker),readRunCardEntry(entry):record|undefined. Allhelperspureexceptactualcompilerintheexistingrenderpath. LiveTools adds readonlytoolCount andflush():Snapshot. restoreBranch returns matchingownedrevisionorundefinedwhilepreservingselectedsnapshotsemantics. No input/snapshotprotocolchanges.

- [ ] BaselineNode24 tests/extension.test.ts+tests/live.test.ts beforecode; preserveactual33passsourcec508receipt.
- [ ] Write completeconsumerREDagainstexistingextension/restorationwithoutnewmoduleimports. Validfixture:
```ts
const savedSession=new UiSession(()=>{});
savedSession.render('run-summary','root = Card(Column([Text("Run summary"),StatusBadge(label="Run completed",status="success"),TaskProgress(stream="tools"),ActivityTimeline(stream="tools")]))');
const saved=savedSession.snapshot();
const restored=new UiSession(()=>{});
restoreBranch(restored,[{type:'custom',customType:'pi-a2ui.run-summary.v1',data:{a2uiSnapshot:saved,a2uiRunSummaryRevision:1}}]);
assert.equal(restored.snapshot().surfaces.length,1); // oldbaselineRED:0
```
Includeexistingvalidtoolreceiptpositivebeforetargetassertionandcheckfixturecompilation. RealbrowserREDusesactualextensionhost/server/auth/SSE: firstnormalmodelfacevisible,dispatchnativebashsuccessandsettled,expectvisibleRunsummary;oldadaptermustfailatvisiblecard,notsetup/auth/import. SaveREDlogs/commit.
- [ ] Implement src/run-card.ts fixed6-nodepresetandbudget/ownership helpers. Test independentactualcompilecount6,58+6allowed/59+6blocked,4fullblocked,ownedreplaceactualminusoldcount,disabled/no-client/no-native-tool,preexistingcollision,staticoutcomeenumsource.
- [ ] Extract existingLiveTools100ms publicationinto flush():clearoldtimer,observeelapsedtime,synchronousunchangedupdateLogandreturnpost-flushsnapshot;timerkeepsbest-effortcatch. readonlytoolCount exposesobservedstartedcount. No unusedrunOutcomegetter.
- [ ] AdaptertracksendedRun+terminaloutcome andownedrevision. Settledconsumesonce,requirecurrentlive,outcomeabortedoverride,checkexistingserverclients,eligibility,callserved session.render synchronously,setownershipimmediatelyaftercommit,flush,appendofficialreceipt. NoensureServer/await/browser/notification/message/provider. OnsuccessfulmodelrenderofsameIDrevokeowner,failedrenderpreserveowner;render/chartdetailsaddoptionalmatchingmetadata. Keeporiginaltoolpromptunchanged.
- [ ] Controllerrestorelatestvalidcurrentbranchsuccessfulrender/chartorstrictknowncustomsnapshot,resetusingexistingfullvalidation,returnmatchingmetadataonly;badcustomskip,toolwithoutmetarestorebutdonotclaimowner. Nohistorybackscan/structuralguess/newstore. Testcompletecustom,malformedlatestfallback,latestvalidtooloverride,failedtoolignored,oldhistory,modeltakeover,branchselection/newEpoch/snapshotbounds/artifactrevocationunchanged.
- [ ] Errorcontrols:atomic413preservesalloldfaces;renderfailuredoesnotflush/append;flushfailuredoesnotappendandretainscreatedownership;appendfailuredoesnotresetUI/throwtoagent;duplicate/prose/pause/reset/shutdownquiet. Recoveredtoolerrorhasnormalterminalbadgewithfailedcounter1;actualabortwins.
- [ ] Nativebrowserpositiveverifiesbadge+actualtoolname/failedcounter+0opener/POST/user-message,summaryreplacewithouttouchingdraft,preexistingmodelcollision/failedandvalidtakeover,realcurrentbranchcustomentryrestore. AddactualPiSessionManagerofficialcustomentryroundtripwithoutmodel.3outcomeimagesinspected,notpixelgate.
- [ ] NarrowNode/types/actualbrowserGREEN;commitsourcebeforeindependentcode/restore/ownershipGO. AnymajorfindingneedsfocusedRED/fix/newreview; preserveoldfailures.

## Task2 — documented distribution and actual019 candidate closure

Files:README.md,CHANGELOG.md,docs/releases/v0.1.9.md,skills/pi-a2ui/references/coding-and-live.md,newCheck107+evidence,tests/benchmark-model/payload.json,worker.tspayloadcount,profile-v2.jsonarchivepin; onlycurrentmanifest/pinchange,frozenv1filesunchanged.

- [ ] Documentconnected-only6-node/1slotbudget,non-a2uiobservedtools,normalterminationversustoolerrors,IDcollision/modeltakeover,officialnon-LLMhistory/branchrestore,best-effortfailure/nativecurrent-runstreamsemantics. Update019releasecompositionandremove“57future/runtimeunchanged”currentclaims;keepolderChecksasdatedhistory.
- [ ] Addnewmoduletoexactcurrentpayloadmanifest(76)andworkerstrictcount; do notrelaxallowlist/archive/currentbytechecksorintentoracles. Node24prepack/buildnewownedarchive;75oldcandidatepreserved,76allbytescurrent,dependencies/SRIsunchanged,updatev2pinfromnewarchivewithoutselfreference.0v2realmodelscore.
- [ ] Freezecommit;fullNode/types/completebrowserrunner+strictsame-source68union/publicdryrun/offline0actualmodel. OwnnormalfreshGit/localinstallstartup/skill+tooluniqueness,packageartifactbindings. Reviewnewruntime/artifactandallsourceboundreceiptsindependently; Actionsnevertriggered.
- [ ] PushreviewedPR,attach,milestone019. IntegrateonlyexactheadafterGO;actualmainrepeatrequiredchecks/prepack/ownedconsumersonnewsource,recordsource/tree/lock/Node/browser/log/artifactSHA. Metadata-onlysuccessorverifiedbydiffandallpayload/v1hashes,notfullsuitefakeheadlabels.
- [ ] AfteractualmainindependentGO,close57withproof;43/51/52/56staycompleted,update019milestonecompositionaccurately. Preparecurrent019archive/SHA256SUMS/releasenotes/readiness;old6a2isnowhistorical. Publication/tag/globalupgradeawaitseparateexplicitGOwhenconcretecandidateisready.

Self-review:all8ACsmappedincludingrealpositive/ownership/restore/budget/appendfault; no newmodel/cost/prompt/contractrestriction/newcatalog. Risk/rollbackSpec020; progressintracker,resultsChecks,nolivecountsintheplanbeyondbaselineidentityneededforRED.
