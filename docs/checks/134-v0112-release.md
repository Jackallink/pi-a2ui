# v0.1.12 release evidence

The current task releases the reviewed, gated issue #67 render-polish state as 0.1.12. The shipped delta versus v0.1.11 is exactly the Spec028 render-polish surface — `src/client.css`, `src/live-elements.ts`, `src/table-elements.ts` and the rebuilt `dist/*` — plus release metadata, design/check records and the extended test suites. No data type, sorting, draft, event or permission contract changed. Release validation uses zero inference; benchmarks in CI remain synthetic-only and the frozen real-v1 files are unchanged. GitHub Actions stays disabled; local Node24 CI only.

External review status at release: the independent full review R1 (NO-GO, 4 P2) was repaired in corrective commits; the internal codex loop converged (R2 4 blocking → R3 5 blocking, all mechanical blockers fixed, gates green) and was stopped per the AGENTS.md §2.4 fuse with one open item — the Spec028:63 actual desktop 200% browser-zoom record, which requires a human desktop operation headless CI cannot produce. The release owner explicitly waived that item as a daily-use follow-up (report issues as they appear); it is tracked in [Check133](133-render-polish-acceptance.md) and the release note.

## Accepted release candidate

Exact clean source `7bc2e2d2e1df1a3400ddca3094e5df2c03869e29` (fast-forward-merged to `main`, pushed), Node24.18.1/npm11.16.0:

- `npm test` **609 pass / 0 fail** (includes 68-case strict golden union: 45 positive, 23 negative; P01/P05 identity tests updated to 0.1.12).
- Six-suite Playwright run (`browser`, `benchmark-model`, `golden`, `visual`, `render-polish`, `render-polish-acceptance`) **141 passed**, BM3 `accepted:true` with `not-comparable/pixelGate:false` baseline preservation.
- Golden union regenerated on the clean tree: `{"source":"7bc2e2d…","cases":68,"positive":45,"negative":23,"node":"v24.18.1","browser":"158.0.8127.18"}` ([golden-union-candidate.json](v0112-release-evidence/golden-union-candidate.json)).
- `tsc --noEmit` clean; `npm run build` deterministic; profile-v2 binding updated to `packageVersion 0.1.12` / `archiveSHA256 373e3a0d…` with policy identifier, caps, model and handoff policy unchanged.

Actual prepack archive `pi-a2ui-0.1.12.tgz`: **78 files**, SHA256 **`373e3a0d78355e328225e2c8cfdedb09cc773f53dbf7b317736edd5af8fb4432`**; `npm pack` byte-determinism verified on the identical tree.

## Consumer acceptance (0 model requests in every receipt)

- **Extracted prepack archive** (official `scripts/live-acceptance.mjs --mode startup`): normal registration, helper identity (packageVersion 0.1.12, 32-component catalog), skill discovery, `/a2ui-status`, external fetch denied, all node processes Node24 within the owned run, package payload and operator files unchanged, private registration removed ([consumer-local.json](v0112-release-evidence/consumer-local.json)).
- **`git:github.com/Jackallink/pi-a2ui@7bc2e2d…`** (candidate): installed HEAD verified at the candidate commit, clean checkout, 4 unique A2UI commands/skill served from the installed checkout, `/a2ui-status` enabled, process exited cleanly ([consumer-git-candidate.json](v0112-release-evidence/consumer-git-candidate.json)).
- **Published `git:github.com/Jackallink/pi-a2ui@v0.1.12`** (tag): installed HEAD verified at the tag commit, same checks ([consumer-git-published.json](v0112-release-evidence/consumer-git-published.json)).

## Publication and machine deployment

Tag `v0.1.12` was pushed and the release published at the tag with the candidate archive and its SHA256SUMS. A fresh public download verified `373e3a0d…` byte-for-byte (`cmp` against the local prepack artifact) with 78 files.

The machine's original user-scope registration `git:github.com/Jackallink/pi-a2ui@v0.1.11` was upgraded in place via the official installer to `@v0.1.12` (global scope, no `-l`); the settings fingerprint changed `559e0ddc…` → `75885360…` with the diff being exactly that one registration entry and no duplicate ([publication.json](v0112-release-evidence/publication.json)). The installed checkout is clean at the tag commit (`package.json` 0.1.12) and all 78 archive payload files are byte-identical to the public archive (13 git-only extras excluded, 0 differing/missing). A real-home, real-settings RPC startup probe with all other registered packages loaded together and the main-project working directory confirmed: unique A2UI commands, `/skill:pi-a2ui` discovery served from the upgraded global package, `/a2ui-status` enabled, no load-conflict or runtime extension-error diagnostics, 0 agent runs/model requests, and clean probe process exit under actual Node24 ([deployment-realhome.json](v0112-release-evidence/deployment-realhome.json)). Existing sessions must restart under Node24 to load the upgraded package.

Honesty note: one unintended real model request occurred during deployment reconnaissance when `pi package list` (not a CLI subcommand) fell through to prompt mode. It is outside release validation, receipts and benchmarks; frozen baselines and receipts are untouched. Recorded in [publication.json](v0112-release-evidence/publication.json).

The Spec028:63 real desktop 200% record remains open as a daily-use follow-up; issues are to be opened from actual use as they appear.
