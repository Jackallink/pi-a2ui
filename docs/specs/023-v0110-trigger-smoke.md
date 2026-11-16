# Spec023：0.1.10 主动触发双场景冒烟设计

状态：walkthrough-approved（draft→独立R1 NO-GO→修正→独立R2 Gate1 GO）；审查设计稿提交3abed7e，结论见[Check117](../checks/117-trigger-smoke-design.md)。这只批准设计，不代表Gate2/实现/代码或执行GO。用户本轮只授权设计与独立评审；当前真实模型预算0。拟申请一次新批次、两个独立会话、最多4次请求，须另行获得明确调用授权。本文件不执行、不续跑Spec022，不改变其停止结果或冻结BM4。

## 目标、范围与证据边界

观察修复后的实际GLM请求链路是否能完成简单确认，以及有交互价值的任务是否在有限窗口内自主选择并提交表单。只测试正式0.1.10新文案；不做旧文案/A组对照，不声称触发率提升、总体成功率、统计显著性或成本节省。

本轮交付为本spec、三轮走查、待适配计划、仅供文档审阅的[拟定profile](../checks/trigger-smoke-design/profile.proposed.json)、独立设计意见及Check117。OUT：运行模型/真实配置读取、实现适配、修改产品/skill/依赖/安装、合并推送发布、执行/重算冻结基线。设计GO仅为Gate1准入，不是实现完成、代码评审GO或live-ready。

现有实际代码基点为提交c8224a3（离线修复运行代码1984c328，Check116）；当前CLI、worker、预算、context捕获和汇总仍固定12会话/每例3/总36，live禁用。因此**不能直接运行旧CLI、切片旧输出或仅把旧liveEnabled改true来执行本设计**。3+1适配、TDD、完整本地CI和独立代码/成本/隐私评审是后续付费的必要前置门槛，本轮不实施。

## 固定输入与顺序

| 顺序 / ID | 自然用户消息（原样） | 上限与预注册观察 |
| --- | --- | --- |
| 1 / SM02-B | 已确认使用测试环境，版本0.1.10。只回复‘收到’。 | 最多1请求。完整正常文本trim后须恰为`收到`，无任何完整toolCall、无模型画布请求；先做低成本链路检查。 |
| 2 / SM01-B | 我要准备一次发布，但应用名、目标环境、版本号还没填。请先把这三项信息收齐，再让我确认；现在不要执行发布。 | 最多3请求。分别观察准备、完整render选择、SDK实际尝试、提交及DOM内容；无真实发布行为。 |

两者都是独立新session、owned workspace、同一正式新文案；`B`只是测试侧标签，不进入prompt。文字取自Spec022的T01/N02，但使用新实验ID/新journal/新报告，不把旧未知尝试合并或补计。本轮不是首次见过该文字的模型总体实验；只观察新批次自己的窗口。

顺序选择的理由：先用1请求核对简单任务的服务/输出；若失败或结果未知，就不花后面3请求。SM02-B通过（允许仅usage缺失）才开始SM01-B；额度不可互借，未使用额度不累积、不自动重启。SM01-B本身3请求可能只够读skill/模板/写draft，这不是增加额度、强制预载或认定插件失效的理由。

## 固定对象与模型可见条件

- 发布包：0.1.10 source `b7022efd48d6ed679eb08b17b672bb10cec9425f`，tar SHA256 `c7d4511c1e92808691ab98a89897f7a6f2d0ed0e64b77f70f9ab610500177e55`，76个生产文件不改。全程Node24.x（本设计检查使用24.18.1）、Pi1.5.0、锁定Chromium1254。
- 唯一拟用模型：`volcengine-ark/glm-5.3-flash`；唯一HTTP endpoint：`https://ark.cn-beijing.volces.com/api/plan/v3/chat/completions`。保留字面model id，不换其它模型或按量端点，不自行解析替换alias。
- SDK reasoning=true/low，实际body须精确`thinking:{type:'enabled'}`、`reasoning_effort:'low'`、`max_completion_tokens:1536`；禁止max_tokens混用，`stream_options.include_usage=true`、`tool_choice=auto`、`parallel_tool_calls=false`。沿用已离线检查的线级策略，不声称已实测服务端支持或alias精确映射。
- 两例都显示同一完整工具集`read,bash,write,edit,a2ui_render`，正常发现packaged skill元数据，不预载skill正文、不注入组件/模板/DSL答案、不增加“必须render”或跳过skill步骤的提示。不将测试标签、期望输出和请求预算加入模型消息。
- owned draft只允许write/edit；read限包内参考/owned工程；bash只允许Node24直接调用已打包helper的只读查询/check，无任意shell/网络/真实业务命令。安全addendum一致；无用户AGENTS/全局扩展/历史会话/MCP。
- 新文案必须原样来自包；不得调用旧`normalizedBody`把新句规范成旧句后签名，否则会放过错误的旧文案。新capture采用不改消息/描述的canonical JSON，只规范对象键顺序；两例各自捕获实际SDK首请求，live首body须与同一路径/状态下的approved capture逐字节语义一致。日期/路径等漂移一律拒绝，不擅自归一化有意义字段。

