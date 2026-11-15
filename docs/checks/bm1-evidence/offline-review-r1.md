# BM1 independent offline code review — R1

**NO-GO for the offline gate/workflow creation: P0=0、P1=1、P2=0。** Fixed source **3dfe2886256869b3e758b0adfe8872b8353e0383**; base **46f04c6d63819c2cb72c6febd748322ffd7c3f5b**. Scope is Spec012 v0.1.7-dx-v1's two families only. No model/auth/config/CI/install/merge/release or source/index/HEAD mutation performed; only this report written.

## P1 F-01 — cross-level duplicate headings incorrectly pass the binding gate

`tests/benchmark/diagnostics.ts:126–128` filters matching names with `heading.level === 2` before checking uniqueness. Consequently, additional outside-fence H1/H3 headings with the same registered name are ignored, violating Spec012's requirement that the named heading be unique outside fences. The registry's declared section/anchor binding is accepted despite multiple structurally visible names. Existing duplicate-heading tests only append another H2 and miss this false-positive.

Independent Node24.18.1 counterexample on each real guide/family:

```ts
verifyDocumentation(family, `# ${family.doc.heading}\n\n` + guide);
verifyDocumentation(family, `### ${family.doc.heading}\n\n` + guide);
```

Expected: BenchmarkFailure with stage doc-contract. Actual: **all four variants pass** (two families × H1/H3). Both fixture pairs still pass first; this is checker acceptance of a forbidden structural mutation, not setup/compile failure. All existing29tests pass, so their GREEN does not close the missing canary.

Minimal repair: count all outside-fence same-title headings and require exactly one, then require that sole heading be H2. Add both families' H1/H3 duplicate negatives and preserve unique-H2/fence-quoted-heading positives. Demonstrate new canary RED on this helper, then doc-contract rejection after the fix and fresh bounded review before workflow creation. No runtime, registry coverage, generic Markdown framework or package example expansion is needed.

## Independent checks and evidence limits

- Using only the specified Node24 wrapper, actual Node24.18.1: narrow **29/29 passed**,0failed/skipped/cancelled; separate `tsc --noEmit` exit0. Independently ran the four in-memory counterexamples above. No full259/browser rerun.
- Reviewed strict registry/fixed paths/two allowlisted static oracles, all four fixtures, typed setup/negative/doc-contract/compile/semantic flow and29canaries. Positives verify fixed intended values independently of compiler-derived expectations; negatives require actual400/reason/owner; compile-valid wrongfilename/coherently changedrecord IDs are compiled first and then rejected semantically. `rejectsAt` requires BenchmarkFailure+stage, not any thrown error. No other P0/P1 found within scope.
- Original actual0338b40 missing-binding RED remains meaningful: root log hash matches its receipt, fixture pairs pass2/2 before two missing-marker doc-contract failures; no import/fixture/setup failure counted. Initial two-marker4/4GREEN and current259/259/tsc/build logs remain producer evidence, not independent reruns here. Current source/input/log hashes match Check077 receipts.
- Independently recalculated TAR SHA256 **b5611a3c2431280b4d4cce237cae494ec5537b4c924641adb53c2ce5c485ad24**; all75archive/source/receipt file bytes/hashes match. Only packed delta is syntax-and-errors.md; removing exactly the two marker+blank-line insertions reconstructs base bytes. Runtime/dist/extension/scripts/deps/package/lock/other skill files unchanged; tests/fixtures/docs/workflow excluded. Product version017 is an unreleased development identity, not replacement of published017 or an018release.

Workflow absence is intentional at this gate, not a finding. After F-01 corrective RED/GREEN and fresh offline GO, root may add only the admitted read-only Node24 workflow, obtain separate workflow review, then pursue authorized PR/real-CI evidence. Local GREEN cannot establish hosted CI, all-error coverage, BM2–BM4/model/quality/cost results or deployment. Issues49/43 remain open; no merge/release/global change is authorized.
