# Spec022：0.1.10 主动触发小样本验证

状态：in-progress（draft→walkthrough-approved→tdd-approved→in-progress）。用户于2026-11-16明确授权实施、离线评审及一次36请求上限的真实批次；Gate2/TDD kickoff已获独立GO；离线实际检查与代码评审通过前不得live。原始draft状态/指纹保留在Check113。不是冻结 BM4 基线的重跑、续跑或重新计分，也不是新版本发布门禁。

后验偏差记录（不改写原批准协议）：上述一次授权批次已使用，在T01-A的第二次请求结果未知时停止；其余11episode未启动、完整配对0，效果验收未通过。实际首请求为`max_completion_tokens=1536`且没有关闭思考参数，响应中有非空推理块；原`thinking off`假设不成立。另有错误信息与usage持久化缺口。见[Check115](../checks/115-trigger-pilot-stopped-live.md)。本spec保留原预算/参数约定作为审计依据；这些偏差不是追溯豁免，也不是新批次授权。不得重启或续跑；任何后续模型策略/线级契约修订须独立走查评审，新的真实推理另需明确授权。

## 目标与范围

回答两个问题：自然任务中，新文案是否更常让模型自主选择 `a2ui_render`；纯文字和简单确认是否仍能跳过画布。把工具选择、UI 准备、编译成功和实际显示分开报告，不把语法错误或原生摘要卡误当作主动触发结果。

推荐六个新场景、两组各一次，共十二个独立 episode。每个 episode 最多三次 provider 请求，总计最多三十六次；用户已确认上述调用上限；代码/离线门槛仍有效，用户安装不变。

更省的替代方案是只跑新文案六个 episode、最多十八次请求，但只能观察当前表现，无法比较文案带来的差异。重复采样本轮不纳入。

## 固定对象与对照方法

- 两组都使用正式 0.1.10：不可变 source `b7022efd48d6ed679eb08b17b672bb10cec9425f`，发布归档 SHA256 `c7d4511c1e92808691ab98a89897f7a6f2d0ed0e64b77f70f9ab610500177e55`，76 个生产文件。Node24.x、Pi1.5.0、锁定 Chromium1254。
- A：仅在私有测试 host 的 `registerTool` 边界，将 `a2ui_render.description` 中新触发句替换为 v0.1.9 的旧句。B：原样加载正式 0.1.10 描述。新旧句已静态核对，完整 extension 只差此句，新句多362个 UTF-8 字节。
- A 的准确名称是“0.1.10 包 + 旧触发文案”，不是“重测 0.1.9”或冻结基线成绩。不得修改包内源码、工具参数、handler、promptSnippet、TOOL CONTRACT 或其他工具定义。
- 新鲜 Pi session / owned workspace，无历史、用户 AGENTS、其他扩展、MCP、全局路由指令。正常发现 packaged skill 元数据；不使用 `/skill:pi-a2ui` 强制预加载，不加入“必须 render”、期望 DSL、组件名称或模板答案。
- 第一请求 `tool_choice=auto`，只允许 `read,bash,write,edit,a2ui_render`；不允许额外代理、网络、任意 shell、用户文件或真实业务操作。模型可自行读取 packaged skill/参考、写 owned draft，或调用 helper。Bash 仅允许实际 helper 的只读查询/预检；安全规则两组完全相同，不把未知普通文字任务强制导向 helper。
- 该实验不强制预检或强制字节交接；产品本身不要求每次 render 都先调用 CLI。模型若主动预检，记录结果；首次预检失败或首次 render 结果后停止，不补提示、不修复重试。
- 每对使用相同的模型可见 cwd、包/skill 路径、输入、时钟文本、工具顺序和参数；串行复用并重置 owned workspace，session/表单/事件/浏览器状态不复用。live 前先用 synthetic transport 捕获两份实际 SDK 首请求，断言模型可见消息/工具/选项只差触发句；路径或时间漂移未闭合不得付费运行。后续输入因模型真实选择不同而自然分叉，原样记录。
- 固定配对顺序：T01 A→B，T02 B→A，T03 A→B，T04 B→A，N01 A→B，N02 B→A。不给模型可见内容加入 A/B 标签。不声称随机性或模型 seed 已被控制。

## 六个固定自然语言场景

以下引文是将来直接发送的用户消息；预期标签仅供测试侧，不交给模型。

