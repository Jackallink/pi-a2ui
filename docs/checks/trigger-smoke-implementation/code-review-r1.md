# Spec023 independent code / privacy / cost / authorization review R1 — NO-GO

Date: 2026-11-16. Reviewed exact source `2b76e516227dbe26bc53ba38bc4e07b8d45e4025`, tree `78d9f848bff324a8e126c358cc38853a182d8129`; baseline `b80ba844296f44f71cbd66d453f2a224d5ab05d4`. Worktree clean at review entry. This report is immutable R1 evidence and writes only the ignored path requested by the coordinator.

## Decision

**NO-GO for paid execution / code acceptance.** Open findings:3P1 and1P2 below. User authorization for exactly one future1/3/4 batch remains valid within its scope, but these findings and complete fixed-candidate verification must close through corrective PDCA and fresh independent review before any real configuration access or provider request. No grant or live command is approved here. Preserve this report and prior receipts.

## Findings

### F-01 [P1] native thinking is copied into durable receipts and the final report

Location: tests/trigger-pilot/worker.ts line121; final serialization line162. Related redactor: tests/benchmark-model/guards.ts lines74–80.

The message_end handler appends `message.content` verbatim to record.transcript. Native enabled reasoning from the actual OpenAI-completions adapter is represented as SDK ThinkingContent with type=thinking, raw thinking text and optional thinkingSignature (local SDK types.d.ts258–260; adapter reasoning_content path inspected read-only). The final redactor only replaces known secret strings and Bearer/token patterns; it does not remove native thinking blocks/signatures. Thus a successful authorized response containing normal reasoning would persist its raw private thought in the worker JSON, and receiptEvidence/smokeSummary would embed it in the final report. Stream diagnostic sanitization does not sanitize this separate persistence path. Existing synthetic controls emit text/tools without reasoning, so their green diagnostics tests do not exercise this leak.

Minimal fix: preserve only the public text/tool observations and allowed bounded metadata in persisted assistant receipt content, excluding native thinking and thought/signature payloads before serialization. Keep the original SDK message available in memory for normal operation; do not modify prompts, SDK behavior or frozen receipts. Add an actual-SDK synthetic native-reasoning sentinel case and assert its text/signature are absent from worker receipt **and final report**, while exact text/tool requested/attempted/committed observations and usage remain correct. No raw response/header capture is needed.

### F-02 [P1] UI acceptance can pass without a confirmation action carrying the three collected values

Location: tests/trigger-pilot/worker.ts line143 (contentChecks/contentValid).

The predicate accepts any3distinct input bindings and any rendered button, with label regexes checked independently via fields.some. A legal three-field form whose only button is 取消 / Event(cancel,{}) passes these checks, despite lacking the required confirmation/submit entry. A 确认 button with empty event context also passes and cannot collect the three input values into its action. Compiler validation permits empty event context; it only restricts any bindings present to reachable inputs. Also, the same field can satisfy multiple semantic regexes while unrelated additional inputs supply the distinct-path count. A one-label-per-field, bound-confirmation requirement is not established by generic counts. This can produce ui_smoke_pass for a UI that fails Spec023's collection/confirmation/data-binding contract.

Minimal fix: select three distinct semantic application/environment/version inputs and verify their distinct bound paths and actual visible usable DOM controls; identify a reachable confirmation/submit button whose event binds those three selected paths. Keep flexible layout/localized labels; no exact source/DSL answer matching or button click is needed. Add actual compiler/server/DOM negative controls for cancel-only, empty/missing confirmation bindings and ambiguous/shared semantic fields, alongside the existing valid/invalid-content controls. No POST or real release is authorized.

### F-03 [P2] top-level negative result converts unknown/protocol failure into behavioral fail

Location: tests/trigger-smoke/policy.ts line65 (smokeSummary negative property).

The expression returns fail for every outcome other than negative_pass/not_run, including provider_unknown, output_truncated, provider_error and setup/admission failures. Although raw rows preserve their outcomes, the independent negative dimension loses the required unknown/protocol distinction and can report a behavioral negative failure when no complete negative response was observed. Spec023 explicitly separates unknown/protocol failures from wrong complete text/tool choices.

Minimal fix: map only negative_text/negative_tool to behavioral fail and preserve unknown/error/not_run as distinct explicit outcomes for transport, truncation, admission and setup cases. Add summary cases for these statuses and verify none yields negative behavioral fail or UI success. Keep usage_unknown orthogonal and do not refund admissions.

### F-04 [P1] required P0 early authorization rejection cases lack actual-entry acceptance evidence

Location: tests/trigger-smoke-grant.test.ts lines10–14,16–32; relevant authority path policy.ts36–60 / offline-read-guard.ts / worker.ts37.

The real CLI/worker/import counter test exercises only absent grant/ticket. The grant mutations test invokes validateGrantData on a minimal pure fixture; concurrency/replay tests exercise claimOnce/claimEpisode helpers. None exercises the real pre-SDK/entry authority path with a structurally valid source-bound owned fixture then a forged/mismatched parent ticket, replay marker, input/context/capture/source drift or failed-negative receipt. These cases were explicit mandatory Gate2 P0 commitments and Check118 claims. Pure helper checks do not prove the correct call ordering before config/workspace/provider at the real entries. This finding is missing acceptance evidence, not a demonstrated guard bypass.

