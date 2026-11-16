# Spec025 independent Gate1 design / cost / comparability review R1 — NO-GO

Reviewed clean source `6e80e3f00501793b0c396db6c378bf4553623488`, tree `6eae9397a1405074d51a8e87b62f25c8875f169a`, base `309c8ba11615947bb98dc1c2afa5e0c48b6b84a3`. Scope: design/static-source review only. Current model budget0, driver unimplemented, no live grant. Only this ignored review report is written.

## Decision

**Gate1 R1 NO-GO pending three bounded P2 definition corrections. Open P0/P1:0; open P2:3.** The proposed small paired experiment is otherwise concrete, reviewable and budget-bounded. No new sample, extra provider call, product change or general evaluation framework is needed to resolve these findings. Preserve R1, make the minimal canonical/profile/walkthrough clarifications and rebind a fresh review; do not apply this review as current call authorization.

## Findings

### F-01 [P2] known no-candidate rows can enter an undefined first-candidate correctness comparison

Location: Spec025 lines62–64, profile reporting and Round3 APR01.

The double denominators correctly retain planned tasks and actual submitted candidates. However, “all4rows known /2complete pairs” does not explicitly require that all4rows actually submitted a first candidate with a known correctness classification. A known preparation-limited/no-candidate row is not a syntactically/semantically invalid candidate. The current direction rule can be interpreted as treating that absence as correctness=false and calling G a correctness winner, despite the intended separate not_observed category. The planned-task delivery numerator can remain0, but it is a different question from comparing submitted first-candidate correctness.

Minimal correction: require **all4rows actually submitted a first candidate and have a known final candidate grade** before the first-candidate correctness G/C/pair-direction comparison. A known compile rejection is a known invalid grade; preparation/INPUT/schema cases not reaching a grade are not silently grade=false. If any candidate is absent, report only budget-bounded delivery/preparation/stage observations without claiming correctness-direction improvement; actual-candidate denominator0 is N/A. Unknown stays unknown/fatal and never becomes0/fail. Add APR controls for known noCandidate and denominator0; no extra model attempts.

### F-02 [P2] intentional local case-stop artifacts must not trigger the fatal cancellation rule

Location: Spec025 line79, Round2/3 stopping matrices and APS01 intent.

Ordinary check/schema/compile/semantic/preparation failures must close only that case and allow the remaining planned cases. The fatal list also names SDK/stream unknown and cancellation, without expressly excluding the local empty assistant/aborted artifact produced by intentionally stopping an already closed case. This is a real known event shape from Spec023, not a hypothetical provider failure. A future adapter that classifies every aborted event as fatal or overwrites the earlier provider-backed request diagnostic can stop the whole comparison on the first ordinary control failure or misstate its outcome.

Minimal correction: an intentionally closed case's empty local SDK aborted/stop artifact with **no new durable admission/HTTP attempt** must preserve the primary authoring outcome and completed request diagnostics, stay out of provider-request/unknown accounting and not stop later cases. Genuine in-flight provider/stream interruption, timeout, external cancellation or missing outcome remains fatal/unknown under the existing budget rule. Add synthetic APS controls contrasting these paths. No actual provider call or new budget is needed.

### F-03 [P2] TextField membership/string bindings do not alone establish free-text task inputs

Location: Spec025 lines54–58, profile oracle and APO01 intent.

The oracle requires3TextField components/string values and visible usable controls, but does not constrain their variant/native input type. The installed active SDK TextField supports number and obscured variants; its actual renderer maps them to input[type=number] and password respectively, while src/inputs.ts validates TextField only as a string. A numerically restricted name/source-folder field can therefore pass compile, pure validateSubmission and visibility checks while failing the request's arbitrary textual information entry contract. Merely testing synthetic strings through server-side validateSubmission does not inspect that DOM restriction.

