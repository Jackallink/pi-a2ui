# Independent final code review

Date: 2026-11-13. Final verdict after scoped fix re-review: **GO for the already-authorized bounded local Pi installation/live trial**. Both initial P2 findings below are resolved; their original evidence is preserved as history. No unresolved P0/P1 code blocker found. This is a code review recommendation, not completed real-Pi acceptance, production readiness, publication authorization, or a clean dependency audit.

Reviewed baseline `cf6ed35` through `60bcf9319b4db949aae2eb73a613e52a0f44b3f6`, plus the working package metadata change making the Pi peer optional and the transport/integration evidence records present during review. Read the canonical spec, three walkthrough rounds, design review, SDK characterization, core TDD record and transport review. Inspected all `src/*.ts`, `extension.ts`, tests, package metadata/lockfile, build script and README. No implementation files were changed by this reviewer.

## P2-FR-01 — accepted bindings can fail only when the browser reads or writes them

Location: `src/compiler.ts:92`–`104` (binding admission); `src/session.ts:105`–`109` correctly rejects the resulting missing/non-string submitted context.

The host checks canonical absolute binding syntax and that context refers to a reachable TextField, but does not prove SDK path validity, writability through the initial data model, or string initialization. Independently reproduced with the actual bundled renderer in Chromium:

| Accepted source | Observed browser result |
| --- | --- |
| `root = TextField("Name", $/constructor)` | Zero textboxes; two page errors: `Forbidden path segment 'constructor' in path '/constructor'.` |
| `$/a = "primitive"` followed by `root = TextField("Name", $/a/b)` | A textbox renders, but filling it emits `Cannot set path '/a/b': segment 'a' is a primitive value.` |
| `root = Column([TextField("Name", $/form/name), Button(Text("Submit"), action=Event("submit", {name: $/form/name}))])` | Submitting the untouched blank field shows `Context keys do not match the declared event`, with zero bridge dispatches: undefined bound data is omitted by JSON serialization. |

These are invalid/generated-input and blank-input usability gaps; this review found no authority escape, prototype mutation, stale-session dispatch, or process crash from them. Valid initialized forms and normal filled forms pass the browser checks. They therefore do not block the narrowly bounded local trial. Recommended follow-up: preflight all binding paths using the SDK's path rules and validate writable TextField ancestors/initial string values (or explicitly initialize missing values to empty strings under a documented policy). Rejections should preserve the prior committed canvas; add focused compiler/restore and browser regressions. Do not weaken submitted-context authority checks to work around missing data.

## P2-FR-02 — comments can offset the source delimiter budget

Location: `src/compiler.ts:114`–`141`, original source preflight.

The SDK accepts line/block comments, but the preflight counts comment delimiters as syntax and allows nesting to go negative. Independently executed `compile('x', '// ' + ')'.repeat(1000) + '\nroot = ' + 'Card('.repeat(1000) + 'Text("x")' + ')'.repeat(1000))`. It bypassed the application's delimiter-depth 64 guard and reached SDK `Maximum call stack size exceeded`, caught and returned as a 400 in approximately 17ms. The same construction at depths 65/100/500 reached the SDK's own logical-recursion guard, instead of application-owned 413 preflight rejection. No process crash, successful oversized commit or sustained exhaustion was demonstrated; byte/token bounds still apply.

Recommended follow-up: recognize the SDK's supported comments in the lexical preflight, count only real delimiters, and prevent unmatched closing delimiters from funding deeper nesting. Regression oracles should assert the application's own 413 delimiter error for deeply nested syntax after comments and successful ordinary comment-containing forms. This qualifies the original source-preflight mitigation claim; it does not establish an exploitable denial of service.

## Independent verification

- `npm test`: **32 passed, 0 failed, 0 skipped** (core 22, native HTTP 5, controller/adapter 5).
- `npm run check`: passed with no diagnostics.
- `npm run build`: passed; bundles the official renderer and local assets without a CDN.
- `npm pack --dry-run --ignore-scripts`: passed after build; 15 files include `extension.ts`, required source imports and all three `dist` assets.
- `npm run test:browser` with the installed Chromium 1248 executable: **5 passed**. This independently covers actual official component rendering/context, escaped literal HTML with no external requests, unrelated-surface/reconnect draft preservation, replacement/epoch clearing, obsolete pending POST release and late-completion isolation, and deadline/no automatic retry.
- Additional independent browser probes established the three P2 counterexamples above. Each used real `UiSession`, `startServer` and the generated browser bundle; credentials were handled in memory and not printed.

The default browser command initially failed all five cases before test execution because Playwright 1.65 expected missing Chromium headless-shell 1254. The successful independent run set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to `/Users/jakeliu/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`. The initial environment failure is not behavioral RED evidence.

## Boundary assessment

Authority checks use the committed requested surface/revision/epoch, reachable static Button declaration and exact declared context keys/literals, with bound values limited to strings. Raw legacy `path` aliases, calls, dynamic templates and checks are rejected before returning a committed surface. Only the restricted implementation-backed six-component catalog is used on both sides; functions are empty. Current-branch restoration validates snapshots and never dispatches actions. Operation generations close the lazy-start/reset/shutdown/disable race; immutable copies and listener failure isolation preserve atomic commits. Event IDs are reserved synchronously, bounded without eviction, and conflicting reuse is rejected. HTTP 202 remains one local void Pi bridge attempt, with asynchronous failure and model success outside that acknowledgment.

