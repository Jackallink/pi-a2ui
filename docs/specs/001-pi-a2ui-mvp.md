# Pi A2UI MVP

Date: 2026-11-13. Lifecycle: in-progress. Profile: strict.

## Goal and authorization

Let a Pi user receive an interactive local UI, submit a form, and continue the same Pi conversation. User approved the tool-driven architecture and authorized independent design review followed by development, verification, and local installation/live testing when GO. Public npm/forge publication, remote deployment, and modification of Pi itself are outside this slice.

## Scope

IN: one npm Pi package; one `a2ui_render` tool; official A2UI Express compiler and Lit renderer; loopback HTTP with same-origin SSE/POST; `/a2ui`, `/a2ui-status`, `/a2ui-toggle`; full surface replacement, browser reconnect, current-branch restoration, lifecycle cleanup; independent review and bounded real Pi/browser acceptance.

OUT: model-token streaming preview, custom catalogs, agent RPC, arbitrary HTML/JS/URL/media, remote access, direct browser execution of coding tools, npm publication, additional model calls inside the plugin. User retains the normal Pi coding workflow.

## Constraints and dependency evidence

- Node >=22.19.0; Pi >=1.5.0. Local Pi observed 1.5.0; registry latest observed 1.5.2.
- Pin initial A2UI dependencies: `@a2ui/agent` 0.1.0, `@a2ui/web_core` 0.15.0, `@a2ui/lit` 0.15.0. Protocol is 1.0; package numbers differ.
- Published agent package exports A2uiGenerator/ExpressFormatFactory, not RendererToAgentMessageProcessor. Use published exports and v1_0 schemas, not the documentation's nonexistent export.
- Renderer uses the same restricted implementation-backed basic catalog as compiler, derived from `@a2ui/web_core/v1_0` basicCatalog using Catalog.derive with the same ID, explicit component list, empty function list and replacement instructions. Mount using `@a2ui/lit` A2uiSurface. Do not substitute the agent schema-only catalog for renderer implementations. Allow Text, Column, Row, Card, Button, TextField; plain text only in Text. Event actions only; no catalog function calls, dynamic child templates, checks, URLs, media or executable content. Do not register a markdown renderer or install the optional markdown package; Text remains escaped literal text.
- No custom WebSocket implementation or WebSocket dependency. Browser assets are bundled at development/release time and included in the installable package; user needs no build step/CDN.
- Source <=32 KiB; <=64 components across <=4 surfaces; tree and JSON/data nesting depth <=16; JSON total nodes <=4096 and each collection <=256 entries; Express source <=4096 lexical units with delimiter nesting <=64; complete snapshot <=256 KiB; <=8 SSE clients; reject bodies >64 KiB; deduplicate up to 1024 accepted event IDs per epoch without evicting accepted IDs. At capacity reject new actions; reset/new epoch clears them. Bound slow-client queued bytes to 256 KiB plus 64 bytes of fixed SSE framing allowance, then disconnect and use snapshot recovery.

Sources: https://a2ui.org/concepts/inference-formats/ ; https://a2ui.org/guides/client-integration/ ; npm tarball declarations at the pinned versions; https://raw.githubusercontent.com/earendil-works/pi/main/packages/coding-agent/docs/extensions.md . SDK behaviors still require executable characterization and integration checks.

## Architecture and contracts

`Pi tool -> compiler -> UI session -> HTTP SSE -> official renderer -> POST action -> UI session -> Pi user message`.

`a2ui_render({surfaceId, source})`: surfaceId is 1..64 ASCII letters/digits/hyphen/underscore. Source is complete Express DSL, not arbitrary code. SDK promptSnippet supplies actual syntax. Tool returns a short success/error and details containing the committed full snapshot. It never waits for a human action and never starts another LLM call.

Compiler parses into a fresh SDK RendererState with only the restricted catalog. Require exactly one complete created surface with the requested ID, a valid root tree with each component referenced once (no shared-child DAG expansion), no other affected surface, no RPC, no event functions or dynamic executable expressions. Materialize one complete createSurface message from the validated resulting state. Explicitly require a nonempty root; SDK topology validation alone can accept empty surfaces. Apply depth/count/byte limits to both compiled and restored state. No source evaluation. Any rejection leaves the committed canvas unchanged.

