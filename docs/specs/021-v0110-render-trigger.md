# Spec021: v0.1.10 materiality-guided render description

State: in-progress. Gate1/2: independent review accepted the pinned draft before release metadata implementation. Historical admission sequence: draft -> walkthrough-approved -> tdd-approved -> in-progress. Evidence: Check112 and docs/checks/v0110-release-evidence/pr63-independent-review.md.

## Goal and authorization

Give model-authored a2ui_render surfaces concrete useful trigger examples and an explicit next-action materiality threshold. The user explicitly authorized PR63 merge, v0.1.10 publication, Node24 published-consumer verification and local-machine update on 2026-11-16. This separately admits the prompt-only work excluded from Spec020; it does not reopen or replace that spec's native-card implementation.

## Non-goals

No new runtime handler, component, tool schema, resource limit, permission, provider call, browser-opening policy or native-card behavior. No measured trigger-rate claim. No real inference, benchmark rescore, npm publication, hosted CI or unrelated plugin update. Keep frozen real GLM v1 and real-v2-not-run evidence, historical branches, tags, assets, failed receipts and user configuration.

## Acceptance and checks

| ID | Observable requirement | Verification |
| --- | --- | --- |
| AC1 | Tool description recommends model rendering for structured multi-field input, review/validation/benchmark results, diffs/charts/tables/comparisons and inspectable local artifacts only when inspection/interaction materially helps the user's next action; prose/trivial confirmations are skipped. | Independent review of exact PR63 base dadbded/head756bf9c description delta. This verifies instruction content, not model compliance. |
| AC2 | Existing asynchronous publish/event contract, complete raw Express rules, schemas, handlers, native summaries, budgets and permissions remain. | Full source diff; existing Node/type/browser/golden regression contracts; compiled assets unchanged. |
| AC3 | Version, lock root metadata, current installation/acceptance examples and changelog identify0.1.10 and Node24. The existing v2 benchmark policy keeps its identifier/semantics/caps, while packageVersion and archiveSHA256 bind the new release so the default zero-inference command remains usable. | Parsed metadata/docs assertions; production prepack/archive manifest; default benchmark dry-run; no dependency graph or frozen-v1 drift. |
| AC4 | Fresh release-package and Git@tag consumers discover one package skill and unique commands, start/status successfully under actual Node24, and make zero agent/model calls. | Owned normal installation, RPC startup/status/runtime observations and release download hash/file comparison. |
| AC5 | Authorized user-scope0.1.9 registration is updated to0.1.10 without duplicate registration or other configuration/plugin change. | Backup, official targeted Pi install, exact settings delta, all production file hashes, global and actual-main-project offline startup/skill/CLI checks. |

## Three-round walkthrough

1. Story/AC: a Pi user receiving a structured result has a clearer model-side instruction to show an interactive surface when it helps their next action. A prose answer or confirmation remains an explicit skip. Instruction availability is observable; model choice frequency is unmeasured.
2. Trace: Pi discovers package extension -> registerTool description plus unchanged promptSnippet/TOOL CONTRACT -> model may choose a2ui_render -> unchanged compiler/session publication and optional initial browser open -> later browser action becomes existing user data/follow-up. Native settled-run summaries remain the separate deterministic path; the new description does not request duplicate summaries.
3. Integration/errors: malformed Express and budget/ownership/event guards keep existing behavior. A larger description has additional prompt bytes but no change to configured runtime budgets. No model inference is admitted as an acceptance shortcut. Publish only after source-bound local CI, packaging, consumer acceptance and independent GO; stop on failure, identity drift, dirty installed checkout or unexpected configuration delta.

## TDD admission and evidence boundaries

AC1 is a prompt-policy content change and has no deterministic model-compliance oracle in this zero-inference slice. No test that merely mirrors the new string is added, and no fabricated behavioral RED is claimed. AC2 maps to the existing extension integration, run-card ownership/history, compiler/session limits and browser/golden cases. AC3-5 use executable metadata, package/runtime and preservation assertions. A failing setup/fixture is never a product RED. Independent review must accept these test intents before metadata implementation; actual results belong in Check112 and tracker/release receipts.

## Risk and rollback

Release-check alignment: tests/package.test.ts pins each current release explicitly. The first0.1.10 candidate correctly failed its two obsolete0.1.9 version expectations; synchronize those expectations to0.1.10 and explicitly retain the0.1.9 changelog entry. This changes no product behavior or acceptance strength. A separate initial browser run failed at missing locked-browser setup; preserve it as setup failure, never as a behavioral RED or passing browser evidence.

The recommendation may change model tool selection and increases description length; effectiveness and cost changes are unknown. No runtime permission is granted by the words. Revert the description in a successor change or choose the immutable v0.1.9 tag in the same installation scope while retaining configuration/session files. Never move an existing tag or overwrite assets.

## Required gates and sequence

draft -> walkthrough-approved -> tdd-approved -> in-progress -> review-ready -> complete. Record independent Gate1/2 admission before release metadata edits; require PR63 tests/review before merge, exact release candidate local full Node/type/browser/compatible golden union and prepack/install acceptance before release PR merge, then immutable actual-main package identity and release publication/readback, published download/Git startup, independent postpublication GO and targeted local upgrade. Main completion docs may follow only with byte-equivalence and accurate original test-source attribution. Root implements; reviewers are read-only. Preserve all worktrees/branches and use only local Node24 CI.
