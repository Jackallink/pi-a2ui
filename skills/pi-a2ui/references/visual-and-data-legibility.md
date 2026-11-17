# Visual and data legibility

Summary cards, charts and tables are the read-back surface for task data. Keep display text, raw numbers and unknown values distinct; every chart/table needs a stated data source. This page gives one composition (`visual-summary-data-digest`) plus the boundaries that keep it honest.

## Data digest: summary, trend and raw table

Start from `example visual-summary-data-digest`. It combines a MarkdownView summary (formatted display strings), one line Chart and one DataTable with raw number cells; adapt the values to the task's actual data before checking. The example values are explicitly labelled as demo data, not measured results.

```text
# Supplied example values, not a native measurement or verified build.
# Raw number cells keep numeric sorting/alignment; null marks unknown, never invented text.
digest = MarkdownView(text="## 本轮数据概览\n\n- 处理请求：**128**\n- 失败请求：**3**\n\n数据来源：示例演示值，非真实测量结果；未知指标留空不虚构。")
trend = Chart(kind="line",series=[{name:"服务端",points:[{label:"11/12",value:42},{label:"11/13",value:55},{label:"11/14",value:49},{label:"11/15",value:61},{label:"11/16",value:74}]},{name:"浏览器",points:[{label:"11/12",value:28},{label:"11/13",value:35},{label:"11/14",value:40},{label:"11/15",value:46},{label:"11/16",value:51}]}])
detail = DataTable(caption="按模块的原始请求计数（示例）",columns=[{id:"module",label:"模块"},{id:"requests",label:"请求数"},{id:"failures",label:"失败数"}],rows=[{id:"api",cells:["/api/render",128,3]},{id:"assets",cells:["/api/assets",64,null]},{id:"ws",cells:["/api/events",31,0]}])
note = Text(text="图表（按日趋势）与表格（按模块计数）是同一场景的两份独立示例，口径不同；表格保留原始 number/null，未本地格式化。",variant="caption")
root = Column(children=[digest,trend,detail,note])
```

With Node24 selected, save the adapted source in a **new owned file** and set `source_file` to its path. Use an allowed write/edit tool when shell file creation is restricted. Preflight the final file (replace the absolute skill path supplied by Pi; keep quotes for spaces):

```sh
node "<absolute-skill-path>/scripts/a2ui.mjs" check --surface-id data-digest "$source_file"
```

Pass the returned `{surfaceId,source}` unchanged to `a2ui_render`; the helper displays nothing. A successful check validates structure, not live capacity or the truth of the supplied values.

## Formatted display text vs raw numbers

Summary numbers inside MarkdownView/Text are display strings; they may be localized or abbreviated because they are never re-parsed. DataTable cells are data: keep `number` cells raw (`128`, `12040`, `0.5`), because local sorting is type-aware and numeric columns are detected from actual cell types. Pre-formatting numbers as strings (for example `"12,803"`) turns a numeric column into text: it sorts lexicographically and loses its local right-alignment. If a task asks for a formatted figure, put it in the summary text and keep the raw value in the table or chart values table.

## Chart legend, ticks and the values table

The canvas chart renders a legend naming every series and zero-baseline deduplicated tick labels; the `Supplied chart values` table under it repeats the original data as a non-color alternative. Keep series names meaningful (they are the legend), keep points aligned across series, and state units/source in the summary text, not inside fabricated chart props. Data-only updates use `a2ui_update_chart`; a Chart is line/bar with at most 4 series and 200 points per series — no donut, stacked or area kinds exist.

## Unknown stays empty, numbers stay raw

An unknown value is a `null` cell or an explicit loading/error DataTable state, not an invented placeholder that looks like data. Do not fabricate measurements, units, percentages, timestamps or tool execution to fill gaps; use reported records with their provenance only. Loading, empty (a completed query with no items) and error states are distinct — see [feedback composition](summaries-and-feedback.md#callout--emptystate--skeleton--composition).

## Explicit anti-patterns

The following sources must stay rejected — each fenced separately so every banned pattern fails on its own: inventing components (`MetricCard`), unsupported chart kinds (`donut`) and presentation props (`formatter`, `delta`) that do not exist in this catalog.

```invalid-express
digest = MarkdownView(text="## 本轮数据概览")
metric = MetricCard(title="处理请求",value=128,delta="+3%",formatter="compact")
root = Column(children=[digest,metric])
```

```invalid-express
trend = Chart(kind="donut",series=[{name:"示例",points:[{label:"A",value:1}]}])
root = Column(children=[trend])
```

```invalid-express
detail = DataTable(caption="按模块的原始请求计数",columns=[{id:"module",label:"模块"}],rows=[{id:"api",cells:["/api/render",128]}],formatter="compact")
root = Column(children=[detail])
```

There is no MetricCard, Donut, sparkline or number formatter API; do not invent properties, measurements or units on real components either. If a needed display primitive is missing, compose it from Text/MarkdownView/Chart/DataTable exactly as the digest example does.
