# #67 independent design review R1

Date: 2026-11-17. Reviewer: independent subagent, gpt-6.1-sol/high. Scope: design, fixed real-renderer prototype samples, implementation test intent, and manual Pi handoff only.

**Decision: NO-GO pending three P2 corrections.** P0: 0; P1: 0; P2: 3. Gate1 completeness: NO-GO. Gate2 test-intent admissibility: NO-GO until the matching tests below are specified. The general theme direction, implementation boundaries and most test intent are sound. This is neither product behavioral RED, product full CI, code GO, release acceptance nor permission to start Pi.

## Fixed identity and evidence

Reviewed branch `codex/67-render-polish-design`, source `f8de033f1bf6ff0ca5cf834bfa55d82c2a27b0bf`, tree `bb5d2d84133acc6f9a2a87e320054b567199b1f9`; product base `0c1fe67649b3f61d520ca0318f7dd977a208b3b5`, package 0.1.11. Working tree initially clean. Git base-to-source diff contains docs only; no production changes. Read root AGENTS/RTK, Spec028, Plan028, Check130, all three walkthrough rounds, design README, handoff, preview CSS, capture script, gallery, manifest, design CI, coverage/contrast/style/preservation records; inspected current table/chart implementation, schema, SDK style adoption and package configuration.

| Artifact | SHA256 |
| --- | --- |
| Spec028 | b3374c26d9a89ac18ac11a25d5ce04cfedebdc6c55053832ff1b2c08283e17e8 |
| Plan028 | 11b78cf122b0569ae6381bc98c3e09d996b38c4bc50274930ff4b1a7daebc831 |
| Check130 | 286cfa9020c41d00fe62bed342464c27e8377066ae4c39f4de44349107353b93 |
| pi-handoff.md | fb10eafaa920dc410a6fffc3921c64634f1db69bfcba229e17ea861f89e2e6e0 |
| capture-manifest.json | 76be8ef6807882a83ca16ba36dc3059a3bc42c8ad373d1a38ed6ae8a88852ec4 |
| capture.mts | 206441229b37eae75778ad229f0b2161128177fdfb0b743971db2cca228b2c9b |
| preview.css | d23dc2badde1d9944ee57a5f28359693ebace2350ae4dff8c5ab1b9498edd64c |
| overview.png | fd2fb36dc38a0752fd135c49d797354f1b07e28256e352d0be7fe1a83f995474 |
| gallery.html | 1aa02c0f0063a287e7aea1fa1fd21add1faee35bebcfd293d7c03fe2d9957f76 |
| design-ci.json | ec12dc8d190b2408765395c52433bd99953144a3c39b114f212ead9db9613eb6 |
| component-coverage.json | 13de93265a2c9045720a79813bac02e349c407213b50733bd4835fdaa15d85ad |
| contrast-pairs.json | 089542d073ee095b8799bc9d2463e2232ce444ee02c2afcf4f651ac553dbce71 |
| product-preservation.json | 1895697b38f58ba36cdc988beac8ae596b9369042f258e6c75421ba82152d8da |
| .local/render-polish-design/design-ci.log | 4f7e0dd5fb1ff5f2d88f44ce681d9d3b79a905849278386de0fa69ee277609bf |

Independently rehashed all 48 public PNGs against the manifest, all 6 Express files against recorded source hashes, and all 24 before/after pairs for identical source and server snapshot hashes. All matched. Public manifest and 48 images byte-match owned raw `run-0SYqvJ`. Independently compared all 77 preservation entries (76 payload plus lock) to both current disk and baseline Git bytes; all matched. Manifest's separate 73 tracked runtime/style/manifest hashes also match disk. Recorded body overflow is false in every capture. Independently recomputed all 11 contrast pairs; values and thresholds match. These facts establish artifact identity and the stated bounded observations, not full accessibility or product acceptance.

Raw capture log identifies `run-0SYqvJ`; final process exit0 is recorded in design-ci. Capture uses real UiSession/startServer and baseline dist, no injected CSS for before; after injects preview CSS and bounded legend/grid/line-style/numeric markers. It asserts server snapshot, chart original table, RP06 draft, three invalid-form errors and primary-button white computed label. Page routes block external requests and business POSTs; manifest reports external/action/dispatch0 and no page errors. No replay was performed in this review. Full product CI, Pi, provider calls, user config/credentials, hosted workflows and GitHub writes were not run.

## Findings required before design GO

### R1-01 [P2] Keep numeric and boolean table tokens readable on narrow screens

Evidence: `docs/designs/028-render-polish/preview.css:11,16,21` combines unrestricted cell wrapping with shrinking column allocation and only right-aligns numeric cells. `samples/RP02-long-table-mobile-after.png` visibly renders 158 as `15` / `8`, 12040 as `12` / `04` / `0`, and false/true as split fragments. RP01 mobile similarly splits 4320/3180/4980. RP02 before kept 158 on one line, so the after design worsens that observable value. Original source/type preservation and bodyOverflow=false do not establish data legibility. The stated long-table/local-scroll design lacks an explicit atomic scalar rule and matching acceptance test.

Required correction: define a local presentation rule preserving complete numeric/boolean tokens (and sensible column headers) while allowing long textual paths to wrap, using bounded table layout/local horizontal scroll when needed. Do not stringify source numbers, alter rows/sort/schema, add props or add a formatter API. Correct affected design CSS/samples in a new owned run, retain old raw and baseline, and record the design delta. Add AC-003/005 and Plan T1/T2 test intent that checks 360px/actual zoom scalar geometry (not textContent alone), original value/type and usable local scroll with no body overflow; include at least 158, 12040, decimals/signs, true/false and long paths. A DOM Range/line-box or independent geometry oracle can detect a token spanning multiple visual lines. Actual implementation RED/GREEN remains later.

