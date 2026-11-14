# v0.1.6 final authoring independent review — R1

- Decision: **NO-GO** for A01+A03 final authoring acceptance: **0 P0, 1 P1, 1 P2**.
- Fixed candidate: `a749757328c0a15eccd7eeddac6669fac56f070c`; full comparison base `3b8947d` (main). Worktree: `/Users/jakeliu/Workspace/pi-a2ui/.local/release-v014-combined`.
- Review covers A01 component metadata/project error guidance and A03 progressive skill, README, references, version/changelog, executable documentation. A01 R2 `89889aef934d70171a471a408046c3d502cdd7eb` previously received scoped GO. A02 corrected developer scripts at `0e57b8e` have a separate independent R2 reviewer; this report does not substitute for that review.
- Intended contract: spec011 A01/A03 and Check050–055. Read-only product review; only ignored evidence written. No inference/model, credentials, installation, remote mutation, publication or real user file changes.

## Findings

### P1 — First documented workflow truncates an existing project file

`skills/pi-a2ui/SKILL.md:14–18` explicitly retains the caller's project cwd and then redirects the template with `> form.express`. `README.md:66–68` repeats the same fixed filename. The shell truncates an existing file before invoking the helper. This new recommended first path can silently destroy an existing user's form, despite describing its source as temporary.

Independent behavioral counterexample: created an owned temporary cwd, wrote `form.express` containing a unique user-owned sentinel, extracted and executed the actual first skill shell block with the helper's absolute path under Node24. Result: exit `0`, check stdout keys `["surfaceId","source"]`, **existing form preserved = false**. The private cwd was removed afterwards. This is an actual overwrite counterexample, not a setup or compilation failure.

Minimal correction: create a new uniquely owned source file safely, retain quoted paths and caller project cwd, and adapt/check that returned filename. A stdin-only README path is also suitable when no adaptation is shown. Add an executable-documentation sentinel case proving pre-existing `form.express` survives. Do not solve this by writing into the installed package or asking permission for an avoidable collision.

### P2 — Error guide names a field absent from component query output

`skills/pi-a2ui/references/syntax-and-errors.md:20` tells the author to run `component NAME` and use “its filtered `allowedProperties`”. The actual component query exposes `.component.parameters`; optional `allowedProperties` belongs to the error envelope. `references/helper.md:15,28` already distinguishes the two correctly.

Minimal correction: use `component.parameters` for component metadata, and `error.allowedProperties` when present for an error's suggestions. Keep the existing project hint/reference guidance.

## Verification and positive closure

- Independently ran five focused files with the Node24 wrapper: `tests/skill-docs.test.ts`, `tests/authoring-cli.test.ts`, `tests/skill-patterns.test.ts`, `tests/skill.test.ts`, `tests/package.test.ts`: **24/24 passed**, no skips/cancellations. They cover all32 component query metadata, actual DateTime flag contract, causes/errors/literal compatibility, all19 examples/32type coverage, all8 routes, executable first recipe and reference links, version0.1.6 identity. The first-recipe test uses an empty cwd and therefore does not detect P1.
- Independent `tsc --noEmit`: exit0, empty `.local/v016-evidence/final-authoring-review-typecheck.log`.
- Independent non-writing esbuild regeneration matches committed `dist/client.js` and `dist/assistant-cli.mjs` byte-for-byte; `src/client.css` equals `dist/client.css`. Client SHA256 `828e361f691d58aec2a00576a6ff918aa8811f4c13a7e6e07a3f5184872f53b9`; helper SHA256 `761acccea57e7748165a19942e2230ea15c8b057cf44401f9bd9a58f590d161f`. Verified no dirty source/dist changes at this check. The dirty follow-up developer scripts/tests are excluded from the pinned assessment.
- A01 R2 flag correction remains intact; no new metadata/compiler P1 found. Component guidance uses named parameters and public schema information with project restrictions, rather than introducing another validator or copying unavailable SDK prose. Existing output/error/exit behavior remains covered.
- The short path keeps known-template discovery optional, preserves exact successful check arguments for `a2ui_render`, and reserves component queries for uncertain parameters. No19-template/8-route omission found. Local helper/catalog identity is distinguished from active Pi capability. Node24 and Git/local installation scope are explicit.
- README distinguishes the published0.1.5 tag from the0.1.6 candidate. Check055 explicitly leaves final production/archive and actual GLM evidence outstanding. No false completed0.1.6 release/model claim found.

## Acceptance boundary

The reported historical189Node/45browser counts in Check055 are not re-executed or relabeled as this review's evidence. Browser runtime code/bundle is unchanged; no new browser test was necessary for this documentation review. No claim is made about final archive/consumer installation, real model acceptance, production, merge, tag or publication. Close P1/P2 in a new fixed candidate and perform a limited independent re-review before final authoring GO.