Minimal fix: construct only owned synthetic grant/preflight/capture/ticket fixtures using the actual source/input identities, mutate the cited fields and exercise the real refusal paths with persisted fs/fetch/resource counters remaining0. Cover actual CLI source/capture drift, direct-worker forged/mismatched ticket and replay, imported API refusal, and positive with bad/missing/non-pass/cleanup-failed negative receipt before workspace/config. Keep these tests zero-inference and do not use real credentials. Existing valid-shape helper checks can remain. Bind their passing evidence to the eventual fixed candidate.

## Scope observations without additional findings

The named policy design is focused and largely matches the approved scope: old pilot live remains disabled; smoke journal parser/admission/receipt limits are1/3/4 with experiment/profile identity; exact new B clause is attested rather than normalized to A; one-use grant and episode markers prevent normal CLI replay; operator grant creation is separate from execution; driver stops after negative failure and emits exactly2unpaired rows. Negative complete tool choices stop before execution; positive preparation caps stop after the permitted final tool; request body/model/endpoint/native policy and durable admission are checked before real fetch. Request retries/fallback/compaction/warming remain disabled. Source review found no additional request-budget widening in the inspected code.

The7-second parent reserve is allocated within42/102 totals rather than added afterward; the shortened owned-browser hang canary is relevant evidence for the changed cleanup strategy. Full180 inclusive batch behavior still belongs to complete fixed-candidate verification; this review does not infer a hard-time proof from source constants alone. No change to the raw diagnostic helper was made, and no frozen/global installation change was observed in the candidate diff.

Grant-file/model/profile/content/source equality checks and input manifest completeness are present. This is not a cryptographic authorization service; its validity depends on the operator recording the actual user authorization exactly once after independent code GO, as explicitly required. A later final grant/command must be separately pinned and reviewed against that exact approved source; the current report approves neither.

## Evidence inspected and limits

Read exact candidate source/docs/diff, existing tests and read-only local SDK types/adapter source to trace native reasoning representation. No SDK or JS module was loaded/executed. No real config, credentials, provider, browser, network or live operation was performed; no tests were run by this reviewer.

The inspected narrow.log reports59/59passing (SHA256 `1ddb7e000c684b2fa221b3d83835b7a94de2566caadf8d0195515444b3a5d5ce`). types-candidate.log contains tsc --noEmit output without an error; coordinator reports exit0 (SHA256 `b94e7c071db8114df2330bc5822d92b358f84cc2578c17c0ad0a84b0c1270745`). Full-node.log was still running when inspected; full Node/browser/golden/public offline/prepare evidence was pending. These results do not cover the four findings and cannot substitute for corrected-source validation. Source/base diff whitespace check passed. Historical product/frozen preservation claims will require fixed-candidate checks; this review did not reopen their contents.

The native-thinking leak and content false positives are established by source trace, with synthetic reproductions requested; no real provider response or user data was inspected. The report retains no raw thought, headers, config or credentials. All further implementation remains the coordinator's corrective work, not modifications by this reviewer.

## Candidate SHA256 fingerprints

| File at reviewed source | SHA256 |
| --- | --- |
| `docs/specs/023-v0110-trigger-smoke.md` | `5b5ec0b2b70df11c4cd999513fb0d7600331d2b0028e3f82dd2d0a49cce4075a` |
| `docs/plans/023-v0110-trigger-smoke.md` | `17c3fb1517c7be9e770403500b4c102945c090f7b794fd5f3ac39c28fbd5e8c8` |
| `docs/checks/118-trigger-smoke-implementation.md` | `dcf4718d7452ee835e628e76877466c3f4eaeb0e587b4562eba91d2a940b36a0` |
| `scripts/trigger-smoke.mjs` | `d4ad287279cd139ddba78273e9d63028c6c84bbeaca96a9d5def20a42a1ab3d0` |
| `tests/trigger-smoke/policy.ts` | `dad20e987311f871594b1a9b7ed53041c3aaf34c59174a6cc6fc8bc05e60e8c9` |
| `tests/trigger-smoke/profile.json` | `a2746ccc5af09c397737b0f9f5fea334627500b48fa4bf2daf2558b9d38200a0` |
| `tests/trigger-pilot/contracts.ts` | `a43cb655576b206d57ed3e81248dabe4a99324a3c83a75b38828b8eab74a157b` |
| `tests/trigger-pilot/control.ts` | `a350887f66f00dca986dc19cb645ad4114649c056211061c5745a4f0a49ce760` |
| `tests/trigger-pilot/offline-read-guard.ts` | `6429b5bacc4bfb5d3ee2c09e59e206f2a3310415f20c50d82e0cdd515aeeb582` |
| `tests/trigger-pilot/worker.ts` | `ca0d4d78cc791d95e6305f099d78097dccc738ae7d4e9ff10a24299b93581ad6` |
| `tests/trigger-pilot/diagnostics.ts` | `ae9496c3eca20e5809792fbe5a3051c4a130b68b3fe4d6262a3e718675c2bdb0` |
| `tests/trigger-smoke.test.ts` | `b14c2861e0f72b3b20d281efcb0425a0652d2f4efb52694d6cb7d36f4232e874` |
| `tests/trigger-smoke-cli.test.ts` | `b26a7417b3db3acb41749bff78bb9146daab2f9319c32e2845c82c21bb746529` |
| `tests/trigger-smoke-grant.test.ts` | `995a8b2af30d2472f110e64988ea24cbe6ce71a2525223e4dbf3bd5e03318df3` |
| `tests/trigger-smoke-sdk.test.ts` | `5ce93dac1fb5e6fab8799ecbeda3337f89fdbae4851c9567d53b269c133dee73` |
| `tests/benchmark-model/guards.ts` | `ad445156cc09a9af4268ce92c7f4edd81465fbecd4ba1fa0da17a6b68fc90391` |