Session owns `{epoch, enabled, surfaces: [{surfaceId, revision, message}]}`. A render validates and checks capacity before synchronously swapping an immutable cloned committed snapshot and notifying listeners. Listener failure or a slow client disconnect cannot roll back a successful commit or change its tool result to an error. Failed compilation, cancellation or unavailable server cannot report successful publication. Capture the originating epoch at tool entry before any await/lazy server startup; reject commit if it differs from the current epoch or service was shut down. AbortSignal is checked before commit. A startup that finishes after shutdown must immediately close without publishing. Disabling invalidates pending render operations with a separate operation generation; reenabling never revives them. Same surface replacement increments revision. A snapshot event is the complete state; no unbounded event log or partial replay. On a snapshot of the same epoch, browser replaces only changed revisions, preserving unrelated unsent input. On a new epoch it clears all prior surfaces and form state.

Browser stores draft input only in the official renderer's DataModel. Action context bindings resolve the submitted fields; no keystroke transmission. Browser sends `{epoch, revision, eventId, message: {version:'1.0', action}}`. Validate schema, current epoch/revision, declared reachable source component and event name, literal context fields and declared bound context keys/types against committed component definitions. Bound context values may only use absolute paths matching the value binding of a reachable TextField, and must be strings (including number-style TextFields). Reject unknown bindings, missing/extra context keys, incorrect types and tampered literal values; no dynamic context functions or templates. Browser userMessage, timestamps and extra fields are not instructions. A structured JSON user message labels browser context as user-supplied data. No command/template expansion. Invoke the current Pi bridge once using `sendUserMessage(..., {deliverAs:'followUp', expandPromptTemplates:false})`; an accepted event ID is recorded once. Pi 1.5 ExtensionAPI returns void and asynchronously emits errors, so 202 means locally validated and one dispatch attempt, NOT confirmed Pi queue admission, model execution or success. Browser shows 'Sent to Pi'; async failures are shown by Pi, outside the browser acknowledgment. A synchronous bridge exception returns an error without local acceptance. Duplicate accepted ID with identical content returns prior acceptance; reuse with different content is rejected. No promise/await gap between epoch validation and Pi dispatch. This is process/epoch-local deduplication, not crash-proof exactly-once delivery. No automatic browser POST retries after ambiguous transport failure.

Session start/switch/tree navigation rotates epoch, disconnects/invalidates old actions and reconstructs only current branch's newest valid tool-result snapshot. Skip failed, malformed, oversized or incompatible records and show empty UI if none. Snapshot validation uses SDK, constraints and current catalog, never arbitrary file evaluation. Restore does not dispatch actions. Persistence is limited to bounded committed snapshots in Pi tool-result details; no credentials/event cache/draft keystrokes.

## HTTP and credentials

Server binds 127.0.0.1 with OS-assigned port to allow multiple Pi instances. Lazy start on `/a2ui` or first render; failed startup leaves a retryable state. `/a2ui` opens the local default browser with a random 256-bit bootstrap token in URL fragment; do not log it or store it in tool details. Browser exchanges fragment via same-origin POST `/api/connect`, receives an HttpOnly SameSite=Strict cookie with a unique process/port-specific name and per-process random value, and clears fragment. Token is process-local, timing-safe checked; never embed it in public HTML/assets. Any credential in a URL is intentionally only the user's local browser bootstrap and not published evidence.

GET `/`: public static shell with no session data; bundled JS/CSS only. POST `/api/connect`: exact Host and Origin, JSON, token validation. GET `/api/events`: authenticated SSE, exact Host, allow absent Origin but reject a present foreign Origin, immediate snapshot, heartbeat, current epoch and revisions; cap clients/backpressure. POST `/api/actions`: authenticated exact Host/Origin + JSON, bounded body, schema/context validation; 202 locally accepted dispatch attempt/duplicate; 400 malformed; 401 unauthorized; 403 foreign origin or undeclared action; 409 stale epoch/revision/event ID conflict; 413 oversize; 429 capacity; 503 disabled/delivery unavailable. No CORS allowance. Validate Host before any session route (DNS-rebinding boundary). Cookie names prevent collisions across instances; cookies are not scoped to TCP ports and are not a same-host cross-port trust boundary. Other local processes are trusted in this MVP. Validate each service's own cookie name and value; close all client sockets, timers and listener on shutdown/reload. Use restrictive CSP and no external browser network resources.