| ID | 固定用户消息 | 预先标记 / 内容核查 |
| --- | --- | --- |
| T01 | “我要准备一次发布，但应用名、目标环境、版本号还没填。请先把这三项信息收齐，再让我确认；现在不要执行发布。” | 画布可能明显有用；若生成 UI，应有三个可填写字段及确认入口，不执行发布、不虚构已提交值。 |
| T02 | “下面是演示用的核查结果，不用读取文件：R1，src/auth.ts 第18行，登录失败提示缺少错误原因，建议补充说明；R2，src/config.ts 第7行，超时值没有单位，建议明确单位。帮我整理成可逐项决定处理或暂缓的结果，先别改文件。” | 画布可能明显有用；两条演示记录、位置和建议准确，逐项选择/意图明确，不冒充实际代码审计或修改。 |
| T03 | “我在选服务方案：A月费10元、延迟80毫秒；B月费2元、延迟120毫秒；C月费2元、延迟60毫秒；D月费6元、延迟90毫秒；E月费4元、延迟70毫秒。让我能按月费或延迟换个顺序比较，再决定选哪个；这些是演示数据。” | 画布可能明显有用；五行数字/单位准确、可本地排序比较，B/C同价不得丢行，不声称实时指标或代替用户选择。 |
| T04 | “帮我核对这份演示配置改动的影响，我想逐项检查差异再决定是否接受，先别修改文件。config.json 原值：timeoutMs=2000，retries=1，mode=fast；新值：timeoutMs=5000，retries=3，mode=safe。” | 画布可能有用；三组前后值完整准确、只读检查，不虚构测试通过或实际应用变更。 |
| N01 | “用三句话解释 git fetch 和 git pull 的区别。” | 应跳过；纯解释，不需要工具或画布。 |
| N02 | “已确认使用测试环境，版本0.1.10。只回复‘收到’。” | 应跳过；简单确认，不执行配置/发布。 |

正例表示预先判断有展示/交互收益，不表示纯文本答案一定错误或未触发就是产品 bug。允许合法的不同组件/布局；无期望 DSL 字节对比。UI 内容核查使用已给事实、实际编译结果及人工/DOM检查，不另付费调用裁判模型。

## 观察值与解释

每个 episode 都记录以下独立维度：

1. `render_requested`：从实际完整 assistant message 的 `toolCall.name=a2ui_render` 记录模型选择；在 SDK 参数校验之前记账。缺source/错误类型等参数拒绝仍计选择；不能仅依赖 extension `tool_call`，Pi1.5会先校验参数。截断且未形成完整调用另记unknown，不推断选择。
2. `render_attempted`：真实 extension `tool_call` 观察到已通过SDK参数校验的调用；`render_committed`：实际 handler 成功提交snapshot/revision。schema拒绝、编译失败、语义错误、浏览器失败分别列出，不抹去已观察到的requested。首次schema拒绝同样停止，不修复续跑。
3. `ui_preparation_only`：自行读取 A2UI skill/ref、调用 helper 或写 UI draft，但截至预算仍未 render；不与纯文字混为一类，不据此断言模型永远不触发。
4. `text_only` / `clarification`：模型正常结束但未选择 UI，分别保留回答和追问。
5. `provider_unknown`、`output_truncated`、`budget_limited`、`not_run`、`harness_error`：独立列出；不得当作零调用、普通未触发或成功样本。`usage_unknown`另列：完整模型输出和已admit请求仍可观察选择，缺token用量不等于缺请求结果，也不返还请求额度。

报告先给十二行原始结果和完整配对数，再给正例“预算内选择/实际尝试/提交”及负例“误触发”。选择和误触发以requested为准，不能靠SDK先拒绝参数来制造低误触发率。未闭合配对不进入可比较差值；预算内未 render 只代表本协议观察窗口内未发生。准备次数/第一步工具选择用于解释预算瓶颈。原生 `run-summary` 以及自动状态更新不计入任何模型触发数。

预先登记的解释规则：B正例至少3/4选择、负例0/2误触发、且不比A差，才称“本组场景中选择行为符合预期”；若出现至少两对 A未选择而B选择、无反向对且负例不增加，只称“观察到改善方向”。A/B都高则“未观察到增益”；结果混合或不完整则“证据不足”。提交正确性单独报分数，不能用触发数代替可用 UI。样本不支持总体成功率、统计显著性、成本节省、默认全局插件环境或长期效果结论。结果不自动触发产品修改、回滚或重跑。

## 已批准的请求、时间与费用边界

