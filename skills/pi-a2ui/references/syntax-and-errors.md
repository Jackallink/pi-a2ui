# Express syntax and failure recovery

This is the installed official Express compiler behind a2ui_render, not JSX/React or an HTML builder. Favor named props and the smallest matching complete template. The helper and tool share the same compiler; local preflight is not a second renderer.

```text
$/form/name = ""
field = TextField(label="姓名",value=$/form/name)
button = Button(child=Text(text="确认"),action=Event("submit",{name:$/form/name}))
root = Card(child=Column(children=[field,button]))
```

Use actual source newlines. If constructing tool JSON programmatically, JSON.stringify once. A command-line stdout payload can be passed as the tool's arguments; do not embed a `{surfaceId,source}` JSON object **inside** source.

| Error / symptom | Evidence-led correction |
| --- | --- |
| `mismatched input 'Button' expecting {',', ']'}` | Check comma/bracket immediately before Button. `Column(children=[Text(text="A"),Button(...)])` needs comma between items. Do not keep retrying unchanged source. |
| Card references non-existent component `标题` | `Card("标题")` is a child-ID reference. Use `Card(child=Text(text="标题"))`, or Card(Column(...)) for title+body. |
| `Function 'Text' is not defined in the catalog` | This message alone does not establish missing Text support or a declaration-order issue. Get full source/tool error, test `root = Text(text="probe")`, check this package's catalog and the active tool. If the minimal form still fails, investigate loaded package/version instead of inventing signatures. A truncated source/error cannot establish the exact root cause. |
| Unknown component DataTable/Modal/Video/etc | Baseline0.1.3 has16 types. These require workbench-v1; using their names on a baseline is not a syntax problem. Choose a baseline template or explicitly upgrade the package. |
| Unknown property / SDK help mentions `checks` | Run `component NAME` when available and use `component.parameters` for parameter names. Compiler error envelopes may separately include filtered `allowedProperties` and a project-aware `hint`. `checks`, executable functions and dynamic templates are unavailable. Use FormValidation for supported field guards; do not copy unfiltered SDK suggestions. |
| `Executable expressions and checks are unavailable` (legacy) / `Forbidden map key "path"` (current) | A reserved map key can trigger this even when its value is ordinary data. Authoring trees block `checks`, `path`, `call`, `callFunction` and `@`-prefixed keys except valid absolute `@path` bindings. For an event filename use `file`; do not rewrite that literal as a binding. `a2ui_register_artifact`'s separate tool parameter is still named `path`. Use FormValidation only when the intended feature is supported field validation. See the filename repair below. |
| `Coding actions must reference current literal record IDs` | If CodeDiff/TestResults are present, every declared Button on that surface needs the current literal `proposalId`/`resultId` for the records present, including unrelated or hidden Buttons. Add the IDs to the reported Button's Event context, or put the independent interaction on another surface. Native copy/sort/disclosure/close controls are local controls, not declared Buttons. IDs are immutable within an epoch; changed record contents need new IDs. |
| `summary.pass: Number must be less than or equal to 128` / `Test summary does not match case records` | Each TestResults summary item is an integer0–128 and must equal its corresponding visible case count; the whole cases array is at most128. A summary of166 with a small displayed subset is unsupported. Render truthful subset counts and label omissions separately; do not claim the subset is the complete run. Merely raising one max would not fix the equality contract. |
| Input/type/binding error | Initialize value before use: TextField string, CheckBox boolean, Slider number, ChoicePicker string array, DateTimeInput local string. Bind submitted values directly to reachable input value paths. |
| Unreachable/missing/repeated child | Put every component into one root tree exactly once. Do not append detached declarations hoping they become Card contents. Forward references do compile; declaration order alone is not generally the cause. |
| `Component limit exceeded: 65/64` / `Surface or total component limit exceeded` | Compiled components total at most64 across at most4 surfaces; implicit Text children count. A single-source check only knows local counts. Live aggregate rejection reports attempted and current counts; successful render reports committed usage. Use a smaller replacement of the same surface ID to reclaim component cost; that surface still uses a slot. See budget management below. Other source/JSON/native limits remain independent. |
| `Expected a relative workspace artifact path` | Resolve the file from the active Pi workspace (`ctx.cwd`), not the installed skill/package directory or a guessed repo root. Current diagnostics include that workspace root. Pass a relative path such as `artifacts/result.png` to `a2ui_register_artifact`; absolute paths, escapes and symlinks remain rejected. Changing an Event data key to `file` does not change this tool parameter. |
| Same source succeeds in helper but fails in Pi | Helper package and loaded extension may differ; inspect pi list/settings/tool description. Check also session aggregate limits, immutable record IDs, enable/pause/cancellation. Preflight has no live session state. |
| Skill missing after reload | Old pinned tag lacks new files, package skill filter may exclude them, or duplicate skill names may mask it. pi.skills must declare skills and distribution must include them. Use the checkout/ref that actually ships this skill; /reload does not change a pinned tag. |
| `Tool "a2ui_render" conflicts with ...` | Inspect both project and user-wide package registrations with `pi list`; loading Git and local copies together registers the same tools twice. Keep the intended registration and remove the obsolete one in its original scope. `/reload` alone does not resolve duplicate sources. |
| Tool succeeds but browser didn't open | Run `/a2ui`. A successful render is not proof of OS browser opening; auto-open availability is version-dependent. |

