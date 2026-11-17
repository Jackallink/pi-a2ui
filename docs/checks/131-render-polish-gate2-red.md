# Check 131 — Render polish (#67 / Design028) Gate2 real RED

Implements the Gate2 requirement from `docs/designs/028-render-polish/pi-handoff.md` and Plan028: before any product change, the T1+T2 test intent is recorded as a real executable RED run over the real UiSession/startServer/browser pipeline, with setup/compiler failures separated from changed-behavior RED and existing invariant contracts kept as regression guards. Independent design GO is Check 130 (R2). This check does not claim product acceptance; 样张不是产品验收证据.

## Scope of this run
- Branch `codex/67-render-polish` created from the fixed design commit `454c6e510aa0bca8aaa164a2465173ef1528e39b` (docs-only design payload on the 0.1.11 baseline). Working tree at run time: exactly two new test files, zero product modifications (`git status --porcelain` = `?? tests/render-polish.spec.ts`, `?? tests/render-polish.test.ts`).
- New files (hashes at run time):
  - `tests/render-polish.spec.ts` sha256 `47a87fd75f9ec95c345a916b938f054b74e502b8a682aea28e98aa62dee6581b` — browser RED suite (31 tests).
  - `tests/render-polish.test.ts` sha256 `643338cb4b9863e6db9d22be1843fde3e2d99cd8df3bfcf04c3e5b6e225656ed` — fixture/corpus validity guards (2 tests, both passing; setup evidence, not RED).
- Test inputs are the six design fixtures `docs/designs/028-render-polish/fixtures/RP01..RP06` plus two inline single-purpose surfaces (mixed-type column, tie stability) and 10 Chart surfaces serialized from the hand-authored oracle `docs/designs/028-render-polish/chart-corpus.json` (schema `rp67-chart-design-corpus-v1`, 11 cases; the `empty` case is exercised as a regression guard). No screenshot, sample or preview CSS is consumed by any assertion; every changed-behavior assertion reads computed styles, ARIA state or real DOM over the served canvas.

## Environment fingerprint
- Node v24.18.1 (nvm), session model bound per handoff (Ark AgentPlan / glm-5.3-flash, no provider probes sent).
- Browser: locked Playwright headless shell `chromium_headless_shell-1254` → Chrome for Testing **158.0.8127.18** (same family as Check 130), `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` selection, `--workers=1`, DPR1, light, en-US, UTC, reducedMotion reduce.
- Server/renderer: current source at `454c6e5` (no dist edits, no preview CSS injection).
- Raw artifacts under `.local/render-polish-red/`: `red-run.txt` (full Playwright list output of the recorded run), `env.txt` (versions/commit/hashes), `t3red.*` (T3 lookup RED), plus `red-run.json` earlier diagnostic run superseded by `red-run.txt`.

## RED evidence (changed-behavior, all failing for the intended reason)
`npx playwright test tests/render-polish.spec.ts --workers=1` → exit 1, **22 failed / 9 passed**, no page errors, no unhandled setup failures in the recorded run:

T1 (6):
1. `body, table filter input and header button share one system font at 14px` — AssertionError: filter input computed font-size **13.33334px** ≠ 14px (UA control size today; canvas body is 16px today).
2. `captions, canvas background, surface text and accent consume the approved tokens` — AssertionError: body background **rgba(0,0,0,0)** vs token `rgb(245,247,251)`; caption/sub-12px SDK scale and h2 28px not yet applied (asserted in same test).
3. `primary button uses the approved accent with a white label` — AssertionError: submit background **rgb(189,77,56)** vs accent `rgb(54,92,219)`.
4. `keyboard focus shows a solid accent outline on inputs` — AssertionError: focused TextField outline-style **none** (SDK removes the outline today) vs required solid 3px `rgb(29,78,216)`.
5. `validation errors are readable and state is not color-only` — AssertionError: error section text **rgb(153,27,27)** vs `rgb(180,35,24)`; transparent error surface / 1px border today.
6. `summary cards stack in one column at 360px without horizontal overflow` — AssertionError: summary card width **99.3125px** (SDK Row never wraps) vs required full-column stacking.

