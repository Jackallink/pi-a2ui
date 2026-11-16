# Offline pilot diagnostics repair — independent Gate1/Gate2 review

2026-11-16. Observed base HEAD `4c15be18aff69ca563c911423f5c1fa232ab2cd8`; previously executed runtime6832b06b remains historical evidence.

**Gate1 GO and Gate2/TDD kickoff GO for AC007–010 offline implementation only.** The current incremental design has a closed technical trace, bounded scope and relevant positive/error test intents. No design blocker remains after the canvas/privacy clarifications. This does not claim implementation, test completion, server-side GLM policy verification or an actual root-cause diagnosis. **Paid budget0; no live GO, retry/resume, merge/push/release or global update.**

## Exact design identity

| Artifact | SHA256 |
| --- | --- |
| docs/specs/022-v0110-trigger-pilot.md | `2acfc7b87b87c720bddec5bc221918722df6589ee21ee06748263cdef0e7069e` |
| docs/plans/022-v0110-trigger-pilot.md | `589fd0a978376f2285b26e62a09bcaa6d1b7caf05471f62aa719e65fe6fdc552` |
| docs/walkthrough/trigger-pilot/01-round1-user-stories.md | `3918044111b132a7efee7b25395886131413f9652a9eea635690eee66c5f4848` |
| docs/walkthrough/trigger-pilot/02-round2-technical-trace.md | `76876ee370eb245b0b2c360a869488ad66b3aa8c62b7d3cfbec079f085b779ab` |
| docs/walkthrough/trigger-pilot/03-round3-integration-check.md | `3967a96c8edc390e60978b1f4800b7ae38108b4a676c845d006d277a3c42dcf7` |

The new current section explicitly overrides historical consumed live authorization without rewriting the old protocol/run. New profile id/liveEnabled=false and CLI/direct-worker rejection before real configuration or workspace creation make the zero-budget boundary observable. Offline synthetic renderer controls may create owned headless canvases; dry-run and rejected live paths must not.

## AC / test-intent admission

| AC | Design and required tests | Verdict |
| --- | --- | --- |
|007 P0 | SDK reasoning model/low session plus actual body enabled/low/max_completion_tokens1536; reject missing/unknown/disabled/alternate or combined max_tokens/include_usage drift before journal; actual-SDK A/B capture differs only by description; CLI/directlive fail before config/workspace/network | Sufficient intent, implement and prove |
|008 P1 | One response observer for synthetic and protected-live code paths; incremental usage before forwarding, UTF8/chunk/CRLF handling, complete/partial/invalid/duplicate usage, cancel propagation/no draining, EOF/read error/timeout/1MiB boundary | Sufficient intent; per-request usage is a last observed snapshot, never summed into invented totals |
|009 P1 | Journal index/body hash/request ordinal association; request-specific status/finish/DONE/stream bytes/state/usage/SDK end/errors; actual SDK read then second-request failure control, no third request; bounded sanitized errors and payload canaries | Sufficient intent; diagnostic data does not convert unknown outcomes to success or identify vendor root cause |
|010 P0 | New-profile fixed-source serial local CI/actual SDK/synthetic public CLI and independent code/privacy/cost review; original5 live receipts/BM4/frozen/76 production inputs unchanged, actual inference0 | Sufficient scope; later passing evidence and independent review remain required |

## TDD evidence boundaries

The read contracts-red.log has three failed assertions, but they have different evidentiary value. TPD02 shows the old guard accepting a body missing native-thinking requirements, and TPD07 shows actual SDK capture lacking the required thinking field: these are meaningful behavioral REDs for the changed wire contract, not import/compiler/setup failures.

TPD01 currently fails because stderr does not contain the new explicit disabled-live classification; the old CLI can fail earlier for a nonexistent archive/dirty source. That result proves neither a forbidden provider call nor absence of configuration/workspace/network access. Do not label it a complete zero-access behavioral RED. Its future GREEN must independently prove the access boundary: persisted owned canary counters/hooks for relevant fs sync/promises and fetch accesses, plus workspace/run observations, with CLI and direct worker tested independently. Merely checking stderr for absence of a thrown marker is insufficient because generic catches can hide that marker. This is verification of the already approved AC007 boundary, not additional scope.

Final test-intent follow-up before this review is handed off: TPD01 source now includes persisted counters for fs sync/async and fs/promises read/open plus fetch, zero-counter assertions, workspace/journal checks and CLI run-directory inventory. Both entry subprocesses are exercised independently. This strengthens the future GREEN intent; no new execution or passing-control claim is made by this reviewer, and the earlier diagnostic-only failure remains classified as such.

Before claiming implementation complete, add and preserve the proposed actual-stream/actual-SDK diagnostic RED→GREEN controls. Missing diagnostics module/compiler failures cannot substitute for observable cancellation/usage/error tests. Unit and actual-SDK controls must derive expected results from ACs rather than reproduce the collector implementation.

## Implementation obligations carried into final code review

- Reject live before auth/runtime setup or owned workspace creation; static SDK imports must not weaken that boundary. Profile metadata alone is not an execution guard. Default/offline imports and child processes remain Node24 and zero real auth/network.
- Parse usage before forwarding each relevant consumed chunk; retain observed values across cancel/error without reading ahead or draining for a better receipt. Missing/partial/invalid usage stays nullable and cannot prove completeness/cost. A hard-killed worker may still lack diagnostics; keep the conservative journal unknown path.
- Collect transport and SDK error sources separately for the current request. Suspicious embedded header/body/messages/reasoning payload markers require a fixed safe placeholder plus fingerprint, not copying arbitrary raw payload from error.message. Remaining errors redact known credentials/Bearer/token/auth/URLs and respect1024 UTF8 bytes. Test embedded payload/secret variants and multibyte boundaries; no raw response/reasoning/header duplication in diagnostics or public exports.
- Keep1MiB response, existing output/request/time/tool bounds, backpressure/cancel behavior, no retry/fallback and first schema/check/render stop intact. No dependency/product-kernel/BM4 change is admitted. Old stopped receipts/lock stay immutable and effects Gate4 remains unaccepted.
- Official documented-version policy motivates a proposed wire contract only. Exact AgentPlan alias mapping and server behavior remain unverified; no paid query is needed or approved to complete this offline slice.

## Review scope

Fresh read of the five design/plan/walkthrough files, current new test intent and existing RED log; read-only shell inspection. No provider/network operation, real configuration/credential read, full test execution or source/index/HEAD/remote edit. Reviewer writes only this ignored report. Root's walkthrough validator result is structural evidence, not behavioral validation. Final implementation must be frozen and receive the planned source-bound checks plus independent code/diagnostics/privacy review before an offline-only completion claim.
