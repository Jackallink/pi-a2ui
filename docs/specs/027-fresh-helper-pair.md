# Spec027：helper适配后的全新任务单对试运行

状态：draft，**设计提案，不可执行**。前置Spec026独立zero GO已完成（source7ee9045、Node606/browser91/type0/strict68，Check126）；模型效果仍未评估。用户只授权此时确定新场景/预算，**当前真实请求授权0**，不存在本Spec的paid runner/实际grant。机器定义[proposed profile](../checks/fresh-helper-pair-design/profile.proposed.json)为documentOnly/live=false，不是执行配置。

三轮：[R1](../walkthrough/fresh-helper-pair/01-round1-user-stories.md)、[R2](../walkthrough/fresh-helper-pair/02-round2-technical-trace.md)、[R3](../walkthrough/fresh-helper-pair/03-round3-integration-check.md)。设计证据归Check127。

## 目标、取舍与非目标

推荐一个全新任务×C/G两session，先验证真实模型能否走通受限helper并观察单题首次候选，成本上限从原24降为**新的一次≤12请求**。备选两新题×两臂≤24覆盖更广，但当前先验证修复后的真实通路，暂不采用；只有G单臂≤6最省，但缺同题C观察，也不采用。两个session不构成总体成功率估计、统计显著性或因果证明。

不重跑冻结BM4 M01–M12、旧T/N/SM/FP实际题，不重判旧STOP；既有21未用额度不可复用。无其它模型、付费judge、自动修复/重试/替代batch、业务操作、发布/安装。Spec026永久offline policy及其CLI不翻live开关；未来须新增独立已知paid profile/authority/入口和两行报告，当前不实现。

## 唯一新题 FC01 与固定顺序

两个独立session都只收到同一自然请求，不带模板名、DSL、skill/check指令或 /skill 强载：

> 请做一个同页资产登记表单，三个文本输入的标签原样使用“资产名称”“责任团队”“登记备注”，都必填、初始留空。按钮叫“提交信息”，只回传三个字符串键 assetName、ownerTeam、registrationNote。先等我确认；只收集信息，不要查询或修改资产系统，也不要添加其它输入或额外的长度限制。

固定顺序**FC01-G → FC01-C**，serial1。G先观察修复后的准备通路，C随后同题对照；不做随机化/顺序平衡，明确保留时序/缓存风险。某臂普通authoring/准备失败关该session，继续下一计划session，不是重试；fatal时后续not_run，绝不换题/换序/补样本。无备用题自动替换。

C：正式0.1.10，source b7022efd48d6ed679eb08b17b672bb10cec9425f，archiveSHA c7d4511c1e92808691ab98a89897f7a6f2d0ed0e64b77f70f9ab610500177e55。G：Spec024未发布引导组合，source095459084f0bf8ab26c803c4b7e2f2dbb6b004ba，archiveSHA c96125e0a2095608d29ad7b09e6f1911572ed7162bf881b9b9d744e5235dc2d8。版本文字同0.1.10，按source/archive/payload识别，不以version比较。76path、恰7差异；其余69及lock相同。

两臂都使用同一受审finite adapter、owned cwd/file、工具read/bash/write/edit/a2ui_render、公共安全说明与native契约；实际各自factory/skill/helper/compiler/validator。仅该组合引导差异作为观察对象，不单独归因某一句或CLI说明。两份新actual SDK synthetic初始capture差异仅实际render descriptor+active system/developer snippet；原body/hash不改写，不沿用HX01或旧FP contexts。metadata发现skill，body不预载。

## Oracle与观测层

FC01必须3个空字符串绑定的可读TextField，精确labels/keys、不同绝对value paths、无额外editable inputs；variant省略/shortText/longText合法，number/obscured不合法。FormValidation恰3required rules，guard实际可达Button ID，不添加min/maxLength；直接Event.context恰3键绑定对应值。Button可用合法布局包装文字，真实caption为“提交信息”，不能凭直接Text布局偏好判分。组件ID取实际snapshot。

唯一编译oracle是同臂compiler；首check（否则首完整accepted render）的源先compile再静态任务语义。compile=false则firstCorrect=false/semantic未运行；CLI INPUT/usage/noCandidate不当DSL错误。纯validateSubmission空输入3errors、有效字符串0errors；不点击或实际POST。UI另需首render commit+真实同页DOM目标ID可见可用；input.type=text/textarea，不让无关控件替代；无UI时actionPosts标未观测，不填实测0。

