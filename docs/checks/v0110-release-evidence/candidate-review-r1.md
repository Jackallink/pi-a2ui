# v0.1.10 candidate independent review R1

Date: 2026-11-16. Independent reviewer; source/index/HEAD/remote unchanged. **Scoped GO**, **0 P0 / 0 P1 / 0 P2** for the fixed candidate's Gate3 and package/prepublication readiness, with the actual-main identity and postpublication gates below still required.

## Reviewed identity and scope

- Base: merged PR63 `f5bd3979cd7bf22d4b13ad56e0599b5689f91364`.
- Exact clean candidate: `bdda63ab3d8e202af2ca837022cd13ff4a9c9076`; tree `69a3b170d118ec4a1b65b9c99f448cdb4e8a9db8`.
- Archive: `pi-a2ui-0.1.10.tgz`, SHA256 `c7d4511c1e92808691ab98a89897f7a6f2d0ed0e64b77f70f9ab610500177e55`, 275811 bytes, 76 files.
- Canonical contracts: `docs/specs/021-v0110-render-trigger.md`, `docs/plans/021-v0110-render-trigger.md`, Check112 and prior PR63 source/Gate1/2 review.
- Evidence root: `.local/v0110-release-evidence/`; consolidated manifest `candidate-r2-validation.json` and its 19 hashed raw inputs, all independently hash-verified by this reviewer.

The complete base-to-candidate diff is metadata/docs, current release fixture expectations and exactly two v2 benchmark package-binding fields. `extension.ts`, `src/`, `dist/`, `skills/` and `scripts/` are byte-identical to merged PR63. The original description remains the exact independently reviewed instruction. `git diff --check` passed. No dependency, renderer, schema, permission, runtime budget, native-summary or inference-policy change is present.

## Gate3 assessment

Independent parsed comparisons prove that package.json changes only version and package-lock.json changes only its two root versions. The locked dependency graph is identical. README/current acceptance/removal examples and the top changelog entry identify 0.1.10; published history remains. Release notes distinguish model selection from deterministic native summaries and disclose +362 description bytes, unmeasured trigger/cost effects and zero new real-model evidence.

The v2 profile changes only `packageVersion` and `archiveSHA256`. This is necessary because unchanged `scripts/benchmark-model.mjs` validates package/profile version before even its default dry-run. The existing `v0.1.9-glm-first-v2` identifier, provider/model, caps, handoff policy, retry prohibition, CI-inference prohibition, oracles and frozen-v1 bytes remain unchanged. Updating this binding is admitted by Spec021 AC3 and Plan021; it neither renames policy nor rescales a model result. Direct exact-clean-bdda dry-run reports zero provider requests and credential reads.

The current-version fixture repair is appropriate: package.test.ts now expects 0.1.10 and additionally preserves the 0.1.9 changelog entry. No assertion is removed or weakened. First-candidate 39dbafa results remain preserved: 470 Node pass / 2 obsolete-version expectation failures; initial browser 11 pass / 79 failed due to missing locked-browser setup. These are release-fixture/setup failures, not behavioral RED and not passing acceptance. The isolated corrected package run is **5** passed tests. Official locked Chromium revision1254 installation and the M01 setup control are retained, followed by a complete successful fresh suite. No real-model result was retried or rescored.

AC1-2 retain exact source/contract review and regression coverage; AC3 has metadata/archive/dry-run proof. AC4's prepublication normal package and Git@commit consumer tiers pass. Published download/Git@tag acceptance and AC5 actual-machine update remain future stages. Spec021 correctly remains in-progress on the test source and may become review-ready in the admitted docs-only successor. No completed/deployed status is justified yet.

## Verified receipts and artifact

The coordinator reports exit0 for full Node/type/browser, strict union, dry-run/helper, prepack and both consumer runs. This reviewer read the raw summaries and receipts, verified their manifest hashes and source identity, and performed independent structural/hash assertions; the reviewer did not rerun full suites.

- Full Node: 472 pass, 0 fail/cancelled/skipped/todo, exact bdda under Node24.18.1 (`candidate-r2-node.log`). Typecheck has clean `tsc --noEmit` output (`candidate-r2-types.log`), exit0 coordinator-verified.
- Complete browser runner: 90 pass (`candidate-r2-browser.log`), Node24.18.1 and locked Chromium1254 / 158.0.8127.18. BM3 pixels are comparable-advisory, pixelGate=false; the log does not establish exact cross-platform pixels.
- Strict golden union: 68 cases = 45 positive + 23 negative. Reviewer independently verified equal complete node/browser identities, clean exact source, 61 node + 7 browser rows, unique 68 IDs, all pass and null failedStage. Dataset/oracle/catalog/assets/lock fingerprints agree; coordinator's existing strict combine receipt agrees (`candidate-r2-union.json`).
- Production prepack succeeds. Reviewer opened the actual gzip archive, required exactly the 76 payload-allowlisted regular members, checked every member against candidate-pack.json and git blobs at both bdda and prior39dbafa. All bytes match; no test/profile/docs evidence is smuggled into the production payload. Thus archive reuse after the fixture/docs repair is demonstrated, not assumed.
- Normal local-package consumer: `pi-a2ui-accept-K2aPAZ/result.json`, package0.1.10, passed all stages including one skill, 3 unique commands, status, cleanup, preservation; 5 observed Node processes all24; 0 agent runs/model requests; external fetch denied.
- Normal Git consumer: `candidate-git-startup.json`, pinned actual bdda clone, all76 payload hashes, one package-origin/project-scope skill and unique commands/status; 3 observed Node processes all24; 0 agent runs/model requests; Pi closed. Reviewer inspected the owned consumer script's actual commit/file/command/status/runtime assertions. This proves Git@commit, not a tag that does not exist yet.

## Admitted docs-only successor and integration/publication boundary

**GO** to assemble the coordinator's bounded successor: copy the validation manifest, sanitized76-file payload receipt, bounded golden identity/results without observations, minimal consumer summary and this review under `docs/checks/v0110-release-evidence/`; append Check112 with actual bdda counts, hashes, source and preserved failures; set Spec021 to review-ready. No source, test, profile, lock, package/payload or oracle changes are admitted by this successor review. Check112 must retain original test source bdda and distinguish consumer source/archive identity and prior failed receipts.

This is conditional admission of that concrete docs-only operation, not an unconditional approval of any future head. Before merging its exact release PR head, verify the complete successor delta is confined to those evidence/docs changes and read back the recorded facts and hashes. After merge, verify actual main against bdda for all76 payload files, lockfile, benchmark bindings, test/oracle/dataset inputs and build scripts. A proven docs-only/source-byte-equivalent successor needs no redundant full-suite run; never relabel the bdda runs as actual-main executions. Any non-document delta or failed identity assertion returns this gate to review.

Subject to those exact-head/readback/equivalence checks, **GO** to merge and publish the already user-authorized immutable v0.1.10 candidate using only the accepted archive and matching SHA256SUMS, with the tag targeting accepted actual main. Do not overwrite old tags/assets. Publication must be read back and actual downloaded bytes plus fresh normal downloaded-package and Git@tag consumers accepted before postpublication GO and the authorized local-machine update. No npm publication, hosted CI, real inference or benchmark rescore is admitted. This review does not claim publication, actual-machine deployment or whole-slice completion has already occurred.

Remaining risk is the model's changed selection preference and longer prompt; compliance/efficacy/cost are unmeasured. Roll back by selecting immutable0.1.9 in the original scope with user configuration/session/history preserved. Existing dependency advisories are unchanged and are not waived by this release. The reviewer wrote only this ignored report.
