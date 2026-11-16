# Offline diagnostics repair — independent code review R1

2026-11-16. Candidate `74948d5596454a3a81e6f3358c145d61f612a9c7`, base `4c15be18aff69ca563c911423f5c1fa232ab2cd8`; admitted incremental design a27fb6b / Spec022 AC007–010.

**NO-GO for offline repair completion on this candidate.** One P1 entry-point blocker and one P2 error-redaction contract finding below. Full fixed-source checks were still running when reviewed; passing checks would not waive these missing paths. No paid scope is available regardless of this verdict: real budget0, old invocation/receipts remain stopped and immutable.

Before R1 handoff, full-node.log completed505/505 with fail0/cancelled0/skipped0 on this candidate. This preserves useful regression evidence but does not cover or waive F1/F2. Reviewed helper SHA256 `128c3676bdcdaa3e974a7f669c4bf6cd57773a170bfa8b6532fa71d2665e0263`, worker `a9b43e35af0ff4f3568f1dd13e79e76e5e4375c10ae74b8c54c6903255ae6dd9`, early guard `5386b3ee82239e8323a21907698183b3338225a0642e559677bd81717df1f44e`.

## F1 — P1 — Exported live worker call bypasses the argv-only disabled-live guard

Locations: `tests/trigger-pilot/offline-read-guard.ts:9`; `tests/trigger-pilot/worker.ts:34-41`.

The early module guard rejects only when the process ambient `argv[4]` equals `live`. The exported `episode(id,run,kind,simulation)` function itself never checks PROFILE.liveEnabled. An offline/test process can import that API and call it with kind=live while its own argv[4] is absent/different. Execution then reaches owned-marker reads and rm/mkdir workspace before the later ticket/config path; the module's offline config-read guard is not equivalent to refusing live before workspace/config. Existing TPD01 spawns the worker script with kind in argv and misses this exported entry.

Required minimal repair: check `kind==='live' && !PROFILE.liveEnabled` at episode entry before any marker/workspace/config work, while retaining the early script/module guard. Add a synthetic imported-call subprocess canary with its ambient process in offline mode, persisted configuration/network counters and workspace/journal observations. It must reject before any such access; a missing ticket must not be the reason for refusal. Keep default/offline operation working and actual provider use0.

## F2 — P2 — Error sanitization only removes HTTP(S) URLs while the current contract promises URLs generally

Location: `tests/trigger-pilot/diagnostics.ts:10`.

`safeError` removes only `https?://` URI text. A plain synthetic message such as `socket failed at wss://example.invalid/private` retains that URL unchanged, as do file/ftp forms. The canonical error contract says URLs are removed without an HTTP-only qualifier. This can carry unrelated transport/browser/local-resource URL detail into the new private diagnostic message despite the stated boundary.

Align implementation and declared contract: redact the URI schemes covered by this diagnostics layer (including websocket/local-resource schemes) and add a non-HTTP URI canary, or narrowly and accurately revise the design if that boundary was intentionally limited. Preserve safe bounded error text/fingerprint and1024 UTF8-byte limit. No network call is needed to expose or fix this.

## Source-level controls accepted in this review

- The profile is a new offline id with liveEnabled=false; normal CLI execute is rejected before identity/archive/run creation. Actual SDK request construction and strict journal guard require enabled/low/max_completion_tokens1536, no alternate max_tokens and include_usage=true. This establishes a local wire policy only, not actual AgentPlan alias/server behavior.
- Synthetic and future protected-live Responses pass through the same observer. Metadata is updated before enqueue, usage snapshots are not summed, byte bound remains1MiB and response/header/body/reasoning payloads are not copied into diagnostics. UTF8/CRLF framing, finish/DONE, partial/missing/invalid usage and cancel/error paths have relevant controls.
- High-water mark0 avoids observer read-ahead; explicit cancellation propagates to the source without draining for usage. Previously observed usage survives. EOF/cancel/error remain separate; metadata does not establish a completed provider result or actual cost. Timeout-shaped synthetic read errors test observer handling, not a real server-timeout cause.
- Request diagnostics bind the just-fsynced journal index/body hash and each admitted ordinal. Resetting currentDiagnostic before every SDK call prevents a blocked fourth request from overwriting the third admitted request's SDK result. Actual SDK read→second-request stream-error intent covers attribution and no continuation.
- Existing budget/accounting/unknown receipt/parent cleanup paths are retained. New error fields are bounded, known credential/payload markers are omitted wholesale with a fingerprint, unknown names are normalized and known secrets/Bearer/token/auth strings are sanitized. The two preserved diagnostic-edge REDs and targeted GREENs accurately expose earlier token-string and request-attribution defects.
- Final record.usage and usageKnown are derived from request diagnostics; missing/partial usage stays nullable. No evidence claims a repaired old error, free call or successful trigger evaluation. Product/BM4/dependency/old-live-receipt preservation is required and root has a preservation receipt; final exact-source/full-run evidence is still needed after correction.

## Next admission

Preserve this R1 finding/report and candidate logs. Correct F1/F2 through targeted offline RED→GREEN, freeze a new candidate, complete the planned serial Node/type/browser/golden and public offline/default/entry-refusal checks, verify all old receipt/payload/frozen identities, and request a fresh bounded code/privacy/cost/isolation review. Only an offline repair completion GO is possible here; no paid model, batch restart, merge/push/release/installation change is authorized.

Reviewer read source, tests, design and targeted logs only; no full suite rerun, provider/network operation, real credential/configuration read or source/index/HEAD/remote mutation. Reviewer writes only this ignored report. No model reasoning/transcript/header/config payload was printed or copied.
