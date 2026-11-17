# Changelog

## 0.1.12 - 2026-11-17

- Polish canvas rendering per issue #67 without changing any data, event, draft, sorting or permission contract: chart gains a non-color series identity layer (legend swatches, deterministic line dash styles `none`/`7 3`/`2 3`/`11 4` with circle/square/triangle/diamond point markers) and axis tick labels switch to the monospace token with a measured per-label gutter (40px floor, actual font-metric width + 12 padding) instead of the character-count estimate.
- Chart x labels gain a bounded wrap fallback: when no full single-line label fits the slot, the fallback renders at most 3 wrapped lines per label (full text kept in `<title>`), reserves a full-width right-edge column for the last label so columns never collide (adjacent gap ≥6 viewBox units), and grows the viewBox height with the deepest wrap instead of discarding every label.
- `DataTable` scroll regions become named focusable regions (`tabindex=0`, `role=region`, caption-derived label) so keyboard arrow scrolling is a contract, and the generic canvas button reset no longer overrides SDK `Tabs` active or `ChoicePicker` chip selected states (restored accent/underline/pill styling with hover scoped off the active tab).
- Shipped tests extended: tab/chip/scroll-region/mono-tick/measured-gutter/tail-column/196-200-point boundary/acceptance suites (AC-001 32-component style coverage with contrast ratios, AC-003 200%-zoom proxy + physical-equivalent rendering, AC-004/007 keyboard/modal/pause/inert, AC-006 dynamic chart updates). Spec028:63 real desktop 200% record remains a human follow-up tracked in Check133/134; report issues from actual use.
- Tool inputs, schemas, runtime permissions, browser-opening policy and the v2 benchmark binding policy stay unchanged (only its packageVersion/archiveSHA256 follow this release; frozen real-v1 files untouched). Node24 local CI and Git/local distribution only; release validation adds no model inference.

## 0.1.11 - 2026-11-17

- Make `a2ui_render` authoring skill-first: after deciding a canvas helps, the model reads the installed pi-a2ui SKILL.md (unless its body is already in context), starts from a matching example, adapts it, runs helper `check` on the final source and passes the returned arguments unchanged. When skill reading or helper execution is unavailable, it explains the limitation in prose instead of claiming a preflight ran.
- Add the complete three-field `FormValidation` example with concrete value semantics: `buttons` is a list of reachable Button ID strings (not `Button(...)` calls), `rules.fieldId` names the input component rather than its value path, and guarded Buttons/inputs/validator live in the root tree. Add the orphan-reference repair walkthrough with an invalid example, and guidance to create a new owned source file via an allowed write/edit tool when shell redirection or `mktemp` is restricted, keeping sandbox rules and existing project files intact.
- Tool inputs, schemas, runtime permissions, components and browser-opening policy are unchanged; only the shipped description/skill texts and built `dist/assistant-cli.mjs` change. Node24 local CI and Git/local distribution only; release validation adds no model inference and the v2 evaluator binding follows this release with frozen v1 files unchanged.

## 0.1.10 - 2026-11-16

- Give `a2ui_render` concrete model-side trigger examples for structured input, review results, comparisons and inspectable artifacts, gated on whether inspection or interaction materially helps the next action. Skip pure prose and trivial confirmations.
- Preserve native automatic run summaries, tool input schemas, rendering/event handlers, resource limits and permissions. The description is 362 UTF-8 bytes longer; no measured trigger-rate or cost improvement is claimed, and release validation adds no model inference.
- Refresh release/install metadata and the existing v2 benchmark package/archive binding; keep its policy/caps and frozen real-v1 evidence unchanged. Node24 local CI and Git/local distribution only.

## 0.1.9

- Add #57 automatic native-run summaries for an enabled, already-connected canvas: observed termination badge, actual tool counters and bounded timeline, without opening a browser or making a model request. Preserve all public surface IDs; only replace the extension's matching owned revision, and skip collisions or full budgets. Synchronous native flush plus official non-LLM custom history restores validated branch snapshots and ownership; render/chart tool details carry optional ownership metadata. Recovered tool errors remain separate from normal agent termination.

