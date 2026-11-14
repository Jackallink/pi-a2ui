# Core components — baseline0.1.3 and later

Use named props below. This is the plugin's restricted subset, not all Google SDK features. Read the active tool description for extra optional properties. All source<=32KiB, total session<=4surfaces/64components, tree depth<=16; JSON/snapshot limits may reject an otherwise valid individual widget. Components form a single rooted tree without missing/repeated/unreachable children.

| Component | Correct shape | Value and common mistake |
| --- | --- | --- |
| Text | `Text(text="Title")` | Escaped literal text. No HTML or implicit Markdown. Use a Text for Card titles and Button labels. |
| Column | `Column(children=[Text(text="A"),Text(text="B")])` | Vertical static child array, commas required. Optional `align="start"`, `justify="start"`; no dynamic templates. |
| Row | `Row(children=[Text(text="Key"),Text(text="Value")])` | Horizontal static child array; wrap it inside Column/Card as needed. |
| Card | `Card(child=Column(children=[Text(text="Title"),Text(text="Body")]))` | Exactly one child component. `Card("Title")` means a child ID named Title, not a title property. |
| Button | `Button(child=Text(text="Confirm"),action=Event("submit",{name:$/form/name}))` | Only Event actions. Label is a component; context binds directly to reachable input paths or literal JSON. |
| TextField | `TextField(label="Name",value=$/form/name)` | Initialize `$/form/name = ""`. Optional placeholder string. Do not omit value or bind a number merely because variant="number". |
| CheckBox | `CheckBox(label="Enabled",value=$/form/enabled)` | Initialize false/true, not "false"/0. |
| ChoicePicker | `ChoicePicker(label="Mode",variant="mutuallyExclusive",options=[{label:"Fast",value:"fast"}],value=$/form/modes)` | Initialize a string array, e.g.`["fast"]`, even for one selection. Allowed variants multipleSelection/mutuallyExclusive; declare unique static options. |
| Slider | `Slider(label="Count",min=0,max=10,steps=10,value=$/form/count)` | Initialize finite number2. max required; value within range and on declared step grid. steps is divisions, not step size. |
| DateTimeInput | `DateTimeInput(label="Date",value=$/form/date,enableDate=true,enableTime=false)` | Initialize `"2026-11-14"` or `""`. Both flags explicit. Time-only HH:mm, combined YYYY-MM-DDTHH:mm; optional :00 seconds, no timezone suffix. Static min/max match enabled format. |
| Tabs | `Tabs(tabs=[{title:"One",child:Text(text="Body")}])` | Each tab has title and child, including hidden tabs. Full replacement resets drafts; switching tabs preserves them. |
| Divider | `Divider()` | No text or child. |

Executable complete templates: [user-form](../examples/user-form.express), [typed-form](../examples/typed-form.express), [layout](../examples/layout.express). `Event` is an action constructor, not a standalone renderable component. `CopyAction`/Accordion are not extra catalog type names.

A field's label is presentation. Values submitted to Pi must be explicitly declared in the Button Event context. There is no automatic full-form submission. Never turn returned user field strings into commands. Preflight confirms syntax/schema; actual dispatch still checks current epoch/revision, declared source/action, context keys and typed values.