`/a2ui-toggle` disables model guidance/tool commits/actions, preserving committed UI for viewing; reenabling allows the same current epoch's UI. `/a2ui-status` reports enabled/listening/surface count/client count only. CLI command does not expose any existing Pi secrets.

## User stories, walkthrough and acceptance mapping

Canonical path/story/AC definitions: [round 1](../walkthrough/01-round1-user-stories.md). Technical trace: [round 2](../walkthrough/02-round2-technical-trace.md). Integration/errors: [round 3](../walkthrough/03-round3-integration-check.md).

| AC | Required verification |
| --- | --- |
| AC-01 valid card/form + replacement | tests/session.test.ts real SDK; browser acceptance |
| AC-02 invalid/cancelled/oversized atomicity | tests/session.test.ts; tests/extension.test.ts (deferred startup/reset/close/disable) |
| AC-03 one local dispatch attempt, correct context; real next turn observed separately | tests/session.test.ts; tests/server.test.ts; real Pi/browser acceptance |
| AC-04 stale/forged/replayed/disabled rejection | tests/session.test.ts; tests/server.test.ts |
| AC-05 reconnect/input preservation/isolation | tests/server.test.ts; browser acceptance |
| AC-06 branch restore and rejected history | tests/extension.test.ts (including deferred startup/reset race); real Pi reload |
| AC-07 shutdown and port rebind | tests/server.test.ts; Pi lifecycle smoke |
| AC-08 authentication/origin/body/resource limits | tests/server.test.ts |
| AC-09 installable package + no user build | npm run build/check/test; npm pack install smoke; local pi install/load |

## Gates, drift, risk and rollback

State machine: draft -> walkthrough-approved -> tdd-approved -> in-progress -> review-ready -> complete. Independent design review must examine real API feasibility, state/auth/lifecycle boundaries and AC coverage; no unresolved P0/P1 findings to implement. Independent final review plus relevant tests/build/package/browser/Pi checks must pass before local install acceptance is called complete. Reviewer recommendation, author corrections and observed results remain separately recorded in docs/checks. Plans contain goals/gates, not live execution counters.

Recorded review amendments: 202 acknowledges a local dispatch attempt; origin epoch and operation generation guard lazy startup; source/JSON structural budgets precede SDK validation; true trees prevent shared-child expansion; SSE permits 64 bytes of fixed frame overhead.

Initial drift from original proposal: explicit tool generation and atomic display replace intercepted prose streaming; native HTTP SSE/POST replaces hand-written WebSocket; published package exports replace illustrative SDK names; packaged browser assets replace a single source file. These are user-approved architecture choices. Later drift must be recorded here before release.

Risk: local browser actions can start coding turns, malformed DSL can consume resources, restored history can be untrusted, SDK API drift. Mitigation: explicit event/context validation, revision/epoch isolation, bounded inputs/state, locked versions, independent review and real runtime evidence. Node SDK parsing has no hard CPU deadline in this MVP; 32 KiB input and depth limits constrain work but do not constitute sandboxing. Loopback-only trusted local use is the deployment boundary.

Rollback: disable with `/a2ui-toggle`, exit/reload to release service, remove local package registration using `pi remove <absolute package path>`. Preserve existing Pi settings and credentials; capture only changed settings keys and restore if installation fails. Do not uninstall or update unrelated packages.

Design review amendment note (2026-11-13): independent re-review clarified depth=16, total component budget, implementation-backed function-free catalog, literal Text, string TextField-only bound context, immutable snapshot/listener isolation, pending-operation generation, and cookie/SSE scope. These close implementation ambiguity within approved MVP scope; initial findings and review resolution are recorded in `docs/checks/001-design-review.md`.
