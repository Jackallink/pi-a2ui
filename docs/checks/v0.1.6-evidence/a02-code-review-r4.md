# Independent A02 code review — R4 bounded preflight source matching

2026-11-14. Exact source **`c50cfe920f677e49d5b2fa9b63e1f39b595bf71a`**; implementation change995c430 and subsequent Check060 clarification are included. **GO for this bounded developer-acceptance revision: 0 open P0 / 0 open P1 / 0 open P2.** Earlier A02 R1–R3 findings stay closed. This is code/replay-eligibility GO, **not actual browser/POST/RPC/ACK or whole-version acceptance**.

## Contract and implementation

The independently approved design correction is recorded in spec011 before this implementation. It changes only developer preflight-source matching, not helper source bytes, tool/API inputs, rendering validation, submitted context requirements or filesystem permissions.

`scripts/skill-acceptance.mjs:59-85` retains successful template retrieval and check completion before the selected render, admitted helper identity, identical surfaceId and the two-key check argument shape. It compares the pair exactly first; otherwise it accepts only longer===shorter+'\n' while shorter does not end in CR/LF. Thus CRLF, zero-versus-multiple LF, one-versus-two LF, space/tab and internal changes are rejected. It does not trim or replace either original string.

The returned metadata at line80 records preflightMatchKind exact|single-terminal-lf, exactPreflightObserved=true only for exact, and separate UTF8 SHA256 hashes of checked/rendered source. The stage at150–155 requires the unchanged guardedForm proof before preflight and records preflightObserved independently after matching. A single-LF match is not mislabeled exact. No sourceFile handoff API, new CLI flag or extra execution capability is introduced.

The submitted context/POST/RPC/ACK checks, owned-cwd/evidence admission, Node24/model opt-in tuple gate and bounded cleanup are unchanged. Developer scripts are excluded from the production payload. Independently inspected the full declared production-path diff from a4e8b6a to c50cfe9: **empty**, including package/lock, src, dist, skills/templates, extension, README/changelog/licenses. This supports retaining the separately reviewed c641 archive identity; this report does not invent a newly built archive or extend old model evidence into unobserved UI steps.

## Independent execution

Verified exact HEAD and reviewed the source/test/spec/Check060 diff. Existing untracked node_modules was preserved. Used the existing private Node24 wrapper via bash plus an explicit actual-major assertion; observed **Node v24.18.1**.

- Independently ran **22/22 acceptance offline tests**, including the new exact/single-LF predicate and counterexamples, both LF directions, independent raw-source SHA assertions and full compiled SurfaceMessage equality for the allowed case. Existing private no-model normal startup, literal/alias rejection, actual POST identity helper, real child cwd/probe, hung cleanup, preflight-close bound and protected evidence admission tests all pass.
- Inspected the actual contract RED: the old exported verifier returned false for the newly approved single-LF case. This is meaningful new-contract behavioral RED, not a claim the previous exact contract was incorrectly implemented.
- Inspected tsc's producer log without diagnostics and Check060's producer22/22 record. Root reports full199/199 separately; that whole-suite count is not a newly executed reviewer run.
- No inference, real browser interaction, credential/config read/copy, real-user installation change, remote write or product edit was performed. Offline startup used its private dummy fixture/registration. Only ignored independent review/replay evidence was written.

## Independent replay of retained actual traces

Used the reviewed verifyPreflight and guardedForm directly on the two retained private RPC arrays, without executing them or modifying their records. Rehashed each original result before replay, asserted its original passed=false and compared its bytes again afterwards:

| Original receipt SHA256 | New predicate eligibility | Context eligibility | Whole-run status |
| --- | --- | --- | --- |
| `e3a458a312b78dc7150cc3887aec61ce21ba947c3259c652edd9636f3acecaee` | exact; exactPreflightObserved=true; equal source hashes | false: original name/ok keys remain outside requested name/accept | unchanged failed |
| `39362ea655535f5257549b47f328e59b91694f498431cff1a2b9aaadaa194909` | single-terminal-lf; exactPreflightObserved=false; original distinct source hashes retained | true | unchanged failed; browser/action/ACK unobserved |

The second pair hashes remain check `a3508dcf2bcf0b9be7b319c4d1ca300d2ec34605d5a9e64553f215e832a58b9d` and render `fc5c2ace5b3316654ed9e9e9e9e131c1b89691d2a6ee3650b38a3c982c036413`, exactly matching the earlier independent terminal-LF observation. The first pair is genuinely exact, not another LF case. Check060 correctly preserves the initial private replay's wrong assumption as a replay-fixture failure rather than product RED/GREEN.

Independent replay receipt: `.local/v016-evidence/a02-r4-independent-replay.json`. It explicitly records inferenceRequests=0, originalPassed=false, oldBytesUnchanged=true and browserActionAckEvidenceAdded=false. Neither offline compilation nor existing component browser tests are substituted for the still-missing actual GLM roundtrip.

## Next-stage boundary

The reviewed revision can support the already agreed **one fresh complete same-story gate** on the reviewed script/exact production artifact for the still-unobserved browser/POST/forwarded RPC/typed ACK boundaries. That is distinct from paying a model to test this comparator. No automatic retry of either old candidate, altered context AC, replay-as-success, fallback provider, merge/publication or installed015 replacement is authorized by this code-review verdict. Any future actual result must preserve its own source/archive/model identity and failure history.
