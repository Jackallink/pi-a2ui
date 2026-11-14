# v0.1.5 final candidate independent code/spec review

**Code/spec-component GO with2nonblocking P2 documentation corrections. 0 P0,0 P1,2 P2.**

Fixed candidate: `dc14b8dd0edd361d086f90b8d3baa4d051a39440`; final-delta base `760aae88f1f3f73a2c19975011e179557329ecfb`; whole-version product base `caa33d4`. Worktree `/Users/jakeliu/Workspace/pi-a2ui/.local/release-v014-combined`. This is not Gate4/release/runtime/production-consumer GO.

## Findings

### P2 F-01 — stale roadmap hold

`ROADMAP.md:29` still says all R01–R08 are assigned to v0.1.5 and “当前不实施”. That unqualified current-state wording conflicts with the same document line57, spec008 review-ready and implemented/independently reviewed slices. Mark it as the historical v0.1.4-only boundary or replace the hold with the current canonical v0.1.5 scope/gate link. No product behavior is affected.

### P2 F-02 — packaged keyboard reference calls implemented metadata future work

`skills/pi-a2ui/references/keyboard-actions.md:7` says “Future helper patterns metadata...” even though S15 now implements patterns/pattern in this exact package and the main skill/helper reference routes users there. Change the sentence to describe the present helper-local metadata and retain its important active-runtime distinction. This is a small packaged-document capability-status drift, not an absent CLI feature.

No P0/P1 implementation or authority gap found in the final delta/integration scope. No claim that either P2 has already been changed.

## S15 and version integration

Reviewed all19 files changed after760aae8, including CLI source/prebuilt helper, skill/helper/keyboard/workbench references, package/lock/changelog/README/release candidate docs and test expectation corrections. The CLI selects its catalog through the actual compiler, returns exactly8allowlisted pattern descriptors and one selected descriptor with local package/catalog identity, separates component-only templateAvailable from required shell capability and retains old example/check output/exit semantics. User text never becomes a manifest/resource path. Only explicit check input or packaged resources are read; no helper inference/render/launch/execution route was introduced.

The palette capability is shared from its actual shell module; production bundling removes unused DOM implementation from the CLI path and actual helper invocations work in Node24. Package and lock root/top versions all0.1.5, dependencies/peers/engine unchanged; changelog is candidate preparation and prior stable tag/install guidance remains0.1.4. Current documents distinguish candidate, publication and active-runtime/helper identity.

Integration map checked against spec008 and final code/resources:

- R01 small hierarchy/breadcrumb composition and declared item intent.
- R02 typed SearchablePicker, old ChoicePicker basic filtering retained, local bounded keyboard selection.
- R03 literal source/units-labelled summary composition.
- R04 static guarded constraints/shared server/client evaluator, alias/typed coverage, zero invalid POST, post-setter revalidation and native Modal error-focus/privacy cleanup.
- R05 explicit fixture/placeholder/report states and recovery intent only.
- R06 native bounded timeline, deep-copy/owned lifecycle, byte/item/depth reservation, all native filters, checkpoint-vs-live persistence disclosure.
- R07 visible evidence identity/location, immutable declared intent and no browser file/remote read.
- R08 actual current Button invocation/latest draft, stale/pending/visibility/modal/IME guards and focus/label cleanup.
- S15 four focused interaction references,8new+11existing=19templates,32actual APIs,8pattern routes; no phantom marketing APIs.

Earlier independent slice reviews remain bound to their exact corrected source. Final browser source is unchanged from reviewed760aae8; final changes are the CLI/resources/metadata/docs and narrow expected-ID/dialog-selector fixture corrections. Existing old-catalog restore checks were retained rather than broadly rewritten to the new default.

## Fresh independent checks

- Node24 `tests/skill-patterns.test.ts tests/skill.test.ts tests/package.test.ts`:14/14 passed,0fail/skipped/cancelled. This covers exact8metadata envelopes/routes, invalid name/arity/no stdout, actual example→check chain, all19compiler-checked examples covering32actual types, skill discovery and package/changelog identities. Test names mentioning distribution are not treated here as a fresh normal Pi production install.
- `tsc --noEmit`: exit0.
- Production-option in-memory esbuild write:false parity: client.js identical SHA256 `86e042120047b9e098e706eae9e772e1f3e3955ba3797a2c18f1e05d210247ff`; assistant-cli.mjs identical SHA256 `e46942218052bb854540d2c7a86580c22001dcc600d3330c777a289bdd3f557e`. Source/dist CSS also byte-identical. No bundle outputs written.
- All11 raw Check045 evidence SHA256 values match, including initial failures and corrected full outputs. Read final logs:166/166 Node,45/45 Chromium1208,tsc exit0. These are independently checked root execution receipts, not this reviewer's full-suite reruns. Initial coding default-catalog and extra closed palette dialog selector failures are correctly classified as expectation/fixture drift, not behavioral RED and not waived failures.

No repeated full suite was needed after the targeted tests/parity checks: no new failure or changed browser product justified repeating the already reviewed browser source/component runs.

## Exact remaining gates and authority boundary

This GO accepts code/spec-component readiness of this exact candidate with the two nonblocking wording fixes above. It does **not** establish normal fresh production package installation/discovery, no-dev-tools consumer runtime, old014→new015→rollback consumers, real bounded GLM skill→tool→browser→typed context→reply/native evidence, final archive identity, merge or release. Those are still Gate4 work owned by the root task. Do not infer them from166/45/unit/package-test names or prior slice GO. Publication and real-user installation retain their separate authorization boundaries.

Reviewer performed only offline Node24/in-memory compilation/local filesystem review and wrote this ignored report; no product change, model request, real-user install, dependency/browser install, remote write, merge/tag/publication or original-session/config/credential mutation. Existing dependency symlink and user artifacts preserved.
