# PR63 independent source and Spec021 admission review

Date: 2026-11-16. Reviewer: independent read-only subagent. Verdict: **scoped GO** for the exact PR63 source delta and prospective Spec021 Gate1/Gate2 admission. Findings: **0 P0 / 0 P1 / 0 P2**.

## Pinned inputs

- PR: https://github.com/Jackallink/pi-a2ui/pull/63, observed OPEN/MERGEABLE with matching base/head through read-only `gh pr view`.
- Base: `dadbdedd17d885073dae4334e660bb64d8e3132c`.
- Head: `756bf9cad7d35422cce6eaeab0c77156e0ed19cd`; tree: `d23c5986db45395d10813ac5f371700f15646a34`.
- Exact diff: `extension.ts`, one insertion/one deletion, line 63 tool-description prefix only. Head extension SHA256 `f7ae0f3ba512de286c616d548c755ad5dd59dac9a424c12005b263ac6a2274c2`; base SHA256 `8849357ce80aaa5b246df93c63aa0f338680ac96c5f5f3454617c119d5f95c9f`.
- Spec draft: `.local/v0110-release-evidence/spec021-draft.md`, SHA256 `8a898a5b7cf20824b37e636d00a31d28846b6d3e7d83f4910c995f3eb4dc6cd1`; canonical destination `docs/specs/021-v0110-render-trigger.md`.
- Both base/head lockfile SHA256: `2c4dacdefa74793ed14aacb7496869cd6f12658b1b044848ae5c998504c2f585`.

## Source assessment

An independent byte comparison proved that replacing the old 39-byte sentence with the new 401-byte instruction reproduces the entire head extension exactly. Net description increase is 362 UTF-8 bytes. `git diff --check base head` passed. No source outside this sentence changes; schemas, execution handlers, promptSnippet and appended TOOL CONTRACT are byte-preserved. Package metadata remains 0.1.9 in this PR, as expected before the separately reviewed release change.

The instruction provides supported examples and an explicit materiality threshold tied to the user's next action, with pure prose and trivial confirmations excluded. Existing catalog/skill contracts support structured forms, CodeDiff/TestResults, Chart/DataTable, Row compositions and registered artifact/media inspection. Existing limitations remain authoritative: supplied results are reported evidence rather than browser-certified execution; CodeDiff is read-only; artifacts require the separate bounded registration tool and supported local media kinds; full render replaces its surface. The new description neither promises broader artifact formats nor grants execution/file access.

The deterministic native run summary remains distinct. Unchanged `agent_settled` hooks and `src/run-card.ts` require the existing connected canvas, observed non-A2UI activity, ownership and capacity gates. The model may still author surfaces, including run-summary under the existing ownership rules. No new duplicate-summary mechanism or native-card trigger is introduced.

Reviewed existing tests include `tests/extension.test.ts`, `tests/run-card-adapter.test.ts`, `tests/run-card-history.test.ts` and `tests/skill.test.ts`, alongside catalog/compiler and relevant skill references. They cover render lifecycle, pause/startup/epoch behavior, automatic native-card eligibility, ownership, persistence, capacity/error isolation, skill discovery and authoring contracts. They do not measure autonomous model selection frequency. No deterministic compliance assertion or fabricated behavioral RED is justified for the new instruction.

The current PR description accurately distinguishes model-authored rendering from v0.1.9 native summaries, excludes `cf8bcbd`/the old branch, and discloses the longer instruction and unmeasured trigger efficacy. Historical Spec020 exclusion of proactive prompting remains valid for that historical slice; the new explicit authorization and Spec021 admit this separate scope.

## Gate1 and Gate2 admission

The pinned Spec021 draft has explicit goal/non-goals, observable AC1-5, all three walkthrough rounds, trace to the unchanged publishing/event pipeline, integration/error behavior, risk/rollback and separate release/local-update preservation gates. AC1 correctly verifies instruction availability/content, not model compliance; AC2 uses existing behavioral regression contracts; AC3-5 require executable metadata, package/consumer/runtime and configuration-preservation checks. Its rationale for omitting a string-mirroring test and real-model behavioral RED is sound under the zero-inference scope.

**GO** to record walkthrough-approved/tdd-approved and begin the bounded release metadata/packaging slice. This is prospective admission; it does not assert that the already-authored PR originally passed these gates before coding. Carry the admitted specification and corresponding plan into the owned release branch, retain original source/test attribution, and populate Check112 with actual receipts. Any material change to this draft or source requires review of that delta.

## Validation and boundaries

The coordinator independently ran the full Node suite on clean exact head under Node24.18.1 and reported exit 0. Reviewer read `.local/v0110-release-evidence/pr63-validation.json` (pins clean head, runtime and log hash) and `.local/v0110-release-evidence/pr63-node-tests.log`: 472 tests, 472 pass, 0 fail/cancelled/skipped/todo. Log SHA256 `8836ace70ddcac9c4937ef232a0ba9972eae126030177f0b5937aa9990a6e25e`. This is current coordinator-run evidence, not merely the PR author's historical claim and not a second reviewer execution. Exact-head `npm run check` exit 0 is coordinator-reported; no raw typecheck receipt was provided to this reviewer. Reviewer did not rerun full tests or typecheck.

This GO covers exact PR63 source readiness and the pinned draft's Gate1/2 only. It does **not** approve an unbuilt v0.1.10 package, metadata candidate, publication, published-consumer acceptance, or global/local installation. Those need actual candidate/integration source identity, required Node/type/browser/golden/prepack/payload/normal-install evidence and fresh independent review as specified. No real model request occurred; efficacy, compliance rate and token/cost effects remain unmeasured. No hosted workflow was triggered or changed. No source, index, HEAD, remote, installed package or configuration was modified by this reviewer; the only write is this ignored report.
