# Independent A02 code review — R2

2026-11-14. Fixed source **`0e57b8ec576482fa7bf8207b0c0bf314ace7b1c0`**, compared with R1 **`250508c623dc55296d426dd76fd9559102ecceab`**. **NO-GO: 0 P0 / 1 remaining P1 / 0 remaining P2.** Five original findings are closed; the shared cleanup finding F03 is substantially corrected but retains the preflight-close omission below. R1 report remains historical and unchanged. Concurrent A03 docs/version/production work is excluded.

## Remaining P1 — preflight browser close is outside the bounded cleanup lifecycle

Location: `scripts/skill-acceptance.mjs:5-16`, especially10–11; caller at runAcceptance browser-setup before Pi creation.

The new cleanupOwned deadline fixes cleanup tasks after resource startup, but preflightBrowser still directly awaits browser.close with no deadline. If that close never settles, the browser-setup stage never finishes or fails and the worker never reaches its catch/finally cleanup or final receipt. This is the resource preflight/close boundary explicitly included in R1 F03's minimum correction; it is not a new model/UI requirement.

Independent controlled offline counterexample under Node24: temporarily replaced the imported browserType.launch method only in the reviewer process with a fixture that returned close() as a never-resolving Promise. Used the Node executable only to satisfy the local executable-path existence check; **no actual browser, Pi or model was launched**. preflightBrowser called the fixture close and remained pending through a150ms external observer. The function has no internal timer, so the deliberately unresolved fixture cannot reach a bounded failure. Temporary method/environment changes were restored and no source file was edited.

Minimum remaining correction: route the preflight close/resource-ownership boundary through bounded cleanup and preserve its setup cause/failed stage. Add an internal controlled never-settling preflight test; do not expose a public CLI injection flag. A failed/timed-out preflight must not proceed to Pi/model or be marked successful.

## Original finding closure

| R1 finding | R2 status and evidence |
| --- | --- |
| P1-1 coding child cwd/probe | **Closed.** component-acceptance:189-199 extracts the real coding fixture and passes explicit workspace cwd plus runtimeEnv into spawnSync. The actual child and test child are observed. Independent new test passes. |
| P1-2 literal/alias context false green | **Closed.** skill-acceptance:306-325 enforces exact name/accept direct binding paths, source/surface/event and typed values; actual POST is captured at151-159 and checked at210, forwarded RPC context at214-222 before acknowledgement. Independent compiler-valid literal/alias rejection and altered-action identity/context tests pass. Hardcoded expected acknowledgement is now backed by verified actual context, so the prior subset counterexample cannot pass. |
| P1-3 hung cleanup blocks later tasks | **Partially closed; remaining P1 above.** support:391-408 has a per-task15s deadline and always advances to later tasks after timeout; independent100ms test closes a real owned child after a deliberately hung earlier task. Post-start skill/component callers use this helper and record cleanup failure. preflightBrowser remains outside it. |
| P1-4 evidence writes package before rejection | **Closed.** live-acceptance:14-16 validates evidence parent before createRun. support:178-201 canonicalizes the nearest existing ancestor, rejects package root/descendants and protected operator paths including missing paths/symlink aliases. The explicit operator-owned new receipt directory exception is clarified in spec011. Independent rejection-before-write test passes. |
| P2-1 missing private original cause | **Closed.** support:224-234 persists at most8192 characters of private cause/stack in mode0600 while retaining generic public error/earliest failure; skill catch also records stage-error before cleanup at244-249. Independent ordinary Error private-diagnostic/public-envelope test passes. |
| P2-2 relative package accepted | **Closed.** support:38-41 rejects nonabsolute explicit package during admission. Independent no-fixture usage test passes. |

The exact opt-in/model tuple, Node24-first, old010 identity rejection, hostile legacy-environment guard, normal startup versus explicit skill profile distinction, five supplied-DSL scenarios and no actual user/global installation changes remain intact. No new P0 or unrelated P1 was identified in this bounded re-review.

## Independent execution evidence

Created a fresh private git archive of exactly0e57b8e with a symlink only to the existing dependencies, not an installation. Identity recorded in `.local/v016-evidence/a02-review-r2-source.json`. This keeps all A03 dirty package016/README/skill/test changes outside the exercised source/package identity.

Under the existing private Node24 wrapper via bash and an explicit actual-major assertion, observed **Node v24.18.1** and independently ran **20/20 offline tests**, including a real new private normal-registration startup with dummy metadata,0model/agent runs, package/operator preservation, normal skill discovery and registration cleanup. The suite includes real coding child cwd/probe, legal compiler counterexample, exact action identity/context, real-child timeout cleanup, protected evidence-path aliases, relative-path rejection and private cause tests. All20 passed; none cover the preflight never-settle counterexample, which was separately observed above.

Check054 accurately distinguishes behavioral RED from the earlier NODE_TEST_CONTEXT fixture failure and invalid development-ancestor production evidence. This review does not turn producer RED history into newly executed reviewer tests, nor does it certify A03 production/model acceptance. No actual016 GLM, browser roundtrip, credential/config copy/read, global installation change, remote write or source/product edit occurred. Only ignored review/snapshot artifacts were written.

Root acknowledged the remaining preflight-close omission and is correcting it in successor work. A new fixed source plus targeted preflight RED→GREEN and R3 review is required for A02 GO; no actual GLM is admitted by this R2 NO-GO.
