# DX34/35/38 implementation plan

Goal: actionable diagnostics and model-visible truthful capacity, followed by executable field guidance. Architecture/spec:013-dx-usability.md is canonical. Root implements inline with executing-plans; independent reviewers do not implement. Node24 only, PR44/benchmark drafts untouched; no paid model or release/global install.

## D1 / issue34

Files: protocol UiError diagnostic metadata/context helper; compiler traversal/ownership; inputs,coding,live,workbench,interactions owner boundaries; artifact-store active-root message; assistant-guidance/CLI additive metadata; extension tool contract; tests/dx-diagnostics.test.ts; rebuild dist.

- [ ] Read callers and run baseline under Node24. Design/TDD intent independent GO.
- [ ] Write real compiler and actual helper subprocess tests against existing APIs: path error reports key/owner/property; unrelated coding Button reports its own ID; typed input/Chart/table/FormValidation owner; nested fake id cannot spoof; artifact absolute input reports override root without existence prerequisite. Observe missing diagnostic/wrong guidance RED (not missing imports).
- [ ] Implement minimal additive diagnostic/context helpers, wrap actual component validation boundaries without changing order/acceptance, and format actual key/current workspace. Keep SDK causes and unknown scopes honest.
- [ ] Focused green/typecheck/build and existing compiler/coding/input/live/workbench/interactions/artifact/helper regression. Check explicit safe inputs still accept and all rejected inputs stay rejected.
- [ ] Independent exact-source code review, fix Major then fresh GO; record RED/GREEN and commit this slice.

## D2 / issue35

Files: protocol pure snapshot capacity type/helper, session aggregate enforcement, compiler local count error, extension render result, tests/dx-budget.test.ts, dist rebuild.

- [ ] Add tests using real UiSession and actual registered extension tool executor, expected literal37/30/67/64 counts and revision/state equality; observe missing count/text fields RED.
- [ ] Derive committed/attempted usage from snapshots; preserve same-ID replacement arithmetic/atomic rejection; include success text/details, keep CLI check shape unchanged.
- [ ] Focused+session/extension regressions/typecheck/build; independent review and correction GO, Check/commit.

## D3 / issue38

Files: skill review.express comment/error and component refs, tests/dx-skill.test.ts; no runtime code changes.

- [ ] Add executable repaired sample (file key + all coding Button IDs), compare tool-observable semantics; validate actual examples/reference links and all19 templates. No prose line-match tests merely to enforce words.
- [ ] Update actual rules/legacy diagnostics/limits/cwd and replacement guidance. Do not promise archive API or full-suite summary counts.
- [ ] Run full Node/tsc/build parity and applicable Chromium regression; production pack/helper consumer where changes affect packaged helper; independent final review/record candidate.

No merge/tag/publish/issue closure inferred. Issues remain open pending separately authorized integration. BM1 follows a deliberate diagnostic-profile/spec update and its own TDD admission; BM2–BM4/36/37 not implemented here.
