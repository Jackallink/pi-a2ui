# DX36/37 Round1 — user paths

2026-11-15. Spec014. Design intent, not passed tests.

US-001/P-001: User reading a166-test report needs a truthful full-suite total and bounded visible records without pretending the sample is complete.
US-002/P-002: Pi consuming browser intent needs accepted epoch/revision so an older queued interaction can be recognized.
US-003/P-003: Current validation/duplicate/failure authority must remain unchanged when metadata is added.

Given166reported total and2visible pass cases, When author follows complete reference, Then AC-001 evidence labels total/omission separately, summary is2, compiler accepts; direct summary166 remains rejected. No fake executed test claim.
Given actual valid typed/nested-context action, When accepted, Then AC-002/004 forwarded JSON contains accepted epoch/revision, old context and Pi followUp options intact.
Given accepted event then replace/reset before consumption (including synchronous callback reentrancy), When queue is read, Then AC-003 original identity remains, not retagged/dropped/re-dispatched.
Given stale/forged/duplicate/failing-bridge input, When handled, Then AC-005 same409/403/duplicate/503 semantics and dispatch cardinality; disable/empty/malformed paths keep existing rejection.
Given packaging and references, When actual consumers run, Then AC-006 no source-byte/SDK/catalog/runtime-limit drift, and unknown delivery currentness is not certified.

OUT: summary/new totals API, queue cancellation, automatic stale drop,36/37 release, benchmark, model, user installation. Gate: independent scope/TDD review before implementation.