### R1-02 [P2] Define scale-safe tick labels within the existing finite-number contract

Evidence: `src/live.ts:7` accepts arbitrary finite numbers. Spec028:55-57 permits bounded formatting but does not forbid nonzero values appearing as zero or long magnitudes overflowing the tick gutter; Plan028:34-38 lacks corresponding numerical-scale cases. `capture.mts` uses maximumFractionDigits2. A read-only Node24.18.1 oracle confirmed tick values `[0, 5e-7, 1e-6]` all format as `0`, while 1e308 produces a hundreds-character decimal label. Current RP01 ordinary positive values do not expose this.

Required correction: specify bounded internal tick display with adaptive significant digits/scientific notation (or an equally falsifiable bounded choice), preserving sign and exponent so nonzero ticks do not appear as zero and distinct relevant ticks do not collapse misleadingly; normalize negative zero. Keep labels within a defined gutter, retain exact original table values and same coordinate domain. Add tiny/large positive and negative/mixed finite corpus intent, plus display-label and geometry checks. This is a display rule, not a new product formatting API or a change to validateSeries/domain/updateChart. No extra design screenshot corpus is required for these unimplemented boundaries if the design records that limitation and the exact implementation intent.

### R1-03 [P2] Bind the Pi working session to the authorized route/model unconditionally

Evidence: Plan028:12 says working model configuration is user-controlled; handoff:24 says the model follows user configuration and only conditionally says "如用户采用既定模型，只用glm-5.3-flash". This is weaker than the user's retained working-session constraint: Ark AgentPlan / glm-5.3-flash only. A future Pi agent could read it as permission to use an already-configured different paid route. The explicit prohibition on additional model evaluation is otherwise clear.

Required correction: say unambiguously that any user-manually-started Pi implementation session must already use Ark AgentPlan `glm-5.3-flash`; if absent/mismatched, stop and report without modifying user/global configuration, exposing credentials, running provider probes or selecting a fallback. User manually starts Pi; this chat only supplies the prompt. Keep real model evaluation budget0, frozen/old grants untouched and no automatic implementation trigger. Apply consistent wording to plan and handoff. No model call is needed to validate this text.

## Assessment of the remaining design and test intent

- Gate1 otherwise has explicit scope/non-scope, source-bound behavior, user paths and error matrix, AC mapping, file boundaries, risks/rollback and two-stage acceptance. The SDK0.15.0 code really has adoptLightDomStyles; retaining root strategy is correct. Existing Text only body/caption and restricted Markdown headings are correctly handled. Root client.css token ownership with component-local style rules is feasible; its non-leakage claim is accurately bounded across common-theme surfaces. No kernel repair, new component/schema/props, dependency, React, remote font or theme API is needed.
- Gate2 intent is broadly feasible: computed font/token consumption is a meaningful changed-behavior RED; numeric alignment and missing legend are observable changes; stable sort, invalid0/valid1, full snapshot/POST/draft, dynamic patch, pause/inert and keyboard focus checks protect invariants. Existing already-passing invariant tests should stay regression GREEN; they need not be artificially made RED. Setup/compiler/fixture failures correctly do not count as changed-behavior RED. TDD approval remains dependent on later actual executable RED evidence, not this design review.
- Visual inspection used overview plus RP01 desktop/mobile after, RP02 desktop/mobile after and mobile before, RP03 desktop/mobile after, RP04 desktop/mobile after, RP05 desktop after and RP06 mobile after. Desktop hierarchy/cards/spacing and primary actions are coherent. Form errors retain visible text, visible focus and white-on-indigo action text; states/logs explicitly label illustrative data. Diff retains +/- evidence. Narrow chart/code/log cropping is consistent with permitted local scrolling, but operability/hit-test/keyboard must still be proven later. Table scalar fragmentation is the concrete exception above. No closed-Modal screenshot or palette table establishes full keyboard, focus, contrast or interaction coverage.
- 32 component coverage is an honest matrix of captured versus uncaptured types. Actual desktop200%, Modal-open/sending/disabled, all32 computed styles, chart empty/zero/negative/4series/bar and dynamic patch are explicitly deferred. Reflow-equivalent640x450 is not desktop zoom. Contrast pairs are palette checks only. Prototype snapshot equality does not prove a future implementation preserves browser event/context or patch behavior.
- Plan T1-T4 with generated dist, narrow checks then fixed-source full Node/type/all four browser groups plus new suite, compatible strict golden union, prepack/owned normal installation/discovery is appropriate. It preserves platform pixel caveats and frozen evidence. No build/full CI or production pass is inferred here. Rollback separated into theme, chart/table display and skill is sufficient for this no-migration scope.

## Allowed next step

Correct only the three design/test-intent/handoff issues in a new docs-only commit and new owned preview run as needed for R1-01; preserve this fixed source and all prior raw. Return the new fixed commit/tree, manifest/artifact hashes and correction mapping for independent re-review. Until a fresh explicit GO, do not hand off as implementation-admissible or start product work. A later design GO can move the design to walkthrough-approved and permit delivery of the bounded manual Pi prompt; Pi must still establish actual Gate2 RED before implementation and stop review-ready for independent code review. No merge/release/global-upgrade/issue-close authorization follows.
