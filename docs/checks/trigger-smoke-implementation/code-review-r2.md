# Spec023 independent code / privacy / cost / authorization review R2 — NO-GO

Reviewed source `01fcd8a7255f4dd86e434f87200db2e70324740f`, tree `579c7315458af95645c3001a2fa030b95d31fac9`; clean at review entry. Prior R1 source `2b76e516227dbe26bc53ba38bc4e07b8d45e4025`. R1 report/public copy remain unchanged at SHA256 `923e5f4688cfd0386078441cbaa8284eb7ce6ae6d175827c0bd8d83234c857ad`.

## Decision

**NO-GO for paid execution / final code acceptance on this source.** F-01, F-03 and F-04 close; F-02 remains partially open as one P1 acceptance-oracle finding below. No additional budget/privacy widening was found in the corrective diff. The original user authorization still covers only one future ≤4-request invocation after all code/evidence gates; no live grant/command is approved by this report.

## F-02 residual [P1]: visible controls are not bound to the selected snapshot components

Location: tests/trigger-smoke/observations.ts7–15 and tests/trigger-pilot/worker.ts147.

The revised semantic predicate correctly requires three distinct component IDs/paths and a non-cancel confirmation action carrying all three selected paths. It fixes the observed cancel-only and unbound-confirm counterexamples. However, it discards the selected field/button component IDs and returns only paths/captions. The DOM stage then counts any three visible controls anywhere in the canvas and accepts any visible button sharing a selected caption. It does not establish that the selected semantic fields or bound confirmation button are the controls actually visible/usable.

Concrete source-trace counterexample: a hidden tab/closed modal contains the three correct semantic fields and a properly bound confirmation button; visible content contains static text naming application/environment/version, three unrelated inputs and an unrelated visible button with the same 确认 caption but cancel/empty action. Snapshot selection succeeds on the hidden nodes; global innerText matches the static labels; the unrelated inputs satisfy nativeInputCount≥3; the unrelated same-caption button satisfies confirmVisible. The current oracle returns contentValid=true / ui_smoke_pass although the required form/confirmation is not the visible usable UI. Compiler tree reachability does not establish current DOM visibility for tab/modal content. This finding is derived from the two predicates' missing association; no SDK/browser reproduction was executed by this reviewer.

Minimal correction: retain the selected field and confirmation **component identities**, resolve their actual DOM component hosts, and require the selected controls themselves visible and usable, with the selected bound button itself visible/enabled. Do not substitute unrelated controls or same-caption buttons. Add a synthetic actual compiler/server/DOM counterexample for hidden selected fields/bound button plus visible unrelated controls, keeping valid-form and cancel/unbound controls green. Preserve layout flexibility and no-click/no-POST rule. The previously requested ambiguous/shared-label case also needs either a rejecting control or a documented unambiguous field-selection criterion; aggregate label matches alone are insufficient.

## Closed findings and inspected evidence

- **F-01 privacy closed:** assistantReceipt projects only public text/toolCall fields before durable receipt creation and drops native thinking/signature blocks without mutating SDK history. The actual-SDK reasoning sentinel previously failed on persisted thought; worker receipt and public CLI report now pass privacy assertions. Safe diagnostic helper remains unchanged. No raw user/provider thinking was inspected; the inspected failing assertion contains only the explicitly synthetic sentinel.
- **F-03 result semantics closed:** only negative_text/negative_tool map to behavioral fail; provider_unknown/output_truncated map to unknown and other protocol states map to protocol_error. The existing summary test now checks unknown explicitly; source covers the stated classification partition.
- **F-04 authority evidence closed:** owned git fixture copies the consumed input set including payload.json, binds synthetic source/grant/captures, proves legitimate negative/positive authority can reach the pre-workspace witness, then rejects13bad-ticket/drift/replay/negative variants before workspace/config/provider. Profile/runtime-file drift and real CLI malformed grant are also exercised. Two real execute CLIs in the fake repository yield one intercepted worker-spawn winner; replay cannot spawn. All fixtures use no actual credentials and no external provider. The early closed-receipt replay guard was added after a genuine witness RED; initial missing-payload setup failure is correctly kept separate.

Read authority-BdUvbC/.local/result.json: negativeWitness/positiveWitness=true, all13rejections have config/network/workspace/spawn/claim0; concurrent execute has one spawn1 and one spawn0, no config/network/workspace; replay spawn0. This is relevant actual-entry evidence, not only helper return-value tests.

