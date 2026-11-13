# pi-a2ui

A local interactive canvas for the Pi coding agent. Pi keeps the conversation and coding tools; the official A2UI renderer displays forms and cards in your browser.

Requires Node >=22.19.0 and Pi >=1.5.0. A2UI protocol 1.0, pinned Agent SDK 0.1.0 and Web Core/Lit 0.15.0.

## Install

For development:

```sh
npm ci
npm run build
pi install /absolute/path/to/pi-a2ui
```

For a built archive, extract it, install production dependencies in the extracted package, then register its absolute path with `pi install`. The package includes browser assets; users do not run a build. Public npm publication is not part of this version's local acceptance.

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

Allowed components: Text, Column, Row, Card, Button, TextField. Text is escaped plain text. Functions, checks, dynamic templates, media, HTML and general RPC are unavailable. Bind submitted values directly to absolute TextField value paths; values are strings. Literal event context is checked against the committed definition.

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

Browser tests require a Playwright Chromium installation (`npx playwright install chromium`). Browser bundling is a development/release step. No CDN or WebSocket dependency is used at runtime. Spec, walkthrough and acceptance mappings: [MVP design](docs/specs/001-pi-a2ui-mvp.md).

## Remove

```sh
pi remove /absolute/path/used/when/installing
```

For project-local installs, use `pi install -l` and `pi remove -l`. Existing Pi sessions and credentials are retained.
