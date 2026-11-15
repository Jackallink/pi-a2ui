# BM4 measurement / oracle pre-live review R1 — NO-GO

固定候选：`c3978f3b6764651a53a85ccf25406872b11b8ea3`（implementation ed9f7ad，design0a2114d）。**0 P0 / 1 P1 / 0 P2；测量链当前不准入live。** 本轮只审12任务语义、oracle、default dry-run、actualSDK/skill/CLI/render/browser/queue、限额和usage分类，不替代完整安全/生命周期/交付审查。

## P1 — 合法 binding / label / layout 会被误计 intent failure

`tests/benchmark-model/oracles.ts:8–15` 以未解码的split('/')解析value path、以`c.label===literal`及直接Text child识别控件。Spec018:30允许合法ID/bindingpath/layout变化；当前判据将合法UI误判失败。独立Node24真实compiler已接受下列完整变体，当前intent均失败：

1. M02用 `$/form={"name/value":""}`，Name.value与context.name都用 `{"@path":"/form/name~1value"}`，其余guard/context不变：实际初始值为empty string，但手工resolver读`name~1value`得到undefined，报`initial Name`。
2. M02增加 `$/label="Name"`，TextField(label=$/label,...)：标签实际仍Name，却报`intent requires one TextField`。
3. M01的同一Inspect file Button合法child改为`Column([Text("Inspect file")])`，event/context不变：可编译却报`intent requires one Button`。

最小修复：独立的轻量data/文字解析正确解码JSON Pointer `~1/~0`并保留实际类型；按解析后的标签和所属Button子树识别指定label，允许这些合法结构包装。不要导入生产validator作为语义oracle，也不要改模型source或放松指定event/context/值/slot。以原始正例、上述合法变体为正控，保留wrong-value/context/slot负控；需窄回归后新固定R2。该项是checker测量偏差，不是018产品或GLM失败。

## 其余已核证据与边界

- 12 requests来自scenarios.json，expectedDSL只在offline SOURCES分支；modelprompt是实际skill展开加NL任务和公开guard profile。M12显式请求独立Image与ArtifactPreview metadata，M11只判native tools组件/stream，不声称固定进度总量或实时遥测质量。
- worker.ts:90–118将第一次真实CLI check输出同draft bytes核对，再要求a2ui_render args完全一致；firstbadcheck/renderattempt后stop，sequential实际tool execution拒绝overlap。实际tool_result持有阶段执行独立intent/native操作，检查真实POST202与getFollowUpMessages中的accepted epoch/revision/source/event/typedcontext，随后abort，无后续模型处理队列。静态case核0POST/0queue。此处是实际SDK路线，不是伪ACK；本轮仅静态确认，未重跑全browser。
- scripts/benchmark-model.mjs:45–54的默认入口不加载SDK/config/auth；明确12 case与0provider/credentialread，unknown args失败。worker:56–78将exact model/URL、5TOTAL/3072/45s/redirect/retry约束置于实际fetch，budget/send统计与post-stop阻断分开。90s case/10s cleanup/20min batch明确；不推导账单保证。
- worker:77,89,142分开保留实际SSE usage与SDK usage；缺实际usage时不会把SDK默认0当已知费用/用量。report:69–71分别保留planned/started/notrun、requests、compile/render/intent、action/static分母及harnessFailure；synthetic-offline实际modelrequests=0，不进入live12评分。provider/model失败与setup/cleanup failure分别计量。
- 独立窄执行（指定wrapper **Node24.18.1**）：24既有selected tests通过，覆盖12semantic positive、8合法wrong-intent negatives、actualdefaultdryrun/invalidargs、opaque credentials、环境字面量和Modal合法布局变化；另上述3合法变体真实compile成功而intent失败。未读真实config/auth，未跑模型、全套或浏览器，未改源码。父代理在审查尾部新增b0ef33f仅5行test；独立git diff/blob核对oracles/worker等被审实现与固定c3978f3完全相同，本NO-GO仍只针对c3978f3，不将新test当修复。

工件SHA256：oracles=`ad845184968e7e2b2286257081e8438a32645d4d708bd01149d8412c95972247`；worker=`074bf48d4de0ba012759b9a125a7d043bc2f108f0ba5294508a47dae0ecd5624`；scenarios=`a721551aee6ae3b59606fdd148939ffc2b83e2c87f707deafdd1ecb6cf371e8b`；fixtures=`c7453d40575d1780e04f2f15e46eb820da0a34aac8bfc5e1d36670b4db752362`；profile=`dc177a215e129b2c00735b126aca2a78c1db321ceceb9cb863d4de3ad0836685`；entry=`c4d69bf09c924dedceef3be1b20a6845d2c65cabb9a346c451b1eb664b9f5218`。

只需对该测量P1修复做窄R2及未解blocker确认，不扩大场景/模型/平台。live仍须其余独立code/cost/isolation GO和source-bound full offline证据；本轮不授权推理、merge/release/global修改或issue closure。
