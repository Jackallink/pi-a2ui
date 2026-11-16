# Trigger pilot independent code/cost/isolation review R1

2026-11-16. Candidate `3d74cebe01ac6bbe12975feef0dfceceb7371280`, base `77715bfa097d706cae9a1c95b0589fb481d2b818`.

**NO-GO for live admission.** Two related P1 accounting/receipt blockers below. No P0 finding. The code can continue through corrective offline PDCA and a fresh fixed-candidate review. Existing full-suite execution may finish as candidate evidence; passing suites cannot waive these uncovered fault paths. No real invocation has occurred in this review.

## Scope and evidence limits

Read all pilot source, pure/SDK tests, profile/scenarios, Check114, existing frozen config/path/redaction helpers and relevant installed Pi1.5 event/stream source. Candidate HEAD and tracked clean state were observed. Root-supplied behavioral RED/initial harness failures/targeted corrections remain preserved and accurately distinguished from product RED. Root full Node/type/browser checks were still running when inspected; no new full suites were run by reviewer. Public CLI offline evidence and a final exact one-shot live command/archive receipt were not yet supplied, and would be required for a future GO even after code correction.

Reviewer did not read real credentials/global profiles, run a model or network operation, modify source/index/HEAD/remotes or rerun the frozen benchmark. Only this ignored report is written. This review does not authorize merge, release, upgrade, extra models or extra calls. User authorization remains the one12-episode batch,3 requests per episode /36 total, only Ark AgentPlan glm-5.3-flash under Node24, after offline gates/review.

## F1 — P1 — Report turns admission counts and explicit unknown results into confirmed actual requests/outcomes

Locations: `scripts/trigger-pilot.mjs:26`; `tests/trigger-pilot/worker.ts:79,96,110`; `tests/trigger-pilot/control.ts:39-42`.

The final CLI report always sets live `actualModelRequests=journal.length`, including when a worker receipt is missing/invalid and the parent explicitly returns `requests:null`. Journal rows are fsynced **before** actual fetch, so they prove occupied/admitted budget, not a confirmed completed/send outcome in an interruption window. Even with an ordinary receipt, a transport failure creates `outcome:'provider_unknown'` but retains a numeric admitted request count; `requestOutcomesKnown` tests only `requests!==null`, and therefore incorrectly reports this explicit unknown outcome as known. The same mismatch affects cost interpretation in exactly the failure cases the approved design requires preserving.

Required correction: retain separate admitted-budget accounting and observed dispatch/provider-result accounting. Set the claimed actual/known outcome fields to unknown/null whenever final request outcome or receipt is unknown; retain journal lower-bound/admitted counts and consumed quota without any refund. Derive `requestOutcomesKnown` from validated outcome/receipt evidence, not the presence of a numeric admission count. Do not lose known model choices when only token usage is absent: complete observed result + known admissions + missing usage remains the distinct `usage_unknown` case.

Required targeted negative evidence: a journaled request with missing receipt, malformed receipt, mismatched receipt count/identity and an explicit numeric-count `provider_unknown` outcome all stop the batch, preserve admitted accounting and cannot produce confirmed actual-request/outcome claims. Include a complete result with missing usage that remains semantically reportable and does not refund quota. Derive assertions from the distinction above, rather than copying the current report formula.

## F2 — P1 — A torn/malformed journal suppresses the final unknown report instead of preserving its valid prefix

Locations: `tests/trigger-pilot/contracts.ts:31-35,43`; `tests/trigger-pilot/control.ts:40-41`; `scripts/trigger-pilot.mjs:21,25,29`.

`PilotBudget.rows()` parses every nonempty line with `JSON.parse` and throws on any malformed/torn tail. That is correct for further admission (fail closed), but it is also the only reader used by parent receipt validation and final report aggregation. The parent worker call can be caught into an unknown result; line25 then calls `rows()` again outside that recovery and throws. The top-level handler prints only a generic admission/setup failure, so no terminal12-row report retains the validated complete journal prefix, uncertain tail and remaining not-run episodes. Additionally, append uses one `writeSync` without verifying its returned byte count; a short write must not be treated as a fully admitted durable row before transport.

Required correction: keep strict journal admission fail-closed, and provide a separate conservative reporting/recovery path that never truncates, resets or repairs the original journal. Preserve the validated complete prefix as known admitted evidence, mark malformed/partial remainder and final request accounting unknown, stop all new sends, write the final unknown/not-run report and retain main/cleanup errors. Ensure the full append was written and fsynced before dispatch; append/fsync failure must never dispatch. No quota refund or automatic rerun.

Required targeted evidence: a valid journal prefix plus partial final JSON line; a malformed complete row or receipt; and injected short-write/fsync failure. Prove no subsequent transport, original bytes retained, the complete prefix exposed conservatively, terminal report produced and outstanding episodes not-run. Existing happy-path3/36 journal tests and worker-hang missing-receipt test do not cover this final-aggregation exception path.

## Accepted source-level controls

- Actual complete assistant `message_end` observation precedes SDK schema validation; requested/attempted/committed are separated, and the real SDK missing-source/nonconvertible-type controls cover the original design defect. Raw model tool args remain in the transcript, while the actual renderer schema/handler are unchanged.
- First-request normalization changes only the exact render clause; the capture uses actual SDK bodies and normal discovered skill metadata. The live path checks its initial normalized body against those captured contexts before admission. No forced skill slash command/BM4 hint or expected DSL is injected.
- Endpoint/model/body/output/tool-choice checks, serial orchestration and no SDK/provider retry/fallback are explicit. The live fetch uses redirect:error and request timeout; body98304-byte/output1536 caps are request bounds, not an unsupported currency guarantee.
- Read roots are ordinary package/project files, writes/edits only the owned draft, shell commands rebuilt as a direct actual Node executable/helper invocation, and nested/excess tools are blocked. Guard-side command rewriting does not rewrite model Express source. Product payload/archive comparison is explicit at live admission.
- Real renderer/server/headless browser and actual accessible canvas region are used; deterministic native summaries are excluded. No action button is clicked; model continuation is stopped after first schema/check/render outcome. DOM visibility and factual content correctness remain different evidence; local-sort or other content behavior must remain unverified unless actually inspected.
- Synthetic credential-read guard is installed before Pi module setup; default CLI imports no actual worker/auth runtime. Selected live config parsing rejects executable values and exposes no key/header/body through assertion output. The serialized receipt uses existing key/header/bootstrap-token redaction. No new credential persistence or user installation change was found.
- Parent owns worker process group, browser ledger and fixed run/workspace. Browser fallback validates worker PID and unique user-data-dir command identity before group kill. Existing actual hang canary addresses the hard-kill path; broader cleanup and full checks still require final source-bound receipts.

## Required next gate

Correct F1/F2 with targeted failing-then-passing offline evidence, preserve current logs and report, freeze a fresh source identity, and complete the planned fixed-source checks/public offline CLI run. Request a new independent code/cost/isolation review including the exact once-only command/archive hash/caps before the authorized live batch. The scope and budget need no new user confirmation; code admission remains blocked until corrected evidence is reviewed.
