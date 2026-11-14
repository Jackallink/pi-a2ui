# Navigation and selection patterns

Requires Node24.x. Inspect the active tool and installed helper catalog; pattern names are not component types. The helper describes its own package, not another running Pi instance.

## TreeView / Breadcrumbs — composition

Use [tree-navigation](../examples/tree-navigation.express) with **Details(title,child,open?)**, Column, Row, Text and Button. Do not call `TreeView()` or `Breadcrumbs()`; they are pattern names. Native Details is keyboard-focusable disclosure, not an ARIA virtual tree. Tab to a summary and Enter/Space to expand; Tab to leaf buttons to choose. The breadcrumb Row uses the same declared Button intents.

The example is a small, supplied hierarchy, not a live filesystem listing. Replace fixture node IDs/labels with explicitly obtained task data. An item click sends only its declared node ID to Pi; Pi decides the next tool and permission. No browser file:// links, path reads, automatic scan or executable commands. A local disclosure sends no Pi event/model call. Full render replaces that surface's draft/open state; data-only native updates preserve it.

Keep the entire surface within64 components,16 tree depth,32KiB Express source, and the global4-surface/256KiB snapshot limits. Empty hierarchy: show a literal Text empty message and an optional declared next action, not an absent/missing child. Too-deep/large input fails compilation atomically. This pattern is deliberately for small hierarchies; a large filesystem explorer needs a separately reviewed design.

Prepare with `example tree-navigation`, then `check --surface-id navigation FILE` and pass the emitted JSON as a2ui_render arguments. Source is raw Express, not manifest JSON or JSX. Named props and explicit Event contexts avoid positional ambiguity.

## SearchablePicker / ComboBox — actual new API

Only an active interactions-v1 catalog containing **SearchablePicker** supports this type. Old workbench-v1 has no searchable picker. Use [searchable-picker](../examples/searchable-picker.express); do not call `ComboBox()`.

`SearchablePicker(label="Branch",options=[{label:"Main",value:"main"}],value=$/branch,variant="mutuallyExclusive")`. label is static1–128; options static0–200, labels/values1–128 with unique values, duplicate display labels allowed. Initialize `$/branch = []`; value must be an absolute binding to a string array, not literal[] or a free-form string. Single mutuallyExclusive (default) allows0/1; multipleSelection permits a distinct subset. No weight/children/action props. Server rechecks membership/types/exclusivity at render/restore/submit. Never nest in a Button or its descendants.

Query is local text (<=128 code points), case-insensitive label substring, no requests. ArrowDown/Up moves to a result; Home/End in results jump, Enter/Space chooses, Escape clears search, Tab leaves. Visible buttons use native semantics. Selected choices remain removable when filtered out. Empty options say No options; unmatched query says No matches; neither submits a query string. Selection/removal alone sends no Pi event; put a separate declared Button after the picker to submit its typed array. Ordinary data updates/reconnect preserve query and draft; a full structural render replaces them.
