# Summaries and feedback patterns

Node24.x only. Check actual installed catalog and active tool; the helper describes its own package. Pattern labels below are not new catalog components.

## KeyValueView / MetricCard — composition

Use [summary-metrics](../examples/summary-metrics.express) with Card(child), Column(children), Row(children), literal Text(text) and StatusBadge(label,status). Do not call `KeyValueView()` or `MetricCard()`. Source/units/time context belong beside the value; give a short headline then optional Details evidence rather than a wall of text.

Example values are fixtures and must be replaced from actual obtained tool/user data. The template explicitly labels its source as an example; no build was run by rendering it. StatusBadge's reported provenance is not independent verification. Prefer TaskProgress for native current execution counts; a static duration supplied by the model is a reported metric, not a new native measurement. Unknown/missing values should say unknown/not measured, never0 or success. Text is escaped plain text; source labels do not become links or arbitrary file reads. Summaries do not execute commands or trigger a model call.

Keep existing component/tree/source/session budgets. `example summary-metrics` emits raw DSL; `check --surface-id summary FILE` emits a2ui_render arguments. No JSX/HTML/metadata JSON as source. Full render replaces that surface, so use a separate summary surface when preserving another form's unsent draft matters.

## InlineValidation / FormErrorSummary — FormValidation API

Requires the active interactions-v1 catalog with **FormValidation**. These two pattern names are not callable types. Use [validated-form](../examples/validated-form.express). Always name the input and Button variables explicitly so rules/guards refer to stable IDs.

`FormValidation(buttons=["submit"],rules=[{fieldId:"name",message:"Enter a name",required:true}],title="Check these fields")`. title static1–128; buttons1–16 distinct reachable Button IDs; rules1–16 distinct bound input fields/paths; at most1 validator/surface. Every guarded Button must directly bind every ruled input path in its Event context. Required fields omitted from that context, literal substitutes, nested bindings, duplicate/shared rules or a non-input target fail preflight atomically. The validator and interactive picker cannot be inside a Button.

Rule props: fieldId1–128 and message1–256, required? boolean, minLength?/maxLength? integers0–4096 with min<=max. At least one meaningful check. Required text/date cannot be blank; required checkbox must be true; required choices nonempty; slider remains a typed finite value in its declared range. Length applies only to TextField Unicode code points (raw, not trimmed) or selected-choice count; it is invalid on checkbox/slider/date. Examples: 😀a has2 code points, not3; trim is only used for required-blank detection. Messages are authored literal text and never interpolate submitted values. Multiple aliases of one ruled path must agree.

An empty/invalid business draft is allowed to render; syntax/types/options/ranges still must be structurally valid. Browser invalid submit makes no request, shows adjacent errors and summary, and focuses a currently focusable field. For hidden fields, focus a visible summary or notice in the active native Modal/canvas; no hidden-tab opening or background focus. Edits revalidate locally; the server repeats the same constraints before accepting a direct/forged request. Invalid data does not consume an event ID. Non-guarded navigation/cancel actions retain their existing checks. This is not authorization: Pi still owns tools/permissions. No arbitrary regex, executable checks/functions, remote validation or automatic retry. Full replacement/reset clears local errors; local filtering/validation uses no model turn.

`check` proves structural source/schema/guard coverage, not that a future user draft passes business checks or fits live session aggregate/resource budgets. Use the emitted tool args with a2ui_render, then continue the Pi reply; user interaction arrives later as typed data.

## Callout / EmptyState / Skeleton — composition

Use [feedback-states](../examples/feedback-states.express) with existing Card/Column/Text/Icon/StatusBadge/Button, not `Callout()`, `EmptyState()` or `Skeleton()`. The example shows four fixture states side by side; for an actual task, render the one supported by known request/tool evidence and include a short reason and declared next intent. A skeleton is explicitly labelled placeholder text, not fabricated records, success or a percentage.

Distinguish loading (awaiting observed response), empty (actual completed query with no items), not run (no execution observed), and reported error (with actual source/error context, not a synthetic diagnostic claim). Supplied StatusBadge remains reported. Use TaskProgress/ActivityTimeline for real native execution rather than modifying a static card to pretend it is server live state. Unknown is not empty or success. Keep error details short, use Details for long evidence, and do not put secrets/tool credentials in a callout.

Change search/start/retry are ordinary declared Button intents sent to Pi. They do not perform the operation, grant permission or automatically retry from the browser. Local display sends no event/model turn. Existing aggregate/depth/component/source budgets apply; helper preflight checks structure, not the truth of a reported task state.