Minimal correction: pre-register accepted ordinary text variants (omitted/default, shortText, longText) and require the selected actual native control to be input.type=text or textarea. Treat unrequested number/obscured variants as semantic invalid, not compiler defects or fatal infrastructure failures. Add wrong-variant counterexamples in APO; keep the component-identity visibility/binding checks and no-fill/no-action-POST rule. This refines the private task oracle, not product schemas or permissions.

Minor unit correction while updating: Round3 APB01 calls98304bytes “98KiB”; the canonical number is **96KiB**. Correct the label without changing the limit.

## Design assessment beyond those corrections

The two arms are properly identified by immutable archive/source/payload hashes rather than their shared0.1.10version. C is released control retaining NEW, not legacy A/OLD; G is the exact unpublished Spec024candidate. Both have76paths and only the registered7guidance paths differ. The study estimates the package-level intervention, not any single clause's causal effect.

Two distinct new local prompts/IDs, explicit task labels/keys/required rules, fixed counterbalanced C-G/G-C order and4independent fresh sessions are reasonable for an exploratory observation. “Fresh” is supported against the frozen/pilot/smoke prompt strings; it does not establish unseen model training/remote cache. No randomization/global success-rate/significance claim is made. Endpoint/SDK/path/tool/skill metadata parity, same-case absolute owned paths, real per-arm factory/helper/compiler loading and exact four context attestations directly address the old-harness confounds. Meaningful initial description/system-snippet differences must be specifically bounded, not hidden through NEW→OLD or broad message normalization.

First check source, otherwise first complete render source, is a reviewable first-**submitted**-candidate definition; it is explicitly not the first partial draft/token. First-source compile/static task correctness, first actual UI, preparation and skill/example/check/source-match evidence remain separate. Check success cannot establish UI, and direct unchecked but valid UI can succeed with workflow marked unchecked. Exact vs the one-terminal-LF compatibility rule vs mismatch are preserved honestly; mismatch cannot rewrite the first-source grade or falsely become a product receipt refusal. Static/context/rule/Unicode and selected-component DOM checks are otherwise sufficiently defined, with the text-variant refinement above required.

Ordinary authoring failure continuing the remaining fixed cases is the correct sampling policy, not a retry. Known ordinary outcomes can remain comparison data; HTTP/transport/unknown/truncation/drift/unsafe operation/time/cleanup faults stop the batch. Distinguish normal cap exhaustion from guard/accounting bypass. The intentional-local-stop exception must be made explicit as F-02. No failure authorizes a replacement invocation or extra sample.

## Cost/time/authorization assessment

The proposed one batch4sessions×≤6requests totals≤24; max_completion_tokens1536 gives36864configured output tokens, including reasoning, not measured usage or a monetary cap. Input98304bytes/response1MiB/source32KiB and12tools/1check/1render per session are concrete resource limits. Usage/reasoning subset/fee unknown reporting is appropriate; no monetary estimate is offered or inferred. Extra skill/example preparation counts within the same request caps, and the two denominators prevent hiding its absence/failure.

Request30s, active150s, worker **total180s including setup/cleanup/TERM2/fallback**, batch **total780s** and no new session when less than its full180s remains are coherent hard ceilings. Four180s windows fit720s plus60s batch overhead; six30s requests need not fit150s, which the spec explicitly acknowledges. Implemented timing still requires real owned-process synthetic canaries at Gate2/code acceptance; constants alone are not a completed timing proof.

Current authorizations are strictly design-only. A corrected Gate1 GO may support a concrete **conditional** user request for minimal private adapter/zero-inference acceptance/code GO followed by exactly one bounded≤24batch. It cannot execute old smoke/pilot entries, enable flags, modify old profiles/grants or create approval now. Future per-arm loading/known policy,6/24/12guard/journal/receipt checks, four captures, early three-entry refusal, one-use lock/replay and complete fixed-source local checks with independent code/privacy/cost GO remain prerequisites. No old real baseline/unused capacity or paid judge/pressure test is admitted.

