# BM2 independent review corrective PDCA

Status: in-progress. Fixed rejected candidate9e475ee; no model, merge, release, install, user config change or issue closure. Spec016 remains canonical. R1 reports preserved under bm2-tdd-evidence/:

- oracle-review-r1.md:0P0/3P1/1P2; SHA2561d668f80ec8abc072830387c8da7110c702767ec874ff2581e8d60ff8a2e6f0b.
- code-review-r1.md:0P0/3P1/0P2; SHA256886992462fbf658276e82c83f7458d54de44acef4aff8a23e9539f9da3bf808e.

## Corrective changes

1. Slot intent: reviewer supplied a **legal** Modal Icon trigger + Column(Open,Body) content. On checker9e475ee, added canary proves real compiler accepts and evaluator wrongly passes; expected semantic rejection fails (1test/1failure, exit1, bm2-tdd-evidence/slot-red.log). Fixed direct Text/slot/child assertions, preserving permitted declaration-order differences and avoiding generated-ID/full-message snapshots. Analogous structural child intents and already-declared Divider/FormValidation/TestResults facts are checked too. This is a new harness defect, not018runtime RED.
2. Raw capacity measurement: independently count actual snapshot arrays; do not delegate the oracle to the same production snapshotUsage used by admission. S04 checks typed413 plus attempted65/current37 and2/1surface facts; wrong-facts evidence canary must fail. No product limit change.
3. Chart transition: compare actual before/after snapshots and actual batch, allowing only declared series/sequence. Epoch/revision/data/other components remain identical; extra-mutation canary must fail. The before observation is captured before update, not reconstructed from output.
4. Inputs: S09 filename/kind, S12 submittedRevision, S13 second eventId/key reorder and browser acceptance/selection/hidden-source inputs are consumed. No expected-outcome fields drive actions. B03 input uses actual accessible option label B · b, while independent expected typed context remains [b]. S04 adds only canonical existing expected numeric facts. Fixture manifest updated; no auto-captured expected output.
5. Child identity: pass exact fixture bytes via fixed session IPC, hash the child-parsed bytes, compare to manifest and require matching attestation. Real valid worker control plus missing/wrong attestation and changed-source canaries fail setup, never count a negative pass.
6. Browser teardown: separate bounded page/server/session attempts preserve primary and cleanup observations; page rejection/hang cannot skip the real server close. Canary checks actual closed listener (ECONNREFUSED) and closed session after each fault, plus primary retention; actual test page is finally closed.4s async subbudgets fit5s teardown; no synchronous-preemption claim.
7. CLI lifetime: independent R1's owned child emitted>1MiB and resisted TERM; old evaluator stayed pending at13.5s until reviewer killed its own child. New failure/termination states are separate; every fault arms TERM→2sKILL and awaits close, retaining original reason. Static isolated canary injects only owned CLI spawn, observes SIGKILL/close before independent6s cleanup, and checks setup/output-budget failure. No registry-selected code or user-process termination. UTF-8 stream decoding also preserves split multibyte output under the same byte cap.

Targeted corrective checks: Node24.18.1 tsc passes;11 narrow Node controls/canaries pass;7actual browser scenarios+network canary+page rejection/hang cleanup canary (9tests) pass on lockedChromium1254. These are pre-final checks, not a current complete-source/hosted CI claim. Fresh complete checks and bounded R2 of the new commit follow. Original failures, rejected source and normal candidate receipts remain preserved. Rollback all benchmark/CI/two-reference changes together, leaving immutable018/source runtime/global state intact.


## R2 outcome

Fixed40746f73f4d24ed57eac3881114be7110e3eb266: independent oracle R2 GO0P0/P1/P2 (SHA73405538d9b2167a303cec5c3f5bfa15c8fc5e97a85fcdd8ca0b4c6fabe34d02); code/lifetime R2 GO0P0/P1/P2 (SHA857321ae8f4fd72c54f561261185a50c144645ba45a4abe7cf2d5ab9fc67bca0). Both reports retained beside R1. Fresh fullNode347/347, Chromium54/54, tsc and clean compatible61+7=68(45+/23−) pass. Check086 holds source-bound receipts. Lifecycle in-progress→review-ready; hostedCI/PR gate remains, no merge/release/closure. Public RED logs redact only absolute workspace paths; raw originals remain private and assertion/source boundaries unchanged.
