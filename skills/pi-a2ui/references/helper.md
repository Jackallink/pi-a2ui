# Read-only local helper

Requires **Node24.x** (`nvm use 24`); production package dependencies must be installed. It uses prebuilt JS and the same compiler as a2ui_render: no tsx/TypeScript/esbuild, global CLI install, experimental Node flag, model request, HTTP server or credential setup. Contributor `npm run build` regenerates the JS; users do not build.

Replace the absolute script path below with this skill's actual path, quoted for spaces. Paths to user source are resolved from the command's cwd; the script's own examples/modules are resolved from its installed location.

```sh
node "/absolute/path/to/pi-a2ui/skills/pi-a2ui/scripts/a2ui.mjs" catalog
node "/absolute/path/to/pi-a2ui/skills/pi-a2ui/scripts/a2ui.mjs" examples
node "/absolute/path/to/pi-a2ui/skills/pi-a2ui/scripts/a2ui.mjs" example user-form
node "/absolute/path/to/pi-a2ui/skills/pi-a2ui/scripts/a2ui.mjs" check --surface-id user-form /absolute/path/to/form.express
```

- `catalog`: JSON packageVersion/nodeMajor/catalogId/components for **this installed helper package**. It cannot identify a different running Pi instance. Active tool descriptions and successful tool-result catalogId determine runtime support.
- `examples`: allowlisted names, required components and current availability. It distinguishes unsupported v014 examples on a16-type catalog.
- `example NAME`: complete raw source of a supported, compiled template. No file writes or publication; change fixture records/provenance before using them for real work.
- `check --surface-id ID FILE`: reads one regular source file, bounded32KiB and valid UTF8, then compiles it. Use `-` for piped stdin. Output is exactly JSON `{surfaceId,source}` for `a2ui_render`; not the generated JSON rendering protocol. The model must actually call that tool to publish.

Pipe a built-in template into preflight:

```sh
node "/absolute/path/to/pi-a2ui/skills/pi-a2ui/scripts/a2ui.mjs" example user-form |
  node "/absolute/path/to/pi-a2ui/skills/pi-a2ui/scripts/a2ui.mjs" check --surface-id user-form -
```

Exit0 success,1 input/compiler/capability failure,2 usage/runtime-major error. Failure writes a JSON error to stderr and **no tool arguments to stdout**. CRLF and source characters are preserved, not normalized. The current SDK rejects a leading UTF8 BOM; save Express files as UTF8 without BOM when that error occurs. No auto-repair or automatic retries. File/stdin reads are bounded before compilation. No writes, arbitrary module loading, publication, browser actions or commands are performed.

Preflight checks one source tree. It does **not** certify current session capacity/record-ID reuse/epoch/revision, browser availability, native progress, file registration, resource URL availability or actual test execution. The live tool remains authoritative and may reject an otherwise valid source. If package identities differ, fix selection/loading before guessing another syntax.