## Verification actually performed

Read-only source/docs/JSON/hash/tar/library-source inspection only; no JS/SDK/helper/Node/Pi/browser/config/auth/provider/network execution, model request, live guard or test rerun. Only this report was written.

Verified exact HEAD/tree/clean state and8docs-only additions from base. All7design-input hashes match static-preflight; all92current runtime inputs and22historical raw/state hashes match. Independently read both immutable archives: exactSHA/76same paths/7allowed guidance differences, G bytes equal current production payload. Release source package-lock equals current lock bytes. The two natural requests are distinct and not old frozen/pilot/smoke scenario strings. Proposed24/36864arithmetic, documentOnly/live=false/budget0/unimplemented flags are internally consistent. Static receipt SHA256 `05e82a8458b71790c0ab3aa48fc56e00f0ff5175a44546b501eadc93450a23da`.

Relevant current worker/contracts/control/policy/observations were read to check the stated adapter gap; no existing505/538/540node or90/91browser result is relabeled as this unimplemented driver acceptance. TextField number/password mapping was inspected in the installed active SDK universal/basic_catalog/components/TextField.js; this is source evidence, not a browser test or SDK execution. Unknown/privacy/native-thinking/raw-header boundaries remain preserved.

## Reviewed fingerprints

| Input | SHA256 |
| --- | --- |
| `docs/specs/025-authoring-paired-pilot.md` | `a855b9ec487ece7af62a2b0fa5d559fd08c457e328d08b661241d03cbc3aaed5` |
| `docs/plans/025-authoring-paired-pilot.md` | `a23cdf446789bcd191ecb549f8ed5add84f5850ff08c5caa39557c05d1549f50` |
| `docs/walkthrough/authoring-paired-pilot/01-round1-user-stories.md` | `1229b665267fd03da00da8b5245a8f2e5a72a8023f691d18e8bd29e1761d6f06` |
| `docs/walkthrough/authoring-paired-pilot/02-round2-technical-trace.md` | `dd50eaae9b6d9c89dabe6a55669fd3a64e1f1068358c8fef0f90d7c572f1358a` |
| `docs/walkthrough/authoring-paired-pilot/03-round3-integration-check.md` | `42c68d60e9f7674cb213dae6673cdb56b3cf1efcd06fc426c6282ed727dc6872` |
| `docs/checks/122-authoring-paired-pilot-design.md` | `26178bad31de27a290f7d47dea9d82a6cad2e90d776f0a1a02e0c953ab241901` |
| `docs/checks/authoring-paired-pilot-design/profile.proposed.json` | `36f1074845c6f2219f22627305b56022bfe08c7c507b1c5a3d808eeaf9ccf4fc` |
| `docs/checks/authoring-paired-pilot-design/static-preflight.json` | `05e82a8458b71790c0ab3aa48fc56e00f0ff5175a44546b501eadc93450a23da` |
| `tests/trigger-pilot/worker.ts` | `d50ff2be819961f43f819580dd353fb7c62865c5c0312d551962e179d1b6b78c` |
| `tests/trigger-pilot/contracts.ts` | `a43cb655576b206d57ed3e81248dabe4a99324a3c83a75b38828b8eab74a157b` |
| `tests/trigger-pilot/control.ts` | `a350887f66f00dca986dc19cb645ad4114649c056211061c5745a4f0a49ce760` |
| `tests/trigger-smoke/policy.ts` | `6a46bd31864033d434e66ef0531ebd59b45f832d70dcbb73e253ab5128fd3fa3` |
| `tests/trigger-smoke/observations.ts` | `d46cc8ae876af194d8ed4737207e7da20db49e6b93246fc11a87ed1c55e7c836` |
| `src/inputs.ts` | `32c9565e4635eca1f5a52335c11ae7e47efa5a885871de6dfc513444ca28ac34` |
