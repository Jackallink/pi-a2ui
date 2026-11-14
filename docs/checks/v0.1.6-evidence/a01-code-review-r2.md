# v0.1.6 A01 independent code review R2

**GO for A01 only. 0 open P0,0 open P1,0 open P2; R1 F-01 closed1/1.**

Fixed R2 `89889aef934d70171a471a408046c3d502cdd7eb`; prior R1 `bc224c6e83e71c6d16775fbdd953674b73388854`; full-slice admission base `77080b0`. Worktree `/Users/jakeliu/Workspace/pi-a2ui/.local/release-v014-combined`. Reviewed exact four-file delta: authoring metadata, rebuilt helper, actual metadata/compiler counterexample test and spec alignment. R1 report remains `.local/v016-evidence/a01-code-review.md`.

## P1 closure

`src/authoring-policy.ts:12` now marks DateTimeInput.enableDate and enableTime required=true in authoring metadata, matching the existing compiler's explicit-flag requirement. The runtime date validator, parser/catalog schemas and binding/action/resource policies are unchanged. The spec explicitly records this project-required-vs-SDK-optional override alongside the existing value-presence override, without turning value presence into binding-only runtime enforcement.

The added test uses the real packaged helper to inspect both flags, proves actual compiler rejection when both are missing or only one is present, and accepts the explicit true/false pair. This is the same independently discovered mismatch, now closed with an independent behavioral oracle rather than merely mirroring the helper implementation. Text.text/Icon.name and native default stream conclusions from R1 remain valid; no further metadata-presence P0/P1 found.

## Fresh independent R2 checks

- Node24 `tests/authoring-cli.test.ts`:8/8 passed,0fail/skipped/cancelled. Includes all32actual component lookups, native authoring field filtering, typed nested-cause recovery, no-stdout failures, source-byte preservation/literal compatibility and the new flags counterexamples.
- `tsc --noEmit`: exit0 at the clean fixed89889ae source (only the preserved dependency symlink is untracked).
- Production-option in-memory esbuild write:false parity: committed client SHA256 `828e361f691d58aec2a00576a6ff918aa8811f4c13a7e6e07a3f5184872f53b9`; committed helper `761acccea57e7748165a19942e2230ea15c8b057cf44401f9bd9a58f590d161f`; both byte-identical. Explicit git-show R2 helper hash confirms the identity.
- Read root's DateTime behavioral RED (false required vs expected true),8-case GREEN and typecheck receipts. Their observed SHA256 values are respectively `4dad61ec162bb491717fd90516727267d2f10253f0358cd4ab7a0dd4ecccb551`, `24cda0166d90b5864bfe6726c71854d5d57050256193aa9bbd399737bd74f8cf`, `9c596d01e14a97de1bddb29382c5392740dfe08ee0cbf79dd75f20f68e25acfd`. Root's RED is not relabeled as this reviewer's rerun; R1 independently reproduced the defect.

R1's original dirty-tree helper parity observation was discarded and its report corrected using33committed source/config files in an ignored parity copy. Exact R1 helper was `ee98c278f89aca74f0256ec928d8bfab29e1a2da106d5d958bd617afc3ebbe20`; R2 helper is761acc... above. These distinct identities are not conflated. R1 independent16focused/verified173root-full evidence remains at its stated boundary; no unnecessary full173 rerun was performed for this metadata-only correction.

## GO boundary

GO covers A01 component/diagnostic helper implementation and allows the normal recorded A02 TDD progression. It does not establish A02/A03, whole016/browser/normal production package/actual GLM/merge/release/global replacement acceptance. No runtime validator was added or weakened, no published015 installation or credentials were read/changed, and no model/install/remote/product mutation occurred in this R2 review. Only this ignored report was written; R1 diagnostic parity copy and dependency symlink preserved.