## 拟申请的硬边界（尚未授权）

| 项目 | 契约 |
| --- | --- |
| 批次 | 1次新invocation、2会话；SM02-B≤1、SM01-B≤3、全批≤4；仅这两个新ID，串行1 |
| 记账 | 每次HTTP发送前验证身份/body/每例与全批上限，完整写journal并fsync成功后才可发送；未知已准入不退款、不重置 |
| 自动调用 | SDK/provider retry=0、fallback=0、redirect=error；关闭warming、压缩、摘要等额外推理；无付费裁判、额外健康探针或后台模型请求 |
| 输出/输入 | 每请求总输出上限1536；最多4次配置总输出上限6144tokens；每body≤96KiB。均是请求配置/字节边界，不是精确计费或实际usage保证 |
| 时间 | 每请求30s；SM02活动30s、SM01活动90s；各cleanup10s、父进程TERM后2s强杀；worker总截止分别42s/102s；live全批硬截止180s（含setup/清理，不含事前零推理capture） |
| 工具 | SM02完整消息出现任何toolCall即记录选择并停在执行前；SM01最多6次串行工具执行，无嵌套，不点产生用户消息的按钮 |
| 窗口末尾 | 最后一次请求的已准许tool可正常结束；完成后若无render则记准备/窗口耗尽，阻断下一provider请求。不得修改或重发同一次请求追到成功 |
| 独占 | 新批次独立一次性授权/源码/profile/capture身份与执行锁；旧run-LUrFUb/原锁/journal完全不触碰；中断、失败或部分结果均不续跑 |

额度不能从SM02转给SM01；发第2个SM02、第4个SM01或全批第5个前必须拒绝。硬deadline下限采用剩余批次时间；无足够时间则未开始项not_run。所有超时/取消/缺回执保留主错和准入下界，不能标为免费调用或普通未触发。

## 观察、停止与验收

先从完整assistant toolCall记录`render_requested`，再分开记SDK校验后的`attempted`、实际snapshot的`committed`。不从推理正文猜测意图；原生摘要不计模型画布。截断/错误的半个toolCall是unknown，不算零触发。沿用Check116逐请求诊断与隐私边界：journal/body哈希、status、finish/DONE、stream终止、usage、SDK结果、有界脱敏错误；单值providerStatus不能代替逐请求证据。硬杀前未落盘诊断仍可能丢失。

| 条件 | 结局与后续 |
| --- | --- |
| SM02完整正常文本为收到，且无toolCall | negative=pass；可开始SM01。usage未知单独记unknown，不返额度 |
| SM02其它完整文本 | negative=fail_text；整批停，SM01 not_run |
| SM02任何完整toolCall（包括read） | negative=fail_tool；若含render则requested=true；执行前停止，attempted/committed=false须说明stopped_by_policy，不能算schema拒绝或无误触发；SM01 not_run |
| SM01正常文字追问/结束，无render | text_only/clarification；保留原文；仅能说本窗口没有render，不算UI成功或必然产品bug |
| SM01只读参考/helper/写draft后用尽3请求 | preparation_limited；不补第4请求、不强制流程捷径 |
| SM01完整render调用 | SDK参数拒绝或首次handler结果后停止，不修复重试；requested/attempted/committed分别报告 |
| SM01提交后owned DOM可见 | 只读核查3个可填写字段（应用/环境/版本）和提交/确认入口、数据绑定及可达组件；不虚构用户已填/确认，不执行发布。有效布局不做字节对比 |
| render提交但内容/DOM不满足 | choice observed但UI_invalid；不能当作交互成功，不补提示 |
| 任意认证/限流/HTTP非成功、SDK/流错误、截断、身份漂移、工具/预检失败或清理失败 | 立即停批，保留错误/unknown；未开始的not_run，无retry/fallback/续跑 |
| 完整输出只缺部分/全部usage | usage_unknown，不推断供应商没返回或0费用；其它观察仍保留，按剩余规则处理 |

本轮仅在SM02通过且SM01实际提交、内容/DOM合格、协议/清理无错误时记`ui_smoke_pass`。SM01纯文字或准备耗尽记`ui_not_observed`，不强行二分为插件故障。结果未知/协议失败/未启动单列。报告必须恰有2行，加独立transport/negative/positive选择/UI维度，不调用旧12行配对汇总、不产生改善率，不以机械`harnessAccepted`替代验收。

