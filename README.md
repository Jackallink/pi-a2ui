# pi-a2ui

A local interactive canvas for the Pi coding agent. Pi keeps the conversation and coding tools; the official A2UI renderer displays forms and cards in your browser.

Requires **Node 24.x** and Pi >=1.5.0. A2UI protocol 1.0, pinned Agent SDK 0.1.0 and Web Core/Lit 0.15.0.

Version **0.1.5** adds eight daily interaction groups,19 skill templates and read-only pattern discovery to the readable workbench delivered in0.1.4. It uses Pi's existing model and tools; it makes no separate model request per UI event or output chunk. Project live acceptance uses only Volcengine Ark Agent Plan `glm-5.3-flash`.

See the [v0.1.5 guide](docs/releases/v0.1.5.md) for installation, compatibility and acceptance boundaries. The [v0.1.4 guide](docs/releases/v0.1.4.md) remains available for rollback.

Project source is MIT licensed. The bundled browser libraries retain their own licenses; complete third-party license/notice texts are included in `THIRD_PARTY_LICENSES.txt` in the distribution.

## Install

The package is distributed through Git and local paths; it is not published to npm. Requires **Node 24.x** and Pi >=1.5.0; select it with `nvm use 24` before installation or use.

### Git

From the Pi project where you want this package enabled:

```sh
nvm use 24
pi install -l --approve git:github.com/Jackallink/pi-a2ui@v0.1.5
```

Pi clones the pinned ref and installs production dependencies. Ready browser assets and full third-party licenses are committed in the repository; no browser build is required. Tags/commits are pinned: `pi update --extensions` does not advance a configured tag to the next release. To upgrade, select the new release ref.

### Local package

Use an existing checkout or an unpacked release. Keep your intended Pi project as the working directory and substitute the package's absolute path:

```sh
nvm use 24
npm install --prefix /absolute/path/to/pi-a2ui --omit=dev --ignore-scripts --legacy-peer-deps
pi install -l --approve /absolute/path/to/pi-a2ui
```

Pi loads local paths in place and does not install their dependencies; the first command prepares them. The production install skips developer/host peers and does not rebuild the browser. Both routes preserve the target project cwd. `-l` writes only that project's package settings; omit `-l` intentionally for user-wide installation. Pi's `--approve` trusts project-local files for this command, so run it in a project you trust.

When switching between Git and local installation, remove the prior registration in the same scope first: Pi identifies a Git source by repository URL and a local source by its resolved path, so they can otherwise both load. Existing Pi sessions and credentials are retained.

Restart Pi or run `/reload`. In Pi:

- `/a2ui` opens the authenticated local canvas.
- `/a2ui-status` shows listening/enabled status and surface/client counts.
- `/a2ui-toggle` pauses or enables UI rendering and actions.

Ask Pi: “Use a2ui_render to show a form asking for my implementation plan. When I submit it, summarize the submitted value.” The first successful render while no browser is connected attempts to open your default browser automatically; if nothing opened or you closed the tab later, `/a2ui` opens the authenticated canvas again. Each Pi instance has its own random loopback port and access credential. Browser refresh restores committed UI; unsubmitted input is browser-local and is lost on refresh or replacement of that surface.

## Companion skill and preflight helper

Version0.1.5 bundles the **pi-a2ui** skill, component subdocuments,19 executable templates and eight pattern routes. Published0.1.4 has11 templates; older pinned tags do not gain new files on reload. Package discovery loads the extension and skill together via `pi.extensions`/`pi.skills`; no extra global skill or CLI installation is needed. Run `/reload` after selecting the new package/ref, then:

```text
/skill:pi-a2ui 生成用户信息表单，包含用户名、邮箱和确认按钮
```

For smaller/local models, explicit invocation gives a known-good named-argument template plus links to the needed component reference. See [skill entry](skills/pi-a2ui/SKILL.md), [core16 component signatures](skills/pi-a2ui/references/core-components.md), [coding/live components](skills/pi-a2ui/references/coding-and-live.md), [workbench components](skills/pi-a2ui/references/workbench-components.md), [media registration](skills/pi-a2ui/references/artifacts.md), [syntax/error guide](skills/pi-a2ui/references/syntax-and-errors.md) and [helper commands](skills/pi-a2ui/references/helper.md).

With **Node24.x** selected, this read-only helper uses the same compiler as the tool and runs from a production install without a TS loader or build:

```sh
nvm use 24
node /absolute/path/to/pi-a2ui/skills/pi-a2ui/scripts/a2ui.mjs catalog
node /absolute/path/to/pi-a2ui/skills/pi-a2ui/scripts/a2ui.mjs patterns
node /absolute/path/to/pi-a2ui/skills/pi-a2ui/scripts/a2ui.mjs pattern validated-form
node /absolute/path/to/pi-a2ui/skills/pi-a2ui/scripts/a2ui.mjs example user-form
node /absolute/path/to/pi-a2ui/skills/pi-a2ui/scripts/a2ui.mjs check --surface-id user-form /absolute/path/to/form.express
```

`catalog`/`patterns` describe that installed package, not an arbitrary active Pi process. `pattern` returns metadata, not DSL: choose its template with `example`, adapt it and `check`, then call a2ui_render. Template availability and local shell capabilities are separate. `check` returns `{surfaceId,source}` for a2ui_render and publishes nothing; actual session/action/resource validation remains in the tool. Examples refuse when the selected catalog lacks their types. Reference presence is not runtime support. Card takes a component child, not a title string; children need commas; forward references work, so declaration order alone is not a sufficient diagnosis.

## Model tool

`a2ui_render({surfaceId, source})` accepts complete raw A2UI Express DSL. No wrapper tags or Markdown fences. The tool description includes official SDK-generated signatures.

```text
$/form/name = ""
root = Card(Column([
  Text("Implementation plan"),
  TextField("Your name", $/form/name),
  Button(Text("Submit"), action=Event("submit", {name: $/form/name}))
]))
```

Supported components include bounded native-tool LogView and finite line/bar Chart; a2ui_update_chart updates series without replacing inputs. Native log collection uses Pi events and makes no model request per chunk. Log display can be paused locally; earlier omitted content is marked. The version also includes read-only CodeDiff and TestResults under a versioned Pi catalog. It also adds CheckBox, ChoicePicker, Slider, DateTimeInput, Tabs and Divider to Text, Column, Row, Card, Button and TextField. Text and source content are escaped plain text. Coding follow-up buttons carry literal proposalId/resultId; source/test records are immutable within a session. TestResults displays supplied case records and provenance reported by Pi; it does not certify a test execution. Functions, SDK executable checks, dynamic templates, HTML and general RPC are unavailable. Declarative FormValidation rules guard chosen submit Buttons and are repeated on the server; they do not authorize tool execution. MarkdownView explicitly renders a bounded safe subset; Text remains literal. Bind submitted values directly to absolute input value paths. TextField uses string, CheckBox boolean, Slider finite bounded number, ChoicePicker string array; DateTimeInput uses explicit date/time flags and local calendar strings (optional :00 seconds), with static bounds. Literal event context is checked against the committed definition.

Rendering validates the entire replacement before publishing it. Invalid source leaves the old surface intact. A tool result does not wait for a human; the browser action becomes a later structured user message, with `followUp` during generation. “Sent to Pi” acknowledges one local dispatch attempt, not model success; asynchronous failures appear in Pi. Ambiguous network failures are not automatically retried.

## Component support and extension opportunities

This version exposes **18 official Basic types +14 custom Pi types =32** in interactions-v1 (published workbench-v1 has29):

| Group | Components / interaction | Purpose |
| --- | --- | --- |
| Daily enhanced APIs | SearchablePicker, FormValidation, ActivityTimeline | Local searchable typed choices, guarded field errors, actual bounded native execution history |
| Layout and forms | Text, Column, Row, Card, Button, TextField, CheckBox, ChoicePicker, Slider, DateTimeInput, Tabs, Divider, List | Collect typed input, compare options and list steps |
| Reading | DataTable, CodeBlock with local copy, MarkdownView, Details / Accordion composition | Sort/filter supplied rows, read/copy code and fold evidence |
| Evidence and state | CodeDiff, TestResults, LogView, Chart, StatusBadge, TaskProgress | Distinguish supplied claims from real native tool lifecycle |
| Focus and artifacts | Modal, Icon, ArtifactPreview, Image, Video, AudioPlayer | Inspect details and registered local outputs |

Copy, sorting, filtering, disclosure, modal opening and playback stay local; only declared Button events send context to Pi. Interactive widgets cannot be nested in Button. StatusBadge/TestResults remain reported evidence, not execution certification. TaskProgress counts tracked real tool events without inventing a planned percentage.

Register an existing workspace file with `a2ui_register_artifact({path:"outputs/preview.png",kind:"image"})`; use its opaque `src` in `ArtifactPreview(src=...,kind="image",label="Preview")` or `Image(url=...,description="Preview")`. Video accepts registered WebM/MP4 and AudioPlayer accepts WAV; decoding depends on the browser and failures are visible. No external/file/data/blob/SVG sources, autoplay, microphone or browser file-path API. Registration copies up to16 files/128MiB total including pending reads (image10MiB; audio/video64MiB each). Reset, pause and shutdown revoke future access; restoring old references shows Unavailable without reopening files. Bytes already received by the browser cannot be remotely erased. The service allows two active bodies with64KiB chunks, backpressure,15s idle timeout and single byte ranges.

