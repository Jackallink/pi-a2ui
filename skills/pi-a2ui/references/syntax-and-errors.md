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
| Input/type/binding error | Initialize value before use: TextField string, CheckBox boolean, Slider number, ChoicePicker string array, DateTimeInput local string. Bind submitted values directly to reachable input value paths. |
| Unreachable/missing/repeated child | Put every component into one root tree exactly once. Do not append detached declarations hoping they become Card contents. Forward references do compile; declaration order alone is not generally the cause. |
| Surface/component/source/JSON limit | Reduce the requested UI; no bypass, dynamic template or arbitrary function fallback. Per-widget bounds do not remove global bounds. |
| Same source succeeds in helper but fails in Pi | Helper package and loaded extension may differ; inspect pi list/settings/tool description. Check also session aggregate limits, immutable record IDs, enable/pause/cancellation. Preflight has no live session state. |
| Skill missing after reload | Old pinned tag lacks new files, package skill filter may exclude them, or duplicate skill names may mask it. pi.skills must declare skills and distribution must include them. Use the checkout/ref that actually ships this skill; /reload does not change a pinned tag. |
| `Tool "a2ui_render" conflicts with ...` | Inspect both project and user-wide package registrations with `pi list`; loading Git and local copies together registers the same tools twice. Keep the intended registration and remove the obsolete one in its original scope. `/reload` alone does not resolve duplicate sources. |
| Tool succeeds but browser didn't open | Run `/a2ui`. A successful render is not proof of OS browser opening; auto-open availability is version-dependent. |

For repeated failures, stop blind retries: load the relevant reference, use an unmodified supported template, preflight it, then change only the required labels/fields. Keep the exact first failing source/error for diagnosis. Never state "the parser requires declaration order" without a reproducer; root-first forward-reference examples pass this compiler.
