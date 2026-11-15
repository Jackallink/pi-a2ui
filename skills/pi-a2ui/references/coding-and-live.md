# Coding evidence and live tools — baseline0.1.3 and later

These four custom types complete the baseline16. Source/test records are supplied by Pi, not certified by the browser. Do not turn template fixtures into claims that a test ran.

| Component | Props | Bounds / ownership |
| --- | --- | --- |
| CodeDiff | `proposalId`, `filename`, `baseRevision`, `before`, `after` | All named strings; proposalId safe1–64 ID. Source<=16KiB/512lines each side. Exactly one per surface. Read-only contiguous diff, no direct apply/file write. |
| TestResults | `resultId`, `command`, `evidence`, `cases`, `summary` | cases `[{id,name,status,details?}]`, status pass/fail/skip/error; summary `{pass,fail,skip,error}` items are integers0–128 and must equal the displayed case counts. Unique case IDs,<=128cases total,<=4096chars per details. At most one per surface. Larger run totals cannot be substituted for displayed subset counts; label subset/omission truthfully. |
| LogView | `LogView(stream="tools")` | Initial text/state/omitted are server-owned; omit them. Native Pi tool events feed it without per-chunk model calls; bounded output/line count shows omissions. Not a manual log injection tool; never nest inside Button. |
| Chart | `Chart(kind="bar",series=[{name:"Count",points:[{label:"one",value:1}]}])` | line/bar,<=4 unique series,<=200aligned points each, labels match across series; finite numbers. Supplied values do not prove a measurement happened. |

Full [review](../examples/review.express) and [live](../examples/live.express) templates compile. In a surface containing CodeDiff/TestResults, **every declared Button's context must include the current literal proposalId/resultId** for records present, e.g. `{proposalId:"p1",resultId:"r1"}`. This includes unrelated or hidden Buttons, not only the Button following the records; local native copy/sort/close controls are distinct. Those IDs are immutable within the epoch: a new result/proposal needs a new ID. Do not reuse an example ID for changed content. See [error repairs and budget management](syntax-and-errors.md) for complete executable examples and global64/4 constraints.

For chart updates, name the Chart variable (`chart = Chart(...)`) and call `a2ui_update_chart({surfaceId,revision,componentId:"chart",series})` with the current structural revision returned by render. This preserves layout and unsent drafts. A full a2ui_render replaces the surface and increments revision. Log display pause is local; `/a2ui-toggle` pauses the canvas. Late/old tool events cannot publish to a new session.

## Report a larger test run

TestResults is a bounded table of supplied case records: at most128 rows, with a summary equal to those displayed rows. This bounds table/DOM and serialized-record work; summary's128 limit follows that row contract, not the largest test suite Pi can run. Source, snapshot-byte and global component limits remain independent, so the maximum row count does not promise that maximum-sized details fit.

For a larger run, put the complete reported totals, omitted count and actual run/tool evidence in `evidence`, then supply a selected<=128-row subset with its exact subset summary. Label that distinction clearly. Raising only a summary max would still fail the independent summary/case equality check. A typed full-suite aggregate API is not currently provided. The example below is synthetic and **not an executed test**; replace every supplied record/count/evidence with the actual report before presenting real results.

```text
root = TestResults(
  resultId="subset-example",
  command="illustrative only",
  evidence="Illustrative fixture, not executed. Reported suite: 166 pass; showing 2 pass records; 164 records omitted. Replace with actual tool/run evidence.",
  cases=[{id:"sample-one",name:"Example one",status:"pass"},{id:"sample-two",name:"Example two",status:"pass"}],
  summary={pass:2,fail:0,skip:0,error:0}
)
```

This compiles through the normal helper and render tool; it does not certify that the reported166 tests ran. Follow-up Buttons on the same surface still need the current literal `resultId`. Use a new ID when records/evidence change; a failed render does not reserve that ID.

## Automatic run summary (0.1.9)

For automatic native-run status, the user first opens `/a2ui` and keeps the canvas connected. After an eligible settled run, the extension creates a preset Run summary from actual native tool events; no extra skill command, model-render call, source authoring or CLI script is needed. It tracks non-`a2ui_` tools, skips tool-free/A2UI-only/paused/disconnected runs, and needs one free surface plus6components within the global4/64 and byte limits. It never evicts a model face. All existing surface IDs remain legal: if the model already owns `run-summary`, automation skips it; a successful model replacement of an automatic card takes ownership and stops future automatic replacement of that revision.

The badge describes agent termination (completed/error/interrupted), not task correctness. A recovered tool error can show Run completed with1failed in TaskProgress; preserve that distinction when explaining results. ActivityTimeline/TaskProgress are bounded current-run streams, not a certified or immutable history. Summary generation/persistence are best-effort. Official Pi custom entries save the native post-flush snapshot outside LLM context; selected-branch reload validates it through the existing snapshot contract and restores only explicit matching ownership metadata. This creates no user message or automatic follow-up model turn. Ordinary form/chart/artifact authoring continues through the existing tools and templates.