For repeated failures, stop blind retries: load the relevant reference, use an unmodified supported template, preflight it, then change only the required labels/fields. Keep the exact first failing source/error for diagnosis. Never state "the parser requires declaration order" without a reproducer; root-first forward-reference examples pass this compiler.

Current helper errors may include `diagnostic.surfaceId`, `componentId`, `componentType`, `propertyPath`, `forbiddenKey` or `workspaceRoot`, and the error text includes known context. `propertyPath` is a JSON pointer (relative to the component when one is known). Follow that actual location. Parse/global/unknown SDK errors may only have surface scope; absence of a component ID is not evidence that a guessed component is responsible. SDK line/column/name evidence remains useful.

## Repair a literal filename

`Event("inspect_file", {path:"src/example.ts"})` uses a reserved authoring key. The repaired complete source below submits the same literal filename as `file`. A literal filename is not an input binding and does not need FormValidation.

```text
inspect = Button(child=Text(text="Inspect"),action=Event("inspect_file",{file:"src/example.ts"}))
root = Column(children=[inspect])
```

## Extend a review surface

Both Buttons need both IDs, even though the second action only asks a question. If only one record type is present, supply its corresponding ID; do not invent an absent record's ID. The records here are illustrative skipped fixtures, not proof of execution. For real work replace the records, evidence and every referencing ID together.

```text
root = Column(children=[
  CodeDiff(proposalId="proposal-example",filename="example.ts",baseRevision="base-example",before="old",after="new"),
  TestResults(resultId="result-example",command="example only",evidence="Illustrative fixture, not an executed test",cases=[{id:"sample",name:"Not run",status:"skip"}],summary={pass:0,fail:0,skip:1,error:0}),
  Button(child=Text(text="Review"),action=Event("review",{proposalId:"proposal-example",resultId:"result-example"})),
  Button(child=Text(text="Ask a question"),action=Event("question",{proposalId:"proposal-example",resultId:"result-example"}))
])
```

## Manage the live budget

`a2ui_render` reports committed `components K/64, surfaces N/4; this surface M` and retains its snapshot. The additive `details.a2uiUsage` contains `{components:{used,limit},surfaces:{used,limit},surface:{surfaceId,components}}`. Count the compiled flat components, including generated Text children, rather than only named declarations. These counts do not promise admission under byte, native-widget or immutable-ID limits.

If one surface uses37 components and another attempts30, the second render rejects attempted67/64,2/4 while current remains37/64,1/4. A rejected render does not change revisions, records or published state. Replace the first with30 under the same ID, then a second with34 fits64/64. A replacement completely replaces that surface and clears its unsent draft.

A smaller replacement releases component capacity but still consumes one surface slot. There is currently no public per-surface archive/delete tool. Do not promise that reload archives old UI; branch history restoration may bring it back. Offline `check` validates one source and has no live-session total; use the actual tool result for current usage.
