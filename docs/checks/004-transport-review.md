# Independent transport/browser review

Date: 2026-11-13. Initial verdict: **NO-GO for completed transport acceptance** until P1-TR-01 is repaired and re-reviewed. One P1, one P2; no P0. Scope limited to `src/server.ts`, `src/client.ts`, `scripts/build.mjs` and their direct transport tests. Concurrent compiler/session/Pi implementation is outside this review; this verdict does not revoke the earlier design GO or prevent authorized fixes.

## P1-TR-01 — valid maximum snapshots cannot reach even a fast client

Location: `src/server.ts:120`–`123`; `LIMITS.snapshotBytes` and `LIMITS.queuedBytes` are both 262144.

The transport adds `event: snapshot\ndata: ` and two final newlines to JSON, then counts the entire framed message against the same 256 KiB limit that the spec permits for the JSON snapshot. A valid upper-bound snapshot therefore always disconnects an authenticated client with an empty queue. Automatic SSE reconnect receives that same snapshot and disconnects again. This breaks full-snapshot recovery and rendering for otherwise accepted/restored state; it is not evidence that the client is slow.

Independent native-HTTP reproduction in this review used the real `startServer` with a schema-shaped session-boundary double containing one Text surface. The serialized snapshot was exactly 262144 bytes; the frame was 262168. After successful bootstrap, the first authenticated `/api/events` fetch failed with `UND_ERR_SOCKET`. No client backpressure was needed. This is a transport boundary reproduction, not proof the compiler generated that fixture.

Repair: make the accepted snapshot budget and framed per-client budget consistent, including initial headers and heartbeat accounting. Either reserve explicitly documented framing/headroom in the snapshot limit or adopt a separately bounded queue budget large enough for one complete maximum snapshot; record the precise spec adjustment. Do not disable backpressure bounds. Regression: maximum accepted snapshot produces a readable complete SSE frame on a fast client, and a genuinely blocked client is still disconnected at the documented budget while another client remains usable.

## P2-TR-02 — obsolete pending actions can keep the new epoch inert

Location: `src/client.ts:95`–`105`, `124`–`164`.

`sending` is global and clears only in the POST's `finally`. New-epoch snapshots discard surfaces and form state but retain that flag, and action fetches have neither abort signal nor deadline. If a POST remains unresolved while Pi changes branch/session, the newly mounted canvas remains inert and reports Sending until an obsolete request finishes, possibly for a browser-length network timeout. The response guard correctly avoids annotating new UI; it does not release its busy state. The same issue can affect a replacement form while the previous revision's request remains pending.

Repair: own pending state by an operation identity; abort/release obsolete work on epoch/surface invalidation, and ensure an old finally cannot clear a newer operation's busy state. A bounded deadline should show uncertain delivery without retrying automatically. Regression: hold a POST unresolved, apply a new epoch (and separately a replacement revision), and show the current form remains usable; resolving the old request later must not annotate/unlock unrelated in-flight work. This is source-traced, not independently browser-reproduced yet.

## Verified existing behavior and remaining evidence

Independently ran `node --import tsx --test tests/server.test.ts`: **4/4 passed**, 0 skipped. These establish native HTTP bootstrap, unauthenticated/foreign Host/Origin/cross-instance rejection, bounded Content-Length rejection, SSE client cap, and shutdown with a connected stream. They do not establish chunked-body oversize handling, actual slow-client recovery, heartbeat limits, valid maximum snapshot transport, or browser DOM/input/pending-state behavior. Add focused tests for the identified contracts rather than treating four passing tests as complete acceptance.

Source inspection found coherent loopback-only authentication, exact Host/POST Origin checks, optional-but-checked SSE Origin, timing-safe credentials, random per-process cookie names/values, no token in public assets, no automatic POST retry, and cleanup of listener/streams/timers/sockets. The client preserves unchanged mounted surface revisions and replaces all renderer state on epoch change. The build bundles official renderer code and local CSS with no CDN or user build step. Actual DOM rendering, text escaping, input preservation, CSP compatibility and real Pi continuation still need separately recorded browser/runtime evidence.

## Known Zod advisory — bounded local-trial assessment

The [reviewed advisory GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) affects Zod below 4.6.6 and concerns excessive per-element validation issues and memory allocation for oversized collections. The project pins Zod 3.25.76 because the official core/Lit dependency generation uses Zod 3; forcing Zod 4 is not a demonstrated compatible remedy. The reported four audit entries describe the same underlying dependency issue, not four independently demonstrated application exploits.

The reviewed transport does not invoke Zod: bootstrap only parses <=64 KiB JSON and checks a token; actions require credentials/origin then pass bounded JSON to the session port. This meaningfully limits exposure, but a byte/depth bound alone is not evidence that SDK union/collection validation cannot amplify issue allocation. Untrusted model DSL, restored snapshots and submitted actions can reach SDK schemas elsewhere. Before calling the local-trial mitigation complete, require a plain-JavaScript structural preflight **before SDK/Zod parsing** on untrusted object paths: explicit bounded total values/nodes plus per-array elements and per-object keys, with early rejection rather than accumulating errors. Keep source/JSON byte, depth and component limits; add the corresponding limits to the canonical spec. Demonstrate one over-budget collection is rejected before the SDK parser is invoked and that maximum valid form fixtures still work. DSL SDK parsing itself has no hard CPU/memory sandbox; retain that known boundary.

This is a concrete mitigation requirement and a disclosed dependency risk, not a claim this reviewer reproduced a Zod memory-exhaustion exploit. A bounded loopback local trial may proceed after the application's guards are verified and transport findings are repaired; this review grants no public/remote release GO. Do not label `npm audit` clean or the dependency patched.

## Re-review

Return P1-TR-01 and P2-TR-02 substantive fixes and focused evidence for independent re-review. Keep the initial findings/reproduction as history. Final acceptance remains separate from this scoped transport review.

## Scoped re-review: P1-TR-01 resolved

Date: 2026-11-13. Re-read the current server framing check, the exact-limit HTTP regression, and the amended canonical queue-budget contract. `SSE_FRAME_ALLOWANCE` is a fixed 64 bytes; snapshot delivery checks buffered bytes plus frame bytes against 256 KiB + 64. This permits the 24-byte snapshot framing overhead while retaining a finite slow-client queue bound. The spec explicitly records the fixed allowance.

Independently re-ran `node --import tsx --test tests/server.test.ts`: **5/5 passed**, 0 skipped, including the exact 262144-byte JSON snapshot being received and parsed over real authenticated HTTP SSE. The earlier socket-failure reproduction remains historical RED evidence. Existing authentication, client-cap and shutdown checks continue to pass.

**P1-TR-01 is closed. GO for this scoped transport fix.** No unresolved P1 remains from this transport review. This re-review does not claim an actual blocked-socket backpressure test, does not re-audit concurrently changing core/Pi code, and does not establish Zod mitigation or completed browser/live acceptance. P2-TR-02 is outside this requested re-review and remains for the active browser/final reviewer to verify against its targeted fixes. The initial findings above are preserved as history rather than a current rejection of this framing fix.