必须分层报告：读skill/示例意图→parser接纳/规范argv→独立actual spawn/PID/commandSHA→CLI exit/check→firstCandidate grade→首UI。provider continuation保留raw command，执行canonical单列；audit error会fatal/harnessFailure，不能把“接纳”写成“已查询”或将prepare/check写成UI成功。原生thinking/signature不落raw。

两行报告计划分母各1、实际提交分母0/1/unknown；已知0候选N/A、未知不填0；独立保留compile/static/UI/sourceMatch（exact/严格单LF/mismatch/unchecked/no-render）与费用。只有两行均实际提交、grade和journal/diagnostics/cleanup全known、无fatal/harness/audit错，才报告**此题两臂观察差异**；若G无UI或未成功check/skill/example，不能称完整引导链路成功。即使G正确/C错误，也不称总体成功率提升/因果改善。不要复用Spec025固定4行/分母2的summary。

## 拟成本和停止约束（当前未获授权）

| 项目 | 提案 |
| --- | --- |
| 模型/endpoint | 唯一volcengine-ark/glm-5.3-flash；https://ark.cn-beijing.volces.com/api/plan/v3/chat/completions |
| 请求 | 每session≤6，2session总≤12；invocations1；无借额/退款/自动重试/补样本 |
| 原生参数 | thinking enabled、reasoning_effort low、max_completion_tokens1536；无max_tokens；include_usage=true、tool_choice auto、parallel_tool_calls=false |
| 输出上限 | 12×1536=18432配置completion token，含reasoning，不是费用保证 |
| 输入/响应/source | 98304bytes / 1MiB / 32KiB；超过即按协议/准备边界拒绝 |
| 工具 | ≤12意图/会话，check≤1、render≤1；第6响应内剩余合法工具仍可结束，不发第7次 |
| 超时 | request30s、active150s、worker总180s含cleanup10s/TERM2s/fallback5s、batch420s；下一臂须有完整180s窗口 |
| 成本事实 | 每请求保留原始usage，reasoning为completion子集；缺usage/货币金额unknown，不写免费，不做额外余额/健康探针 |

最坏12请求与18432输出只是上限，不为凑满而调用。synthetic capture是另计零provider准备，不占12实际provider额度；实际batch只在claim后开始一次420s窗口。HTTP非OK/auth、transport/stream/SDK unknown/截断、source/context/payload漂移、policy违反、进程audit失败、timeout/cancel/cleanup错停止整批，剩行not_run。普通compile/schema/static/usage/INPUT/preparation_limited关case后继续剩行；closed已知终态后的空local aborted不得覆盖原诊断，无新准入不能当新paid调用；真实inflight仍unknown/fatal。

## AC / 后续准入

| ID | Given / When / Then | 后续测试意图 |
| --- | --- | --- |
| AC-001 | 无新用户授权或旧grant/21余量→任何live入口→SDK/配置/provider前拒绝 | 新paidID/两行grant/一次claim早guard见证，永久offline ID仍拒绝 |
| AC-002 | 同题固定C/G→新capture→仅真实已知引导差异，source/字节绑定 | 两归档/76/7diff/native body/actual factory/metadata-only |
| AC-003 | 两会话预算→POST/tool准入→每6/总12/12工具，先fsync再POST，无其它模型/fallback | native wire、torn/丢receipt不退款、最后response bundle、180/420 |
| AC-004 | 第一check或render→分层oracle→compile/static/UI/无candidate分别可证伪 | FC01正负/额外长度/隐藏目标/变体、named-ID/rules、sourceMatch |
| AC-005 | helper规划/实际执行/拒绝或审计故障→请求/清理→持久witness、普通继续/fatal停止不混 | 复用Spec026证明并对新paid ID验证raw/canonical/actual路径、故障与cleanup |
| AC-006 | 固定2行→报告→分母1/actual、N/A/unknown、单题而非总体结论，usage未知保留 | 新两行summary truth table，不复用四行统计 |

这份设计GO只允许向用户提交清晰的新预算申请。只有用户另行明确条件授权后，才实施必要新known paid profile/guard/两行统计和完整Node24零推理验收、独立代码/隐私/成本GO，绑定新source/runtime/两包/105+后续输入/新captures及唯一实际grant/精确命令，再执行一次。不能把当前7ee9045的零推理代码GO当作本Spec已可付费运行；本轮没有假可执行命令。

风险：G/C固定顺序、服务端随机/缓存/时序、6请求仍可能不足、样本只有一对。回退：不调用即零新provider成本；未来撤销新增paid适配也不恢复已消费grant或旧21；全部失败和not_run封存，不通过新模型裁判改分。