Inspected raw receipts:

| Receipt | Result / SHA256 |
| --- | --- |
| review-red.log | Four meaningful assertion failures: summary, cancel-only, unbound-confirm and thinking persistence. `c6496319ec49261ec8022a2418fd3755754c23c217105ba8c4bc8fad22deef0d` |
| review-green.log | 5/5 including normal form. `59a574871cfb86ec9cd7318c5a0a52a1517687f68459bff3f78faf287b26983c` |
| authority-green.log | Actual-entry fixture passes. `622c99be2705012adb9b3ebae49a1fbbbc3f5207c0119e471daa98a7a91d1cf9` |
| report-privacy-green.log | Public CLI reasoning report privacy passes. `53dbc89f727694407f265605e7f0b42afe1d952d4a9f9a8c0eb52e2392fa8bc6` |
| r2-full-node.log | Complete536/536pass on coordinator's fixed source; this does not waive residual F-02. `40d1d9138f66186d91dd681fe0978ddf01e78ea2c05a11e3e8b2c2ff054a7401` |

r2-types.log contains tsc --noEmit with no error; coordinator reports typecheck success. Complete browser/golden/public normal offline/prepare/default and final identity/grant binding were still pending in the supplied evidence when this review was prepared. No success for those stages is asserted here.

## Boundaries

The corrective changes retain the same endpoint/model/native request contract,1/3/4 admission caps, no retries/fallback/resume, one-use grant/episode markers, old pilot live disabled and old frozen/failed receipts intact. No real configuration/provider call has been performed by this reviewer. Read-only shell/source/log/hash inspection only; no SDK, JS, Pi, browser, network or behavioral test execution. Only this ignored report was written. All code fixes remain the coordinator's work. Preserve this NO-GO and issue a fresh review for any corrected source; no paid execution before scoped code/evidence GO and exact final grant/command binding.

## Candidate fingerprints

| File | SHA256 at reviewed source |
| --- | --- |
| `tests/trigger-smoke/observations.ts` | `0a8a63244f5264fe9372faab8f8c77c7d9a800fc17fcacd82a42a83c44e3ce4d` |
| `tests/trigger-smoke/policy.ts` | `6a46bd31864033d434e66ef0531ebd59b45f832d70dcbb73e253ab5128fd3fa3` |
| `tests/trigger-smoke/profile.json` | `a2746ccc5af09c397737b0f9f5fea334627500b48fa4bf2daf2558b9d38200a0` |
| `scripts/trigger-smoke.mjs` | `5473923aa90ff24342838260bf78b643e7b2d061a50faf04c53554e97e028d36` |
| `tests/trigger-pilot/worker.ts` | `6a58ac11a6377f65ed291004afabd7c8868a57f586db9c065df58c36184e3018` |
| `tests/trigger-pilot/contracts.ts` | `a43cb655576b206d57ed3e81248dabe4a99324a3c83a75b38828b8eab74a157b` |
| `tests/trigger-pilot/control.ts` | `a350887f66f00dca986dc19cb645ad4114649c056211061c5745a4f0a49ce760` |
| `tests/trigger-pilot/offline-read-guard.ts` | `6429b5bacc4bfb5d3ee2c09e59e206f2a3310415f20c50d82e0cdd515aeeb582` |
| `tests/trigger-pilot/diagnostics.ts` | `ae9496c3eca20e5809792fbe5a3051c4a130b68b3fe4d6262a3e718675c2bdb0` |
| `tests/trigger-smoke-authority.test.ts` | `377a24ce2165eacb3d0eb3651bda959284dbbdd5c869548c19fd0abb5f11a10a` |
| `tests/trigger-smoke-sdk.test.ts` | `20e18e13e47d0e4d5cae35461512b7b9825b2f5e2ad927211f44c571251f4c42` |
| `tests/trigger-smoke-cli.test.ts` | `b24dc11a584f2e38b64ce7bf148181b32895755dc292daba3f69c3e1f5a1b48f` |
| `tests/trigger-smoke-grant.test.ts` | `6ae99822b2ba5e5c5da65657d0b543c16614658f0ad649452d4527f5c536e30c` |
| `docs/checks/118-trigger-smoke-implementation.md` | `5c9e06331955b3352d8ae57cdb052065ca8d75d258f6b9f1d9db111e9a338fe7` |
