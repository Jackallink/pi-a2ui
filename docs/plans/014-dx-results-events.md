# DX36/37 implementation plan

Root implements inline with executing-plans; independent reviewers review only. Spec014-dx-results-events.md defines the whole contract. Existing native isolated worktree, new branch at61640a2; no PR44/45 mutation. Node24 only, no models/global config/version/release.

## R1 / issue36 documentation alternative

Files: references/coding-and-live.md, syntax-and-errors.md, examples/review.express comment; tests/dx-results-events.test.ts.

- [ ] Verify real summary166 schema rejection and independent equality rule; capture existing valid behavior without modifying limits.
- [ ] Before documentation, add compiler tests for full-run reported totals in evidence with truthful2-row summary, max/equality retention. Reference extraction missing sample is a documentation gap, not runtime RED.
- [ ] Explain bounded row/DOM/serialized payload rationale, remaining independent global byte/source limits, omission and reported-not-executed provenance. Add complete executable sample without creating a20th catalog template.
- [ ] Focused doc/CLI tests and independent review; keep source policy unchanged. Issue remains open until integration.

## R2 / issue37 additive acceptance provenance

Files: src/session.ts single dispatch literal; same new test file; tests/browser.spec.ts first submit assertion; reference event-provenance.md and focused skill links. Rebuild dist only as actual build needs.

- [ ] Read accepted-action/server/extension path and repository acceptance consumers. Design/TDD intent independent GO first.
- [ ] Write actual session accepted/queue/replace/reset/reentrant and real HTTP+Pi adapter tests, observe missing epoch/revision behavioral RED. Existing guard/duplicate/dispatch failure tests retain status/order; no missing-import RED.
- [ ] Add only epoch and surface.revision to existing JSON at accepted dispatch boundary; prefix and old fields/options unchanged. Record any actual schema/consumer drift before broader changes.
- [ ] Explain accepted versus delivery-current semantics, same epoch+surface comparison, uncertainty after restore and no auto-drop/authorization claim.
- [ ] Focused tests then Node/full tsc/build, Chromium; production-only helper/skill smoke and unchanged payload assertions. Independent fixed-source review, correction if needed, source delivery checkpoint PR stacked on45. No merge/release/issue closure.
