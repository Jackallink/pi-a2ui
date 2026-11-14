# pi-a2ui

A local interactive canvas for the Pi coding agent. Pi keeps the conversation and coding tools; the official A2UI renderer displays forms and cards in your browser.

Requires **Node 24.x** and Pi >=1.5.0. A2UI protocol 1.0, pinned Agent SDK 0.1.0 and Web Core/Lit 0.15.0.

Version 0.1.3 is a version-alignment checkpoint with the same complete functionality as v0.1.1: typed forms/layout, coding review components and bounded native logs/charts. It supports forms, choices and task cards alongside Pi; it does not add a separate model or change Pi's tool permissions. Real model acceptance used Volcengine Ark Agent Plan `glm-5.3-flash`. The extension uses whichever model you select in Pi.

Project source is MIT licensed. The bundled browser libraries retain their own licenses; complete third-party license/notice texts are included in `THIRD_PARTY_LICENSES.txt` in the distribution.

## Install

The package is distributed through Git and local paths; it is not published to npm. Requires **Node 24.x** and Pi >=1.5.0; select it with `nvm use 24` before installation or use.

### Git

From the Pi project where you want this package enabled:

```sh
nvm use 24
pi install -l --approve git:github.com/Jackallink/pi-a2ui@v0.1.3
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

Ask Pi: “Use a2ui_render to show a form asking for my implementation plan. When I submit it, summarize the submitted value.” Open `/a2ui` and submit the form. Each Pi instance has its own random loopback port and access credential. Browser refresh restores committed UI; unsubmitted input is browser-local and is lost on refresh or replacement of that surface.

## Companion skill and preflight helper

This branch adds the bundled **pi-a2ui** skill, component subdocuments and11 executable templates. The existing publishedv0.1.3 tag does not contain this addition; use a checkout/ref that actually ships `skills/pi-a2ui/SKILL.md`. Package discovery loads the extension and skill together via `pi.extensions`/`pi.skills`; no extra global skill or CLI installation is needed. Run `/reload` after selecting the new package/ref, then:

```text
/skill:pi-a2ui 生成用户信息表单，包含用户名、邮箱和确认按钮
```

For smaller/local models, explicit invocation gives a known-good named-argument template plus links to the needed component reference. See [skill entry](skills/pi-a2ui/SKILL.md), [core16 component signatures](skills/pi-a2ui/references/core-components.md), [coding/live components](skills/pi-a2ui/references/coding-and-live.md), [optionalv0.1.4 components](skills/pi-a2ui/references/workbench-components.md), [media registration](skills/pi-a2ui/references/artifacts.md), [syntax/error guide](skills/pi-a2ui/references/syntax-and-errors.md) and [helper commands](skills/pi-a2ui/references/helper.md).

With **Node24.x** selected, this read-only helper uses the same compiler as the tool and runs from a production install without a TS loader or build:

```sh
nvm use 24
node /absolute/path/to/pi-a2ui/skills/pi-a2ui/scripts/a2ui.mjs catalog
node /absolute/path/to/pi-a2ui/skills/pi-a2ui/scripts/a2ui.mjs example user-form
node /absolute/path/to/pi-a2ui/skills/pi-a2ui/scripts/a2ui.mjs check --surface-id user-form /absolute/path/to/form.express
```

`catalog` describes that installed package, not an arbitrary active Pi process. `check` returns `{surfaceId,source}` for a2ui_render and publishes nothing; actual session/action/resource validation remains in the tool. v0.1.4-only examples refuse when the catalog lacks their types. Reference presence is not runtime support. Card takes a component child, not a title string; children need commas; forward references work, so declaration order alone is not a sufficient diagnosis.

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

Supported components include bounded native-tool LogView and finite line/bar Chart; a2ui_update_chart updates series without replacing inputs. Native log collection uses Pi events and makes no model request per chunk. Log display can be paused locally; earlier omitted content is marked. The version also includes read-only CodeDiff and TestResults under a versioned Pi catalog. It also adds CheckBox, ChoicePicker, Slider, DateTimeInput, Tabs and Divider to Text, Column, Row, Card, Button and TextField. Text and source content are escaped plain text. Coding follow-up buttons carry literal proposalId/resultId; source/test records are immutable within a session. TestResults displays supplied case records and provenance reported by Pi; it does not certify a test execution. Functions, checks, dynamic templates, media, HTML and general RPC are unavailable. Bind submitted values directly to absolute input value paths. TextField uses string, CheckBox boolean, Slider finite bounded number, ChoicePicker string array; DateTimeInput uses explicit date/time flags and local calendar strings (optional :00 seconds), with static bounds. Literal event context is checked against the committed definition.

Rendering validates the entire replacement before publishing it. Invalid source leaves the old surface intact. A tool result does not wait for a human; the browser action becomes a later structured user message, with `followUp` during generation. “Sent to Pi” acknowledges one local dispatch attempt, not model success; asynchronous failures appear in Pi. Ambiguous network failures are not automatically retried.

## Component support and extension opportunities

This version exposes12 official Basic components plus4 custom Pi components (CodeDiff, TestResults, LogView, Chart). Official List, Modal, Icon, Image, Video and AudioPlayer are not enabled. Proposed tables, code blocks, collapsible details and status/progress widgets are future work, not shipped features. See the [component inventory and practical extension guide](https://github.com/Jackallink/pi-a2ui/blob/v0.1.3/docs/components-and-extensions.md).

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

[Version0.1.3](docs/releases/v0.1.3.md) aligns the public version with historical development labels. It has the same complete functionality as published [v0.1.1](docs/releases/v0.1.1.md), which first delivered all three slices. The earlier development candidates named0.1.3 were not published; the new v0.1.3 tag identifies this reviewed checkpoint. Version0.1.2 remains unpublished. Existing v0.1.0/v0.1.1 tags and assets are immutable.

See [CHANGELOG.md](CHANGELOG.md), [ROADMAP.md](ROADMAP.md), the [Pi package distribution contract](docs/specs/005-v0.1.1-distribution.md), and the [version-alignment contract](docs/specs/006-v0.1.3-version-alignment.md). Historical design/test evidence preserves each original feature slice and artifact identity.

## Planned v0.1.4

The [v0.1.4 scope](docs/specs/007-v0.1.4-usability.md) retains all seven component/interaction groups previously discussed, including image/artifact and audio/video support. It is a draft plan, not shipped functionality or permission to skip design/TDD/security gates. Additional useful candidates are listed separately in the [component guide](docs/components-and-extensions.md). Current install/version/runtime remains v0.1.3 on Node24.x.

## Remove

```sh
pi remove -l --approve git:github.com/Jackallink/pi-a2ui@v0.1.3
# For the local route instead:
pi remove -l --approve /absolute/path/to/pi-a2ui
```

Run removal from the same project used for installation; omit `-l` only for a user-wide registration. Existing Pi sessions and credentials are retained.

Supported runtime: **Node 24.x only**. Run `nvm use 24` (also pinned by `.nvmrc`) before installing or testing. The version-specific acceptance scenarios use `A2UI_ACCEPT_SCENARIO=forms`, `coding` or `live` with the production-installed package.