- Complete BM2's68 explicit compiler/session/browser golden scenarios and clarify DataTable UTF-16 code-unit sorting plus existing eventId dedup/business idempotency contracts (#43/#51/#52).
- Add BM3 Search→Audit→Return geometry/native-action regression, real CSS fault canaries and inspected advisory screenshot baselines.
- Add the manual BM4 pipeline through actual Pi/skill/helper/browser/queue with zero-inference default, explicit GLM-only budgets and honest unknown/interrupted request accounting. Preserve the original v1 result7/12; it is not a universal UI/model quality score.
- Address #56 with a separately versioned v2 compiled-surface handoff check: preserve raw attempted source and byte fidelity, allow only complete compiler-identical contracts, and reject changed action/context/binding/data/IDs/artifact references. Render inputs/CLI output schemas and runtime permissions are unchanged; #57 adds optional history ownership metadata in tool details. New v2 verification uses synthetic transport only; no new real-model score.
- Use Node24 local CI under the user's Actions-quota constraint; retain independent review, full tests and source/package/consumer gates. Distribution remains Git/local, not npm publication.

## 0.1.8 - 2026-11-15

- Add BM1 development-side regression coverage for two registered diagnostic families: reserved Event keys and current coding Button record IDs. Bind actual rejections to uniquely located, executable shipped repair examples and independent intended-data assertions.
- Add strict fixed-profile fixtures, structural/compile/compile-valid semantic canaries and explicit setup/negative/error stages, including cross-level duplicate-heading rejection. Preserve original failed receipts and independent reviews.
- Run read-only Node24 PR CI with pinned official actions, fresh dependency installation, unit tests, typecheck and actual runtime/source identity logs. Tests/fixtures/workflow do not enter the75-file runtime package.
- Keep runtime/SDK/CLI/dependencies/permissions and32types/19templates/8routes unchanged; only two skill reference markers accompany the development gate. Git/local distribution only, no npm.
- Keep benchmark43 open: BM2–BM4 are separate slices. BM1 is not all-error coverage or a model-quality/cost benchmark.

## 0.1.7 - 2026-11-15

- Integrate the reviewed DX work from PR45/46. No new components, runtime dependencies or permissions.
- Report actual reserved authoring keys and known component/property/workspace locations, preserve error status/cause and unknown-scope evidence, and use typed keys for accurate CLI repair hints.
- Expose committed render component/surface usage and attempted/current aggregate overflow counts. Keep64components/4surfaces and atomic replacement/resource/identity rules unchanged.
- Forward server-accepted epoch/revision with existing browser context so delayed interactions retain provenance; no automatic stale queue cancellation or delivery-currentness guarantee.
- Explain bounded128case summaries and full-run reported evidence, all declared coding Button IDs and file/path repairs with executable skill examples. Existing32types/19templates/8routes remain.
- Keep benchmark43 and broad evaluation work for separate admission, Node24.x only, and published0.1.6/user installations unchanged.

## 0.1.6 - 2026-11-15

- Improve authoring reliability while preserving the existing catalog and runtime permissions.
- Add read-only `component NAME` guidance from actual catalog schemas with project-specific constraints, required flags, references and examples. Keep existing helper outputs and exact check arguments compatible.
- Add structured project-aware compiler/input/usage recovery hints while filtering unsupported SDK-only checks/functions from compiler advice.
- Start the skill with known-template → adapt → check → render; preserve all19 templates and eight progressive routes.
- Require explicit package/version in developer acceptance, default to normally registered startup with zero inference, and separate opt-in GLM skill-forward evidence from supplied-DSL component scenarios. Keep private phase receipts, actual child Node24/cwd observations and owned resource cleanup.
- Keep Node24.x, existing dependencies, Git/local installation and published immutable releases unchanged.

## 0.1.5 - 2026-11-14

- Add all eight daily interaction groups: bounded hierarchy/breadcrumb, searchable selection, source-labelled summaries, guarded field feedback, loading/empty/not-run/error patterns, native ActivityTimeline, evidence location intents and keyboard action search.
- Add SearchablePicker and FormValidation with typed membership/guard coverage and shared client/server constraints. Preserve existing ChoicePicker(filterable=true) for basic search; no executable checks or added tool permissions.
- Add native-only ActivityTimeline with32-row per-run window, truthful outcomes/observed elapsed, omissions and restore/pause ownership; reserve byte/JSON-node/depth capacity before admitting layouts. Live data-only patches are not a separate durable audit history.
- Add local Find actions/Ctrl-Cmd-K palette invoking actual current declared Buttons with latest drafts, IME composition/visibility/stale/pending guards and focus return; no direct command execution or phantom catalog types.
- Expand packaged skill to four focused interaction references,19 executable templates and eight read-only patterns/pattern descriptors. Share actual compiler and report helper-local template/shell identity; no TS build tools or extra model provider at runtime.
- Keep Node24.x only, all old catalogs/immutable released tags and Git/local distribution; no npm publication. This source prepares a release candidate; publication/consumer/model evidence is recorded separately.

## 0.1.4 - 2026-11-14

