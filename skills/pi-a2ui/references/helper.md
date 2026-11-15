# Read-only local helper

Requires **Node24.x** (`nvm use 24`); production package dependencies must be installed. It uses prebuilt JS and the same compiler as a2ui_render: no tsx/TypeScript/esbuild, global CLI install, experimental Node flag, model request, HTTP server or credential setup. Contributor `npm run build` regenerates the JS; users do not build.

Replace the absolute script path below with this skill's actual path, quoted for spaces. Paths to user source are resolved from the command's cwd; the script's own examples/modules are resolved from its installed location.

```sh
node "/absolute/path/to/pi-a2ui/skills/pi-a2ui/scripts/a2ui.mjs" component TextField
node "/absolute/path/to/pi-a2ui/skills/pi-a2ui/scripts/a2ui.mjs" catalog
node "/absolute/path/to/pi-a2ui/skills/pi-a2ui/scripts/a2ui.mjs" examples
node "/absolute/path/to/pi-a2ui/skills/pi-a2ui/scripts/a2ui.mjs" example user-form
node "/absolute/path/to/pi-a2ui/skills/pi-a2ui/scripts/a2ui.mjs" check --surface-id user-form /absolute/path/to/form.express
```

- `component NAME` (0.1.6+): exact case-sensitive catalog name; JSON `{packageVersion,catalogId,scope,component:{name,parameters:[{name,required}],notes,examples,reference},restrictions}`. Named arguments only; optional positions are not inferred. Metadata comes from actual public schemas with existing project constraints: initialized input values and explicit DateTimeInput flags are required, native stream widgets expose only `stream`, and forbidden functions/checks are omitted. Notes cover literal Text, static List, opaque media registration and local dates. It does not expand runtime permissions or validate a live session. Unknown name exits1, missing/extra args2. If a catalog shape is unsupported, it fails rather than inventing parameters.
- `catalog`: JSON packageVersion/nodeMajor/catalogId/components for **this installed helper package**. It cannot identify a different running Pi instance. Active tool descriptions and successful tool-result catalogId determine runtime support.
- `examples`: allowlisted names, required components and current availability. It distinguishes unsupported v014 examples on a16-type catalog.
- `example NAME`: complete raw source of a supported, compiled template. No file writes or publication; change fixture records/provenance before using them for real work.
- `check --surface-id ID FILE`: reads one regular source file, bounded32KiB and valid UTF8, then compiles it. Use `-` for piped stdin. Output is exactly JSON `{surfaceId,source}` for `a2ui_render`; not the generated JSON rendering protocol. The model must actually call that tool to publish.

Pipe a built-in template into preflight:

```sh
node "/absolute/path/to/pi-a2ui/skills/pi-a2ui/scripts/a2ui.mjs" example user-form |
  node "/absolute/path/to/pi-a2ui/skills/pi-a2ui/scripts/a2ui.mjs" check --surface-id user-form -
```

Exit0 success,1 input/compiler/capability failure,2 usage/runtime-major error. Failure writes JSON to stderr and **no tool arguments to stdout**. The retained `error` string is accompanied by `code` (`USAGE`, `RUNTIME`, `LOOKUP`, `INPUT`, `COMPILE`), `hint` and a selected `reference`; known component errors may include `component`, filtered `allowedProperties` and `examples`. These are suggestions for correcting the source, not automatic repair. File/UTF8/limit errors stay input errors rather than being diagnosed as DSL syntax. CRLF and source characters are preserved, not normalized. The current SDK rejects a leading UTF8 BOM; save Express files as UTF8 without BOM when that error occurs. No auto-repair or automatic retries. File/stdin reads are bounded before compilation. No writes, arbitrary module loading, publication, browser actions or commands are performed.

Preflight checks one source tree. It does **not** certify current session capacity/record-ID reuse/epoch/revision, browser availability, native progress, file registration, resource URL availability or actual test execution. The live tool remains authoritative and may reject an otherwise valid source. If package identities differ, fix selection/loading before guessing another syntax.

## v0.1.5 pattern discovery

With Node24.x, `patterns` emits `{packageVersion,catalogId,scope,shellCapabilities,patterns:[...]}`; `pattern NAME` emits the same identity plus one `pattern`. Descriptor keys: name,template,reference,requires,templateAvailable,requiresShellCapabilities. Exactly eight routes cover tree-navigation/searchable-picker/summary-metrics/validated-form/feedback-states/activity-timeline/evidence-location/command-actions. `templateAvailable` checks local catalog component requirements; command-actions additionally describes shell capability command-palette, without making its old Row/Button template unavailable.

For a known template skip discovery and go straight to `example TEMPLATE`. For an unknown task read only the selected reference. Then `example TEMPLATE` emits compiler-checked raw Express; adapt and pipe/file into `check --surface-id ID FILE_OR_-`; pass the resulting JSON as a2ui_render arguments. Never pass pattern metadata as DSL. No rendering/inference/browser launch occurs from this CLI. Unknown pattern exits1 with stderr JSON and no stdout; missing/extra args exit2. Existing catalog/examples/example/check behavior remains. Old helper lacking patterns reports usage; use its actual examples/catalog rather than inventing unsupported APIs. Local helper identity never proves an arbitrary active extension/canvas supports a shortcut.
