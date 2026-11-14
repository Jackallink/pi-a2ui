# Independent v0.1.5 pre-merge release review

2026-11-14. **GO for the exact release source/archive below: 0 open P0 / 0 open P1.** User approval already covers PR33 merge, v0.1.5 publication, subsequent verification and issue closure; no repeat permission request is required. This review closes the bounded pre-merge package/documentation check. It does not claim publication, downloaded-asset verification, a fresh Git@tag consumer or issue closure has already happened.

## Fixed release identity

- Release source: **`0253ef35c01e0e4556ef2070b9b9bc8423f59c64`**; HEAD independently matched.
- Reviewed change base: `ee73df0`; previous package source `f0f1805fc14348a967f7a723f857a89ac7319640`; previously independently reviewed main implementation `dc14b8dd0edd361d086f90b8d3baa4d051a39440`.
- Release archive: `.local/v015-release-evidence/assets/pi-a2ui-0.1.5.tgz`.
- Independently computed archive SHA256: **`9b33ccc1929baade75aca1cf490962f48d89070733286867b74490b4d93af8f6`**. The bundled release SHA256SUMS entry matches exactly.
- **71 payload files**. Independently compared each archive payload byte-for-byte with both `git show 0253ef35:<path>` and the actual production package selected by producer.json: **71/71 equal, zero mismatch**.

The source diff contains four documentation files only: README, release guide, spec008 authorization paragraph and the Round3 release-closure addendum. There is no runtime TS, extension, browser distribution, CLI, schema, dependency or manifest change. Independent comparison with the previous reviewed ce42eb9…1772 archive found **exactly one changed payload path: package/README.md**. Other documentation changes are outside the package payload. No previous immutable tag/asset identity is replaced or silently relabeled by these comparisons.

## Installation and documentation review

`README.md:15-40` and `docs/releases/v0.1.5.md:3-18` correctly select Node24.x, require Pi>=1.5.0, use the pinned Git ref `git:github.com/Jackallink/pi-a2ui@v0.1.5`, and preserve the intended Pi project as cwd. `-l` selects project package settings; `--approve` explicitly trusts project-local files for the command. The local route installs production dependencies with omit=dev, ignore-scripts and legacy-peer-deps before registering the absolute path. Prior Git/local registration is removed in the same scope to avoid duplicate loading; /reload and immutable0.1.4 rollback are retained. Published refs remain pinned; the new instructions do not promise that updating a pinned tag automatically advances it.

The guide explicitly distinguishes already-recorded candidate evidence from future publication/download/Git@tag receipts. Spec008's authorization and Round3's release sequence align with the user's current approval. Real-user installation replacement and npm publication remain outside this task's authorized scope. No extra approval gate is introduced by this review.

Also inspected the prepared release-notes.md and SHA256SUMS. They name this exact9b33…f8f6 archive, describe32 types/8groups/19templates correctly, retain Node24/project-scope/approve/local-dependency installation guidance, preserve known upstream and current-run persistence boundaries, and explicitly distinguish segmented model acceptance and pending downloaded-asset/Git@tag checks. They do not repurpose historical candidate hashes as the published archive.

## Targeted independent offline checks

All Node checks used the existing private wrapper via bash and an explicit major24 assertion; observed **Node v24.18.1**. From the separate consumer project, ran the actual release production package's prebuilt helper without a TS loader or build:

- catalog identifies package0.1.5 and32 actual types;
- patterns identifies exactly8 descriptors and the same catalog identity;
- examples lists19 resources;
- actual example validated-form compiles, and stdin check returns exact `{surfaceId,source}`;
- physical production dependency tree has no tsx, TypeScript, esbuild, Pi or typebox host copies.

These targeted checks supplement the earlier independent19-example/package review because this release changes only README payload bytes. No full suite or inference was repeated by the reviewer.

Inspected fresh producer logs: Node **166/166**, Chromium **45/45**, and the recorded tsc invocation completes without diagnostics. Root additionally reports successful fresh build/parity and skill-format validation; this review does not mislabel those producer results as newly executed reviewer checks. Independently hashed the inspected raw logs:

- node.log: `b8bf4d54f7fbc2734c54ec37945fa9c207afa2322ba3dbb5ce4f82b31de6c74f`
- browser.log: `166dea1243d3eab46cc2115918627512940f429bf805f71d0d16ea023970655f`
- typecheck.log: `9c596d01e14a97de1bddb29382c5392740dfe08ee0cbf79dd75f20f68e25acfd`

## Inherited model/consumer evidence and next-stage boundary

The actual authorized model evidence remains the previously inspected Ark AgentPlan volcengine-ark/glm-5.3-flash evidence with exact endpoint preflight, real reference/helper use, one successful render, native bash timeline and resumed invalid0POST → typed palette submission → matching assistant JSON. It is **not a fresh release-time inference run or a clean single cold harness pass**. Three harness failures remain preserved; forward browserErrors=0 remains unestablished. The current release guide states these limitations accurately. Model evidence is inherited through the explicitly proven documentation-only delta, not through a fabricated new model success. The release differs from the original actual-GLM archive in README plus the already-reviewed keyboard-actions wording only; runtime/compiler/dist/templates are unchanged.

Earlier normal registered new-resume/014-upgrade/014-rollback evidence is likewise retained at its actual package identity. Root's planned post-publication checks must independently establish immutable downloaded assets and a fresh normally registered Git@v0.1.5 consumer at the released tag, with no-model restoration and preserved original data. Those later results are **pending**, not certified by this pre-merge GO. Issue/milestone closure follows their success under the already supplied user authorization.

Additionally inspected the new release package's own producer identity receipt and restore-new/result.json: normal package/skill discovery without explicit extension/skill flags, restored compatible015 surface,0agent runs,0browser errors, external fetch denied, fragment cleared and successful process/listener cleanup. This is an actual pre-publication local-release-package restore receipt; it does not replace the later fresh Git@tag validation.

Reviewer actions were read-only for source/product/installations: no inference, auth/model configuration read, install, remote write, merge, tag or publication. Existing untracked node_modules was preserved. Only this ignored review report was written. No P0/P1 blocker was identified within the exact pre-merge review scope.
