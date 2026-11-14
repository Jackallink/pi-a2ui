# Offline assessment — second skill run and exact-argument copy friction

**Recommendation: keep whole-version consumer acceptance NO-GO and PR draft.** The scoped A03 code/document GO remains valid; it does not establish the unexecuted end-to-end story. Do not make another model request to repair reporting or relabel this failed receipt.

Reviewed source: `a4e8b6add3984065f1d6fae567f8008716e9cc15`; supplied archive prefix `c641`. Read only `production-path.txt` and the new owned skill run's `rpc.json`/`result.json`; no auth/config, source mutation, installation or inference. Run: `pi-a2ui-v016-context-9spNZW/skill/pi-a2ui-accept-thr452`.

## Independently confirmed facts

- Successful tools before render: bash, read, bash. One render succeeds, zero renders fail; actual result records one agent run.
- A successful helper check returned exactly source/surfaceId. Check source length466, render source length465, same surfaceId. **check.source === render.source + '\n'**; last check code point10. This is not missing helper use or fabricated check output, and the mismatch is not JSON envelope parsing.
- Compiling the actual rendered source and applying guardedForm succeeds with exact keys accept/name and accept bound to /ok. The first run's wrong submitted key is corrected in this run.
- Current verifyPreflight returns false, as expected: `scripts/skill-acceptance.mjs:59–75` compares source strings exactly. SKILL.md:26 requires successful check arguments unchanged. Under that admitted contract the refusal is correct; LF equivalence is a separate contract decision for the dedicated A02 reviewer.
- result.json remains failed at skill-render (`No successful exact helper preflight precedes the rendered source`). Browser interaction was not observed; invalid/valid submission and typed acknowledgement remain untested. Recorded process exit, Node24/owned cwd, package and operator preservation checks pass. The already-run browser setup/preflight is not browser story acceptance.

## Interpretation and minimum closure

This demonstrates a concrete friction point: helper output is an escaped JSON source string which the model must transport into a separate render invocation without reserializing its source value differently. In this one case, semantic adaptation improved but exact copying lost a trailing LF. It does not prove general failure rates, parser defects, unsafe rendering or successful full-story behavior.

Preserve the old exact-argument AC and this failed receipt. Record the second failure separately from the first semantic RED, credit the observed correction without calling the whole case green, and retain the scoped static/code/production receipts with their exact identities. Stop inference as instructed. Even a separately approved offline conclusion that one trailing LF is compiler-equivalent cannot manufacture missing browser submit/ACK evidence or retroactively turn the original run into an end-to-end pass.

A follow-up design may remove the model's need to copy the full checked source into a second tool call, by establishing an explicit controlled handoff of one checked source artifact/result to rendering. First decide whether the contract is exact source identity or declared semantic equivalence, and define ownership/session binding, freshness, authority and boundedness for the handoff. Keep the current same-compiler and action validation boundaries. This is a future feature/contract decision, not a documentation-only fix, permission to add APIs, arbitrary file reads, normalization or a reason to retry the old candidate.

No further implementation or model run is needed to reach this honest stopping point. Whole-version acceptance remains open/NO-GO until its required observable stages are actually satisfied under an independently admitted design and artifact.