See the [component and extension guide](docs/components-and-extensions.md), [canonical v0.1.4 design](docs/specs/007-v0.1.4-usability.md) and executable [summary/choices](docs/examples/v0.1.4.express) / [accordion](docs/examples/v0.1.4-accordion.express) examples.

## State and local boundary

The current branch's latest valid successful tool-result snapshot restores on reload/navigation. Credentials, duplicate caches and draft keystrokes are never saved in tool details. Old epochs/revisions cannot submit actions to new UI. The service closes clients and listener on Pi shutdown/reload.

The server binds only 127.0.0.1. Same-origin bootstrap, HttpOnly SameSite cookies, exact Host/Origin validation and resource limits protect browser access. Other local processes remain trusted; cookies cannot be scoped to a TCP port. Do not expose or proxy the service onto a network. `/a2ui` opens a fragment-based bootstrap URL: do not share that URL.

Known upstream dependency risk: `npm audit` reports GHSA-mrhx-c7xc-m3w5 in Zod, also attributed transitively to the official A2UI packages. Their Zod 3 contract has no compatible patched version in this pinned set. This package bounds bytes, nesting and collection cardinality before SDK validation, but does not claim the dependency is patched or the audit is clean. Local acceptance and public production readiness are distinct. See `docs/checks/` for exact evidence.

## Develop and verify

```sh
nvm use 24
npm ci
npm run build
npm run check
npm test
npm run test:browser
npm pack
```

The checked-in `dist/` files must match `npm run build`; commit regenerated assets and full third-party notices together with source changes. Browser tests require a Playwright Chromium installation (`npx playwright install chromium`). Browser bundling is a development/release step. No CDN or WebSocket dependency is used at runtime. Spec, walkthrough and acceptance mappings: [MVP design](https://github.com/Jackallink/pi-a2ui/blob/v0.1.0/docs/specs/001-pi-a2ui-mvp.md).

Live acceptance defaults to Agent Plan `volcengine-ark/glm-5.3-flash` and checks the resolved model and Agent Plan endpoint before making a request. Credentials stay in Pi. Select an installed Chromium executable with `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` when needed.

## Release scope

[Version0.1.4](docs/releases/v0.1.4.md) combines PR#27 (automatic browser opening), PR#28 (all seven interaction groups) and PR#30 (skill/helper). The previous0.1.3 version-alignment checkpoint and0.1.0/0.1.1 tags/assets remain immutable;0.1.2 remains unpublished. Source/package/test/publication identity is recorded separately from feature acceptance.
See [CHANGELOG.md](CHANGELOG.md), [ROADMAP.md](ROADMAP.md), the [Pi package distribution contract](docs/specs/005-v0.1.1-distribution.md), and the [version-alignment contract](docs/specs/006-v0.1.3-version-alignment.md). Historical design/test evidence preserves each original feature slice and artifact identity.

## v0.1.5 scope

All eight additional groups are included in [v0.1.5](docs/specs/008-v0.1.5-interactions.md), milestone5/issues19–26: TreeView/Breadcrumbs, SearchablePicker/ComboBox, KeyValueView/MetricCard, inline/form validation, Callout/EmptyState/Skeleton, ActivityTimeline, EvidenceLink/SourceLocation and CommandPalette/ActionBar. The canonical scope is spec008; implementation/review and acceptance receipts are tracked in [#17](https://github.com/Jackallink/pi-a2ui/issues/17) and [PR#33](https://github.com/Jackallink/pi-a2ui/pull/33), separately from publication. The same version includes companion skill/CLI [#32](https://github.com/Jackallink/pi-a2ui/issues/32).

## Remove

```sh
pi remove -l --approve git:github.com/Jackallink/pi-a2ui@v0.1.5
# For the local route instead:
pi remove -l --approve /absolute/path/to/pi-a2ui
```

Run removal from the same project used for installation; omit `-l` only for a user-wide registration. Existing Pi sessions and credentials are retained.

Supported runtime: **Node 24.x only**. Run `nvm use 24` (also pinned by `.nvmrc`) before installing or testing. The version-specific acceptance scenarios use `A2UI_ACCEPT_SCENARIO=forms`, `coding`, `live` or `workbench` with the production-installed package.
