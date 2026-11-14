# Check033 — companion skill and offline authoring helper

Canonical[spec009](../specs/009-pi-a2ui-skill.md), [walkthrough](../walkthrough/pi-a2ui-skill.md). Baseorigin/main217505c (baseline0.1.3/16types). Separatebranch preserves the user's feat/a2ui-render-auto-open2ba1ea3 checkout and the v0.1.4 PR28 worktree. No version bump/release/user installation/model or credential changes.

## Gates and baseline

User requested an operational skill with component subdocuments/examples after real-model DSL failures. Scope defined before code; walkthrough/TDD intent self-audited for S1–S6 (not a claim the user separately approved a new design). S1 actualPi loadSkills using the package manifest observed [] vs [pi-a2ui] RED before resource additions, then discovery GREEN. Supplied screenshot is a real failed-agent baseline, not a full-source reproducer: original DSL is truncated. Representative missing-comma source reproduces mismatchedButton; Card(string) reproduces dangling-child reference. A root-first forward-reference source succeeds, disproving declaration-order as a general explanation. The screenshot's exact second Text-as-function cause remains unconfirmed. SDK prompt said named props forbidden while actualcompiler accepts them; correction is limited to that contradictory wording.

## Actual checks

Node24.18.1 only. New6Node checks + baseline94 = **100/100**, tsc/build pass. Skillcreator quick_validate pass. The validator's narrower allowed frontmatter required placing Pi-compatible compatibility info under metadata; actualPi loader accepts it with no diagnostics. Skill descriptions/routes referenceonlyneeded subdocs; no extra global skill/bin installed.

- Exactly one pi-a2ui skill found through manifest. Packedresources containentry,6references,11completeExpressfixtures+manifest,wrapper andprebuiltJS.
- Five applicablebaseline examples coverall16types and compile. Sixadditionalfixturegroups clearlyrequirev014capabilities; all11fixtures compileagainst actualv014candidatee3d4b77 compiler andcover29types. The helper refusesunsupportedexamples onbaseline, ratherthan markingthemgreen. This is source-levelcandidatecompatibility, not a claimthebaselinehelperhas29types orcanidentifyadifferentactivePi.
- CLI file/stdin exactJSONarguments, spacesincwd/path,quotes/unicode/CRLF,invalidUTF8/ID/DSL,unknowncommand/example,nonregularinput and32KiB bytecaps checked; failures emit no stdouttoolpayload. Read-only, no HTTP/model/credential/filesystemwrite orauthoritybypass.
- UTF8BOM audit found TextDecoder silently removedBOM. ActualSDK rejectsBOM; helper nowpreservescharacters andrejectsconsistently. Initial assumptionthatSDKacceptsBOM was corrected fromactualcompiler evidence, not counted as behavioralRED. Targetfinaltestlocks exactpreflight/compilerparity andCRLF preservation.
- IsolatedproductionTAR outside repository ancestry installedwithomitdev/ignoreScripts/legacyPeers; no tsx/typescript/esbuild/hostPi/typebox present. Absolutehelperfromanothercwd successfullypipesexample->check, no build/experimentalTS flag/globalCLI needed. RuntimeSDKpackages external toJSbundle; browserdist/legalunchanged.
- Normalregisteredpackage with externalHTTPdenied and no explicit--skill exposes exactlyone skillcommand and noagent_start. No inference required fordiscovery. This is distinctfrom explicit skill invocation below.

## Independent actual GLM forward test

Only existingAgentPlan volcengine-ark/glm-5.3-flash used; provider/model/baseURL preflight verified https://ark.cn-beijing.volces.com/api/plan/v3, nofallback. An isolatedPi process loadedtheproductionpackage+explicit skill (other global skills/extensions excluded) andreceived only a natural-language story: username/email, notificationcheckbox, departmentchoice andconfirmation; **noDSL/intendedanswerwasprovided**. The model readcore-components.md, rendered once successfully with0renderfailures, then realChromium submittedstrings/boolean/stringarray. Actualnextmodelreplyacknowledgedthevalues. BrowserErrors0,bootstrapfragmentcleared,processExited/listenerReleasedtrue. [Sanitizedreceipt](skill-evidence/glm-forward.json); rawsession/openURLs remainprivate. This provides independentagent forwardtesting ofskilldecisions; it is not a broadbenchmark or acceptance of untested localmodel families.

Model/initialproductionarchive SHA780bd00df1278d8f5c22c9522d9daf2b3a9bd8a54e6c02f210a62bd432c6398c. Subsequentdelta is localhelperBOMparity plusreferencewording; entry/coretemplate/compiler/extension/modelpath unchanged. Finalarchive/productionCLI checks are recorded separately; actualmodelresult is not relabeled as a rerun ofchangedbytes. No unnecessary additionalinference.

## Drift and rollback

Subdocs covercurrent16 plus gatedv014extensions; v015planningtypes not exposed. Helperpreflightdoesnot certify livecapacity/recordledger/epoch/revision/artifactavailability/actualexecution. S1–S6 mapped to realdiscovery/compiler/CLI/production/GLM outcomes; no unresolvedscopeblocker. Finalpackageandmetadatareceipt follows below. Rollback: removecompanionmanifest/files/helper build output; existingextension/renderer preserved. Newskillfiles absent fromoldpinnedv013tag, so installationinstructions say selecta refthatshipsit before/reload; tag/assets untouched. No claimthischange merged/published or upgraded realuserplugins.

Final: payload46filesmatchsourceandisolatedconsumerexactly, TAR SHA256 `dcc0a24226c1c1154b4457d73da2709495f3d691a0c5e95a03fd75fa323be947`; finalproductioncatalog/example->stdincheck GREEN with no dev/host peers. Browserbundle/legal no diff. Gate3 drift checks and Gate4 scoped100Node/typecheck/build/production/discovery/GLM-forward outcomes pass; release/userinstallation remains separate. Disposableprojectregistration cleared; originalworktrees/userdata preserved.
