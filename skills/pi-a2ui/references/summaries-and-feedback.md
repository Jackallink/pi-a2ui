# Summaries and feedback patterns

Node24.x only. Check actual installed catalog and active tool; the helper describes its own package. Pattern labels below are not new catalog components.

## KeyValueView / MetricCard — composition

Use [summary-metrics](../examples/summary-metrics.express) with Card(child), Column(children), Row(children), literal Text(text) and StatusBadge(label,status). Do not call `KeyValueView()` or `MetricCard()`. Source/units/time context belong beside the value; give a short headline then optional Details evidence rather than a wall of text.

Example values are fixtures and must be replaced from actual obtained tool/user data. The template explicitly labels its source as an example; no build was run by rendering it. StatusBadge's reported provenance is not independent verification. Prefer TaskProgress for native current execution counts; a static duration supplied by the model is a reported metric, not a new native measurement. Unknown/missing values should say unknown/not measured, never0 or success. Text is escaped plain text; source labels do not become links or arbitrary file reads. Summaries do not execute commands or trigger a model call.

Keep existing component/tree/source/session budgets. `example summary-metrics` emits raw DSL; `check --surface-id summary FILE` emits a2ui_render arguments. No JSX/HTML/metadata JSON as source. Full render replaces that surface, so use a separate summary surface when preserving another form's unsent draft matters.
