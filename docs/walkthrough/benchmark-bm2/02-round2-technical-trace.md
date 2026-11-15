# BM2 Round2 — closed technical traces

2026-11-15,Spec016; designintent, notexecutedtests. ProductAPIunchanged.

## P-001 — compiler and intended data
UserrunsfutureNode24test → Handlerfixedregistry/compileradapter → statefixture-controlready→compiled/rejected→semanticchecked → APIexistingcompile(golden,source) plus actualhelpercheckstdin → backendexistingSDK/policyvalidators,staticindependentexpectedvalues → responseCaseResulttypedstage/source/profile/oracle/fixturehashes → UI/terminalshowsrealcontractresult. Noexecfromregistry, fullsourcebytecheckonlyCLIpayloadnotgoldenUIlayout. Wrongintentcompilesbeforesemanticcanaryfails.

## P-002 — state and resources
UserrunsSscenario → HandlerstaticUiSession/serveradapter → stateownedfreshsession/registeredasset→realrender/update/reset/accept → APIactualpublicUiSession methods andauthenticatedloopbackartifactGET → backendcurrentbudget/ledger/clockeddataflush/ArtifactStore → responseSnapshot/DataBatch/UiError/HTTP+observeddispatch → UI/terminalcomparesindependent64/65,4/5,oldvsnewsnapshot/acceptedtuple/bytes. Finallyserver/session/ownedfilesclose; no userfiles/globalconfiguration/Pi queue or modeldelivery.

## P-003 — browser interaction
UserrunsPlaywrightBscenario → Handlerrealcanvasfixture/authviaapi/connect → statebounddraft/localmodal/table/palette → APIrealpageactions andactualapi/actionsPOST → backendcurrentrenderer/server/UiSession, outboundPi observeronly → responseactualstatus+typedcallbackor0requests andvisible/focus state → UI assertion/receipt. No fake actionresponse, modelACK, pixelbaseline or genericlayoutdetector.

## P-004 — scoped truthful results
Userrunsselectedlayers/CI → Handlerstrictcoverage/resultcombiner andfutureNode/Chromiumjobs → stateplanned64/attempted/passed/failed/notrun byid → APItestcommands/GitHubreadonlyworkflow, samerevision/profile/lock/fixtures/oracles → backendsame3adapters andcleanupguards → responseexplicitpartial58/6vscomplete64identity proof → UI job/Checksummary. Unknownsource/cancel/setup/cleanupblockscompletion, no auto-baseline orsilent retry. Currentdesigncreatesnofixtures/code/CIjobs; implementation/TDD/release latergates.

Identity refinement: all jobs share whole-dataset/oracle-set fingerprints; individual case input hashes compare only with their own manifest entry. Compiler/session paths execute synchronous product work in bounded owned Node children with a real parent clock; the browser path has explicit Playwright deadlines. The results path records timeout/cancel/cleanup separately; fake clocks and lost children cannot satisfy deadlines. Spec016defines exactbudgets/exitorder; no implementationnow.
