# pi-a2ui

A local interactive canvas for the Pi coding agent. Pi keeps the conversation and coding tools; the official A2UI renderer displays forms and cards in your browser.

Requires Node >=22.19.0 and Pi >=1.5.0. A2UI protocol 1.0, pinned Agent SDK 0.1.0 and Web Core/Lit 0.15.0.

Version 0.1.3 adds bounded native logs and charts. It supports forms, choices and task cards alongside Pi; it does not add a separate model or change Pi's tool permissions. Real model acceptance used Volcengine Ark Agent Plan `glm-5.3-flash`. The extension uses whichever model you select in Pi.

Project source is MIT licensed. The bundled browser libraries retain their own licenses; complete third-party license/notice texts are included in `THIRD_PARTY_LICENSES.txt` in the distribution.

## Install

From your intended Pi project's directory, download `pi-a2ui-0.1.3.tgz` and `SHA256SUMS` from the [v0.1.3 GitHub Release](https://github.com/Jackallink/pi-a2ui/releases/tag/v0.1.3). Keep that project as your working directory while running:

```sh
shasum -a 256 -c SHA256SUMS
mkdir -p "$HOME/.local/share/pi-a2ui/0.1.3"
tar -xzf pi-a2ui-0.1.3.tgz -C "$HOME/.local/share/pi-a2ui/0.1.3"
npm install --prefix "$HOME/.local/share/pi-a2ui/0.1.3/package" --omit=dev --ignore-scripts
pi install -l --approve "$HOME/.local/share/pi-a2ui/0.1.3/package"
```

The archive includes built browser assets; installing it does not require a build. `-l` registers this package only in the current Pi project; omit `-l` if you intentionally want a user-wide registration. Use one active pi-a2ui registration per Pi instance; preserve other packages, settings and credentials. This is a GitHub distribution; no npm registry publication is required.

The project-local install/remove examples use Pi's `--approve` flag to trust project-local files for that command. Run them from a project you trust.

For development from a checkout:

```sh
nvm use
npm ci
npm run build
pi install /absolute/path/to/pi-a2ui
```

Restart Pi or run `/reload`. In Pi:

- `/a2ui` opens the authenticated local canvas.
- `/a2ui-status` shows listening/enabled status and surface/client counts.
- `/a2ui-toggle` pauses or enables UI rendering and actions.

Ask Pi: “Use a2ui_render to show a form asking for my implementation plan. When I submit it, summarize the submitted value.” Open `/a2ui` and submit the form. Each Pi instance has its own random loopback port and access credential. Browser refresh restores committed UI; unsubmitted input is browser-local and is lost on refresh or replacement of that surface.

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

Version 0.1.3 adds bounded native-tool LogView and finite line/bar Chart; a2ui_update_chart updates series without replacing inputs. Native log collection uses Pi events and makes no model request per chunk. Log display can be paused locally; earlier omitted content is marked. The version also includes read-only CodeDiff and TestResults under a versioned Pi catalog. It also adds CheckBox, ChoicePicker, Slider, DateTimeInput, Tabs and Divider to Text, Column, Row, Card, Button and TextField. Text and source content are escaped plain text. Coding follow-up buttons carry literal proposalId/resultId; source/test records are immutable within a session. TestResults displays supplied case records and provenance reported by Pi; it does not certify a test execution. Functions, checks, dynamic templates, media, HTML and general RPC are unavailable. Bind submitted values directly to absolute input value paths. TextField uses string, CheckBox boolean, Slider finite bounded number, ChoicePicker string array; DateTimeInput uses explicit date/time flags and local calendar strings (optional :00 seconds), with static bounds. Literal event context is checked against the committed definition.

Rendering validates the entire replacement before publishing it. Invalid source leaves the old surface intact. A tool result does not wait for a human; the browser action becomes a later structured user message, with `followUp` during generation. “Sent to Pi” acknowledges one local dispatch attempt, not model success; asynchronous failures appear in Pi. Ambiguous network failures are not automatically retried.

## State and local boundary

The current branch's latest valid successful tool-result snapshot restores on reload/navigation. Credentials, duplicate caches and draft keystrokes are never saved in tool details. Old epochs/revisions cannot submit actions to new UI. The service closes clients and listener on Pi shutdown/reload.

The server binds only 127.0.0.1. Same-origin bootstrap, HttpOnly SameSite cookies, exact Host/Origin validation and resource limits protect browser access. Other local processes remain trusted; cookies cannot be scoped to a TCP port. Do not expose or proxy the service onto a network. `/a2ui` opens a fragment-based bootstrap URL: do not share that URL.

Known upstream dependency risk: `npm audit` reports GHSA-mrhx-c7xc-m3w5 in Zod, also attributed transitively to the official A2UI packages. Their Zod 3 contract has no compatible patched version in this pinned set. This package bounds bytes, nesting and collection cardinality before SDK validation, but does not claim the dependency is patched or the audit is clean. Local acceptance and public production readiness are distinct. See `docs/checks/` for exact evidence.

## Develop and verify

```sh
npm run build
npm run check
npm test
npm run test:browser
npm pack
```

Browser tests require a Playwright Chromium installation (`npx playwright install chromium`). Browser bundling is a development/release step. No CDN or WebSocket dependency is used at runtime. Spec, walkthrough and acceptance mappings: [MVP design](https://github.com/Jackallink/pi-a2ui/blob/v0.1.0/docs/specs/001-pi-a2ui-mvp.md).

Live acceptance defaults to Agent Plan `volcengine-ark/glm-5.3-flash` and checks the resolved model and Agent Plan endpoint before making a request. Credentials stay in Pi. Select an installed Chromium executable with `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` when needed.

## Releases and iteration scope

See the [changelog](https://github.com/Jackallink/pi-a2ui/blob/v0.1.3/CHANGELOG.md), [v0.1.0 checkpoint](https://github.com/Jackallink/pi-a2ui/blob/v0.1.0/docs/releases/v0.1.0.md), and [roadmap](https://github.com/Jackallink/pi-a2ui/blob/main/ROADMAP.md).

- **0.1.1:** form and layout components: CheckBox, ChoicePicker, Slider, DateTimeInput, Tabs, Divider.
- **0.1.2:** coding components: CodeDiff and TestResults.
- **0.1.3:** live data components: LogView and Chart.

This version includes the roadmap components through 0.1.3. Later roadmap items remain outside this package. Each iteration has its own walkthrough, TDD mapping, independent review and release checks.

## Remove

```sh
pi remove -l --approve /absolute/path/used/when/installing
```

For project-local installs, use `pi install -l` and `pi remove -l`. Existing Pi sessions and credentials are retained.

Development runtime: run `nvm use` (Node24, pinned by `.nvmrc`) before installing or testing. The version-specific acceptance scenarios use `A2UI_ACCEPT_SCENARIO=forms`, `coding` or `live` with the production-installed package.
