# Check066 — larger-run guidance and accepted event provenance

2026-11-15. Spec014 AC001–006. Native isolated worktree, new codex/dx-36-37 branch from PR45 fixed61640a2; PR44/45 unchanged. Node24.18.1 throughout. Independent design/TDD intent fixed7715f2c GO,0P0/P1/P2; [report](dx-results-events-evidence/design-review-r1.md),SHA256815fab9a1d0c05f5a22a39c8bd4076e102204dac70c33f5f630930681b5568d7. Walkthrough structural validator initially flagged missing trace field labels; corrected to explicit closed handler/state/API/backend/UI traces and passed before design review. Not behavior RED.

## Evidence and implementation

Baseline relevant57/57. Actual read-only probe confirmed summary166 first fails SDK128 bound, and even bypassing that schema bound still fails validateCoding exact row counts. Accepted event queued then replaced has no provenance in old four-field output. Probe is investigation evidence, not new-feature TDD RED. Raw probe.json/baseline.log under ignored private .local/dx36-37-evidence.

Nine new tests before production changes: **8 actual accepted-session/HTTP/registered-adapter tests fail missing top-level metadata**; **1 missing documentation sample is a reference gap**, not behavior RED. All tests reached existing APIs; no missing import/setup errors. first-red.log preserves the combined9fail receipt. Direct sessions include typed and nested same-name epoch/revision data, accepted-then-replace/reset, reentrant callback mutation, exactly-once duplicate, same-epoch bridge failure/retry, forged context denial. Actual HTTP and real extension registration executor test202, stale409 and unchanged followUp options; Pi host/OS are doubles, no real model or Pi startup is claimed.

Production runtime change is exactly the dispatch JSON literal adding existing captured epoch and chosen surface.revision. No extra async step, validation/order/ledger/input/HTTP/permission/resource change, no prefix/old context field change. JSON serialization occurs before callback entry, so reentrant reset/replace cannot retag it. TestResults/schema/equality stay untouched; larger-run doc labels supplied166total/2visible/164omitted and synthetic-not-executed provenance. Existing19templates/8routes/32types unchanged. Focused88/88, full **230/230**, tsc/build pass. Real Chromium **45/45**, including actual first-click acceptance identity assertion. No further runtime changes after these checks; dist rebuild byte-identical (session module not part of browser/helper bundles).

## Production package boundary

Fresh system-temp production-only consumer, no global/project registration. **75packed files** matched source before and after execution; no typescript/tsx/esbuild/optional Pi host resolves from consumer. Actual prebuilt helper32component queries,19examples+exact check outputs,8patterns,3doc samples (including166/2subset), typed path recovery,65/64 local overflow and CRLF/Unicode byte preservation pass. Larger-run summary166 variant still rejects. Official Pi1.5.0 **development SDK skill loader** pointed only at packaged pi.skills with defaults disabled/private cwd+agentDir discovers one pi-a2ui/0diagnostics. This is packaged discovery, not production Pi startup or delivery/model success.

Archive SHA256 **c81b5a39589ab6acdeae7472d8e18c71bd2e5a29ba6242170dcfe56fe95bff6e**; production consumer receipt **4f556675ab5468a8be982f308982328d53836b2cf974d14f5fee7ad3b6f3d54c**. Private production-pack/consumer/discovery.json,consumer-root.txt,verify-production/discovery.mjs and install log retained alongside full-node.log,browser.log,green.log,tsc.log,build.log. The0.1.6 archive filename is inherited candidate metadata, not a published version or admission into PR44 scope.

## Boundaries and next gate

No contract drift. No new totals API, automatic stale-event drop/queue cancellation, delivery-currentness/permission guarantee, model evaluation, benchmark, release/version/global installation or issue closure. Docs explain comparisons require a trustworthy current tuple, historical tool snapshots may be stale after restore, and old packages may lack metadata. Existing4high upstream dependency warnings still reported on fresh install, README disclosure/manifests unchanged; no audit-clean or public-production waiver.

Rollback this slice and rebuild if needed. Fixed-source independent code review required before source delivery accepted. Issue integration/closure, merge and publication are separately gated. Check records own execution evidence; spec remains review-ready pending integration.
