# Workbench reading and state — requires v0.1.4 catalog capabilities

The published0.1.3 baseline does not contain these types. Check the active tool and helper catalog; do not infer support solely from this document or version labels. In workbench-v1, these plus media expand the16 baseline types to29. Local copy/sort/filter/disclosure/dialog opening do not dispatch Pi events. Interactive widgets cannot be nested inside Button.

| Component | Named props / example | Contract |
| --- | --- | --- |
| List | `List(children=[Text(text="One"),Text(text="Two")])` | Static children; optional SDKdirection/align. Ordinary root/tree/component limits still apply. |
| DataTable | `DataTable(caption="Files",columns=[{id:"name",label:"Name"}],rows=[{id:"a",cells:["a.ts"]}])` | <=12columns/200rows, unique safe IDs1–64, exact one primitive cell/column (string<=256, finite number, boolean, null). Optional state ready/loading/error and message<=512. Local stable sort/filter; no editable cells/SQL. |
| CodeBlock | `CodeBlock(code="  const n = 1;\n",language="ts",copyable=true)` | Literal whitespace,<=16KiB/512logical lines (CR/LF/CRLF), language<=32. Local copy writes only code; clipboard denial gives selectable-text fallback; no execution. |
| MarkdownView | `MarkdownView(text="# Title\n\n**Bold** text")` | Same byte/line cap. Paragraphs,h1–h3,lists,fenced/inline code,bold/italic; HTML/links/images remain text. No href/src or unsafeHTML. Text remains plain. |
| Details | `Details(title="Evidence",child=Text(text="Details"),open=false)` | title1–256, one child; native disclosure. Multiple independent Details are Accordion composition, **not** `Accordion(...)`. Live patches preserve open/draft/selection/scroll; full replacement resets. |
| StatusBadge | `StatusBadge(label="Reported pass",status="success")` | statuses info/success/warning/error/running; reported/unverified provenance. This is a model-supplied claim, not an execution result. |
| TaskProgress | `TaskProgress(stream="tools")` | Native-event-only state/counters, omit initial state/started/settled/failed/omitted. <=1 per surface. Actual tracked counts, indeterminate running progress, no invented plan percentage. |
| Modal | `Modal(trigger=Text(text="Open"),content=Text(text="Details"))` | Actual SDK slots are **trigger/content**. <=1/surface. Trigger only Text or Icon; never wrap it in a Button. Native dialog focus/Escape/return behavior; real Button inside content can send a declared action. |
| Icon | `Icon(name="info")` | Static local names only: check,close,error,info,warning,folder,help,refresh,play,pause,search,settings. No remote font or arbitrary URL. |

Complete templates: [list-table](../examples/list-table.express), [reading](../examples/reading.express), [details](../examples/details.express), [status](../examples/status.express), [modal](../examples/modal.express). Their availability is capability-gated by the helper.

No TreeView, SearchablePicker, MetricCard, generic validation, ActivityTimeline, EvidenceLink or CommandPalette type is implied here. Those are v0.1.5 planning scope, not current catalog types. Prefer existing Card/Row/Text/Button compositions for summaries and continue/modify/abandon choices.