T2 (16):
7. `numeric cells right-align by derived type while strings stay left` — AssertionError: numeric column header computes `left` (no derived numeric alignment exists).
8. `string digits are never coerced into numeric alignment` — AssertionError: number cell computes `left` (mixed-type surface; string `"77"` must stay left, number must go right).
9. `scalar cells stay atomic and every scalar column is horizontally reachable at 360px` — AssertionError: scalar table does not scroll horizontally at 360px today (cells wrap instead of staying atomic; data-rp-scalar marker does not exist yet).
10–25. Chart legend/ticks (12 legend/tick tests + dashboard ticks + four-series legend + 10 corpus tick cases): `expect(locator).toHaveCount(…)` failed — **no `.rp-legend` legend and no `text.rp-tick` ticks exist today**. Corpus labels are the hand-written oracle from `chart-corpus.json`; the tests do not re-derive them from the implementation.

## GREEN regression guards (already true at Gate2, must stay true through T1/T2)
- Sort semantics: numeric order 0,8,77,158,12040 (never `"158"<"77"`), lexicographic string order, exact reverse descending, tie stability both directions (`first/second` keep document order), `aria-sort` toggles, filter round-trip, **zero business POSTs**, **server snapshot byte-identical** after client sort/filter.
- Chart empty corpus case: zero ticks + existing `No data yet` copy.
- Chart original value table: exact per-cell series/label/value (never rewritten).
- RP03 valid submission: exactly one forwarded action envelope `collect_asset` with the three typed values; local invalid submit posts nothing.
- RP06 draft: typed value survives color-scheme emulation + 360px↔1280px resizes with zero POSTs (presentation-only changes never touch the model).
- RP04 pause: pause holds old output, resume shows newest streamed data, no POSTs.
- RP05 states/modal: status badges, empty/loading/error table copy, modal open + Escape close, snapshot untouched.
- Suite state: no page errors, no provider requests, no business POSTs on a presentation-only pass.

## T3 lookup RED (recorded, not yet a committed test)
`node skills/pi-a2ui/scripts/a2ui.mjs example visual-summary-data-digest` → exit 1, empty stdout, stderr `{"error":"Unknown example; use examples to list allowed names","code":"LOOKUP",…}`; `component visual-summary-data-digest` → exit 1 `LOOKUP`. This is the documentation/metadata RED that T3 turns GREEN (new on-demand subdocs + manifest entries + bounded assistant-guidance notes), with recipe tests added to the existing `tests/skill.test.ts` / `tests/authoring-first-use.test.ts` files at that step.

## Gate decisions and risks
- Setup failures observed in the first diagnostic run (Express bracket typos in two inline sources, `expect.poll` arity, unassociated TextField labels vs accessible-name selectors) were fixed and are not counted as RED: Gate2 counts only the 22 changed-behavior failures above, none of which are compiler/setup errors.
- SDK TextField renders `<label>` without `for`/id association, so RP03 field selection is positional (`getByRole('textbox').nth(0..2)`). This is the existing DOM/aria contract and is deliberately **not** "fixed" here (handoff forbids changing aria/input contracts); noted as a separate, out-of-scope improvement suggestion for a future issue.
- `data-rp-numeric`/`data-rp-scalar` markers, legend/tick class names (`text.rp-tick`, `.rp-legend`) are the derived internal visual markers this suite pins; they must appear in T1/T2 implementation and stay stable for these tests.
- Next: T1 (theme/typography/focus/component visuals) → T2 (table numerics, scalar atomicity, chart legend/ticks) with these tests turning GREEN, then T3, then T4 full local CI. `npm test` stays green at this boundary (fixture validity passes; browser RED is a separate runner and does not block the Node suite).