- Add static List and bounded sortable/filterable DataTable, literal CodeBlock with local CopyAction, safe MarkdownView and native Details/Accordion composition.
- Add reported/unverified StatusBadge and native-event TaskProgress with bounded tracking and no per-chunk model request; preserve drafts during live updates.
- Add focus-managed Modal and12 local SVG Icon names. All18 official Basic component types are available through reviewed schemas/implementations; plus11 custom Pi components.
- Add a2ui_register_artifact for bounded immutable workspace files, ArtifactPreview metadata and Image/Video/AudioPlayer. Authenticated opaque routes, exact signatures, pending quotas, revocation, backpressure and single ranges remain constrained. Native controls never autoplay or access a microphone.
- Require Node24.x; Git/local distribution only, no npm publication. Existing tags/assets remain unchanged.
- `a2ui_render` attempts to open the local canvas in the default browser on the first successful render when no browser client is connected; the attempt happens at most once per session episode, failures notify once without retrying and never surface through a stale post-reload, post-branch-switch or post-shutdown context, and `/a2ui` remains the manual fallback sharing the same platform open logic.
- Bundle pi-a2ui skill, progressive component/error references and11 capability-gated Express templates. Add read-only catalog/example/preflight script using prebuiltJS and the existing compiler; no extra runtime dependency or provider.
- Correct contradictory SDK prompt wording about named arguments. Existing published tags remain immutable.

## 0.1.3 - 2026-11-14

- Version-alignment checkpoint: publish the complete v0.1.1 functionality as v0.1.3 to remove ambiguity with historical development version labels.
- Require Node 24.x only in engine metadata/current installation guidance; use `nvm use 24`. Older runtime claims in historical version records are superseded for this release.
- Update package/lock metadata and current Git installation/removal references; document component support and future extension opportunities. No runtime implementation, browser bundle or dependency version change.
- Preserve immutable v0.1.1 source/assets and its feature history below. Version0.1.2 remains unpublished.

## 0.1.1 - 2026-11-14

- Add official CheckBox, ChoicePicker, Slider, DateTimeInput, Tabs and Divider with validated typed values and tab-slot traversal; preserve legacy shared TextField bindings.
- Add read-only CodeDiff and structured TestResults in a versioned Pi catalog, immutable bounded IDs and exact current-record follow-up actions. TestResults displays Pi-supplied evidence rather than independently certifying test execution.
- Add bounded native-tool LogView, constrained line/bar Chart and a2ui_update_chart; lifecycle ownership, coalesced SSE data sequences and gap recovery preserve unsent inputs. No model request per log chunk.
- Distribute ready browser assets through both Git and local installs; retain complete third-party licenses, include this changelog and declare host packages as wildcard peers. No npm registry publication.
- Historical runtime-floor guidance is superseded: current consumers and contributors require Node24.x and Pi>=1.5.0.
- This release combines the former three unpublished iteration candidates. Known upstream Zod advisory remains unchanged.

## 0.1.0 - 2026-11-13

Initial MVP checkpoint for local Pi/browser interaction.

### Added
- `a2ui_render` tool using the official A2UI Express compiler and Lit renderer.
- Text, Column, Row, Card, Button and TextField components.
- `/a2ui`, `/a2ui-status`, `/a2ui-toggle` commands.
- Atomic full-surface publication: invalid generation preserves the previous UI.
- Browser form events returned as structured user data to the same Pi conversation, using followUp delivery.
- Current-branch snapshot restoration, browser reconnection and lifecycle cleanup.
- Loopback HTTP SSE/POST, credential bootstrap, Host/Origin checks, event deduplication and bounded resources.
- Bundled browser assets in an installable package; no user build or CDN required.
- Complete third-party redistribution license/notice texts generated from actual browser bundle inputs and included in the archive.

### Validation

- 44 Node checks and 5 real Chromium cases passed.
- Actual Agent Plan `glm-5.3-flash` completed model -> tool -> browser -> submitted context -> subsequent model reply.
- Actual Pi reload, snapshot recovery, exit and listener cleanup verified.
- Independent design/code reviews and scoped repairs recorded under docs/checks.

### Limits and known issue

- Local trusted-process use only; no remote service deployment or production security certification.
- No Diff, charts, data tables or live logs in this version. No token-streaming preview, general RPC or arbitrary HTML/JS.
- HTTP202 means one local dispatch attempt, not model success.
- Upstream Zod advisory GHSA-mrhx-c7xc-m3w5 remains in the pinned SDK dependency tree. Input budgets are mitigations, not a patched dependency or clean audit.

Future scope is defined in ROADMAP.md and versioned specs, not shipped here.
