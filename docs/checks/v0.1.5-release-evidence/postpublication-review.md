# Independent v0.1.5 post-publication review

2026-11-14. **GO: 0 open P0 / 0 open P1 for the published identities, downloaded assets and fresh normal Git@tag consumer reviewed below.** These release-verification gates are complete within this scope. The user has already authorized subsequent Check/issue/milestone closure and private-fixture cleanup; this report does not claim those tracker/cleanup actions have already occurred. No real-user installation replacement or npm publication is included.

## Live remote identities independently verified

- PR33 is merged/closed; remote API merge commit **`0fc7b65895f7eff9ac1f4197658025d858b1b967`**, reviewed PR head **`da66c2d292f76701370603a09c1a9c7a07779166`**.
- Remote `git ls-remote` reports annotated v0.1.5 object **`41e3f024f51d1e20648b4cc7155d291e45787261`**, peeled commit **`0fc7b65895f7eff9ac1f4197658025d858b1b967`**. Independently computed merge and reviewed-head tree IDs are equal.
- Live GitHub release **445196913**, tag v0.1.5, URL https://github.com/Jackallink/pi-a2ui/releases/tag/v0.1.5, **draft=false / prerelease=false**. A separate releases/latest request identifies the same release/tag as stable latest.
- Archive asset **747057385**, pi-a2ui-0.1.5.tgz,250882 bytes, uploaded; live digest **sha256:9b33ccc1929baade75aca1cf490962f48d89070733286867b74490b4d93af8f6**.
- Checksum asset **747057386**, SHA256SUMS,84 bytes, uploaded; live digest **sha256:8d4af48997b34ff91e984e095159d75023e3d8465b7c108d36391b81d0170abb**.

These are live read-only git/GitHub CLI observations, separately checked against retained producer metadata. The reviewed published/tag identities are fixed under the project's immutability policy; this report does not claim a GitHub-enforced immutable-lock setting. The producer's draft tag-lookup404 handling is a release-discovery incident, not product failure: the retained exact release/asset IDs agree with the published state. No replacement/deletion action was performed by this reviewer or required for this review.

## Independent second download and payload audit

The reviewer independently downloaded both published assets with gh release download into `.local/v015-release-evidence/review-download`, without replacing producer downloads or remote assets. Rehashed the downloaded archive and checksum file; both match the live digests above, and the SHA256SUMS entry exactly names the downloaded archive and digest.

For every one of **71 regular payload files**, independently compared downloaded tar bytes with (a) `git show 0fc7b658:<path>` and (b) the physical normal Git consumer checkout selected by posttag-producer.json. **71/71 equal, zero mismatch.** The archive digest is the previously reviewed release archive9b33…f8f6, not the older candidate ce42…1772 or initial-model0366…eb3a archive. The fresh Git clone's actual HEAD is independently verified as the peeled release/merge commit0fc7b658.

This closes downloaded-asset/tag-source/fresh-install identity. It does not relabel a later receipt commit as the code that produced the immutable published archive. The pre-merge source0253ef35 and later reviewed-head receipts are related by the already reviewed documentation/payload identity checks, and the final merged source is now directly compared rather than inferred.

## Fresh normally registered Git@v0.1.5 consumer

Inspected the actual install log: Pi installs `git:github.com/Jackallink/pi-a2ui@v0.1.5` into an isolated project .pi/git clone, checks out the tag detached at0fc7b65 and installs21 production dependency packages. Inspected producer records identify the private project/agent directory rather than real-user settings. Current physical clone is preserved for this audit; no install command was run by the reviewer.

Under the existing private Node24 wrapper, with an explicit major24 assertion, independently ran the actual Git consumer's prebuilt helper: **Node v24.18.1, package0.1.5,32 catalog types,8 pattern descriptors,19 available examples**, with matching catalog identities. Independently checked no physical tsx/TypeScript/esbuild/Pi/typebox copies in that Git package's node_modules. The producer separately executed all19 example→check compilations, with exact downloaded/source/install equality and no consumer build; its hashed helper receipt is inspected evidence, not newly rerun19-example work. Previous independent package verification had already compiled/checked the identical helper/templates; no payload changes warrant repeating the full suite.

Inspected the actual posttag-registered-test.mjs and fresh posttag-new/result.json: normal RPC startup has **no explicit -e/--skill/--no-skills overrides**; commands expose both a2ui and skill:pi-a2ui through ordinary registration. With external fetch denied, the copied actual015 checkpoint restores an editable form and enhanced Branch picker; header Find actions opens the current declared submit and closes normally. Assertions establish **0 agent runs / 0 browser errors**, bootstrap fragment cleared, owned Pi process exited and listener released. This is a real post-publication normal Git@tag browser restore; it does not invoke a model or pretend to exercise a new roundtrip.

The posttag consumer aggregate records same project-scope registration, private project/global-marker preservation, original model-session hashes unchanged and user checkout/install untouched. Those preservation claims are producer evidence inspected alongside the copy-only harness; the reviewer did not read auth/model configuration, mutate either registration scope or claim a new whole-user-state audit. The actual successful posttag harness is the unchanged file with SHA256 `a6f7cd884bc27ba997310f0e1603674d00bbe0171497b1176554bd8134b0d477`; there is no new posttag harness-repair history introduced by this review.

## Model and publication boundaries retained

The previously accepted model evidence remains exact Ark AgentPlan volcengine-ark/glm-5.3-flash endpoint-preflighted evidence: actual skill/reference/helper use, one successful model-authored render, native bash timeline, resumed invalid0POST → typed palette submission → matching JSON acknowledgement. It remains **segmented/resumed acceptance, not a clean single cold harness pass**; the three earlier implementation-stage harness failures remain preserved, and forward browserErrors=0 remains unestablished. They are not erased or converted into post-publication inference results. The published release notes preserve these distinctions and the current-run/earlier-or-empty snapshot persistence limit.

No additional inference was needed to prove this published archive/tag and no-model normal consumer: runtime/dist/compiler/helper/templates match the reviewed package. No speculative inference result, complete durable tool audit history or new execution authority is claimed. Earlier014 upgrade/rollback results remain their actual prior-checkpoint evidence; the new post-publication result specifically establishes fresh015 Git@tag normal restore.

## Receipt hashes independently computed

- published-release.json: `4c3f865f01bbf601019abe47380e291374ffc6704a61a6c8a5eb0e996e14b261`
- download-result.json: `df03d5a9a967b781e097217ef89f038decab9823b2ee4c9dd7bfcd5de96b486b`
- posttag-helper-result.json: `285f8a69e7a5390eb9adb86f878818afc0ffc0be968fa2dfd3caec763ec04182`
- posttag-new/result.json: `44b2e47f6130fa5528fd64160bb2b7bd012892d2ab12d61b6cd4ccab5dd33b4c`
- posttag-consumer-result.json: `e1811c1f12f2cccd664c87924d4fda839622dcdfdae965e5fb4ebf2884947246`
- posttag-registered-test.mjs: `a6f7cd884bc27ba997310f0e1603674d00bbe0171497b1176554bd8134b0d477`

Reviewer actions: live read-only remote queries, separate asset downloads, local byte/hash comparisons and read-only production helper commands only. No model, auth/credential-file read, install, source edit, remote write, tag/release replacement or user/private registration cleanup was performed. Only ignored review/download artifacts were written. The already-authorized root workflow can now record Check048, remove only its private test registrations and close the scoped issues/milestone after recording its cleanup receipt.