The maximum-snapshot transport regression passes independently with the fixed SSE framing allowance. The actual-browser pending-action regressions independently pass the operation-identity/abort/deadline repair. Host/origin, credentials, cross-instance cookie rejection, SSE capacity, listener cleanup and shutdown are covered by native HTTP checks. These checks do not establish every slow-network condition, a hostile-parser CPU deadline, or proof of absence of denial of service.

Independent `npm audit --json` still reports **4 high-severity package records**, all deriving from [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5). The reviewed advisory lists Zod `<4.6.6` as affected and `4.6.6` as patched; this pinned SDK generation uses Zod 3. The source/token and JSON/node/cardinality/depth/byte guards precede the relevant SDK validation entry points, and targeted tests demonstrate the application guards reject over-budget inputs. This supports a bounded loopback trial with trusted local processes. It does **not** patch Zod, make `npm audit` clean, prove the SDK parser is resource-safe for every in-budget input, or justify public/remote production release.

Real Pi model → tool → browser → action → same-session next turn, installed-archive loading, and live lifecycle cleanup remain separately observed acceptance work. They need not be completed to issue this code GO, and must not be inferred from it. No public npm/forge publication or remote deployment is authorized by this report.

## Scoped fix re-review and final GO

Re-reviewed the working compiler/test/spec changes for P2-FR-01/P2-FR-02 and the author-provided behavioral RED records in `003-core-tdd.md`. This was a targeted re-review of the substantive fixes, not a repeated dependency audit or a claim that live Pi acceptance had occurred.

- **P2-FR-01 resolved:** canonical absolute pointers require valid escapes and nonempty segments; every component/context binding is checked through the official SDK data model for decoded path safety. Bound `Text.text`, `TextField.label/value/placeholder` and common `accessibility.label/description` must resolve to initialized strings before commit/restore. Missing/scalar-parent/nonstring/reserved-path cases reject while preserving prior state. The accessibility follow-up is restricted to its string properties: the positive `accessibility.hidden:false` binding remains valid. No submitted-context authority check was relaxed.
- **P2-FR-02 resolved:** source preflight skips actual SDK `#`, `//` and `/* */` comments outside supported quoted/raw/triple strings, uses a matching delimiter stack, and cannot grant negative nesting credit. Independently repeated the original 1000-level comment-masked source and observed the application's own 413 `Source delimiter nesting limit exceeded`, rather than an SDK recursion exception.
- **P2-TR-02 remains resolved:** source owns pending actions by operation identity, releases/aborts obsolete epoch/revision work, applies a 15-second deadline, and guards late responses/finally blocks from modifying newer operations. The independent real-browser epoch/revision/deadline checks pass.

Independent checks during this fix wave: whole Node suite **40/40 passed** before the final two accessibility tests; typecheck/build passed; actual Chromium browser suite **5/5 passed** with the initialized fixture. After the final narrow accessibility patch, independently ran the focused core suite **32/32 passed**, 0 failed/skipped, and typecheck passed. The added native slow-consumer HTTP test is parent-owned evidence and is not included in those independent counts.

Also independently re-ran all three original binding inputs and confirmed pre-commit 400 rejection. A real Chromium probe submitted an initialized but untouched blank form: exactly one bridge dispatch contained `"name":""`, the browser displayed `Sent to Pi`, and no page error occurred. Reviewed the old-code logs showing the four missing-exception binding failures, comment-budget SDK recursion/syntax failures, and the final missing accessibility-string rejection; these are author-run RED evidence, separately supported by this reviewer's earlier direct reproductions and current independent GREEN.

**Final GO:** no unresolved finding from this review blocks the bounded local installation/live Pi trial. Dependency caveats and the separation between code GO, installed-artifact checks, real same-session continuation, cleanup, and public readiness remain unchanged.

## Scoped packaging follow-up: host-provided TypeBox

Reviewed the metadata-only follow-up prompted by the parent's real interactive Pi diagnostic. In the installed Pi 1.5.0 source, `dist/core/resource-loader.js` explicitly lists `typebox` as host-provided and warns when it appears in an extension's runtime `dependencies`; `dist/core/extensions/loader.js` resolves TypeBox and its supported subpaths from the host and supplies extension-loader aliases. A separate extension runtime copy is therefore contrary to the loader contract.

The working manifest removes `dependencies.typebox`, declares `peerDependencies.typebox: "*"` with optional peer metadata, and retains `devDependencies.typebox: "1.3.27"` for local development. The lockfile matches and marks its TypeBox package development-only. Independently asserted these manifest/lock facts with Node. No source or browser-bundle change is required for this correction.

**GO for this packaging correction.** Repacking/installing and observing the warning disappear in real interactive Pi remain parent-owned validation; source inspection and metadata assertions alone do not prove that installed artifact was replaced or reloaded successfully. No additional paid model request is required by this review.

Parent-reported live evidence is bounded: an actual model produced the tool/UI, browser submission reached the same Pi conversation as a user message, and the subsequent model request failed with `429 AccountQuotaExceeded`; other attempted providers reported insufficient balance. A separate restore-only Pi/browser check reported no page errors and listener cleanup. This reviewer did not independently execute those live sessions. The full successful next-model reply criterion remains unfulfilled because of provider/account limits; it must not be marked complete from a validated POST, admitted user message, or code/packaging GO.
