# BM1 Round3 — integration/error admission

2026-11-15, spec012; intent until actualChecks. Userapproval coversbounded design→independentreview→implementation→PRCI, notmerge/release.

|IT/path|Case|Expected/AC|
|---|---|---|
|IT-001/P-001|Currentreservedpath/file andsecondButtonmissingIDs pairs|Real400/reason/owner withindependentpositive; AC001|
|IT-002/P-001|Existingrepairdocwithoutmarkers thenonlymarkersadded|MeaningfulbindingRED→GREEN,prosealreadyexists; AC002|
|IT-003/P-002|Missing/duplicate/insidefence markers,crosssectionborrow,unclosedunsupportedfence|doc-contract; normaldocpasses; AC003|
|IT-004/P-002|InvalidDSL,stillpath,missingIDs|compilefailure,notsemantic/setup; AC003|
|IT-005/P-002|Wrongfile/changedrecordIDs allconsistentcompilevalid|Firstrealcompilepasses,thenindependentsemanticfails; AC003|
|IT-006/P-002|Registryunknown/empty/duplicate/profile/oracle/extra/pathescape;fixturemissing/positiveinvalid;negativewrongreason/location/accepted|Setupvsnegativeaccurate; AC004|
|IT-007/P-003|Localtargeted/full/check/build,75packscope;actualNode24PRjob/source|Exactreceipts,0model,notrelease; AC005|

|Error|User-visible/result|Behavior|
|---|---|---|
|Realnegativeacceptsorwrongfacts|familynegativefailure|No auto-rebaseline|
|Docmarker/section/blockwrong|familydoc-contractfailure|No crosssectionfallback|
|Repairrejectedorcompilevalidwrongintent|compile/semanticrespectively|Noanyexception-as-pass|
|Fixture/environment/configwrong|setupfailure|NotbehaviorRED/canarysuccess|
|CIunknown/cancelled/timeout|Incomplete/failedCI|No successclaimorreleaseclosure|

Productstate/request/notifications/retry/authareunchanged; testcopiesonlyreadrealreferences. Runtime/dependencydriftblocksandrequiresfreshspec/review. Rollbacksliceincludingtest/CI/docbindings, preservepublished017/originaldrafts/failedreceipts. No open technicalscopeblocker; independentdesign/TDDGO remains preimplementationgate, rootowns corrections. BM2–BM4/merge/release43closureexcluded.

## P-004 — authorized018release succession

UserGO2026-11-15 supersedes historicalcandidate-only boundaries: Given fixedacceptedb5bb171 and realPRCI, When version-contract tests firstREDthenminimal018metadata/docs, independentpremergeGO/exactheadCI/merge/tag/assets/download/productionhelper+normalGitdiscovery andoneallowedGLM/browser/typedACK/rawtuple/budget/cleanup/preservation/postGO pass, Then close49andmarkBM1complete,keep43OPENandoldtags/assets/global015/drafts unchanged. Operatoraction → releasehandler/versionstate → GitHubtag/assets andprivatePi APIs → frozenproduct/backend/compiler/bridge → source-boundreceipts → userpublishedinstallandtracker. Setup/version/mismatchedsource/modeltuple/cleanup/job failures blockdependentsteps, nofallback/forceassets. Rollback017insamescope. OnlyafterreleaseclosurestartBM2design+independentreview, noBM2implementation. ActualresultsChecks079–081.
