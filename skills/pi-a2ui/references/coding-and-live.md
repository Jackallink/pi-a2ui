# Coding evidence and live tools — baseline0.1.3 and later

These four custom types complete the baseline16. Source/test records are supplied by Pi, not certified by the browser. Do not turn template fixtures into claims that a test ran.

| Component | Props | Bounds / ownership |
| --- | --- | --- |
| CodeDiff | `proposalId`, `filename`, `baseRevision`, `before`, `after` | All named strings; proposalId safe1–64 ID. Source<=16KiB/512lines each side. Exactly one per surface. Read-only contiguous diff, no direct apply/file write. |
| TestResults | `resultId`, `command`, `evidence`, `cases`, `summary` | cases `[{id,name,status,details?}]`, status pass/fail/skip/error; summary `{pass,fail,skip,error}` must equal actual case counts. Unique case IDs,<=128cases,<=4096chars per details. At most one per surface. |
| LogView | `LogView(stream="tools")` | Initial text/state/omitted are server-owned; omit them. Native Pi tool events feed it without per-chunk model calls; bounded output/line count shows omissions. Not a manual log injection tool; never nest inside Button. |
| Chart | `Chart(kind="bar",series=[{name:"Count",points:[{label:"one",value:1}]}])` | line/bar,<=4 unique series,<=200aligned points each, labels match across series; finite numbers. Supplied values do not prove a measurement happened. |

Full [review](../examples/review.express) and [live](../examples/live.express) templates compile. In a surface containing CodeDiff/TestResults, **every Button's context must include the current literal proposalId/resultId** for records present, e.g. `{proposalId:"p1",resultId:"r1"}`. Those IDs are immutable within the epoch: a new result/proposal needs a new ID. Do not reuse an example ID for changed content.

For chart updates, name the Chart variable (`chart = Chart(...)`) and call `a2ui_update_chart({surfaceId,revision,componentId:"chart",series})` with the current structural revision returned by render. This preserves layout and unsent drafts. A full a2ui_render replaces the surface and increments revision. Log display pause is local; `/a2ui-toggle` pauses the canvas. Late/old tool events cannot publish to a new session.
