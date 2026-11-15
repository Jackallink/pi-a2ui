# BM4 bounded corrective code / pre-live R2 — NO-GO

**Fixed source:** 769ea274b6cc57f6f64ab9f8ff9f109122548c6d; rejected predecessorc3978f3b6764651a53a85ccf25406872b11b8ea3. **0 P0 / 1 P1 / 0 P2.** Scope limited to R1 F-01–03, V-01 and nearby cost/accounting/stop paths. Later corrective worktree edits are excluded. No12live-run admission on this source.

## Original findings closed

- **F-01 closed:** entire real configuration hashing/read/JSON parse/admission block returns only a fixed trusted error before secrets are available. Later errors use populated secret redaction. Independent synthetic malformed JSON/config controls pass with no real config read or provider fetch.
- **F-02 closed:** before-dispatch credential-free request journal records fixed id/index/mode/model/endpoint. Parent validates journal/final-receipt agreement; missing/invalid receipt becomes started:null and unknown requests/actualModelRequests (live), with known admitted lower bound. Aggregation keeps unknown counts separate from0/not-run, and stops the batch on harness failure. Independent missing-after-admission/malformed-journal and aggregate controls pass.
- **F-03 identity portion closed:** actual model/URL/body/auth/profile rejection marks fatal+harnessFailure before transport, distinct from measurable request-limit exhaustion. Independently ran actual SDK wrong-body control:0requests, no tool execution, fatal+harnessFailure. Genuine identity failure cannot silently continue later cases. Normal stopped continuation has the new regression below.
- **V-01 closed for this source:** owned BrowserServer disables Playwright's automatic SIGTERM/INT/HUP handlers; worker/parent own the signal path. Fresh full-source hard-hang canary passes its retained workerSIGKILL/fallbackBrowserKill/browsergone/serverunreachable/ownedworkspaceremoved assertions; cleanup claims were not weakened. Originalc39779pass/1fail remains preserved.

## Remaining finding

**F-04 — P1: normal abort is mislabeled as an identity breach.** `tests/benchmark-model/worker.ts:58` combines `stop || wrong model tuple` and sets fatal+harnessFailure for both. In the actual SDK the synchronous successful render-hook abort can still invoke its cancelled continuation callback. The guard correctly prevents any additional HTTP, but now marks an otherwise successful scenario as a harness failure. Fresh769full-browser has **12normal-positive failures /71passes** (83total). Inspected M01/M12 receipts are stage:success, requests3/4, rendered+intent+interaction/static passed, cleanup[], blockedRequests0; fatal/harnessFailure appear only with the final assistant stopReason:aborted. This is a correction regression, not real-model quality failure or paid continuation.

Minimal correction: separate already-stopped/cancelled callback suppression from true tuple/URL/body/auth/profile rejection. Both remain before transport; expected cancellation must neither dispatch another request nor add fatal flags. Preserve pre-existing fatal failures. Record suppressed cancellation diagnostically and prove normal success/cleanup alongside unchanged wrong-body0transport fatal and5-request-budget controls on a new fixed source.

## Evidence / disposition

Independent bounded checks: **10/10** cost/config/journal/identity Node controls and **1 actual SDK identity browser control** pass. Producer fresh769logs: **418/418 Node,0fail/skip/cancel**, tsc passes, **71/83 Chromium**;12normal positives fail exactly F-04. Default dry-run binds clean769,Node24.18.1/Pi1.5.0,0providerrequests/0credentialreads. No full rerun was performed by reviewer. Product/runtime/dependencies/75-file payload/profile/scenario budgets are unchanged by these corrections; separate measurement-oracle corrections remain their own review boundary.

**NO-GO pending F-04 repair and fresh fixed-source offline/full/main--offline accounting evidence.** Preserve this failed769round, then request narrowly scoped R3. No model call, real auth/config-content read, source edit, install, CI trigger, remote mutation, merge, release, global change or issue closure was performed by this review.