| 项目 | 上限 / 契约 |
| --- | --- |
| 唯一模型/端点 | `volcengine-ark/glm-5.3-flash`，`https://ark.cn-beijing.volces.com/api/plan/v3/chat/completions`；不回退、不换模型、不跟随重定向 |
| episode / 请求 | 12个 episode；每个首次尝试，至多3个 provider HTTP请求；整批硬上限36，逐次发送前持久记账 |
| 输出参数 | 每请求 `max_tokens=1536`，thinking off；累计配置输出上限55,296 tokens，不是账单/实际usage保证 |
| 输入体积 | 每次模型请求 JSON≤96KiB；这是字节上限，不冒称精确input-token上限；实际usage缺失记unknown |
| 重试 / 并发 | 串行1；SDK/provider自动retry=0；关闭cache warming/自动压缩/自动摘要推理；每episode最多6次串行工具执行 |
| 时间 | 请求30秒，episode90秒，cleanup10秒，live整批20分钟；父进程硬截止及 owned子进程清理须在离线阶段验证 |
| 停止 | 第一次render结果（含SDK参数拒绝）或正常文字结束即停；最多3请求；认证/限流/身份漂移/未知请求结果/清理失败整批停，不继续或自动补跑；单纯usage缺失记unknown并保留已占请求额度 |
| 浏览器 | 仅 owned loopback/headless；显示后检查snapshot/DOM、可保留截图；不点会产生用户消息的按钮，不启动模型后续回合 |
| 费用口径 | 不估算未经核对的人民币价格；报告实际请求/供应商usage及unknown。超时或中断前已发送的请求仍占预算，不能因缺收据返还额度 |

请求2/3允许是正常的首次 authoring 流程，不是重试同一请求。请求不足以完成参考/预检时保留 `ui_preparation_only` / `budget_limited`，不提高额度追到成功。安全 guard 拒绝或非零工具结果单独归因；不伪造预检结果或改写模型 source。

## 实施前门槛与证据

设计已获用户授权；现按Plan022编写独立、默认零推理的 pilot harness/profile/scenarios；不调用现有 `benchmark-model --execute`，不改 BM4 profiles/dataset/oracles/report，也不向其结果目录写入。独立评审、TDD与离线控制通过后，方可执行一次所批准的 live 批次。

离线必须证明：首请求A/B仅句子不同；`tool_choice=auto`且无强制render提示；技能可发现但非强制预载；第4个单例请求/第37个批次请求发送前被拒；失败check/render后无repair调用；schema拒绝（缺source/错误surfaceId类型）仍requested=true、attempted=false、committed=false且无续请求；首render后不会产生额外provider请求；负例纯文字可正常结束；预备动作不会误判为render；原生卡不计数；usage缺失与请求结果未知的区别、预算/超时/截断/中断和清理canary正确；无真实凭据读取和网络。

将来 live 保存 scenario/arm/context/工具定义/source/SDK/Node/归档/guard哈希、发送前journal、usage、原始脱敏模型输出与toolargs、编译和实际snapshot/DOM结果。只在内存解析选定Ark凭据；拒绝可执行配置，不复制或打印真实auth/header。用户配置只读、hash验证，无全局安装变更。未知结果保留已admit请求下界并停批。报告和临时工作区独立存放，精确命令在harness评审后冻结。

冻结保护：`tests/benchmark-model/profile.json` SHA256 `dc177a215e129b2c00735b126aca2a78c1db321ceceb9cb863d4de3ad0836685`；Check099 SHA256 `015de150cee7c5c53bff89a2dc8f36dbf4f6c99bd5426be10cacd29d3c895539`。原始v1真实报告/失败收据不改、不重新打分；v2不执行。只读核对冻结身份不算重跑基线。

风险：小样本随机波动、受限工具/上下文与真实全局环境差异、三请求窗口截断准备流程、中文语义人工审阅差异。通过成对首请求一致性、预注册标签/顺序、原始结果及分维度报告约束解释，不以补跑美化。回退仅移除新pilot脚本/测试/草案；不修改发布包、用户环境或历史证据。

走查：[Round1](../walkthrough/trigger-pilot/01-round1-user-stories.md)、[Round2](../walkthrough/trigger-pilot/02-round2-technical-trace.md)、[Round3](../walkthrough/trigger-pilot/03-round3-integration-check.md)。当前用户预算授权与独立harness评审共同限定后续一次真实批次；未通过离线/代码门槛不得调用。