## 用户故事、AC及测试意图

| ID / 优先级 | Given / When / Then | 后续必须有的测试 |
| --- | --- | --- |
| AC-001 / P0 | LIVE请求无新调用授权或源/政策不匹配时，CLI、worker script、imported API均应在真实配置/工作区/HTTP前拒绝；默认dry-run和synthetic offline不要求付费grant，须零真实配置/零provider | SMG01 LIVE三入口、缺/错grant；持久fs/fetch计数+无资源创建；合法dry-run/offline无付费grant可用 |
| AC-002 / P0 | 任意两例调用顺序/异常回执下，durable guard同时强制1/3/4上限且不互借；未知不返预算 | SMG02每例第2/第4、全批第5、未用额度不可转、fsync/短写、torn/缺/错receipt；无实际fetch |
| AC-003 / P1 | 两例B自然消息进入实际SDK时，正确描述/工具/线级参数和首context一致；不得A归一化或强载skill | SMS01 actualSDK synthetic capture、body/model/描述漂移拒绝、wrong-old-clause canary |
| AC-004 / P1 | SM02完整消息结束时，exact text无tool才通过；其它文本/任意toolCall先观察后阻止执行 | SMS02 收到/错字/read/render缺参数/截断/error；tool执行及后续provider计数0、失败后SM01 not_run |
| AC-005 / P1 | SM01正常authoring或render时，准备、选择、schema、提交、DOM分开，窗口与首次失败/结果后无续请求 | SMS03 3步准备、缺source、编译错、正常form、内容缺字段、native-only、message_end→tool_result顺序 |
| AC-006 / P0 | 任意stream/worker/cleanup失败后，停批且保留已准入与unknown，主错不被清理覆盖 | SMS04 取消/超时/硬杀/限流/坏receipt/丢usage及脱敏；父42/102/180截止和owned PID退出 |
| AC-007 / P0 | 未来新候选付费前，归档/运行源码、所有输入、模型端点/政策/授权收据必须固定，历史不变 | SMI01 固定候选完整本地Node/type/90browser/68union和正常smoke-offline；产品76/冻结/旧回执hash，独立代码GO |

## 当前代码缺口与后续准入

采用小入口加单一受限政策适配，复用R2收集器、实际SDK/extension、guard及清理，避免复制另一套WebSocket/编译器。未来`trigger-smoke`入口固定新experiment id；私有worker/预算/父调度/报告全部使用同一经过校验的smoke policy，而不是CLI外层独自计数。只允许已知的旧offline与新smoke政策，无任意provider/预算/profile路径注入；旧pilot模式live保持禁用，新live须独立授权票据。新票据记录用户明确授权、source/tree/lock/profile/scenario/实际capture/归档/Node/SDK/browser/guard哈希和≤4界限；不能由CLI自行写userAuthorizedRequests充当授权。LIVE的授权guard不适用于合法dry-run/synthetic offline：后者在适配实施另获允许后可无付费grant运行，只用synthetic凭据/transport，可创建owned测试资源，真实配置和外部provider始终拒绝。当前设计授权不包含实施或跑SDK。

必须适配：每ID限额map与全局4同时用于journal准入/解析和父receipt核对；两行非配对report；负例message_end执行前停止；正例末请求tool_result后停止；B原样context attestation；3+1 worker/批次deadline；三入口统一授权guard与新独占锁。新增experiment/profile必须计入输入身份，journal须绑定experiment/profile身份，不能接受旧36预算journal作为新账本。当前实现的旧函数只可作为待复用边界，不证明上述缺口已闭合。

后续顺序：用户另行授权新批次预算 → spec/TDD kickoff确认 → 最小适配及行为RED→GREEN → 固定新候选完整本地检查与独立代码/隐私/成本GO → 冻结实际命令及新一次性grant → 一次live → 两行原始结局及费用unknown → checkpoint。任何代码/场景/限额/模型/端点变更都不能扩大本设计；审查NO-GO先修正重审。本轮停在设计独立评审及预算申请，不先写适配代码。

风险/回退：3请求准备瓶颈、小样本非比较、服务端策略尚未实测、观察器取消/硬杀诊断局限。按原始维度报告，不加额度追绿。设计可只删新增文档；未来适配可回退到旧offline-only入口，不能因回退恢复旧live授权。产品、用户进程、现有工作区证据、旧锁及凭据一律保留。

走查：[Round1](../walkthrough/trigger-smoke/01-round1-user-stories.md)、[Round2](../walkthrough/trigger-smoke/02-round2-technical-trace.md)、[Round3](../walkthrough/trigger-smoke/03-round3-integration-check.md)。实现计划：[Plan023](../plans/023-v0110-trigger-smoke.md)。当前设计检查/评审见Check117，未有本批次模型结果。
