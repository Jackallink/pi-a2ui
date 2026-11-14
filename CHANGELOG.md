# Changelog

## 0.1.4 - Unreleased

- Add static List and bounded sortable/filterable DataTable, literal CodeBlock with local CopyAction, safe MarkdownView and native Details/Accordion composition.
- Add reported/unverified StatusBadge and native-event TaskProgress with bounded tracking and no per-chunk model request; preserve drafts during live updates.
- Add focus-managed Modal and12 local SVG Icon names. All18 official Basic component types are available through reviewed schemas/implementations; plus11 custom Pi components.
- Add a2ui_register_artifact for bounded immutable workspace files, ArtifactPreview metadata and Image/Video/AudioPlayer. Authenticated opaque routes, exact signatures, pending quotas, revocation, backpressure and single ranges remain constrained. Native controls never autoplay or access a microphone.
- Require Node24.x; Git/local distribution only, no npm publication. Existing tags/assets remain unchanged. This is a candidate until separately published.

- `a2ui_render` attempts to open the local canvas in the default browser on the first successful render when no browser client is connected; the attempt happens at most once per session episode, failures notify once without retrying and never surface through a stale post-reload, post-branch-switch or post-shutdown context, and `/a2ui` remains the manual fallback sharing the same platform open logic.

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
